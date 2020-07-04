import React from "react";
import PropTypes from "prop-types";
import {
  isEmpty,
  isLoaded,
  useFirebaseConnect,
} from "react-redux-firebase";
import { Route, Switch } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import FoodMenuRoute from "routes/FoodMenus/routes/FoodMenu";
import { renderChildren } from "utils/router";
import styles from "./RestaurantsPage.styles";
import RestaurantsCardLoading from "../RestaurantsCardLoading";
import RestaurantsCard from "../RestaurantsCard";

const useStyles = makeStyles(styles);

function useRestaurants() {
  // Get auth from redux state
  const auth = useSelector((state) => state.firebase.auth);
  const profile = useSelector((state) => state.firebase.profile);
  // Attach todos listener
  useFirebaseConnect([
    {
      path: "restaurants",
      queryParams: ["orderByChild=name"],
      // queryParams: ['orderByChild=createdBy', `equalTo=${auth.uid}`]
    },
    {
      path: "book_a_table",
      queryParams: ["orderByChild=owner", `equalTo=${auth.uid}`],
      storeAs: "bookATables",
    },
    {
      path: `orders_process/${auth.uid}/orders`,
      storeAs: "userOrders",
    },
    {
      path: `orders_process/${auth.uid}/ordering`,
      storeAs: "userOrdering",
    },
    {
      path: `orders_process/${auth.uid}/ordered`,
      storeAs: "userOrdered",
    },
  ]);

  // Get projects from redux state
  const restaurants = useSelector(
    (state) => state.firebase.ordered.restaurants
  );
  const bookATables = useSelector(
    (state) => state.firebase.ordered.bookATables
  );
  const userOrders = useSelector((state) => state.firebase.ordered.userOrders);
  const userOrdering = useSelector(
    (state) => state.firebase.ordered.userOrdering
  );
  const userOrdered = useSelector(
    (state) => state.firebase.ordered.userOrdered
  );

  return {
    auth,
    profile,
    restaurants,
    bookATables,
    userOrders,
    userOrdering,
    userOrdered,
  };
}

const Loading = ({ classes }) => (
  <div className={classes.root}>
    <div className={classes.tiles}>
      <RestaurantsCardLoading />
    </div>
  </div>
);

Loading.propTypes = {
  classes: PropTypes.object.isRequired,
};

const DisplayWithFilter = ({ filter, data }) => {
  return (
    <React.Fragment>
      {!isEmpty(data) &&
        data
          .filter((restaurant) =>
            filter.some((f) => f.value.restaurant === restaurant.value.name)
          )
          .map(
            (restaurant, ind) =>
              restaurant.key !== "staff" && (
                <RestaurantsCard
                  key={`Restaurants-${restaurant.key}-${ind}`}
                  name={restaurant.value.name}
                  pictureUrl={restaurant.value.pictureUrl}
                  restaurantId={restaurant.key}
                />
              )
          )}
    </React.Fragment>
  );
};

DisplayWithFilter.propTypes = {
  filter: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
};

function FilterDisplay({
  redirect,
  restaurants,
  bookATableFilter,
  userOrders,
  userOrdering,
  userOrdered,
  classes,
}) {
  if (redirect === "/menu" && bookATableFilter.length) {
    return <DisplayWithFilter filter={bookATableFilter} data={restaurants} />;
  } else if (redirect === "/order") {
    if (!isLoaded(userOrders)) return <Loading classes={classes} />;
    return (
      !isEmpty(userOrders) && (
        <DisplayWithFilter filter={userOrders} data={restaurants} />
      )
    );
  } else if (redirect === "/ordering") {
    if (!isLoaded(userOrdering)) return <Loading classes={classes} />;
    return (
      !isEmpty(userOrdering) && (
        <DisplayWithFilter filter={userOrdering} data={restaurants} />
      )
    );
  } else if (redirect === "/ordered") {
    if (!isLoaded(userOrdered)) return <Loading classes={classes} />;
    return (
      !isEmpty(userOrdered) && (
        <DisplayWithFilter filter={userOrdered} data={restaurants} />
      )
    );
  } else {
    return (
      <React.Fragment>
        {!isEmpty(restaurants) &&
          restaurants.map((restaurant, ind) => {
            return (
              restaurant.key !== "staff" && (
                <RestaurantsCard
                  key={`Restaurants-${restaurant.key}-${ind}`}
                  name={restaurant.value.name}
                  pictureUrl={restaurant.value.pictureUrl}
                  restaurantId={restaurant.key}
                />
              )
            );
          })}
      </React.Fragment>
    );
  }
}

FilterDisplay.propTypes = {
  redirect: PropTypes.object.isRequired,
  restaurants: PropTypes.object.isRequired,
  bookATableFilter: PropTypes.object.isRequired,
  userOrders: PropTypes.object.isRequired,
  userOrdering: PropTypes.object.isRequired,
  userOrdered: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

function RestaurantsPage({ match, history }) {
  const classes = useStyles();

  const {
    auth,
    profile,
    restaurants,
    bookATables,
    userOrders,
    userOrdering,
    userOrdered,
  } = useRestaurants();

  var bookATableFilter = [];

  if (!isLoaded(restaurants) || !isLoaded(profile))
    return <Loading classes={classes} />;

  if (!isLoaded(bookATables)) return <Loading classes={classes} />;

  if (!isEmpty(bookATables)) {
    bookATableFilter = bookATables.filter(
      (bookATables, index, self) =>
        index ===
        self.findIndex(
          (t) => t.value.restaurant === bookATables.value.restaurant
        )
    );
    if (bookATableFilter.length === 1 && history.location.state)
      history.push(
        `${history.location.state.redirect}/${bookATableFilter[0].value.restaurant}`,
        {redirect: history.location.state.redirect}
      );
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
              <FilterDisplay
                redirect={history.location.state ? history.location.state.redirect : "/menu"}
                restaurants={restaurants}
                bookATableFilter={bookATableFilter}
                userOrders={userOrders}
                userOrdering={userOrdering}
                userOrdered={userOrdered}
                classes={classes}
              />
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
