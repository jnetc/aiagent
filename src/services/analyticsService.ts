import { AnalyticsCard } from '../types/index.js';
import { analyticsRepository } from '../repositories/analyticsRepository.js';

interface FilterOptions {
  platform?: string;
  risk?: string;
  trending?: boolean;
  sortBy?: 'volume' | 'followers' | 'marketcap' | 'trending';
  search?: string;
  limit?: number;
  offset?: number;
}

interface AdvancedFilterOptions {
  platforms?: string[];
  risks?: string[];
  dateRange?: string;
  volumeMin?: number;
  volumeMax?: number;
  followersMin?: number;
}

interface UserPreferences {
  riskTolerance?: string;
  platforms?: string[];
  priceRange?: string;
}

interface HistoricalDataPoint {
  date: string;
  marketCap: number;
  volume24h: number;
  followers: number;
  smartFollowers: number;
}

interface HistoricalDataResponse {
  cardId: string;
  period: string;
  data: HistoricalDataPoint[];
}

interface MarketInsights {
  totalProjects: number;
  trendingToday: number;
  totalVolume24h: number;
  topGainer: string;
  platformStats?: any;
  riskDistribution?: any;
  weeklyPerformance?: any;
  message: string;
}

interface TrendingAnalysis {
  totalTrending: number;
  trendingByPlatform: Record<string, number>;
  trendingByRisk: Record<string, number>;
  avgMarketCapChange: number;
  avgVolumeChange: number;
}

interface CardComparison {
  cards: (AnalyticsCard | null)[];
  comparison: {
    marketCapRange: { min: number; max: number };
    volumeRange: { min: number; max: number };
    followersRange: { min: number; max: number };
    riskDistribution: Record<string, number>;
  };
}

class AnalyticsService {
  async getAnalyticsCards(
    isPro: boolean,
    filters: FilterOptions = {}
  ): Promise<{ cards: AnalyticsCard[]; total: number }> {
    let cards = await analyticsRepository.getAllCards();

    // Apply filters
    if (filters.platform && filters.platform !== 'all') {
      cards = cards.filter(card => card.collection.platform === filters.platform);
    }

    if (filters.risk && filters.risk !== 'all') {
      cards = cards.filter(card => card.riskLevel === filters.risk);
    }

    if (filters.trending) {
      cards = cards.filter(card => card.trending);
    }

    if (filters.search) {
      cards = await this.searchInCards(cards, filters.search);
    }

    // Sort cards
    if (filters.sortBy) {
      cards = this.sortCards(cards, filters.sortBy);
    } else {
      // Default sort: trending first, then by market cap change
      cards = cards.sort((a, b) => {
        if (a.trending && !b.trending) return -1;
        if (!a.trending && b.trending) return 1;
        return b.metrics.marketCapChange24h - a.metrics.marketCapChange24h;
      });
    }

    const total = cards.length;

    // Apply pagination
    const offset = filters.offset || 0;
    const limit = filters.limit || (isPro ? 50 : 5);
    cards = cards.slice(offset, offset + limit);

    // Process cards for free/pro access
    const processedCards = cards.map(card => this.processCardForAccess(card, isPro));

    return { cards: processedCards, total };
  }

  private processCardForAccess(card: AnalyticsCard, isPro: boolean): AnalyticsCard {
    if (isPro) {
      return card;
    }

    // Free tier: hide sensitive data
    return {
      ...card,
      metrics: {
        ...card.metrics,
        marketCap: 0,
        marketCapChange24h: 0,
        volume24h: 0,
        volume7d: 0,
        smartFollowers: 0,
        twitterFollowersChange24h: 0,
      },
      aiRecommendation: 'Upgrade to Pro to see full AI analysis and market recommendations',
    };
  }

  private sortCards(cards: AnalyticsCard[], sortBy: string): AnalyticsCard[] {
    return cards.sort((a, b) => {
      switch (sortBy) {
        case 'volume':
          return b.metrics.volume24h - a.metrics.volume24h;
        case 'followers':
          return b.metrics.followers - a.metrics.followers;
        case 'marketcap':
          return b.metrics.marketCap - a.metrics.marketCap;
        case 'trending':
          if (a.trending && !b.trending) return -1;
          if (!a.trending && b.trending) return 1;
          return b.metrics.marketCapChange24h - a.metrics.marketCapChange24h;
        default:
          return 0;
      }
    });
  }

