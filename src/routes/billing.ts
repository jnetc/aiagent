import { Router, type IRouter } from 'express';
import express from 'express';
import { billingController } from '../controllers/billingController.js';
import { authGuard } from '../middlewares/authGuard.js';

const router: IRouter = Router();

// Stripe webhook - MUST be before express.json() middleware
router.post('/webhook', express.raw({ type: 'application/json' }), billingController.handleWebhook);

// Protected billing routes
router.post('/checkout', authGuard, billingController.createCheckoutSession);
router.get('/success', authGuard, billingController.checkoutSuccess);
router.get('/cancel', authGuard, billingController.checkoutCancel);

export default router;
