import React from "react";
import { Route } from "react-router-dom";
import { connectedRouterRedirect } from "redux-auth-wrapper/history4/redirect";
import locationHelperBuilder from "redux-auth-wrapper/history4/locationHelper";
import { createBrowserHistory } from "history";
import LoadingSpinner from "components/LoadingSpinner";
import { FOOD_MENU_PATH, SIGNUP_PATH, RESTAURANTS_PATH, SIGNUP_ROLE_PATH } from "constants/paths";
import liff from "./liff";

const locationHelper = locationHelperBuilder({});
const history = createBrowserHistory();

const AUTHED_REDIRECT = "AUTHED_REDIRECT";
const UNAUTHED_REDIRECT = "UNAUTHED_REDIRECT";
const SIGNED_REDIRECT = "SIGNED_REDIRECT";

/**
 * Higher Order Component that redirects to `/login` instead
 * rendering if user is not authenticated (default of redux-auth-wrapper).
 * @param {Component} componentToWrap - Component to wrap
 * @return {Component} wrappedComponent
 */
export const UserIsAuthenticated = connectedRouterRedirect({
  redirectPath: "/login",
  AuthenticatingComponent: LoadingSpinner,
  wrapperDisplayName: "UserIsAuthenticated",
  // Want to redirect the user when they are done loading and authenticated
  authenticatedSelector: ({ firebase: { auth } }) =>
    !auth.isEmpty && !!auth.uid,
  authenticatingSelector: ({ firebase: { auth, profile, isInitializing } }) =>
    !auth.isLoaded || !profile.isLoaded || isInitializing,
  redirectAction: (newLoc) => (dispatch) => {
    // Use push, replace, and go to navigate around.
    history.push(newLoc);
    dispatch({
      type: UNAUTHED_REDIRECT,
      payload: { message: "User is not authenticated." },
    });
  },
});

/**
 * Higher Order Component that redirects to listings page or most
 * recent route instead rendering if user is not authenticated. This is useful
 * routes that should not be displayed if a user is logged in, such as the
 * login route.
 * @param {Component} componentToWrap - Component to wrap
 * @return {Component} wrappedComponent
 */
export const UserIsNotAuthenticated = connectedRouterRedirect({
  AuthenticatingComponent: LoadingSpinner,
  wrapperDisplayName: "UserIsNotAuthenticated",
  allowRedirectBack: false,
  // Want to redirect the user when they are done loading and authenticated
  authenticatedSelector: ({ firebase: { auth } }) => auth.isEmpty,
  authenticatingSelector: ({ firebase: { auth, profile, isInitializing } }) =>
    !auth.isLoaded || !profile.isLoaded || isInitializing,
  redirectPath: (state, ownProps) =>
    locationHelper.getRedirectQueryParam(ownProps) ||
    `${RESTAURANTS_PATH}`,
  redirectAction: (newLoc) => (dispatch) => {
    // Use push, replace, and go to navigate around.
    history.push(newLoc);
    dispatch({
      type: UNAUTHED_REDIRECT,
      payload: { message: "User is not authenticated." },
    });
  },
});

/**
 * Higher Order Component that redirects to `/login` instead
 * rendering if user is not authenticated (default of redux-auth-wrapper).
 * @param {Component} componentToWrap - Component to wrap
 * @return {Component} wrappedComponent
 */
export const UserIsSigned = connectedRouterRedirect({
  AuthenticatingComponent: LoadingSpinner,
  wrapperDisplayName: "UserIsSigned",
  allowRedirectBack: false,
  // Want to redirect the user when they are done loading and authenticated
  authenticatedSelector: ({ firebase: { auth, profile } }) => !profile.role,
  authenticatingSelector: ({ firebase: { auth, profile, isInitializing } }) =>
    !auth.isLoaded || !profile.isLoaded || isInitializing || !liff.isInit(),
  redirectPath: (state, ownProps) => SIGNUP_ROLE_PATH,
  redirectAction: (newLoc) => (dispatch) => {
    // Use push, replace, and go to navigate around.
    history.push(newLoc);
    dispatch({
      type: UNAUTHED_REDIRECT,
      payload: { message: "User is authenticated." },
    });
  },
});

/**
 * Render children based on route config objects
 * @param {Array} routes - Routes settings array
 * @param {Object} match - Routes settings array
 * @param {Object} parentProps - Props to pass to children from parent
 */
export function renderChildren(routes, match, parentProps) {
  return routes.map((route) => (
    <Route
      key={`${match.url}-${route.path}`}
      path={`${match.url}/${route.path}`}
      render={(props) => <route.component {...parentProps} {...props} />}
    />
  ));
}
