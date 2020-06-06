import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import styles from "./SelectRolePage.styles";
import { Grid, Button } from "@material-ui/core";
import { Link, Route, Switch } from "react-router-dom";
import { renderChildren } from "utils/router";
import CustomerSignup from "routes/Signup/routes/Customer";
import BusinessSignup from "routes/Signup/routes/Business";

const useStyles = makeStyles(styles);

export default function SelectRolePage({ match }) {
  const classes = useStyles();

  return (
    <Switch>
      {renderChildren([CustomerSignup, BusinessSignup], match)}
      <Route
        exact
        path={match.path}
        render={() => (
          <div className={classes.root}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Grid
                  container
                  direction="column"
                  justify="center"
                  alignItems="center"
                  spacing={3}
                >
                  <Grid item>
                    <Button
                      variant="contained"
                      component={Link}
                      to="/signup/select-role/customer"
                      color="primary"
                      size="large"
                      style={{ width: 130 }}
                    >
                      Customer
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      component={Link}
                      to="/signup/select-role/business"
                      color="secondary"
                      size="large"
                      style={{ width: 130 }}
                    >
                      Business
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </div>
        )}
      />
    </Switch>
  );
}
