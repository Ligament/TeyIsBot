import React, { useState } from "react";
import PropTypes from "prop-types";
import { MuiPickersUtilsProvider, DateTimePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";

function FormTextField({
  label,
  input: { value, onChange },
  meta: { touched, invalid, error },
  variant,
  ...custom
}) {
  const [selectedDate, handleDateChange] = useState(new Date());
  // value = selectedDate;
  const handleChange = (event) => {
    onChange(event)
    handleDateChange(event)
  }
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <DateTimePicker
        autoOk
        label={label}
        ampm={false}
        value={value}
        onChange={handleChange}
        minDate={new Date()}
        inputVariant={variant}
        format="dd/MM/yyyy HH:mm"
        {...custom}
      />
    </MuiPickersUtilsProvider>
  );
}

FormTextField.propTypes = {
  formTextField: PropTypes.object,
};

export default FormTextField;
