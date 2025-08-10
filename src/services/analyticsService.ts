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

  // Initialize analytics data
  async initialize() {
    await analyticsRepository.initializeData();
  }
}

export const analyticsService = new AnalyticsService();
