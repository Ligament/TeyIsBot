import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { makeStyles } from "@material-ui/core/styles";
import { Button, Grid, MenuItem } from "@material-ui/core";
import TextField from "components/FormTextField";
import { required } from "utils/form";
import styles from "./CustomerForm.styles";
import SelectField from "components/FormSelectField";

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
          <Button
            color="primary"
            type="submit"
            variant="contained"
            disabled={pristine || submitting}
          >
            {submitting ? "Loading" : "ลงทะเบียน"}
          </Button>
        </Grid>
      </Grid>
      {/* <Field
        name="username"
        component={TextField}
        autoComplete="username"
        label="Username"
        variant="outlined"
        validate={required}
      />
      <Field
        name="email"
        component={TextField}
        autoComplete="email"
        label="Email"
        variant="outlined"
        validate={[required, validateEmail]}
      />
      <Field
        name="password"
        component={TextField}
        autoComplete="current-password"
        label="Password"
        type="password"
        variant="outlined"
        validate={required}
      /> */}
      {/* <div className={classes.submit}>
        <Button
          color="primary"
          type="submit"
          variant="contained"
          disabled={pristine || submitting}
        >
          {submitting ? "Loading" : "Sign Up"}
        </Button>
      </div> */}
    </form>
  );
}

CustomerForm.propTypes = {
  pristine: PropTypes.bool.isRequired, // from enhancer (reduxForm)
  submitting: PropTypes.bool.isRequired, // from enhancer (reduxForm)
  handleSubmit: PropTypes.func.isRequired, // from enhancer (reduxForm - calls onSubmit)
};

export default CustomerForm;
