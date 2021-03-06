import React from "react";
import PropTypes from "prop-types";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { RESTAURANTS_PATH, BOOK_A_TABLE_PATH } from "constants/paths";
import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography
} from "@material-ui/core";
import styles from "./OrdersCard.styles";

const useStyles = makeStyles(styles);

function OrdersCard({ name, pictureUrl, restaurantId }) {
  const classes = useStyles();
  const history = useHistory();

  function goToOrder() {
    return history.push(`${BOOK_A_TABLE_PATH}/${restaurantId}`);
  }

  return (
    <Card className={classes.root}>
      <CardActionArea className={classes.action} onClick={goToOrder}>
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

OrdersCard.propTypes = {
  name: PropTypes.string,
};

export default OrdersCard;
