import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { AnalyticsCard } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../data/analytics.json');

class AnalyticsRepository {
  private async readCards(): Promise<AnalyticsCard[]> {
    try {
      const data = await fs.readFile(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // Return demo data if file doesn't exist
      return this.generateDemoData();
    }
  }

  private generateDemoData(): AnalyticsCard[] {
    const platforms = ['zora', 'foundation', 'superrare', 'fxhash'] as const;
    const riskLevels = ['low', 'medium', 'high'] as const;

    const artistNames = [
      'CryptoArtist',
      'NeonWave Studio',
      'PixelMaster',
      'Abstract Forms',
      'AI Artist Collective',
      'Ethereal Visions',
      'Urban Canvas',
      'Less is More',
      'Digital Dreams',
      'Synth Aesthetics',
      'Quantum Creator',
      'Vintage Future',
      'Glitch Poet',
      'Cyber Monk',
      'Neural Artist',
      'Data Sculptor',
      'Code Painter',
      'Blockchain Muse',
      'Crypto Picasso',
      'NFT Wizard',
      'Meta Artist',
      'Web3 Creator',
      'Onchain Visionary',
      'Decentralized Studio',
      'Token Artist',
      'Smart Contract Art',
      'DeFi Designer',
      'DAO Creator',
      'Protocol Artist',
      'Layer2 Labs',
      'Zora Native',
      'Foundation Fellow',
      'SuperRare Sage',
      'Fxhash Phoenix',
      'Manifold Maker',
      'Async Artist',
      'KnownOrigin King',
      'OpenSea Oracle',
      'Rarible Rebel',
      'MakersPlace Master',
      'Mintable Muse',
      'Nifty Gateway Ninja',
      'Portion Pioneer',
      'Atomic Artist',
      'Viv3 Visionary',
      'Tezos Talent',
      'Solana Sculptor',
      'Polygon Painter',
      'Ethereum Executor',
      'BSC Builder',
    ];

    const collectionNames = [
      'Digital Dreams',
      'Synthwave Collection',
      'Retro Pixels',
      'Geometric Harmony',
      'Machine Dreams',
      'Dreamscape Series',
      'City Walls Digital',
      'Minimal Expressions',
      'Neon Nights',
      'Cyber Punk',
      'Abstract Reality',
      'Future Nostalgia',
      'Glitch Art Series',
      'Neural Networks',
      'Data Visualization',
      'Algorithmic Beauty',
      'Generative Art',
      'Procedural Worlds',
      'AI Compositions',
      'Code Art',
      'Smart Contracts',
      'Blockchain Stories',
      'Crypto Portraits',
      'NFT Landscapes',
      'Digital Souls',
      'Virtual Galleries',
      'Metaverse Memories',
      'Decentralized Dreams',
      'Token Tales',
      'Web3 Wonders',
      'Onchain Chronicles',
      'Layer2 Legends',
      'Protocol Paintings',
      'DAO Designs',
      'DeFi Drawings',
      'Yield Farming Art',
      'Liquidity Pool Landscapes',
      'AMM Abstracts',
      'Bridge Blueprints',
      'Oracle Oracles',
      'Consensus Creations',
      'Fork Fantasies',
      'Merge Masterpieces',
      'Rollup Renderings',
      'Shard Sculptures',
      'Hash Harmony',
      'Block Beauties',
      'Chain Chronicles',
      'Node Narratives',
      'Mining Murals',
    ];

    const aiRecommendations = [
      'Strong momentum with growing follower base and increasing trading volume. Consider watching for next drop.',
      'Early stage growth detected with smart money accumulation. High potential but monitor risk levels.',
      'Consolidation phase after recent gains. Good entry point for long-term positions.',
      'VIRAL ALERT! Massive follower spike and volume growth. High risk but potential for significant returns.',
      'Cross-platform momentum building with institutional interest. Strong fundamentals.',
      'Market correction phase. Watch for support levels and accumulation patterns.',
      'Emerging talent with strong community support. Early growth opportunity with medium risk.',
      'Street art crossover appeal attracting mainstream collectors. Stable growth trajectory.',
      'Minimalist aesthetic gaining traction among serious collectors. Timeless appeal.',
      'AI-generated content showing experimental promise. High volatility expected.',
      'Established artist with consistent performance. Low risk, steady returns.',
      'New artist breakthrough with rapid community adoption. Monitor closely.',
      'Technical innovation driving collector interest. Strong technical fundamentals.',
      'Community-driven project with DAO governance. Social signals very positive.',
      'Gaming integration creating new utility. Potential for broader adoption.',
      'Music and visual art hybrid gaining streaming platform interest.',
      'Environmental art theme resonating with ESG-focused collectors.',
      'Historical significance driving academic and museum interest.',
      'Celebrity collaboration announcement driving mainstream attention.',
      'Utility token integration creating additional value streams.',
      'Cross-chain compatibility expanding potential market reach.',
      'Real-world asset backing providing fundamental value floor.',
      'Interactive features engaging new type of digital collectors.',
      'AR/VR integration positioning for metaverse adoption.',
      'Limited edition mechanics creating scarcity-driven demand.',
      'Provenance verification attracting institutional collectors.',
      'Royalty optimization benefiting long-term holder value.',
      'Social impact narrative driving values-based purchasing.',
      'Technical analysis showing bullish chart patterns.',
      'Whale accumulation detected through on-chain analysis.',
      'Developer activity increasing with new feature releases.',
      'Partnership announcements expanding ecosystem integration.',
      'Mainstream media coverage driving awareness growth.',
      'Influencer adoption creating viral potential.',
      'Economic uncertainty driving digital asset allocation.',
      'Regulatory clarity improving institutional confidence.',
      'Technology upgrade improving user experience significantly.',
      'Market maker support providing liquidity stability.',
      'Community rewards program incentivizing holding behavior.',
      'Educational content driving informed collector base.',
      'Platform exclusive features creating competitive advantage.',
      'Analytics showing sustained organic growth patterns.',
      'Social sentiment analysis indicating positive momentum.',
      'Price discovery mechanism showing healthy market development.',
      'Diversification trend among traditional art collectors.',
      'Generation Z adoption driving long-term growth potential.',
      'Corporate treasury allocation creating institutional demand.',
      'Creator economy integration expanding utility beyond collecting.',
      'Fractionalization features enabling broader participation.',
      'Insurance products reducing collector risk concerns.',
    ];

    const tagSets = [
      ['trending', 'early-growth', 'digital-art'],
      ['synthwave', 'established', 'music-art'],
      ['viral', 'pixel-art', 'breakout'],
      ['geometric', 'abstract', 'premium'],
      ['ai-generated', 'experimental', 'high-volume'],
      ['dreamy', 'surreal', 'emerging'],
      ['street-art', 'urban', 'crossover'],
      ['minimalist', 'clean', 'timeless'],
      ['cyberpunk', 'neon', 'futuristic'],
      ['generative', 'algorithmic', 'procedural'],
      ['glitch', 'error', 'digital-noise'],
      ['neural', 'ai', 'machine-learning'],
      ['abstract', 'contemporary', 'gallery'],
      ['photography', 'digital', 'manipulation'],
      ['3d', 'rendering', 'virtual'],
      ['animated', 'gif', 'motion'],
      ['interactive', 'utility', 'gaming'],
      ['profile-picture', 'avatar', 'identity'],
      ['landscape', 'nature', 'environment'],
      ['portrait', 'character', 'figure'],
      ['architecture', 'building', 'structure'],
      ['space', 'cosmic', 'astronomy'],
      ['underwater', 'ocean', 'marine'],
      ['fantasy', 'magical', 'mystical'],
      ['horror', 'dark', 'gothic'],
      ['retro', 'vintage', 'nostalgia'],
      ['modern', 'contemporary', 'current'],
      ['classical', 'traditional', 'timeless'],
      ['experimental', 'avant-garde', 'cutting-edge'],
      ['commercial', 'mainstream', 'accessible'],
      ['exclusive', 'limited', 'rare'],
      ['collaborative', 'community', 'social'],
      ['utility', 'functional', 'practical'],
      ['decorative', 'aesthetic', 'beautiful'],
      ['conceptual', 'intellectual', 'thought-provoking'],
      ['emotional', 'expressive', 'personal'],
      ['technical', 'complex', 'sophisticated'],
      ['simple', 'elegant', 'refined'],
      ['bold', 'striking', 'attention-grabbing'],
      ['subtle', 'nuanced', 'sophisticated'],
      ['colorful', 'vibrant', 'saturated'],
      ['monochrome', 'black-white', 'grayscale'],
      ['textured', 'tactile', 'material'],
      ['smooth', 'polished', 'refined'],
      ['rough', 'gritty', 'raw'],
      ['organic', 'natural', 'flowing'],
      ['geometric', 'structured', 'mathematical'],
      ['chaotic', 'random', 'unpredictable'],
      ['ordered', 'systematic', 'logical'],
      ['dynamic', 'energetic', 'active'],
    ];

    const cards: AnalyticsCard[] = [];

    for (let i = 0; i < 50; i++) {
      const platform = platforms[Math.floor(Math.random() * platforms.length)];
      const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
      const trending = Math.random() > 0.7;
      const artistName = artistNames[i] || `Artist ${i + 1}`;
      const collectionName = collectionNames[i] || `Collection ${i + 1}`;
      const username = artistName.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Generate realistic metrics based on risk level and trending status
      const baseMultiplier = trending ? 1.5 : 1;
      const riskMultiplier = riskLevel === 'high' ? 2 : riskLevel === 'medium' ? 1.3 : 0.8;
      const multiplier = baseMultiplier * riskMultiplier;

      const marketCap = Math.floor((Math.random() * 800000 + 50000) * multiplier);
      const volume24h = Math.floor((Math.random() * 200000 + 10000) * multiplier);
      const followers = Math.floor((Math.random() * 15000 + 500) * multiplier);
      const smartFollowers = Math.floor((Math.random() * 200 + 5) * multiplier);
      const twitterFollowers = Math.floor((Math.random() * 50000 + 1000) * multiplier);

      // Generate change percentages
      const marketCapChange = (Math.random() - 0.3) * 200 * multiplier; // Slightly bullish bias
      const followersChange = Math.floor((Math.random() - 0.2) * 500 * multiplier);
      const twitterFollowersChange = Math.floor((Math.random() - 0.2) * 1000 * multiplier);

      // Select random tags
      const tags = tagSets[Math.floor(Math.random() * tagSets.length)];

      // Select random AI recommendation
      const aiRecommendation = aiRecommendations[Math.floor(Math.random() * aiRecommendations.length)];

      const card: AnalyticsCard = {
        id: `card_${i + 1}`,
        artist: {
          username,
          displayName: artistName,
          profileUrl: `https://${platform}.co/@${username}`,
          twitterUrl: Math.random() > 0.3 ? `https://twitter.com/${username}` : undefined,
        },
        collection: {
          name: collectionName,
          contractAddress: `0x${Math.random().toString(16).substring(2, 10)}${Math.random()
            .toString(16)
            .substring(2, 10)}${Math.random().toString(16).substring(2, 10)}${Math.random()
            .toString(16)
            .substring(2, 10)}`,
          platform,
        },
        metrics: {
          marketCap,
          marketCapChange24h: Number(marketCapChange.toFixed(1)),
          volume24h,
          volume7d: volume24h * (5 + Math.random() * 10),
          followers,
          followersChange24h: followersChange,
          smartFollowers,
          twitterFollowers: Math.random() > 0.2 ? twitterFollowers : undefined,
          twitterFollowersChange24h: Math.random() > 0.2 ? twitterFollowersChange : undefined,
        },
        aiRecommendation,
        tags,
        riskLevel,
        trending,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      };

      cards.push(card);
    }

    return cards;
  }

  async getAllCards(): Promise<AnalyticsCard[]> {
    return this.readCards();
  }

  async getCardById(id: string): Promise<AnalyticsCard | null> {
    const cards = await this.readCards();
    return cards.find(card => card.id === id) || null;
  }

  async getCardsByPlatform(platform: string): Promise<AnalyticsCard[]> {
    const cards = await this.readCards();
    return cards.filter(card => card.collection.platform === platform);
  }

  async getCardsByRiskLevel(riskLevel: string): Promise<AnalyticsCard[]> {
    const cards = await this.readCards();
    return cards.filter(card => card.riskLevel === riskLevel);
  }

  async getTrendingCards(): Promise<AnalyticsCard[]> {
    const cards = await this.readCards();
    return cards.filter(card => card.trending);
  }

  async getCardsSortedBy(sortBy: 'volume' | 'followers' | 'marketcap' | 'trending'): Promise<AnalyticsCard[]> {
    const cards = await this.readCards();

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

  async searchCards(query: string): Promise<AnalyticsCard[]> {
    const cards = await this.readCards();
    const searchLower = query.toLowerCase();

    return cards.filter(
      card =>
        card.artist.displayName.toLowerCase().includes(searchLower) ||
        card.artist.username.toLowerCase().includes(searchLower) ||
        card.collection.name.toLowerCase().includes(searchLower) ||
        card.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }

  async saveCard(card: AnalyticsCard): Promise<void> {
    const cards = await this.readCards();
    const index = cards.findIndex(c => c.id === card.id);

    if (index >= 0) {
      cards[index] = { ...card, updatedAt: new Date().toISOString() };
    } else {
      cards.push({ ...card, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }

    await fs.writeFile(DATA_FILE, JSON.stringify(cards, null, 2));
  }

  async initializeData(): Promise<void> {
    try {
      await fs.access(DATA_FILE);
    } catch {
      // File doesn't exist, create it with demo data
      const demoData = this.generateDemoData();
      await fs.writeFile(DATA_FILE, JSON.stringify(demoData, null, 2));
      console.log(`📊 Initialized analytics data with ${demoData.length} cards`);
    }
  }
}

export const analyticsRepository = new AnalyticsRepository();
