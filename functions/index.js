"use strict";

const functions = require("firebase-functions");
const request = require("request-promise");
const admin = require("firebase-admin");
const spawn = require("child-process-promise").spawn;
const path = require("path");
const os = require("os");
const fs = require("fs");
const line = require("./lineHandleEvent");

admin.initializeApp();

var db = admin.database();
var users = db.ref("users");

// Max height and width of the thumbnail in pixels.
const THUMB_MAX_HEIGHT = 200;
const THUMB_MAX_WIDTH = 200;
// Thumbnail prefix added to file names.
const THUMB_PREFIX = "thumb_";

const runtimeOpts = {
  timeoutSeconds: 300,
  memory: "2GB",
};

exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
});

exports.generateThumbnail = functions.storage
  .object()
  .onFinalize(async (object) => {
    // File and directory paths.
    const filePath = object.name;
    const contentType = object.contentType; // This is the image MIME type
    const fileDir = path.dirname(filePath);
    const fileName = path.basename(filePath);
    const thumbFilePath = path.normalize(
      path.join(fileDir, `${THUMB_PREFIX}${fileName}`)
    );
    const tempLocalFile = path.join(os.tmpdir(), filePath);
    const tempLocalDir = path.dirname(tempLocalFile);
    const tempLocalThumbFile = path.join(os.tmpdir(), thumbFilePath);

    console.log("fileDir", fileDir);

    // Exit if this is triggered on a file that is not an image.
    if (!contentType.startsWith("image/")) {
      return console.log("This is not an image.");
    }

    // Exit if the image is already a thumbnail.
    if (fileName.startsWith(THUMB_PREFIX)) {
      return console.log("Already a Thumbnail.");
    }

    // Cloud Storage files.
    const bucket = admin.storage().bucket(object.bucket);
    const file = bucket.file(filePath);
    const thumbFile = bucket.file(thumbFilePath);
    const metadata = {
      contentType: contentType,
      // To enable Client-side caching you can set the Cache-Control headers here. Uncomment below.
      // 'Cache-Control': 'public,max-age=3600',
    };

    // Create the temp directory where the storage file will be downloaded.
    await mkdirp(tempLocalDir);
    // Download file from bucket.
    await file.download({ destination: tempLocalFile });
    console.log("The file has been downloaded to", tempLocalFile);
    // Generate a thumbnail using ImageMagick.
    await spawn(
      "convert",
      [
        tempLocalFile,
        "-thumbnail",
        `${THUMB_MAX_WIDTH}x${THUMB_MAX_HEIGHT}>`,
        tempLocalThumbFile,
      ],
      { capture: ["stdout", "stderr"] }
    );
    console.log("Thumbnail created at", tempLocalThumbFile);
    // Uploading the Thumbnail.
    await bucket.upload(tempLocalThumbFile, {
      destination: thumbFilePath,
      metadata: metadata,
    });
    console.log("Thumbnail uploaded to Storage at", thumbFilePath);
    // Once the image has been uploaded delete the local files to free up disk space.
    fs.unlinkSync(tempLocalFile);
    fs.unlinkSync(tempLocalThumbFile);
    // Get the Signed URLs for the thumbnail and original image.
    const config = {
      action: "read",
      expires: "03-01-2500",
    };
    const results = await Promise.all([
      thumbFile.getSignedUrl(config),
      file.getSignedUrl(config),
    ]);
    console.log("Got Signed URLs.");
    const thumbResult = results[0];
    const originalResult = results[1];
    const thumbFileUrl = thumbResult[0];
    const fileUrl = originalResult[0];
    // Add the URLs to the Database
    await admin
      .database()
      .ref("images")
      .push({ path: fileUrl, thumbnail: thumbFileUrl });
    return console.log("Thumbnail URLs saved to database.");
  });

// exports.addRestaurantIdToUser = functions.database
//   .ref("/users/{userId}/restaurant")
//   .onCreate((snapshot, context) => {
//     const restaurantName = snapshot.val();
//     return db
//       .ref("restaurants")
//       .orderByChild("name")
//       .equalTo(restaurantName)
//       .once("value", (shot) => {
//         const restaurant = shot.val();
//         return snapshot.ref.parent
//           .child("restaurant")
//           .set({ key: Object.keys(restaurant)[0], name: restaurantName });
//       });
//   });

