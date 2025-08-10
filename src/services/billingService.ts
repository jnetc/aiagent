import { stripe } from '../integrations/stripe.js';
import { usersRepository } from '../repositories/usersRepository.js';
import config from '../config/index.js';
import type Stripe from 'stripe';

class BillingService {
  async createCheckoutSession(userId: string): Promise<string | null> {
    try {
      if (!config.STRIPE_SECRET_KEY || !config.STRIPE_PRICE_ID) {
        throw new Error('Stripe configuration missing');
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [
          {
            price: config.STRIPE_PRICE_ID,
            quantity: 1,
          },
        ],
        success_url: `${this.getBaseUrl()}/billing/success`,
        cancel_url: `${this.getBaseUrl()}/pricing?cancelled=true`,
        client_reference_id: userId,
      });

      return session.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return null;
    }
  }

  async handleStripeWebhook(body: Buffer, signature: string): Promise<void> {
    try {
      const event = stripe.webhooks.constructEvent(body, signature, config.STRIPE_WEBHOOK_SECRET);

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const userId = session.client_reference_id;
    if (!userId) {
      console.error('No client_reference_id in checkout session');
      return;
    }

    await this.upgradeToPro(userId, session.customer as string, session.subscription as string);
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    // Handle subscription updates (e.g., plan changes, renewals)
    console.log('Subscription updated:', subscription.id);
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    // Handle subscription cancellations
    const user = await usersRepository.findByStripeSubscriptionId(subscription.id);
    if (user) {
      await usersRepository.setPro(user.id, false);
      console.log(`User ${user.id} subscription cancelled`);
    }
  }

  async upgradeToPro(userId: string, customerId?: string, subscriptionId?: string): Promise<void> {
    await usersRepository.setPro(userId, true);

    if (customerId) {
      await usersRepository.setStripeCustomerId(userId, customerId);
    }

    if (subscriptionId) {
      await usersRepository.setStripeSubscriptionId(userId, subscriptionId);
    }

    console.log(`User ${userId} upgraded to Pro`);
  }

  private getBaseUrl(): string {
    return config.NODE_ENV === 'production' ? 'https://your-domain.com' : `http://localhost:${config.PORT}`;
  }
}

export const billingService = new BillingService();
