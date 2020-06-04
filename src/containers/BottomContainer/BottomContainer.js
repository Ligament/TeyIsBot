import React, { useEffect, Fragment } from "react";
import { useHistory } from "react-router-dom";
import Alert from "@material-ui/lab/Alert";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import {
  useFirebase,
  useFirebaseConnect,
} from "react-redux-firebase";
import {
  BOOK_A_TABLE_PATH,
  FOOD_MENU_PATH,
  CUSTOMER_ORDER_PATH,
  RECEIVE_ORDER_PATH,
  SIGNUP_PATH,
  LOGIN_PATH,
  RESTAURANTS_PATH,
} from "constants/paths";
import styles from "./BottomContainer.styles";
import Fabs from "containers/Fabs";
import BottomNavbar from "containers/BottomNavbar";
import NewFoodMenuDialog from "./AddFoodMenuDialog";
import { useNotifications } from "modules/notification";
import AddTableDialog from "./AddTableDialog";

const useStyles = makeStyles(styles);
const mapPath = [
  BOOK_A_TABLE_PATH,
  FOOD_MENU_PATH,
  RECEIVE_ORDER_PATH,
  CUSTOMER_ORDER_PATH,
];

function addFoodMenus(props) {
  const {
    firebase,
    auth,
    profile,
    toggleDialog,
    showSuccess,
    showError,
  } = props;

  function addMenu(newInstance) {
    if (!auth.uid) {
      return null;
    }
    return firebase
      .push(`restaurants/${profile.restaurant}/menus`, {
        ...newInstance,
        createdBy: auth.uid,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
      })
      .then(() => {
        toggleDialog("addFoodMenus")();
        showSuccess("Menu added successfully");
      })
      .catch((err) => {
        console.error("Error:", err); // eslint-disable-line no-console
        showError(err.message || "Could not add menu");
        return Promise.reject(err);
      });
  }

  function addTable(newInstance) {
    if (!auth.uid) {
      return showError("You must be logged in to add a table");
    }
    if (profile.role === "customer") {
      return showError("You cannot add a table");
    }
    return firebase
      .push(`restaurants/${profile.restaurant}/table_set`, {
        ...newInstance,
        createdBy: auth.uid,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        isEmpty: true,
      })
      .then(() => {
        toggleDialog("addTable")();
        showSuccess("Table added successfully");
      })
      .catch((err) => {
        console.error("Error:", err); // eslint-disable-line no-console
        showError(err.message || "Could not add table");
        return Promise.reject(err);
      });
  }

  function editTable(editInstance) {
    if (!auth.uid) {
      return showError("You must be logged in to add a table");
    }
    if (profile.role === "customer") {
      return showError("You cannot add a table");
    }
    return firebase
      .update(`table_set/${editInstance.id}`, {
        tableNumber: editInstance.tableNumber,
        tablePositionX: editInstance.tablePositionX,
        tablePositionY: editInstance.tablePositionY,
        tableSize: editInstance.tableSize,
        modifyBy: auth.uid,
        modifyAt: firebase.database.ServerValue.TIMESTAMP,
      })
      .then(() => {
        // toggleEditDialog();
        showSuccess("Table edit successfully");
      })
      .catch((err) => {
        console.error("Error:", err); // eslint-disable-line no-console
        showError(err.message || "Could not edit table");
        return Promise.reject(err);
      });
  }

  return { addMenu, addTable };
}

function BottomContainer() {
  const classes = useStyles();
  const [values, setValues] = React.useState({
    addTable: false,
    addFoodMenus: false,
    addReceiveOrder: false,
    addOrder: false,
  });
  const [value, setValue] = React.useState(0);
  const history = useHistory();

  // Get auth from redux state
  const auth = useSelector((state) => state.firebase.auth);
  const profile = useSelector((state) => state.firebase.profile);
  const firebase = useFirebase();

  useFirebaseConnect([
    {
      path: "book_a_table",
      queryParams: ["orderByChild=owner", `equalTo=${auth.uid}`],
      storeAs: "bookATables",
    },
    {
      path: "users",
      storeAs: "users",
    },
  ]);

  const bookATables = useSelector(
    (state) => state.firebase.ordered.bookATables
  );

  const { showSuccess, showError } = useNotifications();

  const toggleDialog = (prop) => (event) => {
    setValues({ ...values, [prop]: !values[prop] });
    if (prop === "ordering" || prop === "ordered" || prop === "billing") {
      history.push(`/${prop}/${profile.restaurant}`);
    }
  };

  const { addMenu, addTable } = addFoodMenus({
    firebase,
    auth,
    profile,
    toggleDialog,
    showSuccess,
    showError,
  });

  useEffect(() => {
    if (
      history.location.pathname.split("/")[1] === "ordering" ||
      history.location.pathname.split("/")[1] === "ordered" ||
      history.location.pathname.split("/")[1] === "billing"
    ) {
      setValue(3);
    } else {
      setValue(mapPath.indexOf(`/${history.location.pathname.split("/")[1]}`));
    }
  }, [history]);

  function handleChange(event, value) {
    setValue(value);
    if (profile.role !== "customer") {
      history.push(`${mapPath[value]}/${profile.restaurant}`);
    } else {
      history.push(`${RESTAURANTS_PATH}`, { redirect: mapPath[value] });
    }
  }

  const menuHandle = (prop) => {
    history.push(`${RESTAURANTS_PATH}`, { redirect: prop });
  };

  if (
    (history.location.pathname === "/" ||
      history.location.pathname.includes(SIGNUP_PATH) ||
      history.location.pathname.includes(LOGIN_PATH)) &&
    !auth.uid
  ) {
    return null;
  }

  return (
    <Fragment>
      <NewFoodMenuDialog
        onSubmit={addMenu}
        open={values.addFoodMenus}
        onRequestClose={toggleDialog(Object.keys(values)[value])}
      />
      <AddTableDialog
        onSubmit={addTable}
        open={values.addTable}
        onRequestClose={toggleDialog(Object.keys(values)[value])}
      />
      <Fabs
        value={value}
        onClick={
          value === 1 ? toggleDialog(Object.keys(values)[value]) : toggleDialog
        }
      />
      <BottomNavbar
        onChange={handleChange}
        value={value}
        menuHandle={menuHandle}
      />
    </Fragment>
  );
}

export default BottomContainer;
