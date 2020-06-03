import React from "react";
import Typography from "@material-ui/core/Typography";
import Skeleton from "@material-ui/lab/Skeleton";
import { makeStyles } from "@material-ui/core/styles";
import styles from "./FoodMenuCardLoading.styles";
import { Card, CardActionArea, CardContent } from "@material-ui/core";

const useStyles = makeStyles(styles);

function FoodMenuCardLoading() {
  const classes = useStyles();
  return (
    <Card className={classes.root}>
      <CardActionArea className={classes.action}>
        <Skeleton animation="wave" variant="rect" className={classes.cover} />
        <CardContent className={classes.content}>
          <Typography component="h5" variant="h5" noWrap>
            <Skeleton />
          </Typography>
          <Typography
            variant="subtitle1"
            color="textSecondary"
            component="p"
            noWrap
          >
            <Skeleton />
          </Typography>
        </CardContent>
        <CardContent className={classes.price}>
          <Typography variant="subtitle1" color="textSecondary">
            <Skeleton />
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default FoodMenuCardLoading;
