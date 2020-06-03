import React from 'react'
import { Switch, Route } from 'react-router-dom'
import CoreLayout from '../layouts/CoreLayout'
import Home from './Home'
import LoginRoute from './Login'
import SignupRoute from './Signup'
import FoodMenusRoute from './FoodMenus'
import AccountRoute from './Account'
import NotFoundRoute from './NotFound'
import BookATableRoute from './BookATable'
import RestaurantsRoute from './Restaurants'
import OrdersPageRoute from './Orders'
// import CssBaseline from "@material-ui/core/styles";

export default function createRoutes(store) {
  return (
    <CoreLayout>
      {/* <CssBaseline /> */}
      <Switch>
        <Route exact path={Home.path} component={() => <Home.component />} />
        {/* Build Route components from routeSettings */
        [
          AccountRoute,
          RestaurantsRoute,
          FoodMenusRoute,
          SignupRoute,
          LoginRoute,
          BookATableRoute,
          OrdersPageRoute,
          /* Add More Routes Here */
        ].map((settings, index) => (
          <Route key={`Route-${index}`} {...settings} />
        ))}
        <Route component={NotFoundRoute.component} />
      </Switch>
    </CoreLayout>
  )
}
