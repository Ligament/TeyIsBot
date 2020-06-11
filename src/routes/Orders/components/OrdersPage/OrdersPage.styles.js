export default (theme) => ({
  root: {
    ...theme.flexColumnCenter,
    flexGrow: "2",
    boxSizing: "border-box",
    overflowX: "auto",
    padding: theme.spacing(2, 1, 8),
  },
  tiles: {
    display: "grid",
    justifyContent: "center",
    flexWrap: "wrap",
    "-webkit-flex-flow": "row wrap",
  },
  menu: {
    flexGrow: 1,
    overflow: "hidden",
    padding: theme.spacing(0, 3),
  },
  tableView: { 
    width: "100%", 
    maxWidth: 768 
  },
  buttonBar: {
    padding: theme.spacing(1),
    width: "100%",
    justifyContent: "center",
  },
});
