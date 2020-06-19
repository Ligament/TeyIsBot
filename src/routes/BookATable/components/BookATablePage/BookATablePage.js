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
// import FoodMenuRoute from "routes/FoodMenus/routes/FoodMenu";
import { useNotifications } from "modules/notification";
import { renderChildren } from "utils/router";
import LoadingSpinner from "components/LoadingSpinner";
import DisplayTable from "../DisplayTable";
import ReceiveTableDialog from "../ReceiveTableDialog";
import AddTableDialog from "../AddTableDialog";
import styles from "./BookATablePage.styles";
import ConfirmTableReservationDialog from "../ActivityBookATableDialog/ConfirmTableReservationDialog";
import CancelTableReservationDialog from "../ActivityBookATableDialog/CancelTableReservationDialog";
import EditTableDialog from "../EditTableDialog";
import DeleteTableReservationDialog from "../ActivityBookATableDialog/DeleteTableReservationDialog";
import BookATableDialog from "../BookATableDialog";
import DetailTableDialog from "../DetailTableDialog";

const useStyles = makeStyles(styles);
const positionMap = ["4", "6", "8", "10"];

function useTables({ restaurantId }) {
  const { showSuccess, showError } = useNotifications();
  const firebase = useFirebase();
  // Get auth from redux state
  const auth = useSelector((state) => state.firebase.auth);
  const profile = useSelector((state) => state.firebase.profile);

  useFirebaseConnect([
    { path: "images/tables" },
    {
      path: `restaurants/${restaurantId}/table_set`,
      storeAs: "table_set",
      // queryParams: ["limitToLast=50"],
      // queryParams: ['orderByChild=createdBy', `equalTo=${auth.uid}`]
    },
  ]);

  // Get projects from redux state
  const tableImages = useSelector((state) => state.firebase.ordered.images);
  const tableSet = useSelector((state) => state.firebase.ordered.table_set);
  const users = useSelector((state) => state.firebase.ordered.users);

  // New dialog
  const [dialogOpen, changeDialogState] = useState({
    confirmDialogOpen: false,
    cancelDialogOpen: false,
    deleteDialogOpen: false,
    detailDialogOpen: false,
  });

  const toggleDialog = (prop) => (event) => {
    changeDialogState({ ...dialogOpen, [prop]: !dialogOpen[prop] });
  };

  const bookATable = (table, customer = true) => ({ date, cookNow }) => {
    if (!auth.uid) {
      return showError("You must be logged in to book a table");
    }
    console.log(date);
    console.log("date", date.getTime());
    return firebase
      .push("book_a_table", {
        date: date.getTime(),
        cookNow,
        restaurant: restaurantId,
        tableId: table.id,
        owner: customer ? auth.uid : "restaurant",
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        lineId: (profile.lineId && customer) ? profile.lineId : null,
        notification: true,
      })
      .then((snapshot) =>
        firebase
          .update(`restaurants/${restaurantId}/table_set/${table.id}`, {
            isEmpty: false,
            reservationBy: customer ? auth.uid : "restaurant",
            bookId: snapshot.key,
            time: date.getTime(),
          })
          .then(() => {
            toggleDialog("confirmDialogOpen")();
            showSuccess("Reservation successfully");
          })
          .catch((err) => {
            console.error("Error:", err); // eslint-disable-line no-console
            showError(err.message || "Could not reservation table");
            return Promise.reject(err);
          })
      );
  };

  function cancelBookATable(table, dialogToggle = true) {
    if (!auth.uid) {
      return showError("You must be logged in to book a table");
    }
    if (profile.role !== "customer") {
      firebase.remove(`book_a_table/${table.bookId}`);
      return firebase
        .update(`restaurants/${restaurantId}/table_set/${table.id}`, {
          isEmpty: true,
          reservationBy: null,
          bookId: null,
          time: null,
        })
        .then(() => {
          if (dialogToggle) {
            toggleDialog("cancelDialogOpen")();
          }
          showSuccess("Cancel reservation successfully");
        })
        .catch((err) => {
          console.error("Error:", err); // eslint-disable-line no-console
          showError(err.message || "Could not reservation table");
          return Promise.reject(err);
        });
    }
    if (auth.uid !== table.reservationBy) {
      return showError("You cannot cancel this table reservation");
    }
    firebase.remove(`book_a_table/${table.bookId}`);
    return firebase
      .update(`restaurants/${restaurantId}/table_set/${table.id}`, {
        isEmpty: true,
        reservationBy: null,
        bookId: null,
      })
      .then(() => {
        toggleDialog("cancelDialogOpen")();
        showSuccess("Cancel reservation successfully");
      })
      .catch((err) => {
        console.error("Error:", err); // eslint-disable-line no-console
        showError(err.message || "Could not reservation table");
        return Promise.reject(err);
      });
  }

  function deleteTable(table) {
    if (!auth.uid) {
      return showError("You must be logged in to delete a table");
    }
    if (profile.role === "customer") {
      return showError("You cannot delete this table reservation");
    }
    return firebase
      .remove(`restaurants/${restaurantId}/table_set/${table.id}`)
      .then(() => {
        toggleDialog("deleteDialogOpen")();
        showSuccess("Delete successfully");
      })
      .catch((err) => {
        console.error("Error:", err); // eslint-disable-line no-console
        showError(err.message || "Could not delete table");
        return Promise.reject(err);
      });
  }

  return {
    auth,
    profile,
    tableImages,
    tableSet,
    bookATable,
    cancelBookATable,
    deleteTable,
    dialogOpen,
    toggleDialog,
    users,
  };
}

