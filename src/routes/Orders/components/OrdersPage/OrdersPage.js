import React, { Fragment } from "react";
import PropTypes from "prop-types";
import {
  isEmpty,
  isLoaded,
  useFirebase,
  useFirebaseConnect,
} from "react-redux-firebase";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import { useNotifications } from "modules/notification";
import styles from "./OrdersPage.styles";
import OrdersLoading from "components/OrdersLoading";
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
import MaterialTable, { MTableBody } from "material-table";

const useStyles = makeStyles(styles);

function useOrders({ restaurantId }) {
  const firebase = useFirebase();
  // Get auth from redux state
  const auth = useSelector((state) => state.firebase.auth);
  const profile = useSelector((state) => state.firebase.profile);
  const history = useHistory();
  // Attach todos listener
  useFirebaseConnect([
    {
      path: `restaurants/${restaurantId}/orders/${auth.uid}`,
      storeAs: "orders",
    },
    {
      path: `restaurants/${restaurantId}/ordering`,
      queryParams: ["orderByChild=book_time"],
      storeAs: "orderingCustomer",
    },
  ]);

  // Get projects from redux state
  const orders = useSelector((state) => state.firebase.ordered.orders);
  const orderingCustomer = useSelector(
    (state) => state.firebase.ordered.orderingCustomer
  );
  const users = useSelector((state) => state.firebase.ordered.users);

  return { firebase, auth, profile, orders, orderingCustomer, users, history };
}

