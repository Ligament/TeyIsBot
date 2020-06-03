import React from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import { makeStyles } from "@material-ui/core/styles";
import { Field } from "redux-form";
import { required } from "utils/form";
import styles from "./BookATableDialog.styles";
import {
  Grid,
  DialogContentText,
  Typography,
} from "@material-ui/core";
import DateTimeField from "components/FormDateTimeField";
import Checkbox from "components/FormCheckbox";

const useStyles = makeStyles(styles);

function BookATableDialog({ handleSubmit, open, onRequestClose, table }) {
  const classes = useStyles();
  
  return (
    <Dialog open={open} onClose={onRequestClose}>
      <DialogTitle id="book-a-table-dialog-title">
        จองโต๊ะหมายเลข {table.tableNumber}
      </DialogTitle>
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
              <DialogContentText id="book-a-table-dialog-description">
                โต๊ะนี้สามารถนั้งได้ {table.tableSize} ที่
              </DialogContentText>
              <Typography variant="caption" display="block" gutterBottom>
                เนื่องจากสถานการณ์ covid-19 จึงขอสงวนที่นั้งเหลือ{" "}
                {table.tableSize / 2} ที่
              </Typography>
            </Grid>
            <Grid item>
              <Field
                name="date"
                component={DateTimeField}
                variant="outlined"
                label="วันและเวลาที่ต้องการจอง"
                validate={[required]}
              />
            </Grid>
            <Grid item>
              <Field name="cookNow" component={Checkbox} label="ต้องการให้ทำอาหารก่อนถึงเวลาที่จอง" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onRequestClose} color="secondary">
            ยกเลิก
          </Button>
          <Button type="submit" color="primary">
            จอง
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

BookATableDialog.propTypes = {
  handleSubmit: PropTypes.func.isRequired, // from enhancer (reduxForm)
  open: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  table: PropTypes.object.isRequired,
};

export default BookATableDialog;
