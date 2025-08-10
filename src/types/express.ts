// src/types/express.ts
import type { Router } from 'express';

// Re-export Express types for consistent usage across the app
export type ExpressRouter = Router;
export type { Request, Response, NextFunction } from 'express';
