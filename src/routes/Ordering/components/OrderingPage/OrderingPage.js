import React from "react";
import PropTypes from "prop-types";
import {
  isEmpty,
  isLoaded,
  useFirebase,
  useFirebaseConnect,
} from "react-redux-firebase";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import styles from "./OrderingPage.styles";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@material-ui/core";
import OrdersLoading from "components/OrdersLoading";

const useStyles = makeStyles(styles);

function useOrdering({ restaurantId }) {
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
  const ordering = useSelector((state) => state.firebase.ordered.ordering);
  const orderedCustomer = useSelector(
    (state) => state.firebase.ordered.orderedCustomer
  );
  const users = useSelector((state) => state.firebase.ordered.users);

  return { firebase, auth, profile, ordering, orderedCustomer, users };
}

function OrderingPage({ match }) {
  const classes = useStyles();
  const restaurantId = match.params.restaurantId;

  const {
    profile,
    ordering,
    orderedCustomer,
    users,
  } = useOrdering({
    restaurantId: restaurantId,
  });

  if (!isLoaded(profile)) return <OrdersLoading />;

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

  const tableView = (orders, showOwner = false, usersData = {}) => (
    <TableContainer
      component={Paper}
      style={{ width: "100%", maxWidth: 768, marginBottom: 16 }}
    >
      <Table className={classes.table} aria-label="ordering table">
        <TableHead>
          {showOwner && (
            <TableRow>
              <TableCell>
                รายการอาหารของ {`${usersData.firstName} ${usersData.lastName}`}
              </TableCell>
              <TableCell align="right"></TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          )}
          <TableRow>
            <TableCell>รายการอาหาร</TableCell>
            <TableCell align="right">จำนวน</TableCell>
            <TableCell align="right">ราคาต่อหน่วย</TableCell>
            <TableCell align="right">ราคา (บาท)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.keys(orders).map((key) => {
            const pricePerRow = priceRow(orders[key].count, orders[key].price);
            total += pricePerRow;
            return (
              <TableRow key={orders[key].foodName}>
                <TableCell component="th" scope="row">
                  {orders[key].foodName}
                </TableCell>
                <TableCell align="right">{orders[key].count}</TableCell>
                <TableCell align="right">
                  {priceUnit(orders[key].price)}
                </TableCell>
                <TableCell align="right">{ccyFormat(pricePerRow)}</TableCell>
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
  );

  if (profile.role !== "customer") {
    if (!isLoaded(orderedCustomer) || !isLoaded(users)) {
      return <OrdersLoading />;
    }
    const usersMap = {};
    users.forEach((element) => {
      usersMap[element.key] = element.value;
    });

    if (!isEmpty(orderedCustomer)) {
      return (
        <div className={classes.root}>
          {orderedCustomer.map((odc) =>
            Object.keys(odc.value).map((key) =>
              tableView(odc.value[key], true, usersMap[odc.key])
            )
          )}
        </div>
      );
    }
  }

  if (!isLoaded(ordering)) return <OrdersLoading />;

  return (
    <div className={classes.root}>
      {!isEmpty(ordering) && ordering.map((orders) => tableView(orders.value))}
    </div>
  );
}

OrderingPage.propTypes = {
  match: PropTypes.object.isRequired, // from enhancer (withRouter)
};

export default OrderingPage;
