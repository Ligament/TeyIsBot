import { reduxForm } from 'redux-form'
import { DETAIL_TABLE_FORM_NAME } from 'constants/formNames'

export default reduxForm({
  form: DETAIL_TABLE_FORM_NAME,
  initialValues: {date: new Date(), cookNow: false},
  // Clear the form for future use (creating another project)
  onSubmitSuccess: (result, dispatch, props) => props.reset()
})
