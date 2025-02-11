import express from 'express';
import UserRoutes from '../app/modules/user/user.routes';
import ProductRoutes  from '../app/modules/product/product.routes';
import  OrderRoutes  from '../app/modules/order/order.routes';
import  PaymentRoutes  from '../app/modules/payment/routes';
import { adminRoutes } from '../app/modules/admin/admin.routes';
import MessageRoutes  from '../app/modules/message/message.routes';
import  EarningRoutes  from '../app/modules/earning/earningRoutes';
import AuthRoutes from '../app/modules/auth/auth.routes'
import productAttributeRoutes from '../../src/app/modules/product/productAttributeRoutes'
import categoryRoutes from '../app/modules/category/categoryRoutes'
// import productRoute from '../app/modules/product/product.routes'



const router = express.Router();

const apiRoutes = [
  { path: '/auth', route: AuthRoutes },
  { path: '/users', route: UserRoutes },
  { path: '/auth/users', route: UserRoutes },
  { path: '/products', route: ProductRoutes },
  { path: '/product-attributes', route: productAttributeRoutes },
  { path: '/categories', route: categoryRoutes},
  // product-attributes
  { path: '/orders', route: OrderRoutes },
  { path: '/admin', route: adminRoutes },
  { path: '/payments/pay', route: PaymentRoutes },
  { path: '/admin/payments', route: PaymentRoutes },
  { path: '/messages', route: MessageRoutes },,
  { path: '/earnings/total', route: EarningRoutes },
  { path: '/earnings/monthly', route: EarningRoutes },
  { path: '/earnings/yearly', route: EarningRoutes },
  { path: '/earnings/pending', route: EarningRoutes },
  { path: '/earnings/manual', route: EarningRoutes },
  { path: '/earnings/today', route: EarningRoutes },
];
apiRoutes.forEach(route => {
  if (route) {
    console.log(`Registering route: /api${route.path}`); // Debugging
    router.use(route.path, route.route);
  }
});

export default router;
