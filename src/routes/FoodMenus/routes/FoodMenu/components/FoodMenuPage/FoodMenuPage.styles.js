export default theme => ({
  root: {
    padding: theme.spacing(2),
    marginBottom: 56
  },
  progress: {
    ...theme.flexRowCenter,
    alignItems: 'center',
    paddingTop: theme.spacing(8)
  },
  media: {
    width: '100%',
    height: 'auto'
  },
  order: {
    position: 'fixed',
    bottom: 60
  }
})
