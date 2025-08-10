import passport from 'passport';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import { authService } from '../services/authService.js';
import { TwitterProfile } from '../types/auth.js';
import config from '../config/index.js';

// Only configure Twitter strategy if not in mock mode
if (!config.MOCK_TWITTER) {
  if (!config.TWITTER_CONSUMER_KEY || !config.TWITTER_CONSUMER_SECRET) {
    console.warn('⚠️  Twitter OAuth credentials missing. Set MOCK_TWITTER=1 for development.');
  } else {
    passport.use(new TwitterStrategy({
      consumerKey: config.TWITTER_CONSUMER_KEY,
      consumerSecret: config.TWITTER_CONSUMER_SECRET,
      callbackURL: config.TWITTER_CALLBACK_URL,
    }, async (token, tokenSecret, profile, done) => {
      try {
        const twitterProfile: TwitterProfile = {
          id: profile.id,
          username: profile.username,
          displayName: profile.displayName,
          photos: profile.photos,
        };
        
        const user = await authService.createOrUpdateUser(twitterProfile);
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }));
  }
}

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await authService.findUserById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});