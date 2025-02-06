import express from 'express';
import UserRoutes from '../app/modules/user/user.routes';
import ProductRoutes  from '../app/modules/product/product.routes';
import  OrderRoutes  from '../app/modules/order/order.routes';
import  PaymentRoutes  from '../app/modules/payment/routes';
import { adminRoutes } from '../app/modules/admin/admin.routes';
import MessageRoutes  from '../app/modules/message/message.routes';
import  EarningRoutes  from '../app/modules/earning/earningRoutes';
import AuthRoutes from '../app/modules/auth/auth.routes'


const router = express.Router();

const apiRoutes = [
  { path: '/users', route: UserRoutes },
  { path: '/products', route: ProductRoutes },
  { path: '/orders', route: OrderRoutes },
  { path: '/payments', route: PaymentRoutes },
  { path: '/admin', route: adminRoutes },
  { path: '/messages', route: MessageRoutes },
  { path: '/earnings', route: EarningRoutes },
  { path: '/auth', route: AuthRoutes },
  
];
apiRoutes.forEach(route => {
    router.use(route.path, route.route);
  });
export default router;
