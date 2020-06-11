import React from "react";
import ReactDOM from "react-dom";
import { initScripts } from "./utils";
import createStore from "./store/createStore";
import { version } from "../package.json";
import { env } from "./config";
import App from "./containers/App";
import { ThemeProvider, CssBaseline, useMediaQuery, responsiveFontSizes } from "@material-ui/core";
import theming from "theme";

// import * as serviceWorker from './serviceWorker'

// Window Variables
// ------------------------------------
window.version = version;
window.env = env;
initScripts();

// Store Initialization
// ------------------------------------
const initialState = window.___INITIAL_STATE__ || {
  firebase: { authError: null },
};
const store = createStore(initialState);
const routes = require("./routes/index").default(store);

const Root = () => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  let theme = React.useMemo(() => theming(prefersDarkMode), [prefersDarkMode]);
  theme = responsiveFontSizes(theme);
  return (<ThemeProvider theme={theme}>
    <React.Fragment>
      <CssBaseline />
      <App store={store} routes={routes} />
    </React.Fragment>
  </ThemeProvider>)
};

ReactDOM.render(
  <Root  />,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
// serviceWorker.unregister()
