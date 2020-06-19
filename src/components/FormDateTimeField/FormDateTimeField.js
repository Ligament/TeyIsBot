import React, { useState } from "react";
import PropTypes from "prop-types";
import { MuiPickersUtilsProvider, DateTimePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";

function FormTextField({
  label,
  input,
  meta: { touched, invalid, error },
  variant,
  ...custom
}) {
  const [selectedDate, handleDateChange] = useState(new Date());
  // value = selectedDate;
  const handleChange = (event) => {
    handleDateChange(event)
    input.onChange(event)
  }
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <DateTimePicker
        autoOk
        label={label}
        ampm={false}
        value={selectedDate}
        onChange={handleChange}
        inputVariant={variant}
        onError={(err,value) => {error = value}}
        minDate={new Date().getTime()}
        format="dd/MM/yyyy HH:mm"
        // {...input}
      />
    </MuiPickersUtilsProvider>
  );
}

FormTextField.propTypes = {
  formTextField: PropTypes.object,
};

export default FormTextField;
