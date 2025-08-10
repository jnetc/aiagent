import type { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.js';

class AuthController {
  async mockTwitterLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const mockUser = await authService.createOrUpdateMockUser();

      req.login(mockUser, err => {
        if (err) {
          return next(err);
        }
        res.redirect('/analytics');
      });
    } catch (error) {
      next(error);
    }
  }

  twitterCallback(req: Request, res: Response): void {
    // Successful authentication
    res.redirect('/analytics');
  }

  logout(req: Request, res: Response, next: NextFunction): void {
    req.logout(err => {
      if (err) {
        return next(err);
      }
      req.session.destroy(sessionErr => {
        if (sessionErr) {
          return next(sessionErr);
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
      });
    });
  }
}

export const authController = new AuthController();
