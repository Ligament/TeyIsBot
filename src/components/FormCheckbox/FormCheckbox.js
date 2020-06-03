import React from "react";
import PropTypes from "prop-types";
import { FormControlLabel, Checkbox } from "@material-ui/core";

function FormCheckbox({
  label,
  input,
  meta: { touched, invalid, error },
  ...custom
}) {
  return (
    <FormControlLabel
      control={<Checkbox {...input} {...custom} />}
      label={label}
    />
  );
}

FormCheckbox.propTypes = {
  formTextField: PropTypes.object,
};

export default FormCheckbox;
