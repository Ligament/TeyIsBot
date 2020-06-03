import React from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import { makeStyles } from "@material-ui/core/styles";
import { Field } from "redux-form";
import TextField from "components/FormTextField";
import { required } from "utils/form";
import styles from "./EditTableDialog.styles";
import { Grid, MenuItem } from "@material-ui/core";
import PrefixTextField from "components/FormPrefixTextField";
import ImagePicker from 'react-image-picker'
import { useFirebase } from "react-redux-firebase";
import { useSelector } from "react-redux";
import SelectField from "components/FormSelectField";

const useStyles = makeStyles(styles);
const positionMap = ['4','6','8','10']

function EditTableDialog({ handleSubmit, open, onRequestClose, tableData }) {
  const classes = useStyles();
  const firebase = useFirebase();
  
  return (
    <Dialog open={open} onClose={onRequestClose}>
      <DialogTitle id="edit-table-dialog-title">Edit Table</DialogTitle>
      <form onSubmit={handleSubmit} className={classes.inputs}>
        <DialogContent>
          <Grid
            container
            direction="column"
            justify="center"
            alignItems="center"
            spacing={2}
          >
            <Grid item>
              <Field
                name="tableSize"
                component={SelectField}
                label="Table size"
                validate={[required]}
                variant="outlined"
                classes={classes}
                value={tableData.tableSize}
                children={positionMap.map((name, key) => (
                  <MenuItem key={key} value={name}>{name}</MenuItem>
                ))}
              />
            </Grid>
            <Grid item>
              <Field
                name="tableNumber"
                component={TextField}
                label="Table number"
                validate={[required]}
                variant="outlined"
                value={tableData.tableNumber}
              />
            </Grid>
            <Grid item>
              <Field
                name="tablePositionX"
                component={TextField}
                label="Position X"
                placeholder="X"
                validate={[required]}
                variant="outlined"
                style={{maxWidth: 101}}
                value={tableData.tablePositionX}
              />
              <Field
                name="tablePositionY"
                component={TextField}
                label="Position Y"
                placeholder="Y"
                validate={[required]}
                variant="outlined"
                style={{maxWidth: 101}}
                value={tableData.tablePositionY}
              />
            </Grid>
          </Grid>
          {/* <Field name="foodPicture" label="Drag and drop an image here or click" component={UploadField} /> */}
        </DialogContent>
        <DialogActions>
          <Button onClick={onRequestClose} color="secondary">
            Cancel
          </Button>
          <Button type="submit" color="primary">
            Edit
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

EditTableDialog.propTypes = {
  handleSubmit: PropTypes.func.isRequired, // from enhancer (reduxForm)
  open: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  tableData: PropTypes.object.isRequired
};

export default EditTableDialog;
