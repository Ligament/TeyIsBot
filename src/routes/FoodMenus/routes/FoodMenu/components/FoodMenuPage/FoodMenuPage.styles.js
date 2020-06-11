export default (theme) => ({
  root: {
    padding: theme.spacing(2),
    marginBottom: 125,
  },
  progress: {
    ...theme.flexRowCenter,
    alignItems: "center",
    paddingTop: theme.spacing(8),
  },
  media: {
    width: "100%",
    height: "auto",
  },
  orderContainer: {
    bottom: 70,
    position: "fixed",
    width: "100%",
    display: "inline-block",
    justifyContent: "center",
    alignContent: "center",
    textAlign: "center",
  },
  order: {
    position: "relative",
    width: "90vw",
    maxWidth: 500,
    display: "inline-flex",
  },
  paperButtonGroup: {
    width: "fit-content",
  },
  confirmButton: {
    right: 0,
    position: "absolute",
    height: 40,
  },
  qty: {
    width: 100,
    textAlignLast: "center",
    borderImage: 'linear-gradient(45deg, rgba(100, 181, 246, 0.5) 10%, rgba(240, 98, 146, 0.5) 90%)',
    // color: 'linear-gradient(45deg, #21CBF3 30%, #FF8E53 90%)',
    border: '1px solid transparent',
    borderImageSlice: 1
    // background: "linear-gradient(45deg, #21CBF3 30%, #FF8E53 90%)",
    // boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
  },
});
