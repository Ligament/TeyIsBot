import React from "react";
import styles from "./HomePage.styles";
import { makeStyles, Typography } from "@material-ui/core";

const useStyles = makeStyles(styles);

function Home() {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Typography variant="h3" className={classes.title}>
        <span>always be</span>
        <div className={classes.message}>
          <div className={classes.word1}>Order food</div>
          <div className={classes.word2}>Reserve a table</div>
        </div>
      </Typography>
      {/* <h1>
        <span>always be</span>
        <div class="message">
          <div class="word1">close</div>
          <div class="word2">code</div>
          <div class="word3">creating</div>
        </div>
      </h1> */}
    </div>
  );
}

export default Home;