  private async searchInCards(cards: AnalyticsCard[], query: string): Promise<AnalyticsCard[]> {
    const searchLower = query.toLowerCase();
    return cards.filter(
      card =>
        card.artist.displayName.toLowerCase().includes(searchLower) ||
        card.artist.username.toLowerCase().includes(searchLower) ||
        card.collection.name.toLowerCase().includes(searchLower) ||
        card.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        card.aiRecommendation.toLowerCase().includes(searchLower)
    );
  }

  async getCardById(id: string, isPro: boolean): Promise<AnalyticsCard | null> {
    const card = await analyticsRepository.getCardById(id);
    if (!card) return null;
    return this.processCardForAccess(card, isPro);
  }

  async getTrendingCards(isPro: boolean, limit = 8): Promise<AnalyticsCard[]> {
    const result = await this.getAnalyticsCards(isPro, { trending: true, limit });
    return result.cards;
  }

  async getDemoCards(): Promise<AnalyticsCard[]> {
    const allCards = await analyticsRepository.getAllCards();
    return allCards.slice(0, 3).map(card => ({
      ...card,
      metrics: {
        ...card.metrics,
        marketCap: 0,
        volume24h: 0,
        volume7d: 0,
        smartFollowers: 0,
      },
      aiRecommendation: 'Sign up to unlock AI-powered insights and recommendations',
    }));
  }

  async getMarketStats() {
    const allCards = await analyticsRepository.getAllCards();

    const totalVolume24h = allCards.reduce((sum, card) => sum + card.metrics.volume24h, 0);
    const trendingCount = allCards.filter(card => card.trending).length;
    const topGainer = Math.max(...allCards.map(card => card.metrics.marketCapChange24h));

    return {
      totalProjects: allCards.length,
      trendingToday: trendingCount,
      totalVolume24h,
      topGainer: `+${topGainer.toFixed(1)}%`,
    };
  }

  async getTopPerformers(isPro: boolean, limit = 5): Promise<AnalyticsCard[]> {
    const result = await this.getAnalyticsCards(isPro, {
      sortBy: 'marketcap',
      limit,
    });
    return result.cards;
  }

  async getRecentlyAdded(isPro: boolean, limit = 5): Promise<AnalyticsCard[]> {
    const allCards = await analyticsRepository.getAllCards();
    const sorted = allCards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return sorted.slice(0, limit).map(card => this.processCardForAccess(card, isPro));
  }

  async getByPlatform(platform: string, isPro: boolean): Promise<AnalyticsCard[]> {
    const result = await this.getAnalyticsCards(isPro, { platform });
    return result.cards;
  }

  async getByRiskLevel(riskLevel: string, isPro: boolean): Promise<AnalyticsCard[]> {
    const result = await this.getAnalyticsCards(isPro, { risk: riskLevel });
    return result.cards;
  }

  async searchCards(query: string, isPro: boolean): Promise<AnalyticsCard[]> {
    const result = await this.getAnalyticsCards(isPro, { search: query });
    return result.cards;
  }

  // Platform statistics
  async getPlatformStats() {
    const allCards = await analyticsRepository.getAllCards();
    const platformStats = {
      zora: { count: 0, volume: 0, trending: 0 },
      foundation: { count: 0, volume: 0, trending: 0 },
      superrare: { count: 0, volume: 0, trending: 0 },
      fxhash: { count: 0, volume: 0, trending: 0 },
    };

    allCards.forEach(card => {
      const platform = card.collection.platform;
      if (platform in platformStats) {
        platformStats[platform].count++;
        platformStats[platform].volume += card.metrics.volume24h;
        if (card.trending) platformStats[platform].trending++;
      }
    });

    return platformStats;
  }

  // Risk level distribution
  async getRiskDistribution() {
    const allCards = await analyticsRepository.getAllCards();
    const riskStats = {
      low: 0,
      medium: 0,
      high: 0,
    };

    allCards.forEach(card => {
      riskStats[card.riskLevel]++;
    });

    return riskStats;
  }

  // Weekly performance summary
  async getWeeklyPerformance() {
    const allCards = await analyticsRepository.getAllCards();

    const totalMarketCap = allCards.reduce((sum, card) => sum + card.metrics.marketCap, 0);
    const avgChange = allCards.reduce((sum, card) => sum + card.metrics.marketCapChange24h, 0) / allCards.length;
    const totalVolume = allCards.reduce((sum, card) => sum + card.metrics.volume24h, 0);

    return {
      totalMarketCap,
      avgMarketCapChange: avgChange,
      totalVolume24h: totalVolume,
      activeProjects: allCards.filter(card => card.metrics.volume24h > 1000).length,
      trendingProjects: allCards.filter(card => card.trending).length,
    };
  }

