import { Loadable } from 'utils/components'

export default {
  path: 'select-role',
  component: Loadable({
    loader: () =>
      import(/* webpackChunkName: 'SelectRolePage' */ './components/SelectRolePage')
  })
}
