import React, { useEffect, useState } from "react";
import { Link, useHistory, Route, Switch } from "react-router-dom";
import GoogleButton from "react-google-button";
import Paper from "@material-ui/core/Paper";
import { useFirebase, isLoaded, isEmpty } from "react-redux-firebase";
import { makeStyles } from "@material-ui/core/styles";
import { LOGIN_PATH, SIGNUP_PATH } from "constants/paths";
import { useNotifications } from "modules/notification";
import SignupForm from "../SignupForm";
import styles from "./SignupPage.styles";
import { ButtonBase, Typography, Grid, Button } from "@material-ui/core";
import liff from "utils/liff";
import { line } from "config";
import lineLoginButton from "static/btn_base.png";
import { renderChildren } from "utils/router";
import CustomerSignup from "routes/Signup/routes/Customer";
import BusinessSignup from "routes/Signup/routes/Business";
import { useSelector } from "react-redux";
import { getFirebaseToken } from "store/user";
import LoadingSpinner from "components/LoadingSpinner";

const useStyles = makeStyles(styles);

function SignupPage({ match, location }) {
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

  useEffect(() => {
    if (!liff.isInit()) {
      return <LoadingSpinner />;
    } else {
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
            })
        );
      } else if (!liff.isLoggedIn() && values.oneTimeLogin) {
        setValues({ isLoaded: true, oneTimeLogin: false });
      }
    }
  }, [firebase, values]);

  if (!values.isLoaded) {
    return <LoadingSpinner />;
  }

  return (
    <Switch>
      {renderChildren([CustomerSignup, BusinessSignup], match)}
      <Route
        exact
        path={match.path}
        render={() =>
          isEmpty(auth) ? (
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
          ) : (
            <div className={classes.root}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Grid
                    container
                    direction="column"
                    justify="center"
                    alignItems="center"
                    spacing={3}
                  >
                    <Grid item>
                      <Button
                        variant="contained"
                        component={Link}
                        to="/signup/customer"
                        color="primary"
                      >
                        Customer
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button
                        variant="contained"
                        component={Link}
                        to="/signup/business"
                        color="secondary"
                      >
                        Business
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </div>
          )
        }
      />
    </Switch>
  );
}

// SignupPage.propTypes = {
//   match: PropTypes.object.isRequired, // from enhancer (withRouter)
// };

export default SignupPage;
