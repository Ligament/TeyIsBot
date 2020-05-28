"use strict";

import {
  client as lineClient,
  handleEvent as lineHandleEvent,
} from "./lineHandleEvent";
const functions = require("firebase-functions");
const request = require("request-promise");
const admin = require("firebase-admin");
const spawn = require("child-process-promise").spawn;
const path = require("path");
const os = require("os");
const fs = require("fs");

admin.initializeApp();

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

exports.createCustomToken = functions
  .region("asia-northeast1")
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

function getFirebaseUser(body) {
  const firebaseUid = `line:${body.id}`;

  return admin
    .auth()
    .getUser(firebaseUid)
    .then((userRecord) => {
      return userRecord;
    })
    .catch((error) => {
      if (error.code === "auth/user-not-found") {
        return admin.auth().createUser({
          uid: firebaseUid,
          displayName: body.name,
          photoURL: body.picture,
          email: body.email,
        });
      }
      return Promise.reject(error);
    });
}

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
    Promise.all(request.body.events.map(lineHandleEvent))
      .then(() => response.end())
      .catch((err) => {
        console.error(err);
        response.status(500).end();
      });
  });
