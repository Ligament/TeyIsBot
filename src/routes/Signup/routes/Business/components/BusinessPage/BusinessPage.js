import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useFirebase } from "react-redux-firebase";
import { makeStyles } from "@material-ui/core/styles";
import { useNotifications } from "modules/notification";
import styles from "./BusinessPage.styles";
import liff from "utils/liff";
import { businessSignup } from "store/user";
import BusinessForm from "../BusinessForm";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles(styles);

function BusinessPage() {
  const classes = useStyles();
  const firebase = useFirebase();
  const history = useHistory()
  const auth = useSelector((state) => state.firebase.auth);
  const { showError, showSuccess } = useNotifications();

  const onSubmitFail = (formErrs, dispatch, err) =>
    showError(formErrs ? "Form Invalid" : err.message || "Error");
  // const withLine = (creds) =>
  //   liff
  //     .getProfile()
  //     .then((pf) =>
  //       businessSignup({
  //         ...pf,
  //         ...creds,
  //         name: `${creds.firstName} ${creds.lastName}`,
  //       }).then((data) => {
  //         firebase
  //           .login({
  //             token: data.firebase_token,
  //             profile: { email: pf.email }, // required (optional if updateProfileOnLogin: false config set)
  //           })
  //           .then(() => (liff.isInClient() ? liff.closeWindow() : history.push(`/menu/${pf.restaurant}`)))
  //           .catch((err) => showError(err.message));
  //       })
  //     )
  //     .catch((err) => showError(err.message));

  const handleSubmit = (creds) => {
    businessSignup({ uid: auth.uid, ...creds })
      .then((msg) => {
        showSuccess("Sign up success");
        if (liff.isInClient()) {
          liff.closeWindow();
        }
      })
      .catch((err) => {
        console.error("Error:", err); // eslint-disable-line no-console
        showError(err.message || "Could not sign up");
        return Promise.reject(err);
      });
  };

  return (
    <div className={classes.root}>
      <BusinessForm onSubmit={handleSubmit} onSubmitFail={onSubmitFail} />
    </div>
  );
}

export default BusinessPage;