function BookATablePage(props) {
  const classes = useStyles();
  const restaurantId = props.match.params.restaurantId;
  const {
    auth,
    profile,
    tableImages,
    tableSet,
    bookATable,
    cancelBookATable,
    deleteTable,
    dialogOpen,
    toggleDialog,
    users,
  } = useTables({ restaurantId });
  var tableData = [];

  const [selectTable, setSelectTable] = useState({
    img: "",
    createdBy: "system",
    cols: 1,
    number: "0",
    isEmpty: false,
    reservationBy: "",
  });

  // Show spinner while projects are loading
  if (!(isLoaded(tableImages) && isLoaded(tableSet) && isLoaded(users))) {
    return <LoadingSpinner />;
  }

  const usersMap = {};
  users.forEach((element) => {
    usersMap[element.key] = element.value;
  });

  // Get Table Picture URL Form Firebase
  const imageUrl = tableImages.tables.map((tb) => {
    return tb.value;
  });

  const emptyTable = {
    img: imageUrl[0],
    createdBy: "system",
    cols: 1,
    number: 0,
    isEmpty: false,
  };

  // Map imageUrl to table data
  /**
   * Table data structure
   * {
   * img: URL,
   * createdBy: String,
   * cols: Number,
   * number: Number,
   * isEmpty: Boolean
   * },
   */
  // const tableData = tableSet.map(tb => {
  //   return {
  //     img: imageUrl[positionMap.indexOf(tb.tableSize)+1],
  //     createdBy: tb.createdBy,
  //     cols: (positionMap.indexOf(tb.tableSize) * 0.5) + 1,
  //     number: tb.tableNumber,
  //     isEmpty: tb.isEmpty
  //   }
  // })
  if (tableSet) {
    tableSet.forEach((data) => {
      const tb = data.value;
      const index = (tb.tablePositionX % 6) + tb.tablePositionY * 6;
      tableData[index] = {
        ...tb,
        img: imageUrl[positionMap.indexOf(tb.tableSize) + 1],
        cols: positionMap.indexOf(tb.tableSize) * 0.5 + 1,
        id: data.key,
      };
    });
    tableData = Array.from(tableData, (item) => item || emptyTable);
  }

  const handleDialog = (table) => {
    if (profile.role !== "customer") {
      setSelectTable(table);
      toggleDialog("detailDialogOpen")();
    } else if (table.isEmpty) {
      setSelectTable(table);
      toggleDialog("confirmDialogOpen")();
    } else {
      setSelectTable(table);
      toggleDialog("cancelDialogOpen")();
    }
  };
  return (
    <div className={classes.root}>
      <DetailTableDialog
        users={usersMap}
        open={dialogOpen.detailDialogOpen}
        onSubmit={bookATable(selectTable)}
        table={selectTable}
        onRequestClose={toggleDialog("detailDialogOpen")}
        handleDelete={() => deleteTable(selectTable)}
        handleCancel={() => cancelBookATable(selectTable, false)}
      />
      <BookATableDialog
        open={dialogOpen.confirmDialogOpen}
        onSubmit={bookATable(selectTable)}
        table={selectTable}
        onRequestClose={toggleDialog("confirmDialogOpen")}
      />
      <CancelTableReservationDialog
        open={dialogOpen.cancelDialogOpen}
        handleOk={() => cancelBookATable(selectTable)}
        tableNumber={selectTable.tableNumber}
        onRequestClose={toggleDialog("cancelDialogOpen")}
      />
      <div className={classes.tiles}>
        {!isEmpty(tableData) && (
          <DisplayTable tableData={tableData} handleTable={handleDialog} />
        )}
      </div>
    </div>
  );
}

BookATablePage.propTypes = {
  match: PropTypes.object.isRequired, // from enhancer (withRouter)
};

export default BookATablePage;