  // New Pro features
  async advancedSearch(filters: AdvancedFilterOptions, isPro: boolean): Promise<AnalyticsCard[]> {
    if (!isPro) {
      throw new Error('Pro subscription required for advanced search');
    }

    let cards = await analyticsRepository.getAllCards();

    // Apply advanced filters
    if (filters.platforms && filters.platforms.length > 0) {
      cards = cards.filter(card => filters.platforms!.includes(card.collection.platform));
    }

    if (filters.risks && filters.risks.length > 0) {
      cards = cards.filter(card => filters.risks!.includes(card.riskLevel));
    }

    if (filters.volumeMin !== undefined) {
      cards = cards.filter(card => card.metrics.volume24h >= filters.volumeMin!);
    }

    if (filters.volumeMax !== undefined) {
      cards = cards.filter(card => card.metrics.volume24h <= filters.volumeMax!);
    }

    if (filters.followersMin !== undefined) {
      cards = cards.filter(card => card.metrics.followers >= filters.followersMin!);
    }

    if (filters.dateRange) {
      const now = new Date();
      let filterDate: Date;

      switch (filters.dateRange) {
        case '24h':
          filterDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          filterDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          filterDate = new Date(0);
      }

      cards = cards.filter(card => new Date(card.updatedAt) >= filterDate);
    }

    return cards.map(card => this.processCardForAccess(card, isPro));
  }

  async getHistoricalData(cardId: string, period: string): Promise<HistoricalDataResponse> {
    // This would fetch historical data from database
    // For now, return mock data
    const periods = ['1d', '7d', '30d', '90d'];
    if (!periods.includes(period)) {
      throw new Error('Invalid period');
    }

    // Mock historical data
    const now = Date.now();
    const dataPoints: HistoricalDataPoint[] = [];
    const days = period === '1d' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : 90;

    for (let i = days; i >= 0; i--) {
      const timestamp = new Date(now - i * 24 * 60 * 60 * 1000);
      dataPoints.push({
        date: timestamp.toISOString(),
        marketCap: Math.random() * 1000000 + 500000,
        volume24h: Math.random() * 200000 + 10000,
        followers: Math.floor(Math.random() * 1000) + 5000,
        smartFollowers: Math.floor(Math.random() * 50) + 10,
      });
    }

    return {
      cardId,
      period,
      data: dataPoints,
    };
  }

  async getPersonalizedRecommendations(userId: string, preferences: UserPreferences): Promise<AnalyticsCard[]> {
    let cards = await analyticsRepository.getAllCards();

    // Filter by risk tolerance
    if (preferences.riskTolerance && preferences.riskTolerance !== 'all') {
      cards = cards.filter(card => card.riskLevel === preferences.riskTolerance);
    }

    // Filter by preferred platforms
    if (preferences.platforms && preferences.platforms.length > 0) {
      cards = cards.filter(card => preferences.platforms!.includes(card.collection.platform));
    }

    // Filter by price range
    if (preferences.priceRange && preferences.priceRange !== 'all') {
      switch (preferences.priceRange) {
        case 'low':
          cards = cards.filter(card => card.metrics.marketCap < 100000);
          break;
        case 'medium':
          cards = cards.filter(card => card.metrics.marketCap >= 100000 && card.metrics.marketCap < 500000);
          break;
        case 'high':
          cards = cards.filter(card => card.metrics.marketCap >= 500000);
          break;
      }
    }

    // Sort by potential (combination of trending status and growth metrics)
    cards = cards.sort((a, b) => {
      const scoreA = this.calculateRecommendationScore(a);
      const scoreB = this.calculateRecommendationScore(b);
      return scoreB - scoreA;
    });

    // Return top 10 recommendations
    return cards.slice(0, 10).map(card => this.processCardForAccess(card, true));
  }

  private calculateRecommendationScore(card: AnalyticsCard): number {
    let score = 0;

    // Trending gets bonus points
    if (card.trending) score += 50;

    // Market cap change weight
    score += card.metrics.marketCapChange24h * 2;

    // Follower growth weight
    score += card.metrics.followersChange24h * 0.1;

    // Smart followers weight
    score += card.metrics.smartFollowers * 2;

    // Risk level adjustment (lower risk gets slight bonus for stability)
    if (card.riskLevel === 'low') score += 10;
    else if (card.riskLevel === 'high') score += 20; // High risk can mean high reward

    return score;
  }

