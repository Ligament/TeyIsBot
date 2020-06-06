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
import { RESTAURANTS_PATH } from "constants/paths";

const useStyles = makeStyles(styles);

function BusinessPage() {
  const classes = useStyles();
  const history = useHistory()
  const auth = useSelector((state) => state.firebase.auth);
  const profile = useSelector((state) => state.firebase.profile)
  const { showError, showSuccess } = useNotifications();

  const onSubmitFail = (formErrs, dispatch, err) =>
    showError(formErrs ? "Form Invalid" : err.message || "Error");

  const handleSubmit = (creds) => {
    businessSignup({ uid: auth.uid, ...creds })
      .then((msg) => {
        showSuccess("Sign up success");
        liff.isInClient()
          ? liff.closeWindow()
          : history.push(`/menu/${profile.restaurant}`);
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
