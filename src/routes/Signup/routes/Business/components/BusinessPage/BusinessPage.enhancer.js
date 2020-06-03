// import { UserIsNotAuthenticated } from 'utils/router'

// // Redirect to list page if logged in
// export default  UserIsNotAuthenticated

import { compose } from 'redux'
import { withRouter } from 'react-router-dom'
import { setDisplayName } from 'recompose'
import { UserIsAuthenticated } from 'utils/router'

export default UserIsAuthenticated
