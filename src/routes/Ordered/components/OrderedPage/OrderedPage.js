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
import OrdersLoading from "routes/Orders/components/OrdersLoading";
import MaterialTable from "material-table";

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
  const orders = useSelector((state) => state.firebase.ordered.ordered);
  const billingCustomer = useSelector(
    (state) => state.firebase.ordered.waitBillingCustomer
  );
  const users = useSelector((state) => state.firebase.ordered.users);

  return { firebase, auth, profile, orders, billingCustomer, users };
}

function OrderedPage({ match }) {
  const classes = useStyles();
  const restaurantId = match.params.restaurantId;
  const { showSuccess } = useNotifications();
  const {
    firebase,
    auth,
    profile,
    orders,
    billingCustomer,
    users,
  } = useOrdered({
    restaurantId: restaurantId,
  });

  if (!isLoaded(orders)) {
    return <OrdersLoading />;
  }
  if (profile.role !== "customer" && !isLoaded(billingCustomer)) {
    return <OrdersLoading />;
  }

  if (profile.role !== "customer") {
    if (!isLoaded(billingCustomer) && !isLoaded(users) && (!isLoaded(billingCustomer))) {
      return <OrdersLoading />;
    }
    const usersMap = {};
    users.forEach((element) => {
      usersMap[element.key] = element.value;
    });

    return (
      !isEmpty(billingCustomer) &&
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
          <Paper>
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
                paging: false
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
                      .set(
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
            />
          </Paper>
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
            var order = {};
            orders.forEach((od) => (order[od.key] = od.value));
            firebase
              .set(`restaurants/${restaurantId}/wait_billing/${auth.uid}`, order)
              .then(() =>
                firebase
                  .remove(`restaurants/${restaurantId}/ordered/${auth.uid}`)
                  .then(() => showSuccess("กรุณารอพนักงานเก็บเงิน"))
              );
          }}
          color="primary"
          variant="contained"
          size="small"
          disabled={isEmpty(orders)}
        >
          เรียกพนักงานเก็บเงิน
        </Button>
      </div>
    </div>
  );
}

OrderedPage.propTypes = {
  match: PropTypes.object.isRequired, // from enhancer (withRouter)
};

export default OrderedPage;
