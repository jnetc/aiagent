import type { Request, Response, NextFunction } from 'express';

export function authGuard(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.redirect('/login');
    return;
  }

  // Allow access to analytics for all logged in users
  // The difference will be in what data they see (handled in service layer)
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.redirect('/login');
    return;
  }
  next();
}
