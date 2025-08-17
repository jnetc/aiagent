import { Router, type IRouter } from 'express';
import { analyticsController } from '../controllers/analyticsController.js';
import { authGuard, requirePro, optionalAuth } from '../middlewares/authGuard.js';
import { rateLimiter } from '../middlewares/rateLimiter.js';

const router: IRouter = Router();

// Apply rate limiting to analytics endpoints
router.use(rateLimiter);

// Main analytics dashboard - allow guest access with limited data
router.get('/', optionalAuth, analyticsController.getAnalytics);

// Individual card details - allow guest access with limited data
router.get('/cards/:id', optionalAuth, analyticsController.getCard);

// Trending cards - allow guest access with limited data
router.get('/trending', optionalAuth, analyticsController.getTrending);

// Basic search - allow for all users but limited for guests
router.get('/search', optionalAuth, analyticsController.searchCards);

// Pro features - require authentication and pro subscription
router.get('/top-performers', authGuard, requirePro, analyticsController.getTopPerformers);
router.get('/platform-stats', authGuard, requirePro, analyticsController.getPlatformStats);
router.get('/weekly-performance', authGuard, requirePro, analyticsController.getWeeklyPerformance);
router.get('/export', authGuard, requirePro, analyticsController.exportData);

// Advanced filtering and sorting - Pro only
router.get('/advanced-search', authGuard, requirePro, analyticsController.advancedSearch);
router.get('/historical-data/:cardId', authGuard, requirePro, analyticsController.getHistoricalData);
router.get('/recommendations', authGuard, requirePro, analyticsController.getPersonalizedRecommendations);

export default router;
