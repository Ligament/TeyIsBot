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
import styles from "./DetailTableDialog.styles";
import { Grid, DialogContentText, Typography } from "@material-ui/core";
import DateTimeField from "components/FormDateTimeField";
import Checkbox from "components/FormCheckbox";
import red from "@material-ui/core/colors/red";
import yellow from "@material-ui/core/colors/yellow";

const useStyles = makeStyles(styles);

function DetailTableDialog({
  handleSubmit,
  open,
  onRequestClose,
  table,
  users,
  handleDelete,
  handleCancel,
}) {
  const classes = useStyles();
  return (
    <Dialog open={open} onClose={onRequestClose}>
      <DialogTitle id="book-a-table-dialog-title">
        โต๊ะหมายเลข {table.tableNumber}
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
                {table.isEmpty
                  ? "โต๊ะนี้ว่าง"
                  : `โต๊ะนี้ถูกจองโดย ${
                      table.reservationBy &&
                      users[table.reservationBy].firstName
                    } ${
                      table.reservationBy && users[table.reservationBy].lastName
                    }`}
                {table.isEmpty && (
                  <Button variant="contained" onClick={handleCancel} color={yellow[400]}>
                    ทำเครื่องหมายให้โต๊ะนี้ไม่ว่าง
                  </Button>
                )}
              </DialogContentText>
            </Grid>
            {!table.isEmpty && table.time && (
              <Grid item>
                <Typography variant="caption" display="block" gutterBottom>
                  ถูกจองเวลา {new Date(table.time).toDateString()}{" "}
                  {new Date(table.time).toTimeString()}
                </Typography>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDelete} color={red[400]}>
            ลบโต๊ะนี้
          </Button>
          {!table.isEmpty && (
            <Button onClick={handleCancel} color={yellow[400]}>
              ยกเลิกจองโต๊ะนี้
            </Button>
          )}
          <Button onClick={onRequestClose} color="primary">
            ตกลง
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

DetailTableDialog.propTypes = {
  handleSubmit: PropTypes.func.isRequired, // from enhancer (reduxForm)
  open: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  table: PropTypes.object.isRequired,
  users: PropTypes.object.isRequired,
  handleDelete: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
};

export default DetailTableDialog;
