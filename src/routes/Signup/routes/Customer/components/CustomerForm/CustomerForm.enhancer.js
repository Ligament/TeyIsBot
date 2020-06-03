import PropTypes from 'prop-types'
import { reduxForm } from 'redux-form'
import { setPropTypes, compose } from 'recompose'
import { CUSTOMER_SIGNUP_FORM_NAME } from 'constants/formNames'

export default compose(
  // Set prop-types used in HOCs
  setPropTypes({
    onSubmit: PropTypes.func.isRequired // called by handleSubmit
  }),
  // Add form capabilities (handleSubmit, pristine, submitting)
  reduxForm({
    form: CUSTOMER_SIGNUP_FORM_NAME
  })
)