  // Guest access methods
  async getGuestCards(): Promise<AnalyticsCard[]> {
    const allCards = await analyticsRepository.getAllCards();

    // Show only trending cards for guests
    const trendingCards = allCards.filter(card => card.trending);

    return trendingCards.slice(0, 3).map(card => ({
      ...card,
      metrics: {
        ...card.metrics,
        marketCap: 0,
        marketCapChange24h: 0,
        volume24h: 0,
        volume7d: 0,
        smartFollowers: 0,
        twitterFollowersChange24h: 0,
      },
      aiRecommendation: 'Create an account to unlock AI-powered insights and recommendations',
      tags: [], // Hide tags for guests
    }));
  }

  // Analytics for different user tiers
  async getAnalyticsForUserTier(
    userTier: 'guest' | 'free' | 'pro',
    filters: FilterOptions = {}
  ): Promise<{ cards: AnalyticsCard[]; total: number }> {
    switch (userTier) {
      case 'guest':
        return this.getGuestAnalytics(filters);
      case 'free':
        return this.getAnalyticsCards(false, filters);
      case 'pro':
        return this.getAnalyticsCards(true, filters);
      default:
        throw new Error('Invalid user tier');
    }
  }

  private async getGuestAnalytics(filters: FilterOptions = {}): Promise<{ cards: AnalyticsCard[]; total: number }> {
    let cards = await analyticsRepository.getAllCards();

    // Guests only see trending content, limited filters
    cards = cards.filter(card => card.trending);

    // Basic sorting only
    if (filters.sortBy === 'volume') {
      cards = cards.sort((a, b) => b.metrics.volume24h - a.metrics.volume24h);
    } else {
      // Default: trending
      cards = cards.sort((a, b) => b.metrics.marketCapChange24h - a.metrics.marketCapChange24h);
    }

    const total = cards.length;

    // Limit to 3 cards for guests
    cards = cards.slice(0, 3);

    // Process cards for guest access
    const processedCards = cards.map(card => ({
      ...card,
      metrics: {
        ...card.metrics,
        marketCap: 0,
        marketCapChange24h: 0,
        volume24h: 0,
        volume7d: 0,
        smartFollowers: 0,
        twitterFollowersChange24h: 0,
      },
      aiRecommendation: 'Create an account to unlock AI-powered insights and recommendations',
      tags: [], // Hide tags for guests
    }));

    return { cards: processedCards, total };
  }

  // Additional utility methods
  async getCardsByTag(tag: string, isPro: boolean): Promise<AnalyticsCard[]> {
    const allCards = await analyticsRepository.getAllCards();
    const filteredCards = allCards.filter(card =>
      card.tags.some(cardTag => cardTag.toLowerCase().includes(tag.toLowerCase()))
    );

    return filteredCards.map(card => this.processCardForAccess(card, isPro));
  }

  async getCardsByArtist(artistUsername: string, isPro: boolean): Promise<AnalyticsCard[]> {
    const allCards = await analyticsRepository.getAllCards();
    const artistCards = allCards.filter(card => card.artist.username.toLowerCase() === artistUsername.toLowerCase());

    return artistCards.map(card => this.processCardForAccess(card, isPro));
  }

  async getRandomCards(isPro: boolean, count: number = 6): Promise<AnalyticsCard[]> {
    const allCards = await analyticsRepository.getAllCards();
    const shuffled = allCards.sort(() => 0.5 - Math.random());
    const randomCards = shuffled.slice(0, count);

    return randomCards.map(card => this.processCardForAccess(card, isPro));
  }

  async getCardsByDateRange(startDate: string, endDate: string, isPro: boolean): Promise<AnalyticsCard[]> {
    const allCards = await analyticsRepository.getAllCards();
    const start = new Date(startDate);
    const end = new Date(endDate);

    const filteredCards = allCards.filter(card => {
      const cardDate = new Date(card.createdAt);
      return cardDate >= start && cardDate <= end;
    });

    return filteredCards.map(card => this.processCardForAccess(card, isPro));
  }

  // Market insights for different user tiers
  async getMarketInsights(userTier: 'guest' | 'free' | 'pro'): Promise<MarketInsights> {
    const basicStats = await this.getMarketStats();

    if (userTier === 'guest') {
      return {
        ...basicStats,
        message: 'Limited market overview. Sign up for detailed insights.',
      };
    }

    if (userTier === 'free') {
      const riskDistribution = await this.getRiskDistribution();
      return {
        ...basicStats,
        riskDistribution,
        message: 'Basic market insights. Upgrade to Pro for advanced analytics.',
      };
    }

    // Pro users get full insights
    const [platformStats, riskDistribution, weeklyPerformance] = await Promise.all([
      this.getPlatformStats(),
      this.getRiskDistribution(),
      this.getWeeklyPerformance(),
    ]);

    return {
      ...basicStats,
      platformStats,
      riskDistribution,
      weeklyPerformance,
      message: 'Complete market analysis available.',
    };
  }

