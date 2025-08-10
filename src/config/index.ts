import dotenv from 'dotenv';

dotenv.config();

// Validate critical environment variables
const requiredEnvVars = ['SESSION_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  SESSION_SECRET: process.env.SESSION_SECRET!,
  
  // Mock modes for development
  MOCK_TWITTER: process.env.MOCK_TWITTER === '1',
  MOCK_STRIPE: process.env.MOCK_STRIPE === '1',
  
  // Twitter OAuth
  TWITTER_CONSUMER_KEY: process.env.TWITTER_CONSUMER_KEY || '',
  TWITTER_CONSUMER_SECRET: process.env.TWITTER_CONSUMER_SECRET || '',
  TWITTER_CALLBACK_URL: process.env.TWITTER_CALLBACK_URL || 'http://localhost:3000/auth/twitter/callback',
  
  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  STRIPE_PRICE_ID: process.env.STRIPE_PRICE_ID || '',
  
  // External APIs
  ZORA_API_URL: process.env.ZORA_API_URL || 'https://api.zora.co/v1',
  TWITTER_API_BEARER_TOKEN: process.env.TWITTER_API_BEARER_TOKEN || '',
};

export default config;