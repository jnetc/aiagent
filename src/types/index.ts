export interface User {
  id: string;
  twitterId?: string;
  username: string;
  displayName: string;
  profileImage?: string;
  email?: string;
  pro: boolean;
  tokenGatePassed: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsCard {
  id: string;
  artist: {
    username: string;
    displayName: string;
    profileUrl: string;
    twitterUrl?: string;
  };
  collection: {
    name: string;
    contractAddress?: string;
    platform: 'zora' | 'foundation' | 'fxhash' | 'superrare';
  };
  metrics: {
    marketCap: number;
    marketCapChange24h: number;
    volume24h: number;
    volume7d: number;
    followers: number;
    followersChange24h: number;
    smartFollowers: number;
    twitterFollowers?: number;
    twitterFollowersChange24h?: number;
  };
  aiRecommendation: string;
  tags: string[];
  riskLevel: 'low' | 'medium' | 'high';
  trending: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}