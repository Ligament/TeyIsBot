import React from "react";
import Skeleton from "@material-ui/lab/Skeleton";
import { makeStyles } from "@material-ui/core/styles";
import styles from "./OrdersLoading.styles";
import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@material-ui/core";

const useStyles = makeStyles(styles);

function OrdersLoading() {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <TableContainer component={Paper} className={classes.table}>
        <Table aria-label="loading table">
          <TableHead>
            <TableRow>
              <TableCell>รายการอาหาร</TableCell>
              <TableCell align="right">จำนวน</TableCell>
              <TableCell align="right">ราคาต่อหน่วย</TableCell>
              <TableCell align="right">ราคา (บาท)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow key="loading">
              <TableCell component="th" scope="row">
                <Skeleton />
              </TableCell>
              <TableCell align="right">
                <Skeleton />
              </TableCell>
              <TableCell align="right">
                <Skeleton />
              </TableCell>
              <TableCell align="right">
                <Skeleton />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default OrdersLoading;
