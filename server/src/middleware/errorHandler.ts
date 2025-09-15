import { Request, Response, NextFunction } from 'express';

/**
 * Extended Error interface for application-specific error handling
 * @interface AppError
 * @extends Error
 */
export interface AppError extends Error {
  /** HTTP status code for the error */
  statusCode?: number;
  /** Flag indicating if the error is operational (expected) or programming error */
  isOperational?: boolean;
}

/**
 * Global error handling middleware for Express applications
 * Handles various types of errors including Mongoose-specific errors
 * 
 * @param err - The error object to handle
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  // Create a copy of the error object to avoid mutating the original
  let error = { ...err };
  error.message = err.message;

  // Log the error for debugging purposes
  console.error(err);

  // Handle Mongoose bad ObjectId error (CastError)
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error.statusCode = 404;
    error.message = message;
  }

  // Handle Mongoose duplicate key error (E11000)
  if ((err as any).code === 11000) {
    const message = 'Duplicate field value entered';
    error.statusCode = 400;
    error.message = message;
  }

  // Handle Mongoose validation error
  if (err.name === 'ValidationError') {
    // Extract all validation error messages and join them
    const message = Object.values((err as any).errors).map((val: any) => val.message).join(', ');
    error.statusCode = 400;
    error.message = message;
  }

  // Send error response to client
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    // Include stack trace only in development environment
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
