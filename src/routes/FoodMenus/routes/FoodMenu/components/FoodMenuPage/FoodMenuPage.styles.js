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
  order: {
    bottom: 70,
    position: "fixed",
    width: "90vw",
    maxWidth: 500,
  },
  qty: {
    width: 100,
    textAlignLast: "center",
  },
});
