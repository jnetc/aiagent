import express from 'express';
import session from 'express-session';
import passport from 'passport';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import config from './config/index.js';
import { analyticsService } from './services/analyticsService.js';

// Import middleware
import { errorHandler } from './middlewares/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust proxy for secure cookies in production
if (config.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Static files - IMPORTANT: This should be early in middleware stack
app.use('/static', express.static(path.join(__dirname, '../static')));
console.log('📁 Static files served from:', path.join(__dirname, '../static'));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Security and logging
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP for development
  })
);
app.use(morgan('combined'));
app.use(cors());

// Session configuration
app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax',
    },
  })
);

// Initialize passport only after we create the passport config
async function initializePassport() {
  await import('./integrations/passport.js');
  app.use(passport.initialize());
  app.use(passport.session());
}

await initializePassport();

// Dynamic import routes to handle different export types
async function setupRoutes() {
  try {
    // Import billing routes first (for webhook)
    const billingModule = await import('./routes/billing.js');
    const billingRoutes = billingModule.default || billingModule;
    app.use('/billing', billingRoutes);

    // Body parsing middleware AFTER billing webhook route
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    // Make user available to all templates
    app.use((req, res, next) => {
      res.locals.user = req.user || null;
      res.locals.isLoggedIn = !!req.user;
      next();
    });

    // Import other routes
    const indexModule = await import('./routes/index.js');
    const indexRoutes = indexModule.default || indexModule;
    app.use('/', indexRoutes);

    const authModule = await import('./routes/auth.js');
    const authRoutes = authModule.default || authModule;
    app.use('/auth', authRoutes);

    const analyticsModule = await import('./routes/analytics.js');
    const analyticsRoutes = analyticsModule.default || analyticsModule;
    app.use('/analytics', analyticsRoutes);

    console.log('✅ All routes loaded successfully');
  } catch (error) {
    console.error('❌ Error loading routes:', error);
    throw error;
  }
}

// Error handling
app.use(errorHandler);

// Initialize analytics data
async function initializeApp() {
  try {
    console.log('🔄 Initializing analytics data...');
    await analyticsService.initialize();
    console.log('✅ Analytics data initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize analytics data:', error);
  }
}

// Start server
const PORT = config.PORT || 3000;

async function startServer() {
  try {
    // Setup routes first
    await setupRoutes();

    app.listen(PORT, async () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Zora AI Agent - NFT Analytics Platform`);
      console.log(`🔧 Mode: ${config.NODE_ENV}`);

      if (config.MOCK_TWITTER) {
        console.log(`🧪 Mock Twitter OAuth enabled`);
      }

      if (config.MOCK_STRIPE) {
        console.log(`🧪 Mock Stripe billing enabled`);
      }

      // Initialize app data
      await initializeApp();

      console.log(`✨ Ready to serve analytics for 50+ NFT projects!`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
