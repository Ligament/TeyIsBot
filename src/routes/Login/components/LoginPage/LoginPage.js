import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useFirebase } from "react-redux-firebase";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import { SIGNUP_PATH, LOGIN_PATH, RESTAURANTS_PATH } from "constants/paths";
import { useNotifications } from "modules/notification";
import LoginForm from "../LoginForm";
import styles from "./LoginPage.styles";
import { Button, ButtonBase, Typography } from "@material-ui/core";
import liff from "utils/liff";
import Signup from "routes/Signup";
import { getFirebaseToken } from "store/user";
import LoadingSpinner from "components/LoadingSpinner";
import GoogleButton from "react-google-button";
import lineLoginButton from "static/btn_base.png";

const useStyles = makeStyles(styles);

function LoginPage() {
  const classes = useStyles();
  const firebase = useFirebase();
  const history = useHistory();
  const { showError } = useNotifications();
  const [values, setValues] = useState({ oneTimeLogin: true, isLoaded: false });

  const onSubmitFail = (formErrs, dispatch, err) =>
    showError(formErrs ? "Form Invalid" : err.message || "Error");
  const googleLogin = () =>
    firebase
      .login({ provider: "google", type: "popup" })
      .catch((err) => showError(err.message));
  const emailLogin = (creds) =>
    firebase.login(creds).catch((err) => showError(err.message));

  // const phoneNumber = "+11234567899" // for US number (123) 456-7899
  // const recaptchaVerifier = new firebase.auth.RecaptchaVerifier('sign-in-button', {
  //   'size': 'invisible',
  // });
  // const phoneLogin = () => {

  //   firebase.signInWithPhoneNumber(phoneNumber, recaptchaVerifier)
  //   .then((confirmationResult) => {
  //     // SMS sent. Prompt user to type the code from the message, then sign the
  //     // user in with confirmationResult.confirm(code).
  //     const verificationCode = window.prompt('Please enter the verification ' +
  //         'code that was sent to your mobile device.');
  //     return confirmationResult.confirm(verificationCode);
  //   })
  //   .catch((error) => {
  //     // Error; SMS not sent
  //     // Handle Errors Here
  //     return Promise.reject(error)
  //   });}

  const lineLogin = () =>
    liff.login({
      redirectUri: "https://" + window.location.hostname + LOGIN_PATH,
    });

  // if (!liff.isInit()) {
  //   return <LoadingSpinner />;
  // } else {
  //   if (liff.isLoggedIn() && values.oneTimeLogin) {
  //       setValues({ isLoaded: false, oneTimeLogin: false });
  //       liff.getProfile().then((profile) =>
  //         getFirebaseToken(profile)
  //           .then((data) =>
  //             firebase
  //               .login({
  //                 token: data.firebase_token,
  //               })
  //               .then(({ user: { user } }) =>
  //                 firebase
  //                   .update(`users/${user.uid}/`, {
  //                     lineId: profile.userId,
  //                   })
  //                   .then(() => setValues({ isLoaded: true }))
  //               )
  //           )
  //           .catch((err) => {
  //             console.log("err", err);
  //             setValues({ isLoaded: true });
  //             return history.push(SIGNUP_PATH);
  //           })
  //       );

  //   } else if (!liff.isLoggedIn() && values.oneTimeLogin) {
  //     setValues({ isLoaded: true, oneTimeLogin: false });
  //   }
  // }
  if (!liff.isInit()) return <LoadingSpinner />;

  if (liff.isLoggedIn() && values.oneTimeLogin) {
    setValues({ isLoaded: false, oneTimeLogin: false });
    liff.getProfile().then((profile) =>
      getFirebaseToken(profile)
        .then((data) =>
          firebase
            .login({
              token: data.firebase_token,
            })
            .then(({ user: { user } }) =>
              firebase
                .update(`users/${user.uid}/`, {
                  lineId: profile.userId,
                })
                .then(() => setValues({ isLoaded: true }))
            )
        )
        .catch((err) => {
          console.log("err", err);
          setValues({ isLoaded: true });
          return history.push(SIGNUP_PATH);
        })
    );
  } else if (!liff.isLoggedIn() && values.oneTimeLogin) {
    setValues({ isLoaded: true, oneTimeLogin: false });
  }

  if (!values.isLoaded) return <LoadingSpinner />;

  // useEffect(() => {
  //   if (!liff.isInit()) {
  //     return <LoadingSpinner />;
  //   } else {
      
  //   }
  // }, [firebase, history, values]);

  // useEffect(() => {
  //   liff.login();
  //   if (liff.isLoggedIn()) {
  //     getFirebaseToken()
  //     liff
  //       .getFirebaseToken()
  //       .then((data) => {
  //         firebase.login({
  //           token: data.firebase_token,
  //         })}
  //       )
  //       .catch((err) => history.push(SIGNUP_PATH));
  //   }
  // }, [firebase, history]);
  // return
  // (
  // <div className={classes.root}>
  //   <Paper className={classes.panel}>
  //     <LoginForm onSubmit={emailLogin} onSubmitFail={onSubmitFail} />
  //   </Paper>
  //   <div className={classes.orLabel}>or</div>
  //   <div className={classes.providers}>
  //     <Button onClick={googleLogin} data-test="google-auth-button" />
  //   </div>
  //   <div className={classes.signup}>
  //     <span className={classes.signupLabel}>Need an account?</span>
  //     <Link className={classes.signupLink} to={SIGNUP_PATH}>
  //       Sign Up
  //     </Link>
  //   </div>
  // </div>
  // )
  return (
    <div className={classes.root}>
      <div className={classes.providers}>
        <ButtonBase className={classes.loginButton} onClick={lineLogin}>
          <span
            className={classes.imageSrc}
            style={{
              backgroundImage: `url(${lineLoginButton})`,
            }}
          />
          <Typography
            component="span"
            color="inherit"
            className={classes.imageButton}
          >
            Sign in with Line
            <span className={classes.imageMarked} />
          </Typography>
        </ButtonBase>
      </div>
      <div className={classes.providers}>
        <GoogleButton onClick={googleLogin} />
      </div>
      <div className={classes.orLabel}>or</div>
      <Paper className={classes.panel}>
        <LoginForm onSubmit={emailLogin} onSubmitFail={onSubmitFail} />
      </Paper>
    </div>
  );
}

export default LoginPage;
