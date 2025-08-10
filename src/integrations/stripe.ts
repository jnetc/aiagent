import Stripe from 'stripe';
import config from '../config/index.js';

let stripe: Stripe;

if (config.STRIPE_SECRET_KEY) {
  stripe = new Stripe(config.STRIPE_SECRET_KEY, {
    apiVersion: '2023-08-16',
    typescript: true,
  });
} else {
  // Create a mock stripe object for development
  stripe = {
    checkout: {
      sessions: {
        create: async (params: any) => ({
          id: 'cs_mock_session',
          url: 'https://checkout.stripe.com/mock-checkout-url',
          customer: 'cus_mock_customer',
          subscription: 'sub_mock_subscription',
        }),
      },
    },
    webhooks: {
      constructEvent: (body: any, sig: any, secret: any) => ({
        id: 'evt_mock_event',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_mock_session',
            client_reference_id: 'mock-user-id',
            customer: 'cus_mock_customer',
            subscription: 'sub_mock_subscription',
          },
        },
      }),
    },
  } as any;
}

export { stripe };
