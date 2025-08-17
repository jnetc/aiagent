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

// New middleware for optional auth (allow both logged in and guest users)
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  // Always proceed, user might be null for guests
  next();
}

// Pro features middleware
export function requirePro(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.redirect('/login');
    return;
  }

  if (!req.user.pro && !req.user.tokenGatePassed) {
    res.redirect('/pricing?upgrade=required');
    return;
  }

  next();
}
