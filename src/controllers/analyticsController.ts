import type { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analyticsService.js';

class AnalyticsController {
  async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const isPro = user.pro || user.tokenGatePassed;

      // Parse query parameters for filtering
      const filters = {
        platform: req.query.platform as string,
        risk: req.query.risk as string,
        trending: req.query.trending === 'true',
        sortBy: req.query.sort as 'volume' | 'followers' | 'marketcap' | 'trending',
        search: req.query.search as string,
        limit: parseInt(req.query.limit as string) || undefined,
        offset: parseInt(req.query.offset as string) || 0,
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof typeof filters] === undefined || filters[key as keyof typeof filters] === '') {
          delete filters[key as keyof typeof filters];
        }
      });

      const { cards, total } = await analyticsService.getAnalyticsCards(isPro, filters);
      const stats = await analyticsService.getMarketStats();
      const platformStats = await analyticsService.getPlatformStats();
      const riskDistribution = await analyticsService.getRiskDistribution();

      const itemsPerPage = res.locals.itemsPerPage ?? (isPro ? 50 : 5);

      // For AJAX requests, return JSON
      if (req.headers.accept?.includes('application/json')) {
        return res.json({
          cards,
          total,
          stats,
          platformStats,
          riskDistribution,
          isPro,
          filters,
        });
      }

      // For regular page requests, render HTML
      res.render('analytics', {
        title: 'Analytics Dashboard - Zora AI Agent',
        cards,
        total,
        stats,
        platformStats,
        riskDistribution,
        isPro,
        showUpgradePrompt: !isPro,
        currentFilters: filters,
        itemsPerPage,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCard(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user!;
      const isPro = user.pro || user.tokenGatePassed;

      const card = await analyticsService.getCardById(id, isPro);

      if (!card) {
        return res.status(404).json({ error: 'Card not found' });
      }

      res.json(card);
    } catch (error) {
      next(error);
    }
  }

  async getTrending(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const isPro = user.pro || user.tokenGatePassed;
      const limit = parseInt(req.query.limit as string) || 8;

      const trendingCards = await analyticsService.getTrendingCards(isPro, limit);

      res.json(trendingCards);
    } catch (error) {
      next(error);
    }
  }

  async searchCards(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const isPro = user.pro || user.tokenGatePassed;
      const query = req.query.q as string;

      if (!query) {
        return res.status(400).json({ error: 'Search query required' });
      }

      const results = await analyticsService.searchCards(query, isPro);

      res.json({
        query,
        results,
        count: results.length,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTopPerformers(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const isPro = user.pro || user.tokenGatePassed;
      const limit = parseInt(req.query.limit as string) || 5;

      const topPerformers = await analyticsService.getTopPerformers(isPro, limit);

      res.json(topPerformers);
    } catch (error) {
      next(error);
    }
  }

  async getPlatformStats(req: Request, res: Response, next: NextFunction) {
    try {
      const platformStats = await analyticsService.getPlatformStats();
      res.json(platformStats);
    } catch (error) {
      next(error);
    }
  }

  async getWeeklyPerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const weeklyPerformance = await analyticsService.getWeeklyPerformance();
      res.json(weeklyPerformance);
    } catch (error) {
      next(error);
    }
  }

  async exportData(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const isPro = user.pro || user.tokenGatePassed;

      if (!isPro) {
        return res.status(403).json({ error: 'Pro subscription required for data export' });
      }

      const { cards } = await analyticsService.getAnalyticsCards(isPro, {});

      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=nft-analytics.csv');

      // Generate CSV content
      const csvHeader =
        'Artist,Collection,Platform,Market Cap,Volume 24h,Followers,Smart Followers,Risk Level,Trending,AI Recommendation\n';
      const csvRows = cards
        .map(
          card =>
            `"${card.artist.displayName}","${card.collection.name}","${card.collection.platform}",${
              card.metrics.marketCap
            },${card.metrics.volume24h},${card.metrics.followers},${card.metrics.smartFollowers},"${card.riskLevel}",${
              card.trending
            },"${card.aiRecommendation.replace(/"/g, '""')}"`
        )
        .join('\n');

      res.send(csvHeader + csvRows);
    } catch (error) {
      next(error);
    }
  }
}
export const analyticsController = new AnalyticsController();
