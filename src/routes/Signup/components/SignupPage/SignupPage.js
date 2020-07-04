import React, { useState, Fragment } from "react";
import PropTypes from "prop-types";
import { Route, Switch, Redirect } from "react-router-dom";
import GoogleButton from "react-google-button";
import Paper from "@material-ui/core/Paper";
import { useFirebase } from "react-redux-firebase";
import { makeStyles } from "@material-ui/core/styles";
import { SIGNUP_PATH, SIGNUP_ROLE_PATH } from "constants/paths";
import { useNotifications } from "modules/notification";
import SignupForm from "../SignupForm";
import styles from "./SignupPage.styles";
import { ButtonBase, Typography } from "@material-ui/core";
import liff from "utils/liff";
import lineLoginButton from "static/btn_base.png";
import { renderChildren } from "utils/router";
import { useSelector } from "react-redux";
import { getFirebaseToken } from "store/user";
import LoadingSpinner from "components/LoadingSpinner";
import SelectRole from "routes/Signup/routes/SelectRole";

const useStyles = makeStyles(styles);

function SignupPage({ match }) {
  const classes = useStyles();
  const firebase = useFirebase();

  const auth = useSelector((state) => state.firebase.auth);

  const [values, setValues] = useState({ oneTimeLogin: true, isLoaded: false });

  const { showError } = useNotifications();

  const onSubmitFail = (formErrs, dispatch, err) =>
    showError(formErrs ? "Form Invalid" : err.message || "Error");
  const googleLogin = () =>
    firebase
      .login({ provider: "google", type: "popup" })
      .catch((err) => showError(err.message));
  const emailSignup = (creds) =>
    firebase
      .createUser(creds, {
        email: creds.email,
        username: creds.username,
      })
      .catch((err) => showError(err.message));
  const lineLogin = () =>
    liff.login({
      redirectUri: "https://" + window.location.hostname + SIGNUP_PATH,
    });

  if (!liff.isInit()) return <LoadingSpinner />;

  console.log(auth, liff.isInit());

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
          showError("Line ของคุณไม่ได้ลงทะเบียน E-mail ไว้กรุณาลงทะเบียน E-mail หรือลงทะเบียนด้วยวิธีอื่น")
          setValues({ isLoaded: true });
        })
    );
  } else if (!liff.isLoggedIn() && values.oneTimeLogin) {
    setValues({ isLoaded: true, oneTimeLogin: false });
  }

  if (!values.isLoaded) {
    return <LoadingSpinner />;
  }

  return (
    <Switch>
      {renderChildren([SelectRole], match)}
      <Route
        exact
        path={match.path}
        render={() => (
          <Fragment>
            {auth.uid && <Redirect to={SIGNUP_ROLE_PATH} />}
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
                <SignupForm
                  onSubmit={emailSignup}
                  onSubmitFail={onSubmitFail}
                />
              </Paper>
            </div>
          </Fragment>
        )}
      />
    </Switch>
  );
}

SignupPage.propTypes = {
  match: PropTypes.object.isRequired, // from enhancer (withRouter)
};

export default SignupPage;