exports.setLIFF = functions.database
  .ref("/users/{userId}/role")
  .onCreate((snapshot, context) => {
    // Grab the current value of what was written to the Realtime Database.
    const role = snapshot.val();

    // You must return a Promise when performing asynchronous tasks inside a Functions such as
    // writing to the Firebase Realtime Database.
    return snapshot.ref.parent.child("lineId").once("value", (snap) => {
      const lineId = snap.val();
      if (lineId) {
        const richId = db.ref("line_constance/liff");
        richId.once("value", (shot) => {
          var id = shot.val();
          if (role === "customer") {
            line.client.linkRichMenuToUser(lineId, id.customer);
          } else {
            line.client.linkRichMenuToUser(lineId, id.business);
          }
        });
      }
    });
  });

exports.createCustomToken = functions
  .runWith(runtimeOpts)
  .https.onRequest((request, response) => {
    if (request.body.access_token === undefined) {
      const ret = {
        error_message: "AccessToken not found",
      };
      return response.status(400).send(ret);
    }

    return verifyLineToken(request.body)
      .then((customAuthToken) => {
        const ret = {
          firebase_token: customAuthToken,
        };
        return response.status(200).send(ret);
      })
      .catch((err) => {
        const ret = {
          error_message: `Authentication error: ${err}`,
        };
        return response.status(200).send(ret);
      });
  });

function verifyLineToken(body) {
  return request({
    method: "GET",
    uri: `https://api.line.me/oauth2/v2.1/verify?access_token=${body.access_token}`,
    json: true,
  })
    .then((response) => {
      if (response.client_id !== functions.config().line.channelid) {
        console.log("response.client_id", response.client_id);
        console.log("config", functions.config().line.channelid);
        return Promise.reject(new Error("LINE channel ID mismatched"));
      }
      return getFirebaseUser(body);
    })
    .then((userRecord) => {
      return admin.auth().createCustomToken(userRecord.uid);
    })
    .then((token) => {
      return token;
    });
}

function createUser(user) {
  return admin
    .auth()
    .createUser({
      uid: user.userId,
      displayName: user.displayName,
      photoURL: user.pictureUrl,
      email: user.email,
      phoneNumber: user.phoneNumber,
    })
    .then((userRecord) => {
      users.child(userRecord.uid).set({
        avatarUrl: userRecord.photoURL,
        displayName: userRecord.displayName,
        email: userRecord.email,
        providerData: userRecord.providerData,
      });
      return userRecord;
    });
}

function getFirebaseUser(body) {
  return admin
    .auth()
    .getUserByEmail(body.email)
    .then((userRecord) => {
      return userRecord;
    })
    .catch((error) => {
      if (error.code === "auth/user-not-found") {
        return createUser(body);
      }
      return Promise.reject(error);
    });
}

function updateUser(user) {
  const userRole = user.position ? user.position : "customer";
  users.child(user.uid).update({
    role: userRole,
    firstName: body.firstName,
    lastName: body.lastName,
    restaurant: body.restaurantNameEN ? body.restaurantNameEN : "",
  });
  if (userRole === "owner") {
    var restaurants = db.ref("restaurants");
    restaurants.child(body.restaurantNameEN).set({
      name: body.restaurantNameEN,
      nameTH: body.restaurantNameTH,
    });
  }
  const richId = db.ref("line_constance/liff");
  richId.on("child_changed", (snapshot) => {
    var id = snapshot.val();
    if (userRole === "customer") {
      client.linkRichMenuToUser(body.userId, id.customer);
    } else {
      client.linkRichMenuToUser(body.userId, id.business);
    }
  });
}

exports.businessSignUp = functions.https.onRequest((request, response) => {
  if (request.body.uid === undefined) {
    const ret = {
      error_message: "User not found",
    };
    return response.status(400).send(ret);
  }
  var restaurants = db.ref("restaurants");
  users.child(request.body.uid).update({
    role: request.body.position,
    firstName: request.body.firstName,
    lastName: request.body.lastName,
    restaurant: request.body.restaurantNameEN,
  });
  if (request.body.position === "owner") {
    var restaurant = restaurants.child(request.body.restaurantNameEN);
    restaurant.set({
      name: request.body.restaurantNameEN,
      nameTH: request.body.restaurantNameTH,
      pictureUrl: request.body.pictureUrl,
    });
    restaurant.child("staff").push({ id: request.body.uid });
  } else {
    restaurants.child("staff").push({ id: request.body.uid });
  }
  return response.status(200).send({ message: "success" });
});

