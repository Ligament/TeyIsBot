import React from "react";
import PropTypes from "prop-types";
import TextField from "@material-ui/core/TextField";

function FormTimePickerField({
  label,
  input,
  meta: { touched, invalid, error },
  ...custom
}) {
  return (
    <KeyboardTimePicker
      margin="normal"
      label={label}
      KeyboardButtonProps={{
        "aria-label": "change time",
      }}
      placeholder={label}
      error={touched && invalid}
      helperText={touched && error}
      {...input}
      {...custom}
    />
  );
}

FormTimePickerField.propTypes = {
  formTimePickerField: PropTypes.object,
};

export default FormTimePickerField;
