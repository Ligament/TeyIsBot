import React from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import {
  useFirebaseConnect,
  isLoaded,
  useFirebase,
} from "react-redux-firebase";
import { useParams, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import LoadingSpinner from "components/LoadingSpinner";
import styles from "./FoodMenuPage.styles";
import {
  ButtonGroup,
  Button,
  Paper,
  CardHeader,
  IconButton,
  OutlinedInput,
} from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";
import AddIcon from "@material-ui/icons/Add";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import RemoveIcon from "@material-ui/icons/Remove";
import { useNotifications } from "modules/notification";

const useStyles = makeStyles(styles);

function MenuPage(props) {
  const classes = useStyles();
  const [count, setCount] = React.useState(1);
  const firebase = useFirebase();
  const history = useHistory();
  const auth = useSelector((state) => state.firebase.auth);
  const profile = useSelector((state) => state.firebase.profile);
  const { showSuccess, showError } = useNotifications();
  const foodMenuId = props.match.params.foodMenuId;
  const pathUrl = props.match.url;
  const restaurantId = pathUrl.split("/")[2];

  // Create listener for projects
  useFirebaseConnect(() => [{ path: `menus/${restaurantId}/${foodMenuId}` }]);

  // Get projects from redux state
  const menu = useSelector(
    ({ firebase: { data } }) => data.menus && data.menus[foodMenuId]
  );

  // Show loading spinner while project is loading
  if (!(isLoaded(menu) && isLoaded(profile))) {
    return (
      <div className={classes.root}>
        <Card className={classes.card}>
          <Skeleton animation="wave" variant="rect" className={classes.cover} />
          <CardContent>
            <Typography
              gutterBottom
              variant="h5"
              component="h2"
              className={classes.title}
            >
              <Skeleton />
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              <Skeleton />
            </Typography>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleClick = (event) => {
    if (count) {
      firebase.set(`orders/${auth.uid}/orders/${restaurantId}`, {
        restaurantId,
      });
      firebase
        .push(`restaurants/${restaurantId}/orders/${auth.uid}`, {
          foodName: menu.foodName,
          count: count,
          price: menu.price,
          createdAt: firebase.database.ServerValue.TIMESTAMP,
        })
        .then(() => {
          showSuccess("เพิ่มรายการอาหารแล้ว");
        })
        .catch((err) => {
          console.error("Error:", err); // eslint-disable-line no-console
          showError(err.message || "Could not add menu");
          return Promise.reject(err);
        });
    }
  };

  const handleDelete = () => {
    history.goBack();
    firebase.remove(`restaurants/${restaurantId}/menus/${foodMenuId}`);
  };

  return (
    <div className={classes.root}>
      {profile.role !== "customer" && (
        <CardHeader
          action={
            <IconButton aria-label="Delete" onClick={handleDelete}>
              <DeleteForeverIcon />
            </IconButton>
          }
          title={(menu && menu.foodName) || "Menu"}
          subheader={new Date(menu && menu.createdAt).toDateString()}
        />
      )}
      <Card className={classes.card}>
        <CardMedia
          component="img"
          className={classes.media}
          image={`${menu && menu.pictureUrl}`}
          title={`${menu && menu.foodName}`}
        />
        <CardContent>
          <Typography
            gutterBottom
            variant="h5"
            component="h2"
            className={classes.title}
          >
            {(menu && menu.foodName) || "Menu"}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            {(menu && menu.detail) || ""}
          </Typography>
        </CardContent>
      </Card>
      {profile.role === "customer" && (
        <div className={classes.order}>
          <ButtonGroup size="small">
            <Button
              aria-label="reduce"
              onClick={() => {
                setCount(Math.max(count - 1, 0));
              }}
            >
              <RemoveIcon fontSize="small" />
            </Button>
            <OutlinedInput
              id="orderCount"
              type="number"
              value={count}
              margin="dense"
              className={classes.qty}
            ></OutlinedInput>
            <Button
              aria-label="increase"
              onClick={() => {
                setCount(count + 1);
              }}
            >
              <AddIcon fontSize="small" />
            </Button>
          </ButtonGroup>
          <Button
            variant="contained"
            color="primary"
            style={{ right: 0, position: "absolute", height: 40 }}
            onClick={handleClick}
          >
            สั่ง
          </Button>
        </div>
      )}
    </div>
  );
}

export default MenuPage;
