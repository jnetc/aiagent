export interface StripeCheckoutSession {
  id: string;
  url: string;
  customer?: string;
  subscription?: string;
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
}

export interface BillingResult {
  success: boolean;
  checkoutUrl?: string;
  error?: string;
}