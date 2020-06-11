export default theme => ({
  root: {
    ...theme.flexColumnCenter,
    flexGrow: '2',
    boxSizing: 'border-box',
    overflowX: 'auto',
    padding: theme.spacing(2, 1, 8)
  },
})
