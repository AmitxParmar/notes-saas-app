import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import Tenant, { ITenant } from '../models/Tenant';

export interface AuthRequest extends Request {
  user?: IUser;
  tenant?: ITenant;
}

export interface JWTPayload {
  userId: string;
  tenantId: string;
  role: string;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.accessToken || req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        code: 'ACCESS_TOKEN_MISSING'
      });
    } 

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    const user = await User.findById(decoded.userId).populate('tenantId');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const tenant = await Tenant.findById(decoded.tenantId);
    if (!tenant) {
      return res.status(401).json({
        success: false,
        message: 'Tenant not found',
        code: 'TENANT_NOT_FOUND'
      });
    }

    req.user = user;
    req.tenant = tenant;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'ACCESS_TOKEN_INVALID'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

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