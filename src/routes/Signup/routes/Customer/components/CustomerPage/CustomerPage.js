import React from "react";
import { useSelector } from "react-redux";
import { useFirebase } from "react-redux-firebase";
import { makeStyles } from "@material-ui/core/styles";
import { useNotifications } from "modules/notification";
import styles from "./CustomerPage.styles";
import CustomerForm from "../CustomerForm";
import { useHistory } from "react-router-dom";
import liff from "utils/liff";
import { RESTAURANTS_PATH } from "constants/paths";

const useStyles = makeStyles(styles);

function CustomerPage() {
  const classes = useStyles();
  const firebase = useFirebase();
  const auth = useSelector((state) => state.firebase.auth);
  const history = useHistory();
  const { showError, showSuccess } = useNotifications();

  const onSubmitFail = (formErrs, dispatch, err) =>
    showError(formErrs ? "Form Invalid" : err.message || "Error");

  const handleSubmit = (creds) =>
    firebase
      .update(`users/${auth.uid}/`, {
        ...creds,
        role: "customer",
      })
      .then(() => {
        firebase.updateAuth({ phoneNumber: creds.phoneNumber }, true);
        showSuccess("Sign up success");
        liff.isInClient()
          ? liff.closeWindow()
          : history.push(RESTAURANTS_PATH, { redirect: "menu" });
      })
      .catch((err) => {
        console.error("Error:", err); // eslint-disable-line no-console
        showError(err.message || "Could not sign up");
        return Promise.reject(err);
      });

  return (
    <div className={classes.root}>
      <CustomerForm onSubmit={handleSubmit} onSubmitFail={onSubmitFail} />
    </div>
  );
}

export default CustomerPage;
