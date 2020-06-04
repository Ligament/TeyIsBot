import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  isEmpty,
  isLoaded,
  useFirebase,
  useFirebaseConnect,
} from "react-redux-firebase";
import { Route, Switch } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import FoodMenuRoute from "routes/FoodMenus/routes/FoodMenu";
import { useNotifications } from "modules/notification";
import { renderChildren } from "utils/router";
import styles from "./BillingPage.styles";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
} from "@material-ui/core";
import OrdersLoading from "routes/Orders/components/OrdersLoading";
import MaterialTable from "material-table";

const useStyles = makeStyles(styles);

function useBilling({ restaurantId }) {
  const firebase = useFirebase();
  // Get auth from redux state
  const auth = useSelector((state) => state.firebase.auth);
  const profile = useSelector((state) => state.firebase.profile);
  // Attach todos listener
  useFirebaseConnect([
    {
      path: `restaurants/${restaurantId}/billing/${auth.uid}`,
      storeAs: "billing",
      // queryParams: ['orderByChild=createdBy', `equalTo=${auth.uid}`]
    },
    {
      path: `restaurants/${restaurantId}/billing`,
      storeAs: "billingCustomer",
      // queryParams: ['orderByChild=createdBy', `equalTo=${auth.uid}`]
    },
  ]);

  // Get projects from redux state
  const billing = useSelector((state) => state.firebase.ordered.billing);
  const billingCustomer = useSelector(
    (state) => state.firebase.ordered.billingCustomer
  );
  const users = useSelector((state) => state.firebase.ordered.users);

  return { firebase, auth, profile, billing, billingCustomer, users };
}

function BillingPage({ match }) {
  const classes = useStyles();
  const restaurantId = match.params.restaurantId;
  const { showSuccess } = useNotifications();
  const {
    firebase,
    auth,
    profile,
    billing,
    billingCustomer,
    users,
  } = useBilling({
    restaurantId: restaurantId,
  });

  if (!isLoaded(billing)) {
    return <OrdersLoading />;
  }
  if (profile.role !== "customer" && !isLoaded(billingCustomer)) {
    return <OrdersLoading />;
  }

  if (profile.role !== "customer") {
    if (!isLoaded(billingCustomer) && !isLoaded(users)) {
      return <OrdersLoading />;
    }
    const usersMap = {};
    users.forEach((element) => {
      usersMap[element.key] = element.value;
    });

    return (
      !isEmpty(billingCustomer) &&
      billingCustomer.map((element) => {
        return (
          <div className={classes.root}>
            <TableContainer component={Paper}>
              <Table className={classes.table} aria-label="billing c table">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      รายการอาหารของ{" "}
                      {`${usersMap[element.key].firstName} ${
                        usersMap[element.key].lastName
                      }`}
                    </TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right"></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>รายการอาหาร</TableCell>
                    <TableCell align="right">จำนวน</TableCell>
                    <TableCell align="right">ราคา</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.keys(element.value).map((key) => (
                    <TableRow key={element.value[key].foodName}>
                      <TableCell component="th" scope="row">
                        {element.value[key].foodName}
                      </TableCell>
                      <TableCell align="right">
                        {element.value[key].count}
                      </TableCell>
                      <TableCell align="right">
                        {element.value[key].price}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        );
      })
    );
  }

  return (
    <div className={classes.root}>
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="billing table">
          <TableHead>
            <TableRow>
              <TableCell>รายการอาหาร</TableCell>
              <TableCell align="right">จำนวน</TableCell>
              <TableCell align="right">ราคา</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!isEmpty(billing) &&
              billing.map((order, ind) => (
                <TableRow key={order.value.foodName}>
                  <TableCell component="th" scope="row">
                    {order.value.foodName}
                  </TableCell>
                  <TableCell align="right">{order.value.count}</TableCell>
                  <TableCell align="right">{order.value.price}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

BillingPage.propTypes = {
  match: PropTypes.object.isRequired, // from enhancer (withRouter)
};

export default BillingPage;
