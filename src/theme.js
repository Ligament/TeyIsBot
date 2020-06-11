import { createMuiTheme } from "@material-ui/core";

export default (prefersDarkMode) =>
  createMuiTheme({
    palette: {
      type: prefersDarkMode ? "dark" : "light",
      primary: {
        main: "#f06292",
      },
      secondary: {
        main: "#64b5f6",
      },
    },
    typography: {
      fontFamily: [
        "-apple-system",
        "BlinkMacSystemFont",
        "Saraun",
        '"Segoe UI"',
        "Roboto",
        '"Helvetica Neue"',
        "Arial",
        "sans-serif",
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(","),
      h4: {
        fontSize: 20,
      },
      h5: {
        fontSize: 16,
      },
      h6: {
        fontSize: 14,
      },
      subtitle1: {
        fontSize: 12,
      },
    },
    flexColumnCenter: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    flexRowCenter: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
    },
    overrides: {
      MuiButton: {
        contained: {
          borderRadius: 3,
          border: 0,
          color: "white",
          // height: 48,
          // padding: "0 30px",
        },
        containedPrimary: {
          background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
          boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
        },
        containedSecondary: {
          background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
          boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
        },
      },
    },
  });
