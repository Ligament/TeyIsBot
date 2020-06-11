import React, { Fragment } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import ViewModuleIcon from "@material-ui/icons/ViewModule";
import MenuBookIcon from "@material-ui/icons/MenuBook";
import RestaurantMenuIcon from "@material-ui/icons/RestaurantMenu";
import styles from "./BottomNavbar.styles";
import {
  BottomNavigationAction,
  BottomNavigation,
  Menu,
  MenuItem,
  Popper,
  Grow,
  Paper,
  ClickAwayListener,
  MenuList,
} from "@material-ui/core";

const useStyles = makeStyles(styles);

function BottomNavbar({ onChange, value, menuHandle }) {
  const classes = useStyles();

  // Get profile from redux state
  const profile = useSelector((state) => state.firebase.profile);
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleClick = (target) => (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
    menuHandle(target);
  };

  function handleListKeyDown(event) {
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  // const handleClick = (event) => {
  //   setAnchorEl(event.currentTarget);
  // };

  // const handleClose = (target) => () => {
  //   setAnchorEl(null);
  //   menuHandle(target);
  // };

  if (!profile.isLoaded && profile.isEmpty) {
    return null;
  }

  const role = profile.role;
  if (role !== "customer") {
    return (
      <BottomNavigation
        value={value}
        onChange={onChange}
        showLabels
        className={classes.root}
      >
        {role !== "rider" && role !== "chef" && (
          <BottomNavigationAction
            key="book-a-table"
            label="จัดโต๊ะ"
            value={0}
            icon={<ViewModuleIcon />}
          />
        )}
        {role !== "rider" && (
          <BottomNavigationAction
            key="food-menu"
            label="รายการอาหาร"
            value={1}
            icon={<MenuBookIcon />}
          />
        )}
        <BottomNavigationAction
          key="order"
          label="อาหารที่ลูกค้าสั่ง"
          value={3}
          icon={<RestaurantMenuIcon />}
        />
      </BottomNavigation>
    );
  }

  return (
    <Fragment>
      <BottomNavigation
        showLabels
        value={value}
        onChange={onChange}
        className={classes.root}
      >
        <BottomNavigationAction
          key="book-a-table"
          label="จองโต๊ะ"
          value={0}
          icon={<ViewModuleIcon />}
        />
        <BottomNavigationAction
          key="food-menu"
          label="รายการอาหาร"
          value={1}
          icon={<MenuBookIcon />}
        />
        <BottomNavigationAction
          key="order"
          label="รายการ"
          value={3}
          icon={<RestaurantMenuIcon />}
          ref={anchorRef}
          aria-controls={open ? "menu-list-grow" : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
        />
        {/* <Menu
        id="order-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose("order")}
      >
        <MenuItem onClick={handleClose("billing")}>ประวัติ</MenuItem>
        <MenuItem onClick={handleClose("ordered")}>รอจ่ายเงิน</MenuItem>
        <MenuItem onClick={handleClose("ordering")}>ยืนยันแล้ว</MenuItem>
        <MenuItem onClick={handleClose("order")}>รายการของฉัน</MenuItem>
      </Menu> */}
      </BottomNavigation>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom" ? "center top" : "center bottom",
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList
                  autoFocusItem={open}
                  id="menu-list-grow"
                  onKeyDown={handleListKeyDown}
                >
                  <MenuItem onClick={handleClick("billing")}>ประวัติ</MenuItem>
                  <MenuItem onClick={handleClick("ordered")}>
                    รอจ่ายเงิน
                  </MenuItem>
                  <MenuItem onClick={handleClick("ordering")}>
                    ยืนยันแล้ว
                  </MenuItem>
                  <MenuItem onClick={handleClick("order")}>
                    รายการของฉัน
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </Fragment>
  );
}

export default BottomNavbar;
