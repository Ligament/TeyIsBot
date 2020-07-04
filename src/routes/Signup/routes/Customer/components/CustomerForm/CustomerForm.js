import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { makeStyles } from "@material-ui/core/styles";
import { Button, Grid } from "@material-ui/core";
import TextField from "components/FormTextField";
import { required } from "utils/form";
import styles from "./CustomerForm.styles";

const useStyles = makeStyles(styles);

function CustomerForm({ pristine, submitting, handleSubmit }) {
  const classes = useStyles();

  return (
    <form className={classes.root} onSubmit={handleSubmit}>
      <Grid
        container
        direction="column"
        justify="center"
        alignItems="center"
        spacing={2}
      >
        <Grid item>
          <Field
            name="firstName"
            autoComplete="firstName"
            component={TextField}
            label="ชื่อ"
            variant="outlined"
            validate={required}
          />
        </Grid>
        <Grid item>
          <Field
            name="lastName"
            autoComplete="lastName"
            component={TextField}
            label="นามสกุล"
            variant="outlined"
            validate={required}
          />
        </Grid>
        <Grid item>
          <Field
            name="phoneNumber"
            autoComplete="phoneNumber"
            component={TextField}
            label="เบอร์โทรศัพท์"
            variant="outlined"
            validate={required}
            type="number"
          />
        </Grid>
        <Grid item>
          <Button
            color="primary"
            type="submit"
            variant="contained"
            disabled={pristine || submitting}
            size="large"
          >
            {submitting ? "Loading" : "ลงทะเบียน"}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}

CustomerForm.propTypes = {
  pristine: PropTypes.bool.isRequired, // from enhancer (reduxForm)
  submitting: PropTypes.bool.isRequired, // from enhancer (reduxForm)
  handleSubmit: PropTypes.func.isRequired, // from enhancer (reduxForm - calls onSubmit)
};

export default CustomerForm;
