import React from "react";
import { useSelector } from "react-redux";
import { useFirebase } from "react-redux-firebase";
import { makeStyles } from "@material-ui/core/styles";
import { useNotifications } from "modules/notification";
import styles from "./CustomerPage.styles";
import CustomerForm from "../CustomerForm";

const useStyles = makeStyles(styles);

function CustomerPage() {
  const classes = useStyles();
  const firebase = useFirebase();
  const auth = useSelector((state) => state.firebase.auth);
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
        showSuccess("Sign up success");
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