function OrdersPage({ match }) {
  const classes = useStyles();
  const restaurantId = match.params.restaurantId;
  const {
    firebase,
    auth,
    profile,
    orders,
    orderingCustomer,
    users,
    history,
  } = useOrders({
    restaurantId: restaurantId,
  });

  const { showSuccess } = useNotifications();

  if (!isLoaded(orders) || !isLoaded(profile)) {
    return <OrdersLoading />;
  }

  if (profile.role !== "customer") {
    if (!isLoaded(orderingCustomer) || !isLoaded(users)) {
      return <OrdersLoading />;
    }
    const usersMap = {};
    users.forEach((element) => {
      usersMap[element.key] = element.value;
    });

    return (
      <div className={classes.root}>
        {!isEmpty(orderingCustomer) &&
          orderingCustomer.map((usersOrders) =>
            Object.keys(usersOrders.value).map((uov) => {
              var usersOrder = usersOrders.value[uov];
              var ordersData = Object.keys(usersOrder).map((key) => ({
                foodName: usersOrder[key].foodName,
                qty: usersOrder[key].count,
                unit: parseInt(usersOrder[key].price.split("฿")[1]),
                price:
                  parseInt(usersOrder[key].price.split("฿")[1]) *
                  parseInt(usersOrder[key].count),
              }));
              return (
                <MaterialTable
                  title={`รายการอาหารของ ${
                    usersMap[usersOrders.key].firstName
                  } ${usersMap[usersOrders.key].lastName}`}
                  columns={[
                    { title: "รายการ", field: "foodName", editable: "never" },
                    {
                      title: "จำนวน",
                      field: "qty",
                      type: "numeric",
                      width: 70,
                    },
                    {
                      title: "ราคาต่อหน่วย",
                      field: "unit",
                      editable: "never",
                      width: 140,
                    },
                    {
                      title: "ราคา (บาท)",
                      field: "price",
                      editable: "never",
                      width: 135,
                    },
                  ]}
                  data={ordersData}
                  options={{
                    search: false,
                    paging: false,
                  }}
                  actions={[
                    {
                      icon: "call",
                      tooltip: `${usersMap[usersOrders.key].phoneNumber}`,
                      isFreeAction: true,
                      onClick: (event) => {
                        alert(
                          `Call to ${usersMap[usersOrders.key].phoneNumber}`
                        );
                        window.open(
                          `tel:${usersMap[usersOrders.key].phoneNumber}`
                        );
                      },
                    },
                    {
                      icon: "done",
                      tooltip: "Done",
                      isFreeAction: true,
                      onClick: (event) => {
                        firebase
                          .set(
                            `restaurants/${restaurantId}/ordered/${usersOrders.key}/${uov}`,
                            usersOrders.value[uov]
                          )
                          .then(() =>
                            firebase
                              .remove(
                                `restaurants/${restaurantId}/ordering/${usersOrders.key}/${uov}`
                              )
                              .then(() =>
                                firebase.remove(
                                  `orders_process/${usersOrders.key}/ordering/${restaurantId}`
                                )
                              )
                          );
                        firebase.set(
                          `orders_process/${usersOrders.key}/ordered/${restaurantId}`,
                          {
                            restaurant: restaurantId,
                          }
                        );
                      },
                    },
                  ]}
                  style={{ width: "100%", maxWidth: 768, marginBottom: 16 }}
                />
              );
            })
          )}
      </div>
    );
  }

  var ordersData = [];
  var totalPrice = 0;
  if (!isEmpty(orders)) {
    ordersData = orders.map((order) => {
      const price =
        parseInt(order.value.price.split("฿")[1]) * parseInt(order.value.count);
      totalPrice += price;
      return {
        foodName: order.value.foodName,
        qty: order.value.count,
        unit: parseInt(order.value.price.split("฿")[1]),
        price: price,
        key: order.key,
      };
    });
  }

  return (
    <div className={classes.root}>
      <MaterialTable
        title="รายการอาหารที่สั่ง"
        columns={[
          { title: "รายการ", field: "foodName", editable: "never" },
          { title: "จำนวน", field: "qty", type: "numeric", width: 70 },
          {
            title: "ราคาต่อหน่วย",
            field: "unit",
            type: "numeric",
            editable: "never",
            width: 140,
          },
          {
            title: "ราคา (บาท)",
            field: "price",
            type: "numeric",
            editable: "never",
            width: 135,
          },
          { title: "", field: "key", hidden: true },
        ]}
        data={ordersData}
        options={{
          search: false,
          pageSize: ordersData.length,
        }}
        editable={{
          onRowUpdate: (newData) =>
            firebase.update(
              `restaurants/${restaurantId}/orders/${auth.uid}/${newData.key}`,
              { count: newData.qty }
            ),
          onRowDelete: (oldData) =>
            firebase.remove(
              `restaurants/${restaurantId}/orders/${auth.uid}/${oldData.key}`
            ),
        }}
        components={{
          Body: (props) => (
            <Fragment>
              <MTableBody {...props} />
              <TableBody>
                <TableRow>
                  <TableCell colSpan={2} />
                  <TableCell colSpan={2}>Total</TableCell>
                  <TableCell align="right">{totalPrice}</TableCell>
                </TableRow>
              </TableBody>
            </Fragment>
          ),
          Pagination: () => (
            <td style={{ display: "flex" }}>
              <div className={classes.buttonBar}>
                <Button
                  onClick={(event) => {
                    history.goBack();
                    var order = {};
                    orders.forEach((od) => (order[od.key] = od.value));
                    firebase
                      .push(
                        `restaurants/${restaurantId}/ordering/${auth.uid}`,
                        order
                      )
                      .then(() =>
                        firebase
                          .remove(
                            `restaurants/${restaurantId}/orders/${auth.uid}`
                          )
                          .then(() =>
                            firebase
                              .remove(
                                `orders_process/${auth.uid}/orders/${restaurantId}`
                              )
                              .then(() =>
                                showSuccess("รายการอาหารถูกส่งให้พ่อครัวแล้ว")
                              )
                          )
                      );
                    firebase.set(
                      `orders_process/${auth.uid}/ordering/${restaurantId}`,
                      {
                        restaurant: restaurantId,
                      }
                    );
                  }}
                  color="primary"
                  variant="contained"
                  size="small"
                  disabled={isEmpty(orders)}
                  style={{ width: "100%" }}
                >
                  ยืนยันการสั่งอาหาร
                </Button>
              </div>
            </td>
          ),
        }}
        style={{ width: "100%", maxWidth: 768 }}
      />
    </div>
  );
}

OrdersPage.propTypes = {
  match: PropTypes.object.isRequired, // from enhancer (withRouter)
};

export default OrdersPage;
