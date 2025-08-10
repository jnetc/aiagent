import { analyticsRepository } from '../repositories/analyticsRepository.js';
import { zoraApi } from '../integrations/zoraApi.js';
import { AnalyticsCard } from '../types/index.js';

class AnalyticsJob {
  private isRunning = false;

  async startPeriodicUpdate(intervalMinutes = 30) {
    if (this.isRunning) {
      console.log('Analytics job already running');
      return;
    }

    this.isRunning = true;
    console.log(`🔄 Starting analytics job (every ${intervalMinutes} minutes)`);

    // Run immediately
    await this.updateAnalytics();

    // Schedule periodic updates
    setInterval(async () => {
      await this.updateAnalytics();
    }, intervalMinutes * 60 * 1000);
  }

  private async updateAnalytics() {
    try {
      console.log('📊 Updating analytics data...');

      // Get trending collections from Zora
      const trendingCollections = await zoraApi.getTrendingCollections(20);

      // Process and update analytics cards
      for (const collection of trendingCollections) {
        const card = await this.createAnalyticsCard(collection);
        if (card) {
          await analyticsRepository.saveCard(card);
        }
      }

      console.log(`✅ Updated ${trendingCollections.length} analytics cards`);
    } catch (error) {
      console.error('❌ Error updating analytics:', error);
    }
  }

  private async createAnalyticsCard(collection: any): Promise<AnalyticsCard | null> {
    try {
      // This would integrate with Twitter API and AI services
      // For now, return mock data
      const card: AnalyticsCard = {
        id: `card_${collection.id}_${Date.now()}`,
        artist: {
          username: 'artist_' + collection.id,
          displayName: `Artist for ${collection.name}`,
          profileUrl: `https://zora.co/@artist_${collection.id}`,
        },
        collection: {
          name: collection.name,
          contractAddress: collection.address,
          platform: 'zora',
        },
        metrics: {
          marketCap: collection.volume24h * 10,
          marketCapChange24h: (Math.random() - 0.5) * 50,
          volume24h: collection.volume24h,
          volume7d: collection.volume24h * 7,
          followers: Math.floor(Math.random() * 5000),
          followersChange24h: Math.floor((Math.random() - 0.5) * 200),
          smartFollowers: Math.floor(Math.random() * 50),
          twitterFollowers: Math.floor(Math.random() * 10000),
          twitterFollowersChange24h: Math.floor((Math.random() - 0.5) * 500),
        },
        aiRecommendation: this.generateAiRecommendation(),
        tags: this.generateTags(),
        riskLevel: this.calculateRiskLevel(),
        trending: Math.random() > 0.7,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return card;
    } catch (error) {
      console.error('Error creating analytics card:', error);
      return null;
    }
  }

  private generateAiRecommendation(): string {
    const recommendations = [
      'Strong momentum building. Consider for portfolio diversification.',
      'Early stage growth detected. Monitor for next 48 hours.',
      'Consolidation phase. Good entry point for long-term positions.',
      'High volatility detected. Suitable for experienced traders only.',
      'Community engagement increasing. Social signals positive.',
      'Smart money accumulating. Institutional interest growing.',
    ];
    
    return recommendations[Math.floor(Math.random() * recommendations.length)];
  }

  private generateTags(): string[] {
    const allTags = ['trending', 'early-growth', 'established', 'viral', 'breakout', 'consolidating'];
    const numTags = Math.floor(Math.random() * 3) + 1;
    return allTags.sort(() => 0.5 - Math.random()).slice(0, numTags);
  }

  private calculateRiskLevel(): 'low' | 'medium' | 'high' {
    const risk = Math.random();
    if (risk < 0.3) return 'low';
    if (risk < 0.7) return 'medium';
    return 'high';
  }
}

export const analyticsJob = new AnalyticsJob();