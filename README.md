# Zora AI Agent - NFT Analytics Platform

AI-powered analytics platform for discovering trending NFT projects and artists on Zora.co and other NFT marketplaces.

## Features

- **Real-time Analytics**: Track NFT collections, artists, and market trends
- **AI Recommendations**: GPT-powered insights and predictions
- **Social Signals**: Twitter follower growth, Smart Followers tracking
- **Subscription Model**: Free tier with limited access, Pro tier with full analytics
- **Visual Cards**: Clean, Instagram-like presentation of analytics data

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Auth**: Twitter OAuth 1.0a (with mock mode for development)
- **Billing**: Stripe Subscriptions (with mock mode for development)
- **Views**: EJS templates with layouts
- **Data**: JSON storage (ready for database migration)

## Development Setup

1. **Clone and install**:
   ```bash
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**: http://localhost:3000

## Mock Mode (for Development)

Set these environment variables to enable mock mode:
- `MOCK_TWITTER=1` - Skip Twitter OAuth, auto-login test user
- `MOCK_STRIPE=1` - Skip real Stripe, simulate successful payments

## Production Deployment

1. Set `NODE_ENV=production`
2. Remove mock environment variables
3. Configure real Twitter and Stripe credentials
4. Build and start:
   ```bash
   npm run build
   npm start
   ```

## API Integration

### Middleware Order (Critical)
The middleware order in `server.ts` is crucial for proper functionality:

1. Static files, view engine, layouts
2. Security (helmet), logging (morgan)
3. Sessions (express-session)
4. Passport initialization
5. **Stripe webhook (BEFORE json parser)**
6. Body parsers (urlencoded, json)
7. Routes
8. Error handler

### Stripe Webhooks

The Stripe webhook endpoint (`/billing/webhook`) must:
- Be mounted BEFORE `express.json()` middleware
- Use `express.raw({ type: 'application/json' })` for body parsing
- Verify webhook signature using `stripe.webhooks.constructEvent()`

## Architecture

### Layers
- **Routes**: HTTP endpoint definitions
- **Controllers**: Request/response handling
- **Services**: Business logic
- **Repositories**: Data access layer
- **Integrations**: External API clients

### Authentication Flow
1. User clicks "Login with Twitter"
2. Redirect to Twitter OAuth (or mock login)
3. Create/update user in JSON storage
4. Set session with user ID

### Billing Flow
1. User clicks "Subscribe" on pricing page
2. Create Stripe Checkout session
3. Redirect to Stripe payment page
4. Webhook confirms payment
5. Upgrade user to Pro tier

## File Structure

- `src/server.ts` - Main application entry point
- `src/routes/` - Express route definitions
- `src/controllers/` - Request handlers
- `src/services/` - Business logic
- `src/repositories/` - Data access
- `src/middlewares/` - Custom middleware
- `src/integrations/` - External service clients
- `src/views/` - EJS templates
- `src/data/` - JSON data storage
- `static/` - Static assets (CSS, JS, images)

## License

MIT# aiagent
