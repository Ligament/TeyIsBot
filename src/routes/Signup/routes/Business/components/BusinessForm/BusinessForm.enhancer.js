import PropTypes from 'prop-types'
import { connect } from 'react-redux';
import { reduxForm, formValueSelector } from 'redux-form'
import { setPropTypes, compose } from 'recompose'
import { BUSINESS_SIGNUP_FORM_NAME } from 'constants/formNames'

const selector = formValueSelector(BUSINESS_SIGNUP_FORM_NAME); // <-- same as form name
export default compose(
  // Set prop-types used in HOCs
  setPropTypes({
    onSubmit: PropTypes.func.isRequired // called by handleSubmit
  }),
  // Add form capabilities (handleSubmit, pristine, submitting)
  reduxForm({
    form: BUSINESS_SIGNUP_FORM_NAME
  }),

  connect(state => {
    // can select values individually
    const positionValue = selector(state, 'position');
    return {
      positionValue,
    };
  })
)
