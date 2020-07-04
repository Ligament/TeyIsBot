import React from "react";
import PropTypes from "prop-types";
import { BrowserRouter as Router } from "react-router-dom";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage"; // make sure you add this for storage
import { ReactReduxFirebaseProvider } from "react-redux-firebase";
// import { createFirestoreInstance } from 'redux-firestore'
import { Provider } from "react-redux";
import { firebase as fbConfig, reduxFirebase as rfConfig } from "config";

// Initialize Firebase instance
firebase.initializeApp(fbConfig);

function App({ routes, store }) {
  return (
    <Provider store={store}>
      <ReactReduxFirebaseProvider
        firebase={firebase}
        config={rfConfig}
        dispatch={store.dispatch}
      >
        <Router>{routes}</Router>
      </ReactReduxFirebaseProvider>
    </Provider>
  );
}

App.propTypes = {
  routes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default App;
