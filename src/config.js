/**
 * NOTE: This file is ignored from git tracking. In a CI environment it is
 * generated by firebase-ci based on config in .firebaserc (see .gitlab-ci.yaml).
 * This is done so that environment specific settings can be applied.
 */
// import runtimeEnv from '@mars/heroku-js-runtime-env';
export const env = 'local'
// export const env = runtimeEnv();
// console.log('React Nara', process.env.REACT_APP_FIREBASE_CONFIG_BASE64);

// Config for firebase
export const firebase = JSON.parse(new Buffer(process.env.REACT_APP_FIREBASE_CONFIG_BASE64, 'base64'));

// Config to override default reduxFirebase config in store/createStore
// which is not environment specific.
// For more details, visit http://react-redux-firebase.com/docs/api/enhancer.html
export const reduxFirebase = {
  userProfile: 'users',
  presence: 'presence',
  updateProfileOnLogin: false,
  profileParamsToPopulate: [
    { child: 'role', root: 'roles' }, // populates user's role with matching role object from roles
  ],
  enableLogging: false, // enable/disable Firebase Database Logging
  fileMetadataFactory: (uploadRes, firebase, metadata, downloadURL) => {
    // upload response from Firebase's storage upload
    const { metadata: { name, fullPath } } = uploadRes
    // default factory includes name, fullPath, downloadURL
    return {
      name,
      fullPath,
      downloadURL
    }
  }
}

export const line = {
  main: {liffId: process.env.REACT_APP_LIFF_ID_MAIN},
  signup: {liffId: process.env.REACT_APP_LIFF_ID_SIGN_UP}
}

export default {
  env,
  firebase,
  reduxFirebase,
  line
}