import React, { useState } from "react";
import PropTypes, { func } from "prop-types";
import {
  isEmpty,
  isLoaded,
  useFirebase,
  useFirebaseConnect,
} from "react-redux-firebase";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import { useNotifications } from "modules/notification";
import styles from "./OrderingPage.styles";
import MaterialTable from "material-table";

import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@material-ui/core";
import OrdersLoading from "routes/Orders/components/OrdersLoading";

const useStyles = makeStyles(styles);

function useOrdering({ restaurantId }) {
  const { showSuccess, showError } = useNotifications();
  const firebase = useFirebase();
  // Get auth from redux state
  const auth = useSelector((state) => state.firebase.auth);
  const profile = useSelector((state) => state.firebase.profile);
  // Attach todos listener
  useFirebaseConnect([
    {
      path: `restaurants/${restaurantId}/ordering/${auth.uid}`,
      storeAs: "ordering",
      // queryParams: ['orderByChild=createdBy', `equalTo=${auth.uid}`]
    },
    {
      path: `restaurants/${restaurantId}/ordered`,
      storeAs: "orderedCustomer",
      // queryParams: ['orderByChild=createdBy', `equalTo=${auth.uid}`]
    },
  ]);

  // Get projects from redux state
  const orders = useSelector((state) => state.firebase.ordered.ordering);
  const orderedCustomer = useSelector(
    (state) => state.firebase.ordered.orderedCustomer
  );
  const users = useSelector((state) => state.firebase.ordered.users);

  return { firebase, auth, profile, orders, orderedCustomer, users };
}

function OrderingPage({ match }) {
  const classes = useStyles();
  const restaurantId = match.params.restaurantId;

  const {
    firebase,
    auth,
    profile,
    orders,
    orderedCustomer,
    users,
  } = useOrdering({
    restaurantId: restaurantId,
  });

  if (!isLoaded(orders)) {
    return <OrdersLoading />;
  }
  if (profile.role !== "customer" && !isLoaded(orderedCustomer)) {
    return <OrdersLoading />;
  }

  // if (profile.role !== "customer") {
  //   if (!isLoaded(orderedCustomer) && !isLoaded(users)) {
  //     return <OrdersLoading />;
  //   }
  //   const usersMap = {};
  //   users.forEach((element) => {
  //     usersMap[element.key] = element.value;
  //   });

  //   return (
  //     !isEmpty(orderedCustomer) &&
  //     orderedCustomer.map((element) => {
  //       var ordersData = [];

  //       if (!isEmpty(element)) {
  //         ordersData = Object.keys(element.value).map((key) => ({
  //           foodName: element.value[key].foodName,
  //           qty: element.value[key].count,
  //           unit: parseInt(element.value[key].price.split("฿")[1]),
  //           price:
  //             parseInt(element.value[key].price.split("฿")[1]) *
  //             parseInt(element.value[key].count),
  //         }));
  //       }
  //       return (
  //         <Paper>
  //           <MaterialTable
  //             title={`รายการอาหารของ ${usersMap[element.key].firstName} ${
  //               usersMap[element.key].lastName
  //             }`}
  //             columns={[
  //               { title: "รายการ", field: "foodName", editable: "never" },
  //               { title: "จำนวน", field: "qty", type: "numeric" },
  //               { title: "ราคาต่อหน่วย", field: "unit", editable: "never" },
  //               { title: "ราคา (บาท)", field: "price", editable: "never" },
  //             ]}
  //             data={ordersData}
  //             options={{
  //               search: false,
  //               paging: false
  //             }}
  //             actions={[
  //               {
  //                 icon: "receipt",
  //                 tooltip: "Check bill",
  //                 isFreeAction: true,
  //                 onClick: (event) => {
  //                   firebase
  //                     .set(
  //                       `restaurants/${restaurantId}/billing/${element.key}`,
  //                       element.value
  //                     )
  //                     .then(() =>
  //                       firebase.remove(
  //                         `restaurants/${restaurantId}/ordered/${element.key}`
  //                       )
  //                     );
  //                 },
  //               },
  //             ]}
  //           />
  //         </Paper>
  //       );
  //     })
  //   );
  // }

  if (profile.role !== "customer") {
    if (!isLoaded(orderedCustomer) && !isLoaded(users)) {
      return <OrdersLoading />;
    }
    const usersMap = {};
    users.forEach((element) => {
      usersMap[element.key] = element.value;
    });

    return (
      <div className={classes.root}>
        {!isEmpty(orderedCustomer) &&
          orderedCustomer.map((element) => {
            return (
              <div className={classes.tableUser}>
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
          })}
      </div>
    );
  }

  function ccyFormat(num) {
    return `${num.toFixed(2)}`;
  }

  function priceUnit(price) {
    return parseInt(price.split("฿")[1]);
  }

  function priceRow(qty, price) {
    return qty * priceUnit(price);
  }

  var total = 0;

  return (
    <div className={classes.root}>
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>รายการอาหาร</TableCell>
              <TableCell align="right">จำนวน</TableCell>
              <TableCell align="right">ราคาต่อหน่วย</TableCell>
              <TableCell align="right">ราคา (บาท)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!isEmpty(orders) &&
              orders.map((order, ind) => {
                const pricePerRow = priceRow(
                  order.value.count,
                  order.value.price
                );
                total += pricePerRow;
                return (
                  <TableRow key={order.value.foodName}>
                    <TableCell component="th" scope="row">
                      {order.value.foodName}
                    </TableCell>
                    <TableCell align="right">{order.value.count}</TableCell>
                    <TableCell align="right">
                      {priceUnit(order.value.price)}
                    </TableCell>
                    <TableCell align="right">
                      {ccyFormat(pricePerRow)}
                    </TableCell>
                  </TableRow>
                );
              })}
            <TableRow>
              <TableCell />
              <TableCell colSpan={2}>Total</TableCell>
              <TableCell align="right">{ccyFormat(total)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

OrderingPage.propTypes = {
  match: PropTypes.object.isRequired, // from enhancer (withRouter)
};

export default OrderingPage;
