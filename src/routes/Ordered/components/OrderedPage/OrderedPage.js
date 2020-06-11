import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  isEmpty,
  isLoaded,
  useFirebase,
  useFirebaseConnect,
} from "react-redux-firebase";
import { Route, Switch, useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import FoodMenuRoute from "routes/FoodMenus/routes/FoodMenu";
import { useNotifications } from "modules/notification";
import { renderChildren } from "utils/router";
import styles from "./OrderedPage.styles";
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
import MaterialTable from "material-table";
import OrdersLoading from "components/OrdersLoading";

const useStyles = makeStyles(styles);

function useOrdered({ restaurantId }) {
  const firebase = useFirebase();
  // Get auth from redux state
  const auth = useSelector((state) => state.firebase.auth);
  const profile = useSelector((state) => state.firebase.profile);
  // Attach todos listener
  useFirebaseConnect([
    {
      path: `restaurants/${restaurantId}/ordered/${auth.uid}`,
      storeAs: "ordered",
      // queryParams: ['orderByChild=createdBy', `equalTo=${auth.uid}`]
    },
    {
      path: `restaurants/${restaurantId}/wait_billing`,
      storeAs: "waitBillingCustomer",
      // queryParams: ['orderByChild=createdBy', `equalTo=${auth.uid}`]
    },
  ]);

  // Get projects from redux state
  const ordered = useSelector((state) => state.firebase.ordered.ordered);
  const billingCustomer = useSelector(
    (state) => state.firebase.ordered.waitBillingCustomer
  );
  const users = useSelector((state) => state.firebase.ordered.users);

  return { firebase, auth, profile, ordered, billingCustomer, users };
}

function OrderedPage({ match }) {
  const classes = useStyles();
  const restaurantId = match.params.restaurantId;
  const { showSuccess } = useNotifications();
  const {
    firebase,
    auth,
    profile,
    ordered,
    billingCustomer,
    users,
  } = useOrdered({
    restaurantId: restaurantId,
  });

  const history = useHistory();

  if (!isLoaded(profile)) return <OrdersLoading />;

  if (profile.role !== "customer") {
    if (!isLoaded(billingCustomer) || !isLoaded(users)) {
      return <OrdersLoading />;
    }
    const usersMap = {};
    users.forEach((element) => {
      usersMap[element.key] = element.value;
    });

    return (
      <div className={classes.root}>
        {!isEmpty(billingCustomer) &&
          billingCustomer.map((element) => {
            var ordersData = [];

            if (!isEmpty(element)) {
              ordersData = Object.keys(element.value).map((key) => ({
                foodName: element.value[key].foodName,
                qty: element.value[key].count,
                unit: parseInt(element.value[key].price.split("฿")[1]),
                price:
                  parseInt(element.value[key].price.split("฿")[1]) *
                  parseInt(element.value[key].count),
              }));
            }
            return (
              <MaterialTable
                title={`รายการอาหารของ ${usersMap[element.key].firstName} ${
                  usersMap[element.key].lastName
                }`}
                columns={[
                  { title: "รายการ", field: "foodName", editable: "never" },
                  { title: "จำนวน", field: "qty", type: "numeric" },
                  { title: "ราคาต่อหน่วย", field: "unit", editable: "never" },
                  { title: "ราคา (บาท)", field: "price", editable: "never" },
                ]}
                data={ordersData}
                options={{
                  search: false,
                  paging: false,
                }}
                actions={[
                  {
                    icon: "call",
                    tooltip: `${usersMap[element.key].phoneNumber}`,
                    isFreeAction: true,
                    onClick: (event) => {
                      alert(`Call to ${usersMap[element.key].phoneNumber}`);
                      window.open(`tel:${usersMap[element.key].phoneNumber}`);
                    },
                  },
                  {
                    icon: "done_all",
                    tooltip: "ยืนยันการจ่ายเงิน",
                    isFreeAction: true,
                    onClick: (event) => {
                      firebase
                        .push(
                          `restaurants/${restaurantId}/billing/${element.key}`,
                          element.value
                        )
                        .then(() =>
                          firebase.remove(
                            `restaurants/${restaurantId}/wait_billing/${element.key}`
                          )
                        );
                    },
                  },
                ]}
                style={{ width: "100%", maxWidth: 768, marginBottom: 16 }}
              />
            );
          })}
      </div>
    );
  }

  if (!isLoaded(ordered)) return <OrdersLoading />;

  function ccyFormat(num) {
    return `${num.toFixed(2)}`;
  }

  function priceUnit(price) {
    return parseInt(price.split("฿")[1]);
  }

  function priceRow(qty, price) {
    return qty * priceUnit(price);
  }

  var totalPrice = 0;

  return (
    <div className={classes.root}>
      {!isEmpty(ordered) &&
        ordered.map((orders) => {
          var total = 0;
          return (
            <TableContainer
              component={Paper}
              style={{ width: "100%", maxWidth: 768, marginBottom: 16 }}
            >
              <Table className={classes.table} aria-label="ordered table">
                <TableHead>
                  <TableRow>
                    <TableCell>รายการอาหาร</TableCell>
                    <TableCell align="right">จำนวน</TableCell>
                    <TableCell align="right">ราคาต่อหน่วย</TableCell>
                    <TableCell align="right">ราคา (บาท)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.keys(orders.value).map((key) => {
                    const pricePerRow = priceRow(
                      orders.value[key].count,
                      orders.value[key].price
                    );
                    total += pricePerRow;
                    totalPrice += pricePerRow;
                    return (
                      <TableRow key={orders.value[key].foodName}>
                        <TableCell component="th" scope="row">
                          {orders.value[key].foodName}
                        </TableCell>
                        <TableCell align="right">
                          {orders.value[key].count}
                        </TableCell>
                        <TableCell align="right">
                          {orders.value[key].price}
                        </TableCell>
                        <TableCell align="right">
                          {ccyFormat(pricePerRow)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow key="total-price">
                    <TableCell />
                    <TableCell colSpan={2}>Total</TableCell>
                    <TableCell align="right">{total}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          );
        })}
      <div
        style={{
          margin: "10px 10px",
          right: 0,
          bottom: 0,
          display: "grid",
        }}
      >
        <Button
          onClick={(event) => {
            var orders = {};
            ordered.forEach((order) =>
              Object.keys(order.value).forEach(
                (key) => (orders[key] = order.value[key])
              )
            );
            firebase
              .set(
                `restaurants/${restaurantId}/wait_billing/${auth.uid}`,
                orders
              )
              .then(() =>
                firebase
                  .remove(`restaurants/${restaurantId}/ordered/${auth.uid}`)
                  .then(() =>
                    firebase
                      .remove(
                        `orders_process/${auth.uid}/ordered/${restaurantId}`
                      )
                      .then(() => showSuccess("กรุณารอพนักงานเก็บเงิน"))
                  )
              );
            firebase
              .set(`orders_process/${auth.uid}/wait_billing/${restaurantId}`, {
                restaurant: restaurantId,
              })
              .then(() => history.goBack());
          }}
          color="primary"
          variant="contained"
          size="small"
          disabled={isEmpty(ordered)}
        >
          เรียกพนักงานเก็บเงิน {totalPrice} บาท
        </Button>
      </div>
    </div>
  );
}

OrderedPage.propTypes = {
  match: PropTypes.object.isRequired, // from enhancer (withRouter)
};

export default OrderedPage;
