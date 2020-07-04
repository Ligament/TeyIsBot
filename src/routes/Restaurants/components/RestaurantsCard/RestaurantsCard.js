import React from "react";
import PropTypes from "prop-types";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography
} from "@material-ui/core";
import styles from "./RestaurantsCard.styles";

const useStyles = makeStyles(styles);

function RestaurantsCard({ name, pictureUrl, restaurantId }) {
  const classes = useStyles();
  const history = useHistory();
     
  function goToRestaurant() {
    return history.push(`${history.location.state ? history.location.state.redirect : "/menu"}/${restaurantId}`);
  }

  return (
    <Card className={classes.root}>
      <CardActionArea className={classes.action} onClick={goToRestaurant}>
        <CardMedia
          className={classes.cover}
          image={pictureUrl}
          title={name}
        />
          <CardContent className={classes.content}>
            <Typography component="h5" variant="h5" noWrap>
              {name}
            </Typography>
          </CardContent>
      </CardActionArea>
    </Card>
  );
}

RestaurantsCard.propTypes = {
  name: PropTypes.string,
};

export default RestaurantsCard;
