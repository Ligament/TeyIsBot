import { reduxForm } from 'redux-form'
import { BOOK_A_TABLE_FORM_NAME } from 'constants/formNames'

export default reduxForm({
  form: BOOK_A_TABLE_FORM_NAME,
  initialValues: {date: new Date(), cookNow: false},
  // Clear the form for future use (creating another project)
  onSubmitSuccess: (result, dispatch, props) => props.reset()
})
