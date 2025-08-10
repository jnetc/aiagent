import { Router, type IRouter, type Request, type Response, type NextFunction } from 'express';
import { analyticsService } from '../services/analyticsService.js';

const router: IRouter = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get demo analytics cards for homepage
    const demoCards = await analyticsService.getDemoCards();

    res.render('index', {
      title: 'Zora AI Agent - NFT Analytics',
      demoCards,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/pricing', (req: Request, res: Response) => {
  res.render('pricing', {
    title: 'Pricing - Zora AI Agent',
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  });
});

router.get('/login', (req: Request, res: Response) => {
  if (req.user) {
    return res.redirect('/analytics');
  }

  res.render('login', {
    title: 'Login - Zora AI Agent',
  });
});

export default router;
