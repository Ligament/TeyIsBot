import { CUSTOMER_ORDER_PATH as path } from "constants/paths";
import { Loadable } from "utils/components";

export default {
  path: `${path}/:restaurantId`,
  component: Loadable({
    loader: () =>
      import(/* webpackChunkName: 'Order' */ "./components/OrdersPage"),
  }),
};
