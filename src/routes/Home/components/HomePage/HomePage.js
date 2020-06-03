import React from "react";
import { useHistory, useLocation } from "react-router-dom";
import styles from "./HomePage.styles";
import { makeStyles, Typography } from "@material-ui/core";
import { SIGNUP_PATH } from 'constants/paths'

const useStyles = makeStyles(styles);

function Home() {
  const history = useHistory();
  const search = useLocation().search
  const params = new URLSearchParams(search);
  // if (params.get('code')) {
  //   history.push(SIGNUP_PATH)
  // }
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
