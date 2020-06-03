import { yellow } from "@material-ui/core/colors";

export default (theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "91vh",
    width: "100vw",
  },
  message: {
    backgroundColor: yellow[500],
    color: theme.palette.common.white,
    display: "block",
    fontWeight: 900,
    overflow: "hidden",
    position: "absolute",
    paddingLeft: "0.5rem",
    top: "0.2rem",
    left: '50%',
    animation: `$openclose 5s ${theme.transitions.easing.easeInOut} infinite`,
  },
  title: {
    color: theme.palette.common.white,
    fontFamily: "tahoma",
    fontSize: theme.typography.h4.fontSize,
    fontWeight: 100,
    lineHeight: theme.typography.h4.lineHeight,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    overflow: "hidden",
    position: "relative",
    width: '100%',
    '& span': {
      fontSize: theme.typography.h4.fontSize,
      marginLeft: '20%',
    }
  },
  word1: {
    fontFamily: "tahoma",
  },
  word2: {
    fontFamily: "tahoma",
  },
  word3: {
    fontFamily: "tahoma",
  },
  "@keyframes openclose": {
    "0%": {
      top: 0,
      width: 0,
    },
    "5%": {
      width: 0,
    },
    "40%": {
      width: 140,
    },
    "43%": {
      top: 0,
      width: 0,
    },
    "45%": {
      top: 0,
      width: 0,
    },
    "48%": {
      top: "-1.335rem",
    },
    "68%": {
      top: "-1.335rem",
      width: 180,
    },
    "92%": {
      top: "-1.335rem",
      width: 180,
    },
    "96%": {
      top: "-1.335rem",
      width: 0,
      textIndent: 0,
    },
    "100%": {
      top: 0,
      width: 0,
      textIndent: 0,
    },
  },
});
