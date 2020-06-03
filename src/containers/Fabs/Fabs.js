import React, { useEffect } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { Link, useHistory, useLocation } from "react-router-dom";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import { isLoaded, isEmpty, useFirebase } from "react-redux-firebase";
import {
  BOOK_A_TABLE_PATH,
  FOOD_MENU_PATH,
  CUSTOMER_ORDER_PATH,
  RECEIVE_ORDER_PATH,
} from "constants/paths";
import ViewModuleIcon from "@material-ui/icons/ViewModule";
import MenuBookIcon from "@material-ui/icons/MenuBook";
import RestaurantMenuIcon from "@material-ui/icons/RestaurantMenu";
import BorderColorIcon from "@material-ui/icons/BorderColor";
import styles from "./Fabs.styles";
import {
  BottomNavigationAction,
  BottomNavigation,
  Zoom,
  Fab,
  useScrollTrigger,
} from "@material-ui/core";
import SpeedDial from "@material-ui/lab/SpeedDial";
import SpeedDialIcon from "@material-ui/lab/SpeedDialIcon";
import SpeedDialAction from "@material-ui/lab/SpeedDialAction";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";

// ตั้งค่า, แสดงบัญชี, รับชำระเงิน

const useStyles = makeStyles(styles);
const mapPath = [
  BOOK_A_TABLE_PATH,
  FOOD_MENU_PATH,
  RECEIVE_ORDER_PATH,
  CUSTOMER_ORDER_PATH,
];

function Fabs(props) {
  const { value, onClick, window } = props;
  const [open, setOpen] = React.useState(false);
  const theme = useTheme();
  const classes = useStyles(theme);
  const location = useLocation();
  const history = useHistory();

  // Get auth from redux state
  const auth = useSelector((state) => state.firebase.auth);
  const profile = useSelector((state) => state.firebase.profile);
  const authExists = isLoaded(auth) && !isEmpty(auth);
  const firebase = useFirebase();

  const transitionDuration = {
    enter: theme.transitions.duration.enteringScreen,
    exit: theme.transitions.duration.leavingScreen,
  };

  const fabs = [
    {
      color: "primary",
      className: classes.fab,
      icon: <AddIcon />,
      label: "AddTable",
    },
    {
      color: "secondary",
      className: classes.fab,
      icon: <AddIcon />,
      label: "AddFood",
    },
    {
      color: "inherit",
      className: clsx(classes.fab, classes.fabTeal),
      icon: <AddIcon />,
      label: "AddReceiver",
    },
    {
      color: "inherit",
      className: clsx(classes.fab, classes.fabGreen),
      icon: <AddIcon />,
      label: "AddOrder",
    },
    {
      color: "inherit",
      className: clsx(classes.fab, classes.fabLime),
      icon: <AddIcon />,
      label: "AddReceiverOrder",
    },
  ];

  const actions = [
    { icon: <AddIcon />, name: "Add", target: "addTable" },
    { icon: <EditIcon />, name: "Edit", target: "editTable" },
  ];

  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  if (profile.isLoaded && !profile.isEmpty) {
    const role = profile.role;
    if (role !== "customer") {
      return fabs.map((fab, index) =>
        index === 0 ? (
          <SpeedDial
            ariaLabel="Table Page SpeedDial"
            className={classes.speedDial}
            hidden={!(value === index && !trigger)}
            icon={<SpeedDialIcon />}
            onClose={handleClose}
            onOpen={handleOpen}
            open={open}
          >
            {actions.map((action) => (
              <SpeedDialAction
                key={action.name}
                icon={action.icon}
                tooltipTitle={action.name}
                onClick={() => {
                  onClick(action.target)(handleClose);
                }}
              />
            ))}
          </SpeedDial>
        ) : (
          <Zoom
            key={fab.color + "-" + fab.label}
            in={value === index && !trigger}
            timeout={transitionDuration}
            style={{
              transitionDelay: `${
                value === index && !trigger ? transitionDuration.exit : 0
              }ms`,
            }}
            unmountOnExit
          >
            <Fab
              aria-label={fab.label}
              className={fab.className}
              color={fab.color}
              onClick={onClick}
            >
              {fab.icon}
            </Fab>
          </Zoom>
        )
      );
    }
  }
  return null;
}

Fabs.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func,
};

export default Fabs;
