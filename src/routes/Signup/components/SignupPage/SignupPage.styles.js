export default (theme) => ({
  root: {
    ...theme.flexColumnCenter,
    justifyContent: "flex-start",
    flexGrow: 1,
    height: "100%",
    width: "100%",
    fontWeight: 400,
    padding: "1.2rem",
  },
  panel: {
    ...theme.flexColumnCenter,
    justifyContent: "center",
    flexGrow: 1,
    padding: "1.25rem",
    minWidth: "250px",
    minHeight: "270px",
  },
  orLabel: {
    marginTop: "1rem",
    marginBottom: ".5rem",
  },
  login: {
    ...theme.flexColumnCenter,
    justifyContent: "center",
    marginTop: "1.5rem",
  },
  loginLabel: {
    fontSize: "1rem",
    fontWeight: "bold",
  },
  loginLink: {
    fontSize: "1.2rem",
  },
  providers: {
    marginTop: "1rem",
  },
  loginButton: {
    position: "relative",
    height: 50,
    width: 240,
    boxShadow: "rgba(0, 0, 0, 0.25) 0px 2px 4px 0px",
  },
  imageButton: {
    position: "absolute",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.palette.common.white,
    fontSize: 16,
    borderRadius: 1,
    fontFamily: "Roboto, arial, sans-serif",
    marginLeft: 22
  },
  imageSrc: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundSize: "contain",
    backgroundPosition: "center left",
    backgroundRepeat: "no-repeat",
    backgroundColor: "#00c300",
  }
});
