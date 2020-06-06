import React from "react";
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
import OrdersLoading from "../OrdersLoading";
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
import MaterialTable, { MTablePagination } from "material-table";

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

  if (!isLoaded(orders) && !isLoaded(orderingCustomer)) {
    return <OrdersLoading />;
  }
  
  if (profile.role !== "customer") {
    if (!isLoaded(orderingCustomer) && !isLoaded(users) && !isLoaded(orders)) {
      return <OrdersLoading />;
    }
    const usersMap = {};
    users.forEach((element) => {
      usersMap[element.key] = element.value;
    });

    return (
      !isEmpty(orderingCustomer) &&
      orderingCustomer.map((element) => {
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
          <div className={classes.root}>
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
                  icon: "done",
                  tooltip: "Done",
                  isFreeAction: true,
                  onClick: (event) => {
                    alert("Menu is done");
                    firebase
                      .set(
                        `restaurants/${restaurantId}/ordered/${element.key}`,
                        element.value
                      )
                      .then(() =>
                        firebase.remove(
                          `restaurants/${restaurantId}/ordering/${element.key}`
                        )
                      );
                  },
                },
              ]}
            />
          </div>
        );
      })
    );
  }

  var ordersData = [];
  if (!isEmpty(orders)) {
    ordersData = orders.map((order) => ({
      foodName: order.value.foodName,
      qty: order.value.count,
      unit: parseInt(order.value.price.split("฿")[1]),
      price:
        parseInt(order.value.price.split("฿")[1]) * parseInt(order.value.count),
      key: order.key,
    }));
  }

  return (
    <MaterialTable
      title="รายการอาหารที่สั่ง"
      columns={[
        { title: "รายการ", field: "foodName", editable: "never" },
        { title: "จำนวน", field: "qty", type: "numeric" },
        { title: "ราคาต่อหน่วย", field: "unit", editable: "never" },
        { title: "ราคา (บาท)", field: "price", editable: "never" },
        { title: "", field: "key", hidden: true },
      ]}
      data={ordersData}
      options={{
        search: false,
        
      }}
      editable={{
        //isEditable: rowData => rowData.name === "birthYear",
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
        Pagination: (props) => (
          <div>
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
                  history.goBack();
                  var order = {};
                  orders.forEach((od) => (order[od.key] = od.value));
                  firebase
                    .set(
                      `restaurants/${restaurantId}/ordering/${auth.uid}`,
                      order
                    )
                    .then(() =>
                      firebase.remove(
                        `restaurants/${restaurantId}/orders/${auth.uid}`
                      ).then(() => showSuccess("รายการอาหารถูกส่งให้พ่อครัวแล้ว"))
                    );
                }}
                color="primary"
                variant="contained"
                size="small"
                disabled={isEmpty(orders)}
              >
                ยืนยันการสั่งอาหาร
              </Button>
            </div>
          </div>
        ),
      }}
    />
  );
}

OrdersPage.propTypes = {
  match: PropTypes.object.isRequired, // from enhancer (withRouter)
};

export default OrdersPage;
