import { FOOD_MENU_PATH as path } from 'constants/paths'
import { Loadable } from 'utils/components'

export default {
  path: `${path}/:restaurantId`,
  component: Loadable({
    loader: () =>
      import(/* webpackChunkName: 'Menu' */ './components/FoodMenusPage')
  })
}
