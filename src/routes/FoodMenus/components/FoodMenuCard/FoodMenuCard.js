import React from "react";
import PropTypes from "prop-types";
import { useHistory } from "react-router-dom";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { useFirebase } from "react-redux-firebase";
import { FOOD_MENU_PATH } from "constants/paths";
import styles from "./FoodMenuCard.styles";
import useNotifications from "modules/notification/components/useNotifications";
import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Grid,
} from "@material-ui/core";

const useStyles = makeStyles(styles);

function FoodMenuCard({ restaurantId, name, detail, pictureUrl, price, foodId }) {
  const classes = useStyles();
  const history = useHistory();

  function goToMenu() {
    return history.push(`${FOOD_MENU_PATH}/${restaurantId}/${foodId}`);
  }

  return (
    <Card className={classes.root}>
      <CardActionArea className={classes.action} onClick={goToMenu}>
        <CardMedia
          className={classes.cover}
          image={pictureUrl}
          title={name}
        />
          <CardContent className={classes.content}>
            <Typography component="h5" variant="h5" noWrap>
              {name}
            </Typography>
            <Typography
              variant="subtitle1"
              color="textSecondary"
              component="p"
              noWrap
            >
              {detail}
            </Typography>
          </CardContent>
          <CardContent className={classes.price}>
            <Typography variant="subtitle1" color="textSecondary">
              {price}
            </Typography>
          </CardContent>
        
      </CardActionArea>
    </Card>
  );
}

FoodMenuCard.propTypes = {
  name: PropTypes.string,
};

FoodMenuCard.defaultProps = {
  showDelete: true,
};

export default FoodMenuCard;
