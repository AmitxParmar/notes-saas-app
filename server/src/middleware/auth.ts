import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import Tenant, { ITenant } from '../models/Tenant';

/**
 * Extended Express Request interface that includes authenticated user and tenant information
 */
export interface AuthRequest extends Request {
  /** The authenticated user object */
  user?: IUser;
  /** The authenticated user's tenant object */
  tenant?: ITenant;
}

/**
 * JWT payload structure containing user authentication information
 */
export interface JWTPayload {
  /** Unique identifier for the user */
  userId: string;
  /** Unique identifier for the user's tenant */
  tenantId: string;
  /** User's role within the tenant */
  role: string;
}

/**
 * Authentication middleware that validates JWT tokens and populates user/tenant data
 * 
 * This middleware:
 * - Extracts JWT token from cookies or Authorization header
 * - Verifies the token signature and expiration
 * - Fetches user and tenant data from the database
 * - Attaches user and tenant objects to the request
 * 
 * @param req - Extended request object that will contain user and tenant data
 * @param res - Express response object
 * @param next - Express next function to continue middleware chain
 * @returns Response with error details if authentication fails, otherwise continues to next middleware
 */
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Extract token from cookies or Authorization header
    const token = req.cookies.accessToken || req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        code: 'ACCESS_TOKEN_MISSING'
      });
    } 

    // Verify and decode the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    // Fetch user from database and populate tenant reference
    const user = await User.findById(decoded.userId).populate('tenantId');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Fetch tenant from database
    const tenant = await Tenant.findById(decoded.tenantId);
    if (!tenant) {
      return res.status(401).json({
        success: false,
        message: 'Tenant not found',
        code: 'TENANT_NOT_FOUND'
      });
    }

    // Attach user and tenant to request object
    req.user = user;
    req.tenant = tenant;
    next();
  } catch (error) {
    // Handle JWT-specific errors
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'ACCESS_TOKEN_INVALID'
      });
    }
    
    // Handle unexpected errors
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Authorization middleware factory that creates role-based access control middleware
 * 
 * This function returns a middleware that checks if the authenticated user has one of the required roles.
 * Must be used after the authenticate middleware to ensure req.user is populated.
 * 
 * @param roles - Array of role strings that are allowed to access the protected resource
 * @returns Express middleware function that validates user roles
 * 
 * @example
 * ```typescript
 * // Allow only admins and managers
 * app.get('/admin-panel', authenticate, requireRole(['admin', 'manager']), handler);
 * 
 * // Allow only super admins
 * app.delete('/users/:id', authenticate, requireRole(['super_admin']), handler);
 * ```
 */
export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    // Check if user's role is in the allowed roles list
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};