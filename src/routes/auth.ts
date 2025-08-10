import { Router, type IRouter } from 'express';
import passport from 'passport';
import { authController } from '../controllers/authController.js';
import config from '../config/index.js';

const router: IRouter = Router();

if (config.MOCK_TWITTER) {
  // Mock Twitter OAuth for development
  router.get('/twitter', authController.mockTwitterLogin);
} else {
  // Real Twitter OAuth
  router.get('/twitter', passport.authenticate('twitter'));
}

router.get(
  '/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  authController.twitterCallback
);

router.post('/logout', authController.logout);

export default router;