  // Trending analysis
  async getTrendingAnalysis(isPro: boolean): Promise<TrendingAnalysis> {
    const allCards = await analyticsRepository.getAllCards();
    const trendingCards = allCards.filter(card => card.trending);

    const analysis = {
      totalTrending: trendingCards.length,
      trendingByPlatform: {} as Record<string, number>,
      trendingByRisk: {} as Record<string, number>,
      avgMarketCapChange: 0,
      avgVolumeChange: 0,
    };

    if (isPro) {
      // Calculate platform distribution
      trendingCards.forEach(card => {
        analysis.trendingByPlatform[card.collection.platform] =
          (analysis.trendingByPlatform[card.collection.platform] || 0) + 1;
      });

      // Calculate risk distribution
      trendingCards.forEach(card => {
        analysis.trendingByRisk[card.riskLevel] = (analysis.trendingByRisk[card.riskLevel] || 0) + 1;
      });

      // Calculate averages
      if (trendingCards.length > 0) {
        analysis.avgMarketCapChange =
          trendingCards.reduce((sum, card) => sum + card.metrics.marketCapChange24h, 0) / trendingCards.length;

        analysis.avgVolumeChange =
          trendingCards.reduce((sum, card) => sum + card.metrics.volume24h, 0) / trendingCards.length;
      }
    }

    return analysis;
  }

  // Performance tracking
  async trackCardPerformance(cardId: string, action: string, userId?: string) {
    // This would typically save to analytics database
    console.log(`Card ${cardId} - Action: ${action} - User: ${userId || 'anonymous'}`);

    // Implementation would track:
    // - Card views
    // - Profile clicks
    // - Share actions
    // - Watchlist additions
    // - Export actions
  }

  // Search suggestions
  async getSearchSuggestions(query: string, isPro: boolean): Promise<string[]> {
    if (!query || query.length < 2) return [];

    const allCards = await analyticsRepository.getAllCards();
    const suggestions = new Set<string>();

    const searchLower = query.toLowerCase();

    allCards.forEach(card => {
      // Artist names
      if (card.artist.displayName.toLowerCase().includes(searchLower)) {
        suggestions.add(card.artist.displayName);
      }
      if (card.artist.username.toLowerCase().includes(searchLower)) {
        suggestions.add(card.artist.username);
      }

      // Collection names
      if (card.collection.name.toLowerCase().includes(searchLower)) {
        suggestions.add(card.collection.name);
      }

      // Tags (Pro only)
      if (isPro) {
        card.tags.forEach(tag => {
          if (tag.toLowerCase().includes(searchLower)) {
            suggestions.add(tag);
          }
        });
      }
    });

    return Array.from(suggestions).slice(0, 8);
  }

  // Compare cards functionality (Pro only)
  async compareCards(cardIds: string[], isPro: boolean): Promise<CardComparison> {
    if (!isPro) {
      throw new Error('Pro subscription required for card comparison');
    }

    const cards = await Promise.all(cardIds.map(id => this.getCardById(id, isPro)));

    const validCards = cards.filter(card => card !== null);

    if (validCards.length < 2) {
      throw new Error('At least 2 valid cards required for comparison');
    }

    return {
      cards: validCards,
      comparison: {
        marketCapRange: {
          min: Math.min(...validCards.map(card => card!.metrics.marketCap)),
          max: Math.max(...validCards.map(card => card!.metrics.marketCap)),
        },
        volumeRange: {
          min: Math.min(...validCards.map(card => card!.metrics.volume24h)),
          max: Math.max(...validCards.map(card => card!.metrics.volume24h)),
        },
        followersRange: {
          min: Math.min(...validCards.map(card => card!.metrics.followers)),
          max: Math.max(...validCards.map(card => card!.metrics.followers)),
        },
        riskDistribution: validCards.reduce((acc, card) => {
          acc[card!.riskLevel] = (acc[card!.riskLevel] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
    };
  }

  // Initialize analytics data
  async initialize() {
    await analyticsRepository.initializeData();
  }
}

export const analyticsService = new AnalyticsService();
