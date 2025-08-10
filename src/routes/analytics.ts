import { Router, type IRouter } from 'express';
import { analyticsController } from '../controllers/analyticsController.js';
import { authGuard } from '../middlewares/authGuard.js';
import { rateLimiter } from '../middlewares/rateLimiter.js';

const router: IRouter = Router();

// Protect analytics routes
router.use(authGuard);

// Apply rate limiting to analytics endpoints
router.use(rateLimiter);

// Main analytics dashboard with filtering support
router.get('/', analyticsController.getAnalytics);

// Individual card details
router.get('/cards/:id', analyticsController.getCard);

// Trending cards
router.get('/trending', analyticsController.getTrending);

// Search functionality
router.get('/search', analyticsController.searchCards);

// Top performers
router.get('/top-performers', analyticsController.getTopPerformers);

// Platform statistics
router.get('/platform-stats', analyticsController.getPlatformStats);

// Weekly performance summary
router.get('/weekly-performance', analyticsController.getWeeklyPerformance);

// Data export (Pro only)
router.get('/export', analyticsController.exportData);

export default router;
