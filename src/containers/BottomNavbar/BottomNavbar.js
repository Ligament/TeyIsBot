import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import ViewModuleIcon from "@material-ui/icons/ViewModule";
import MenuBookIcon from "@material-ui/icons/MenuBook";
import RestaurantMenuIcon from "@material-ui/icons/RestaurantMenu";
import BorderColorIcon from "@material-ui/icons/BorderColor";
import styles from "./BottomNavbar.styles";
import {
  BottomNavigationAction,
  BottomNavigation,
  Menu,
  MenuItem,
} from "@material-ui/core";

const useStyles = makeStyles(styles);

function BottomNavbar({ onChange, value, menuHandle }) {
  const classes = useStyles();

  // Get profile from redux state
  const profile = useSelector((state) => state.firebase.profile);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (target) => () => {
    setAnchorEl(null);
    menuHandle(target);
  };

  if (profile.isLoaded && !profile.isEmpty) {
    const role = profile.role;
    if (role !== "customer") {
      return (
        <BottomNavigation
          value={value}
          onChange={onChange}
          showLabels
          className={classes.root}
        >
          <BottomNavigationAction
            key="book-a-table"
            label="จัดโต๊ะ"
            value={0}
            icon={<ViewModuleIcon />}
          />
          <BottomNavigationAction
            key="food-menu"
            label="รายการอาหาร"
            value={1}
            icon={<MenuBookIcon />}
          />
          {/* {(role === "waiter" ||
              role === "cashier" ||
              role === "owner" ||
              role === "admin") && (
              <BottomNavigationAction
                key="receive-order"
                label="รับรายการอาหาร"
                value={2}
                icon={<BorderColorIcon />}
              />
            )} */}
          {(role === "chef" ||
            role === "cashier" ||
            role === "owner" ||
            role === "admin") && (
            <BottomNavigationAction
              key="order"
              label="อาหารที่ลูกค้าสั่ง"
              value={3}
              icon={<RestaurantMenuIcon />}
            />
          )}
        </BottomNavigation>
      );
    }
  }

  return (
    <BottomNavigation
      value={value}
      onChange={onChange}
      showLabels
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
        onClick={handleClick}
      />
      <Menu
        id="order-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose("")}
      >
        <MenuItem onClick={handleClose("billing")}>ประวัติ</MenuItem>
        <MenuItem onClick={handleClose("ordered")}>รอจ่ายเงิน</MenuItem>
        <MenuItem onClick={handleClose("ordering")}>ยืนยันแล้ว</MenuItem>
        <MenuItem onClick={handleClose("order")}>รายการของฉัน</MenuItem>
      </Menu>
    </BottomNavigation>
  );
}

export default BottomNavbar;
