import React from 'react'
import PropTypes from 'prop-types'
import { Notifications } from '../../modules/notification'
import { makeStyles } from '@material-ui/core/styles'
import styles from './CoreLayout.styles'
import BottomContainer from 'containers/BottomContainer'

const useStyles = makeStyles(styles)

function CoreLayout({ children }) {
  const classes = useStyles()
  return (
    <div className={classes.container}>
      <div className={classes.children}>{children}</div>
      <Notifications />
      <BottomContainer />
    </div>
  )
}

CoreLayout.propTypes = {
  children: PropTypes.element.isRequired
}

export default CoreLayout
