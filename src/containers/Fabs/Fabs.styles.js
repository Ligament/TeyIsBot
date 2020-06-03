import { green, teal, lime } from "@material-ui/core/colors";

export default (theme) => ({
  fab: {
    position: "fixed",
    bottom: 56+theme.spacing(2),
    right: theme.spacing(2),
  },
  fabGreen: {
    color: theme.palette.common.white,
    backgroundColor: green[500],
    "&:hover": {
      backgroundColor: green[600],
    },
  },
  fabTeal: {
    color: theme.palette.common.white,
    backgroundColor: teal[500],
    "&:hover": {
      backgroundColor: teal[600],
    },
  },
  fabLime: {
    color: theme.palette.common.white,
    backgroundColor: lime[500],
    "&:hover": {
      backgroundColor: lime[600],
    },
  },
  speedDial: {
    position: 'absolute',
    bottom: 56+theme.spacing(2),
    right: theme.spacing(2),
  },
});