exports.scheduledNotificationReceiveTable = functions.pubsub
  .schedule("every 1 mins")
  .timeZone("Asia/Bangkok")
  .onRun((context) => {
    db.ref("book_a_table")
      .orderByChild("date")
      .limitToFirst(99)
      .once("value", (snapshot) => {
        const nowDate = new Date();

        snapshot.forEach((data) => {
          const dataVal = data.val();
          const elapsedTime = Math.floor(
            (dataVal.date - nowDate.getTime()) / 1000 / 60 / 60
          );
          const elapsedTimeMin = Math.floor(
            (dataVal.date - nowDate.getTime()) / 1000 / 60
          );
          if (elapsedTime <= 1 && dataVal.notification) {
            data.ref.update({ notification: false });
            if (dataVal.lineId) {
              var message =
                elapsedTime === 1
                  ? `อีก ${elapsedTime} ชั่วโมง `
                  : `อีก ${elapsedTimeMin} นาที `;
              message += `จะถึงเวลาที่คุณจองโต๊ะ ณ ร้าน ${String(
                dataVal.restaurant
              )}`;
              line.client.pushMessage(dataVal.lineId, {
                type: "text",
                text: message,
              });
            }
          }
        });
      });
  });

exports.ordersProgressNotification = functions.database
  .ref("/orders_process/{userId}/{process}/{restaurantId}/restaurant")
  .onCreate((snapshot, context) => {
    // Grab the current value of what was written to the Realtime Database.
    const restaurant = snapshot.val();

    // You must return a Promise when performing asynchronous tasks inside a Functions such as
    // writing to the Firebase Realtime Database.
    db.ref(`users/${context.params.userId}`).once("value", (userSnap) => {
      let userData = userSnap.val();
      var message = "";
      switch (context.params.process) {
        case "ordering":
          return db
            .ref("users")
            .orderByChild("restaurant")
            .equalTo(context.params.restaurantId)
            .once("value", (snap) => {
              snap.forEach((users) => {
                let user = users.val();
                if (user.lineId) {
                  message = `มีออเดอร์ใหม่จากคุณ ${userData.displayName}`;
                  line.client.pushMessage(user.lineId, {
                    type: "text",
                    text: message,
                  });
                }
              });
            });
        case "ordered":
          message = "ออเดอร์ของคุณเสร็จแล้ว";
          return line.client.pushMessage(userData.lineId, {
            type: "text",
            text: message,
          });
        case "wait_billing":
          return db
            .ref("users")
            .orderByChild("restaurant")
            .equalTo(context.params.restaurantId)
            .once("value", (snap) => {
              snap.forEach((users) => {
                let user = users.val();
                if (user.lineId) {
                  message = `มีการเรียกเก็บเงินจากคุณ ${userData.displayName}`;
                  line.client.pushMessage(user.lineId, {
                    type: "text",
                    text: message,
                  });
                }
              });
            });
        default:
          return null;
      }
    });
  });

//==================================================================//

// webhook callback
exports.callback = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onRequest((request, response) => {
    if (request.body.destination) {
      console.log("Destination User ID: " + request.body.destination);
    }

    // req.body.events should be an array of events
    if (!Array.isArray(request.body.events)) {
      response.status(500).end();
    }

    // handle events separately
    Promise.all(request.body.events.map(line.handleEvent))
      .then(() => response.end())
      .catch((err) => {
        console.error(err);
        response.status(500).end();
      });
  });

exports.removeUser = (uid) => {
  admin
    .auth()
    .deleteUser(uid)
    .then(() => {
      const richId = db.ref("line_constance/liff");
      richId.once("value", (shot) => {
        var id = shot.val();
        line.client.unlinkRichMenuFromUser(lineId);
      });
      users.child(uid).remove();
      return console.log("Successfully deleted user");
    })
    .catch((error) => {
      return console.log("Error deleting user:", error);
    });
};
