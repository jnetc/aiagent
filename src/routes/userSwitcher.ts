// src/routes/userSwitcher.ts - Исправленная версия
import { Router, type IRouter } from 'express';
import { userSwitcherController } from '../controllers/userSwitcherController.js';

const router: IRouter = Router();

// Только в development режиме
if (process.env.NODE_ENV !== 'production') {
  // GET /dev/user-switcher - интерфейс переключения пользователей
  router.get('/user-switcher', userSwitcherController.showSwitcher);

  // POST /dev/switch-user - переключить пользователя
  router.post('/switch-user', userSwitcherController.switchUser);

  // GET /dev/current-user - API для получения текущего пользователя
  router.get('/current-user', userSwitcherController.getCurrentUser);

  // POST /dev/update-user-flags - обновить флаги пользователя
  router.post('/update-user-flags', userSwitcherController.updateUserFlags);
}

export default router;
