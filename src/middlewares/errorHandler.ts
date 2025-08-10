import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/index.js';

export function errorHandler(error: AppError | Error, req: Request, res: Response, next: NextFunction): void {
  console.error('Error occurred:', error);

  // Default error
  let statusCode = 500;
  let message = 'Internal Server Error';

  // Handle known errors
  if (error instanceof Error && 'statusCode' in error) {
    statusCode = (error as AppError).statusCode;
    message = error.message;
  }

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  }

  if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  }

  // Send error response
  if (req.accepts('html')) {
    res.status(statusCode).render('error', {
      title: 'Error',
      statusCode,
      message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  } else {
    res.status(statusCode).json({
      error: {
        statusCode,
        message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
    });
  }
}

export function createError(statusCode: number, message: string): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
}
