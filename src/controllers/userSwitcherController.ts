// src/controllers/userSwitcherController.ts - Исправленная версия
import type { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.js';
import { usersRepository } from '../repositories/usersRepository.js';
import type { User } from '../types/index.js';

interface MockUserProfile {
  id: string;
  username: string;
  displayName: string;
  pro: boolean;
  tokenGatePassed: boolean;
}

class UserSwitcherController {
  private mockUsers: MockUserProfile[] = [
    {
      id: 'guest_user',
      username: 'guest',
      displayName: 'Guest User',
      pro: false,
      tokenGatePassed: false,
    },
    {
      id: 'free_user_1',
      username: 'freeuser',
      displayName: 'Free User',
      pro: false,
      tokenGatePassed: false,
    },
    {
      id: 'pro_user_1',
      username: 'prouser',
      displayName: 'Pro User',
      pro: true,
      tokenGatePassed: false,
    },
    {
      id: 'token_gate_user_1',
      username: 'tokenuser',
      displayName: 'Token Gate User',
      pro: false,
      tokenGatePassed: true,
    },
  ];

  // GET /dev/user-switcher - показать интерфейс переключения пользователей
  showSwitcher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Только в development режиме
      if (process.env.NODE_ENV === 'production') {
        res.status(404).send('Not found');
        return;
      }

      const currentUser = req.user as User | undefined;

      res.render('dev/user-switcher', {
        title: 'User Switcher - Development Tool',
        currentUser,
        mockUsers: this.mockUsers,
        isLoggedIn: !!currentUser,
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /dev/switch-user - переключиться на другого пользователя
  switchUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Только в development режиме
      if (process.env.NODE_ENV === 'production') {
        res.status(404).json({ error: 'Not found' });
        return;
      }

      const { userId, userType } = req.body;

      if (userType === 'logout') {
        // Выход из системы
        req.logout(err => {
          if (err) {
            return next(err);
          }
          req.session.destroy(sessionErr => {
            if (sessionErr) {
              return next(sessionErr);
            }
            res.clearCookie('connect.sid');
            res.redirect('/dev/user-switcher?message=logged_out');
          });
        });
        return;
      }

      if (userType === 'guest') {
        // Перейти в гостевой режим (выйти, но перенаправить на analytics)
        req.logout(err => {
          if (err) {
            return next(err);
          }
          req.session.destroy(sessionErr => {
            if (sessionErr) {
              return next(sessionErr);
            }
            res.clearCookie('connect.sid');
            res.redirect('/analytics?guest=true');
          });
        });
        return;
      }

      // Найти мок-пользователя
      const mockUserProfile = this.mockUsers.find(u => u.id === userId);
      if (!mockUserProfile) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }

      // Создать или обновить пользователя в базе
      let user = await usersRepository.findById(mockUserProfile.id);

      if (!user) {
        const newUser: User = {
          id: mockUserProfile.id,
          twitterId: `mock_${mockUserProfile.id}`,
          username: mockUserProfile.username,
          displayName: mockUserProfile.displayName,
          profileImage: undefined,
          pro: mockUserProfile.pro,
          tokenGatePassed: mockUserProfile.tokenGatePassed,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        user = await usersRepository.create(newUser);
      } else {
        // Обновить существующего пользователя
        user =
          (await usersRepository.update(user.id, {
            pro: mockUserProfile.pro,
            tokenGatePassed: mockUserProfile.tokenGatePassed,
            displayName: mockUserProfile.displayName,
          })) || user;
      }

      // Войти под этим пользователем
      req.login(user, err => {
        if (err) {
          return next(err);
        }
        res.redirect('/analytics?switched=true');
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /dev/current-user - показать текущего пользователя (API для отладки)
  getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    if (process.env.NODE_ENV === 'production') {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const user = req.user as User | undefined;
    res.json({
      isLoggedIn: !!user,
      user: user
        ? {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            pro: user.pro,
            tokenGatePassed: user.tokenGatePassed,
          }
        : null,
      accessLevel: this.determineAccessLevel(user),
    });
  };

  // POST /dev/update-user-flags - обновить флаги текущего пользователя
  updateUserFlags = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (process.env.NODE_ENV === 'production') {
        res.status(404).json({ error: 'Not found' });
        return;
      }

      const user = req.user as User | undefined;
      if (!user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { pro, tokenGatePassed } = req.body;

      const updatedUser = await usersRepository.update(user.id, {
        pro: pro !== undefined ? pro : user.pro,
        tokenGatePassed: tokenGatePassed !== undefined ? tokenGatePassed : user.tokenGatePassed,
      });

      if (!updatedUser) {
        res.status(500).json({ error: 'Failed to update user' });
        return;
      }

      // Обновить сессию
      req.login(updatedUser, err => {
        if (err) {
          return next(err);
        }
        res.json({
          success: true,
          user: {
            id: updatedUser.id,
            username: updatedUser.username,
            displayName: updatedUser.displayName,
            pro: updatedUser.pro,
            tokenGatePassed: updatedUser.tokenGatePassed,
          },
          accessLevel: this.determineAccessLevel(updatedUser),
        });
      });
    } catch (error) {
      next(error);
    }
  };

  private determineAccessLevel(user: User | undefined): 'guest' | 'free' | 'pro' {
    if (!user) return 'guest';
    if (user.pro || user.tokenGatePassed) return 'pro';
    return 'free';
  }
}

export const userSwitcherController = new UserSwitcherController();
