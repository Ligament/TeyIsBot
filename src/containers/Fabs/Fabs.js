import React from "react";
import PropTypes from "prop-types";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import styles from "./Fabs.styles";
import {
  Zoom,
  Fab,
  useScrollTrigger,
} from "@material-ui/core";
import SpeedDial from "@material-ui/lab/SpeedDial";
import SpeedDialIcon from "@material-ui/lab/SpeedDialIcon";
import SpeedDialAction from "@material-ui/lab/SpeedDialAction";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import MoreVertIcon from "@material-ui/icons/MoreVert";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import ReceiptIcon from '@material-ui/icons/Receipt';

// ตั้งค่า, แสดงบัญชี, รับชำระเงิน

const useStyles = makeStyles(styles);

function Fabs(props) {
  const { value, onClick, window } = props;
  const [open, setOpen] = React.useState(false);
  const theme = useTheme();
  const classes = useStyles(theme);

  // Get auth from redux state
  const profile = useSelector((state) => state.firebase.profile);

  const transitionDuration = {
    enter: theme.transitions.duration.enteringScreen,
    exit: theme.transitions.duration.leavingScreen,
  };

  const actions = [
    { icon: <AddIcon />, name: "Add", target: "addTable" },
    { icon: <EditIcon />, name: "Edit", target: "editTable" },
  ];

  const orderActions = [
    { icon: <ReceiptIcon />, name: "รายการที่รอเก็บเงิน", target: "ordering" },
    { icon: <AssignmentTurnedInIcon />, name: "รายการที่ต้องเก็บเงิน", target: "ordered" },
    { icon: <DoneAllIcon />, name: "ประวัติรายการ", target: "billing" },
  ];

  const allActions = [actions, [], [], orderActions];

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
      return value === 0 || value === 3 ? (
        <SpeedDial
          ariaLabel="Table Page SpeedDial"
          className={classes.speedDial}
          hidden={!((value === 0 || value === 3) && !trigger)}
          icon={
            value === 0 ? (
              <SpeedDialIcon />
            ) : (
              <SpeedDialIcon
                classes={classes.fabLime}
                icon={<MoreVertIcon />}
                openIcon={<MoreHorizIcon />}
              />
            )
          }
          onClose={handleClose}
          onOpen={handleOpen}
          open={open}
        >
          {allActions[value].map((action) => (
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
          key={"fab-add-table"}
          in={value === 1 && !trigger}
          timeout={transitionDuration}
          style={{
            transitionDelay: `${
              value === 1 && !trigger ? transitionDuration.exit : 0
            }ms`,
          }}
          unmountOnExit
        >
          <Fab
            aria-label="Add table"
            className={classes.fab}
            color="secondary"
            onClick={onClick}
          >
            <AddIcon />
          </Fab>
        </Zoom>
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
