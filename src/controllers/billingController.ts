import type { Request, Response, NextFunction } from 'express';
import { billingService } from '../services/billingService.js';
import config from '../config/index.js';

class BillingController {
  async createCheckoutSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;

      if (config.MOCK_STRIPE) {
        // Mock successful checkout
        await billingService.upgradeToPro(user.id);
        res.redirect('/analytics?upgrade=success');
        return;
      }

      const checkoutUrl = await billingService.createCheckoutSession(user.id);

      if (!checkoutUrl) {
        res.status(500).json({ error: 'Failed to create checkout session' });
        return;
      }

      res.redirect(checkoutUrl);
    } catch (error) {
      next(error);
    }
  }

  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      if (config.MOCK_STRIPE) {
        res.status(200).send('Mock webhook received');
        return;
      }

      const sig = req.headers['stripe-signature'] as string;
      const body = req.body;

      await billingService.handleStripeWebhook(body, sig);

      res.status(200).send('Webhook handled');
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).send('Webhook error');
    }
  }

  checkoutSuccess(req: Request, res: Response): void {
    res.render('checkout-success', {
      title: 'Welcome to Pro! - Zora AI Agent',
    });
  }

  checkoutCancel(req: Request, res: Response): void {
    res.redirect('/pricing?cancelled=true');
  }
}

export const billingController = new BillingController();
