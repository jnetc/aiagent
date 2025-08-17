export interface TwitterProfile {
  id: string;
  username: string;
  displayName: string;
  photos?: Array<{ value: string }>;
}

export interface AuthenticatedUser {
  id: string;
  username: string;
  displayName: string;
  profileImage?: string;
  pro: boolean;
  tokenGatePassed: boolean;
  twitterId?: string;
  email?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

// Расширяем глобальный namespace Express для Passport
declare global {
  namespace Express {
    interface User extends AuthenticatedUser {}
  }
}
