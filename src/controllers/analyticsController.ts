import type { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analyticsService.js';
import type { User } from '../types/index.js';
import { getAuthenticatedUser, hasProAccess, getAccessLevel, getSafeUserData } from '../utils/typeUtils.js';

class AnalyticsController {
  async getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Безопасное получение пользователя
      const user = getAuthenticatedUser(req);

      // Проверка доступа
      const isPro = hasProAccess(user);
      const isGuest = !user;
      const accessLevel = getAccessLevel(user);

      // Безопасные данные для клиента
      const safeUserData = getSafeUserData(user);

      // Использование в логике
      if (accessLevel === 'guest') {
        // Логика для гостей
      } else if (accessLevel === 'free') {
        // Логика для бесплатных пользователей
      } else if (accessLevel === 'pro') {
        // Логика для Pro пользователей
      }

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

      // Limit guest access
      if (isGuest) {
        filters.limit = 3;
        filters.offset = 0;
        if (filters.sortBy && !['trending', 'volume'].includes(filters.sortBy)) {
          filters.sortBy = 'trending';
        }
      }

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        const filterKey = key as keyof typeof filters;
        if (filters[filterKey] === undefined || filters[filterKey] === '') {
          delete filters[filterKey];
        }
      });

      const { cards, total } = await analyticsService.getAnalyticsCards(isPro, filters);
      const stats = await analyticsService.getMarketStats();

      const platformStats = isPro ? await analyticsService.getPlatformStats() : null;
      const riskDistribution = isPro ? await analyticsService.getRiskDistribution() : null;

      const itemsPerPage = isGuest ? 3 : isPro ? 50 : 5;

      // For AJAX requests, return JSON
      if (req.headers.accept?.includes('application/json')) {
        res.json({
          cards,
          total,
          stats,
          platformStats,
          riskDistribution,
          isPro,
          isGuest,
          filters,
        });
        return;
      }

      // For regular page requests, render HTML
      res.render('analytics', {
        title: 'Analytics Dashboard - Zora AI Agent',
        pageCSS: ['analytics'],
        pageJS: ['analytics-page'],
        bodyData: {
          'items-per-page': itemsPerPage,
          'is-pro': isPro,
          'is-guest': isGuest,
          'current-filters': JSON.stringify(filters),
          'total-cards': total,
        },
        cards,
        total,
        stats,
        platformStats,
        riskDistribution,
        isPro,
        isGuest,
        showUpgradePrompt: !isPro && !isGuest,
        showGuestPrompt: isGuest,
        currentFilters: filters,
        itemsPerPage,
        user: user || null,
        isLoggedIn: !isGuest,
      });
    } catch (error) {
      next(error);
    }
  }

  // Новый метод для получения только карточек (для AJAX)
  async getAnalyticsCards(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Безопасное получение пользователя
      const user = getAuthenticatedUser(req);

      // Проверка доступа
      const isPro = hasProAccess(user);
      const isGuest = !user;
      const accessLevel = getAccessLevel(user);

      // Безопасные данные для клиента
      const safeUserData = getSafeUserData(user);

      // Использование в логике
      if (accessLevel === 'guest') {
        // Логика для гостей
      } else if (accessLevel === 'free') {
        // Логика для бесплатных пользователей
      } else if (accessLevel === 'pro') {
        // Логика для Pro пользователей
      }

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

      // Limit guest access
      if (isGuest) {
        filters.limit = 3;
        filters.offset = 0;
        if (filters.sortBy && !['trending', 'volume'].includes(filters.sortBy)) {
          filters.sortBy = 'trending';
        }
      }

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        const filterKey = key as keyof typeof filters;
        if (filters[filterKey] === undefined || filters[filterKey] === '') {
          delete filters[filterKey];
        }
      });

      const { cards, total } = await analyticsService.getAnalyticsCards(isPro, filters);

      // Возвращаем только HTML карточек (используя партиал)
      res.render('partials/analytics-cards', {
        cards,
        isPro,
        isGuest,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user as User | undefined;
      const isPro = user ? user.pro || user.tokenGatePassed : false;

      const card = await analyticsService.getCardById(id, isPro);

      if (!card) {
        res.status(404).json({ error: 'Card not found' });
        return;
      }

      res.json(card);
    } catch (error) {
      next(error);
    }
  }

  async getTrending(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as User | undefined;
      const isGuest = !user;
      const isPro = user ? user.pro || user.tokenGatePassed : false;

      const limit = isGuest ? 3 : parseInt(req.query.limit as string) || 8;
      const trendingCards = await analyticsService.getTrendingCards(isPro, limit);

      res.json(trendingCards);
    } catch (error) {
      next(error);
    }
  }

  async searchCards(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Безопасное получение пользователя
      const user = getAuthenticatedUser(req);

      // Проверка доступа
      const isPro = hasProAccess(user);
      const isGuest = !user;
      const accessLevel = getAccessLevel(user);

      // Безопасные данные для клиента
      const safeUserData = getSafeUserData(user);

      // Использование в логике
      if (accessLevel === 'guest') {
        // Логика для гостей
      } else if (accessLevel === 'free') {
        // Логика для бесплатных пользователей
      } else if (accessLevel === 'pro') {
        // Логика для Pro пользователей
      }
      const query = req.query.q as string;

      if (!query) {
        res.status(400).json({ error: 'Search query required' });
        return;
      }

      const results = await analyticsService.searchCards(query, isPro);
      const limitedResults = isGuest ? results.slice(0, 3) : results;

      res.json({
        query,
        results: limitedResults,
        count: limitedResults.length,
        total: results.length,
        limited: isGuest && results.length > 3,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTopPerformers(req: Request, res: Response, next: NextFunction): Promise<void> {
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

  async getPlatformStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const platformStats = await analyticsService.getPlatformStats();
      res.json(platformStats);
    } catch (error) {
      next(error);
    }
  }

  async getWeeklyPerformance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const weeklyPerformance = await analyticsService.getWeeklyPerformance();
      res.json(weeklyPerformance);
    } catch (error) {
      next(error);
    }
  }

  async exportData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const isPro = user.pro || user.tokenGatePassed;

      const { cards } = await analyticsService.getAnalyticsCards(isPro, {});

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=nft-analytics.csv');

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

  async advancedSearch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Безопасное получение пользователя
      const user = getAuthenticatedUser(req);

      // Проверка доступа
      const isPro = hasProAccess(user);

      const accessLevel = getAccessLevel(user);

      // Использование в логике
      if (accessLevel === 'guest') {
        // Логика для гостей
      } else if (accessLevel === 'free') {
        // Логика для бесплатных пользователей
      } else if (accessLevel === 'pro') {
        // Логика для Pro пользователей
      }

      const filters = {
        platforms: req.query.platforms ? (req.query.platforms as string).split(',') : [],
        risks: req.query.risks ? (req.query.risks as string).split(',') : [],
        dateRange: req.query.dateRange as string,
        volumeMin: parseInt(req.query.volumeMin as string) || 0,
        volumeMax: parseInt(req.query.volumeMax as string) || Number.MAX_SAFE_INTEGER,
        followersMin: parseInt(req.query.followersMin as string) || 0,
      };

      const results = await analyticsService.advancedSearch(filters, isPro);
      res.json(results);
    } catch (error) {
      next(error);
    }
  }

  async getHistoricalData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { cardId } = req.params;
      const period = (req.query.period as string) || '30d';

      const historicalData = await analyticsService.getHistoricalData(cardId, period);
      res.json(historicalData);
    } catch (error) {
      next(error);
    }
  }

  async getPersonalizedRecommendations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const preferences = {
        riskTolerance: (req.query.risk as string) || 'medium',
        platforms: req.query.platforms ? (req.query.platforms as string).split(',') : [],
        priceRange: (req.query.priceRange as string) || 'all',
      };

      const recommendations = await analyticsService.getPersonalizedRecommendations(user.id, preferences);
      res.json(recommendations);
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
