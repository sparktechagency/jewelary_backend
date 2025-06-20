import express from 'express';
import  { isAdmin, isAuthenticated } from '../auth/auth.middleware';
import { RuleController } from './rule.controller';
const router = express.Router();


//about us
router
    .route('/about')
    .post(isAuthenticated, isAdmin,RuleController.createAbout)
    .get(RuleController.getAbout);


//privacy policy
router
    .route('/privacy-policy')
    .post(isAuthenticated, isAdmin, RuleController.createPrivacyPolicy)
    .get(RuleController.getPrivacyPolicy);

//terms and conditions
router
    .route('/terms-and-conditions')
    .post(isAuthenticated, isAdmin, RuleController.createTermsAndCondition)
    .get(RuleController.getTermsAndCondition);

export const RuleRoutes = router;