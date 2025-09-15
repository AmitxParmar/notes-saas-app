import jwt, { SignOptions } from 'jsonwebtoken';
import { Response } from 'express';
import RefreshToken from '../models/RefreshToken';

export interface TokenPayload {
  userId: string;
  tenantId: string;
  role: string;
}

export const generateTokens = async (payload: TokenPayload) => {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m'
  } as SignOptions) ;

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  } as SignOptions);

  // Store refresh token in database
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await RefreshToken.create({
    token: refreshToken,
    userId: payload.userId,
    tenantId: payload.tenantId,
    expiresAt
  });

  return { accessToken, refreshToken };
};

export const setTokenCookies = (res: Response, accessToken: string, refreshToken: string) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: "/",
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path:"/"
  });
};

export const clearTokenCookies = (res: Response) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
};
