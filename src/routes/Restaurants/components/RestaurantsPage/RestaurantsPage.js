import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  isEmpty,
  isLoaded,
  useFirebase,
  useFirebaseConnect,
  firebaseConnect,
} from "react-redux-firebase";
import { Route, Switch, Redirect, useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import FoodMenuRoute from "routes/FoodMenus/routes/FoodMenu";
import { useNotifications } from "modules/notification";
import { renderChildren } from "utils/router";
import styles from "./RestaurantsPage.styles";
import RestaurantsCardLoading from "../RestaurantsCardLoading";
import RestaurantsCard from "../RestaurantsCard";
import { BOOK_A_TABLE_PATH } from "constants/paths";

const useStyles = makeStyles(styles);

function useRestaurants() {
  const { showSuccess, showError } = useNotifications();
  const firebase = useFirebase();
  // Get auth from redux state
  const auth = useSelector((state) => state.firebase.auth);
  const profile = useSelector((state) => state.firebase.profile);
  // Attach todos listener
  useFirebaseConnect([
    {
      path: "restaurants",
      queryParams: ["limitToLast=50"],
      // queryParams: ['orderByChild=createdBy', `equalTo=${auth.uid}`]
    },
    {
      path: "book_a_table",
      queryParams: ["orderByChild=owner", `equalTo=${auth.uid}`],
      storeAs: "bookATables",
    },
    {
      path: `orders/${auth.uid}/orders`,
      storeAs: "userOrders",
    },
    {
      path: `orders/${auth.uid}/ordering`,
      storeAs: "userOrdering",
    },
  ]);

  // Get projects from redux state
  const restaurants = useSelector(
    (state) => state.firebase.ordered.restaurants
  );
  const bookATables = useSelector(
    (state) => state.firebase.ordered.bookATables
  );
  const userOrders = useSelector(
    (state) => state.firebase.ordered.userOrders
  );
  const userOrdering = useSelector(
    (state) => state.firebase.ordered.userOrdering
  );

  return { auth, profile, restaurants, bookATables, userOrders, userOrdering };
}

function RestaurantsPage({ match, history }) {
  const classes = useStyles();

  const { auth, profile, restaurants, bookATables, userOrders, userOrdering } = useRestaurants();

  if (!(isLoaded(restaurants) && isLoaded(profile))) {
    return (
      <div className={classes.root}>
        <div className={classes.tiles}>
          <RestaurantsCardLoading />
        </div>
      </div>
    );
  }

  if (!isEmpty(bookATables)) {
    const bookATableFilter = bookATables.filter(
      (bookATables, index, self) =>
        index ===
        self.findIndex(
          (t) => t.value.restaurant === bookATables.value.restaurant
        )
    );
    if (
      bookATableFilter.length &&
      history.location.state.redirect !== "/book-a-table"
    ) {
      if (bookATableFilter.length === 1) {
        history.push(
          `${history.location.state.redirect}/${bookATableFilter[0].value.restaurant}`
        );
      } else {
        return (
          <Switch>
            {renderChildren([FoodMenuRoute], match, { auth })}
            <Route
              exact
              path={match.path}
              render={() => (
                <div className={classes.root}>
                  <div className={classes.tiles}>
                    {!isEmpty(restaurants) &&
                      restaurants
                        .filter((restaurant) =>
                          bookATableFilter.some(
                            (f) => f.value.restaurant === restaurant.value.name
                          )
                        )
                        .map((restaurant, ind) => {
                          if (restaurant.key === "staff") {
                            return null;
                          }
                          return (
                            <RestaurantsCard
                              key={`Restaurants-${restaurant.key}-${ind}`}
                              name={restaurant.value.name}
                              pictureUrl={restaurant.value.pictureUrl}
                              restaurantId={restaurant.key}
                            />
                          );
                        })}
                  </div>
                </div>
              )}
            />
          </Switch>
        );
      }
    } 
    // else if (history.location.state.redirect  === '/order') {
          
    // }
  }

  return (
    <Switch>
      {renderChildren([FoodMenuRoute], match, { auth })}
      <Route
        exact
        path={match.path}
        render={() => (
          <div className={classes.root}>
            <div className={classes.tiles}>
              {!isEmpty(restaurants) &&
                restaurants.map((restaurant, ind) => {
                  if (restaurant.key === "staff") {
                    return null;
                  }
                  return (
                    <RestaurantsCard
                      key={`Restaurants-${restaurant.key}-${ind}`}
                      name={restaurant.value.name}
                      pictureUrl={restaurant.value.pictureUrl}
                      restaurantId={restaurant.key}
                    />
                  );
                })}
            </div>
          </div>
        )}
      />
    </Switch>
  );
}

RestaurantsPage.propTypes = {
  match: PropTypes.object.isRequired, // from enhancer (withRouter)
};

export default RestaurantsPage;
