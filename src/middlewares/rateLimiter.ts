import type { Request, Response, NextFunction } from 'express';

// Simple in-memory rate limiter
const requests = new Map<string, { count: number; resetTime: number }>();

export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100; // Max requests per window

  const now = Date.now();
  const userRequests = requests.get(ip);

  if (!userRequests || now > userRequests.resetTime) {
    // First request or window expired
    requests.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    next();
    return;
  }

  if (userRequests.count >= maxRequests) {
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil((userRequests.resetTime - now) / 1000),
    });
    return;
  }

  userRequests.count++;
  next();
}
