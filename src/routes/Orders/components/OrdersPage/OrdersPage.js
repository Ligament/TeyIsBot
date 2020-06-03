import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  isEmpty,
  isLoaded,
  useFirebase,
  useFirebaseConnect,
  firebaseConnect,
} from "react-redux-firebase";
import { Route, Switch } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import FoodMenuRoute from "routes/FoodMenus/routes/FoodMenu";
import { useNotifications } from "modules/notification";
import { renderChildren } from "utils/router";
import styles from "./OrdersPage.styles";
import OrdersCard from "../OrdersCard";
import OrdersCardLoading from "../OrdersCardLoading";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@material-ui/core";

const useStyles = makeStyles(styles);

function useOrders({ restaurantId }) {
  const { showSuccess, showError } = useNotifications();
  const firebase = useFirebase();
  // Get auth from redux state
  const auth = useSelector((state) => state.firebase.auth);
  const profile = useSelector((state) => state.firebase.profile);
  // Attach todos listener
  useFirebaseConnect([
    {
      path: `restaurants/${restaurantId}/orders/${auth.uid}`,
      storeAs: "orders",
      // queryParams: ['orderByChild=createdBy', `equalTo=${auth.uid}`]
    },
    {
      path: `restaurants/${restaurantId}/orders`,
      storeAs: "ordersCustomer",
      // queryParams: ['orderByChild=createdBy', `equalTo=${auth.uid}`]
    },
  ]);

  // Get projects from redux state
  const orders = useSelector((state) => state.firebase.ordered.orders);
  const ordersCustomer = useSelector(
    (state) => state.firebase.ordered.ordersCustomer
  );
  const users = useSelector((state) => state.firebase.ordered.users);

  return { auth, profile, orders, ordersCustomer, users };
}

function OrdersPage({ match }) {
  const classes = useStyles();
  console.log(match.params.restaurantId);

  const { auth, profile, orders, ordersCustomer, users } = useOrders({
    restaurantId: match.params.restaurantId,
  });

  if (!isLoaded(orders)) {
    return (
      <div className={classes.root}>
        <div className={classes.tiles}>
          <OrdersCardLoading />
        </div>
      </div>
    );
  }
  if (profile.role !== "customer" && !isLoaded(ordersCustomer)) {
    return (
      <div className={classes.root}>
        <div className={classes.tiles}>
          <OrdersCardLoading />
        </div>
      </div>
    );
  }

  if (profile.role !== "customer") {
    if (!isLoaded(ordersCustomer) && !isLoaded(users)) {
      return (
        <div className={classes.root}>
          <div className={classes.tiles}>
            <OrdersCardLoading />
          </div>
        </div>
      );
    }
    const usersMap = {};
    users.forEach((element) => {
      usersMap[element.key] = element.value;
    });
    // console.log(usersMap);

    return (
      !isEmpty(ordersCustomer) &&
      ordersCustomer.map((element) => {
        return (
          <div className={classes.root}>
            <TableContainer component={Paper}>
              <Table className={classes.table} aria-label="simple table">
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
                      <TableCell align="right">{element.value[key].count}</TableCell>
                      <TableCell align="right">{element.value[key].price}</TableCell>
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
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>รายการอาหาร</TableCell>
              <TableCell align="right">จำนวน</TableCell>
              <TableCell align="right">ราคา</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!isEmpty(orders) &&
              orders.map((order, ind) => (
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
      {/* <div className={classes.tiles}>
              {!isEmpty(orders) &&
                orders.reverse().map((order, ind) => {
                  return (
                    <OrdersCard
                      key={`Orders-${order.key}-${ind}`}
                      name={order.value.foodName}
                      orderId={order.key}
                    />
                  );
                })}
            </div> */}
    </div>
  );
}

OrdersPage.propTypes = {
  match: PropTypes.object.isRequired, // from enhancer (withRouter)
};

export default OrdersPage;
