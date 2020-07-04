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
import styles from "./BillingPage.styles";
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
  const {
    profile,
    billing,
    billingCustomer,
    users,
  } = useBilling({
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
      <Table aria-label="ordering table">
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
    if (!isLoaded(billingCustomer) && !isLoaded(users)) {
      return <OrdersLoading />;
    }
    const usersMap = {};
    users.forEach((element) => {
      usersMap[element.key] = element.value;
    });

    if (!isEmpty(billingCustomer)) {
      return (
        <div className={classes.root}>
          {billingCustomer.map((billc) =>
            Object.keys(billc.value).map((key) =>
              tableView(billc.value[key], true, usersMap[billc.key])
            )
          )}
        </div>
      );
    }

    // return (
    //   !isEmpty(billingCustomer) &&
    //   billingCustomer.map((element) => {
    //     return (
    //       <div className={classes.root}>
    //         <TableContainer component={Paper}>
    //           <Table className={classes.table} aria-label="billing c table">
    //             <TableHead>
    //               <TableRow>
    //                 <TableCell>
    //                   รายการอาหารของ{" "}
    //                   {`${usersMap[element.key].firstName} ${
    //                     usersMap[element.key].lastName
    //                   }`}
    //                 </TableCell>
    //                 <TableCell align="right"></TableCell>
    //                 <TableCell align="right"></TableCell>
    //               </TableRow>
    //               <TableRow>
    //                 <TableCell>รายการอาหาร</TableCell>
    //                 <TableCell align="right">จำนวน</TableCell>
    //                 <TableCell align="right">ราคา</TableCell>
    //               </TableRow>
    //             </TableHead>
    //             <TableBody>
    //               {Object.keys(element.value).map((key) => (
    //                 <TableRow key={element.value[key].foodName}>
    //                   <TableCell component="th" scope="row">
    //                     {element.value[key].foodName}
    //                   </TableCell>
    //                   <TableCell align="right">
    //                     {element.value[key].count}
    //                   </TableCell>
    //                   <TableCell align="right">
    //                     {element.value[key].price}
    //                   </TableCell>
    //                 </TableRow>
    //               ))}
    //             </TableBody>
    //           </Table>
    //         </TableContainer>
    //       </div>
    //     );
    //   })
    // );
  }

  if (!isLoaded(billing)) return <OrdersLoading />;

  return (
    <div className={classes.root}>
      {!isEmpty(billing) && billing.map((bill) => tableView(bill.value))}
    </div>
  );

  // return (
  //   <div className={classes.root}>
  //     <TableContainer component={Paper}>
  //       <Table className={classes.table} aria-label="billing table">
  //         <TableHead>
  //           <TableRow>
  //             <TableCell>รายการอาหาร</TableCell>
  //             <TableCell align="right">จำนวน</TableCell>
  //             <TableCell align="right">ราคา</TableCell>
  //           </TableRow>
  //         </TableHead>
  //         <TableBody>
  //           {!isEmpty(billing) &&
  //             billing.map((order, ind) => (
  //               <TableRow key={order.value.foodName}>
  //                 <TableCell component="th" scope="row">
  //                   {order.value.foodName}
  //                 </TableCell>
  //                 <TableCell align="right">{order.value.count}</TableCell>
  //                 <TableCell align="right">{order.value.price}</TableCell>
  //               </TableRow>
  //             ))}
  //         </TableBody>
  //       </Table>
  //     </TableContainer>
  //   </div>
  // );
}

BillingPage.propTypes = {
  match: PropTypes.object.isRequired, // from enhancer (withRouter)
};

export default BillingPage;
