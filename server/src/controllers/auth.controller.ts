import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Tenant from '../models/Tenant';
import { generateTokens, setTokenCookies, clearTokenCookies } from '../utils/jwt';
import RefreshToken from '../models/RefreshToken';
import { AuthRequest } from '../middleware/auth';

/**
 * Authenticates a user with email and password
 * @param {Request} req - Express request object containing email and password in body
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} JSON response with user data and tenant information on success
 * @description Validates user credentials, generates JWT tokens, and returns user/tenant data
 */
export const login = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user and populate tenant
        const user = await User.findOne({ email: email.toLowerCase() }).populate('tenantId');

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const tenant = await Tenant.findById(user.tenantId);
        if (!tenant) {
            return res.status(404).json({
                success: false,
                message: 'Tenant not found'
            });
        }

        // Generate tokens
        const tokenPayload = {
            userId: String(user._id),
            tenantId: String(tenant._id),
            role: user.role
        };

        const { accessToken, refreshToken } = await generateTokens(tokenPayload);
        setTokenCookies(res, accessToken, refreshToken);

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role
                },
                tenant: {
                    id: tenant._id,
                    name: tenant.name,
                    slug: tenant.slug,
                    plan: tenant.plan,
                    maxNotes: tenant.maxNotes
                }
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Logs out a user by invalidating their refresh token
 * @param {Request} req - Express request object containing refresh token in cookies
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} JSON response confirming logout success
 * @description Removes refresh token from database and clears authentication cookies
 */
export const logout = async (req: Request, res: Response): Promise<Response> => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            await RefreshToken.deleteOne({ token: refreshToken });
        }

        clearTokenCookies(res);

        return res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Refreshes JWT access token using a valid refresh token
 * @param {Request} req - Express request object containing refresh token in cookies or body
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} JSON response confirming token refresh success
 * @description Validates refresh token, generates new token pair, and updates cookies
 */
export const refreshToken = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { refreshToken: tokenFromCookie } = req.cookies;
        const { refreshToken: tokenFromBody } = req.body;

        const token = tokenFromCookie || tokenFromBody;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token required'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as any;

        // Check if token exists in database
        const storedToken = await RefreshToken.findOne({ token });
        if (!storedToken) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

        // Get user and tenant
        const user = await User.findById(decoded.userId);
        const tenant = await Tenant.findById(decoded.tenantId);

        if (!user || !tenant) {
            return res.status(404).json({
                success: false,
                message: 'User or tenant not found'
            });
        }

        // Delete old refresh token
        await RefreshToken.deleteOne({ token });

        // Generate new tokens
        const tokenPayload = {
            userId: String(user._id),
            tenantId: String(tenant._id),
            role: user.role
        };

        const { accessToken, refreshToken: newRefreshToken } = await generateTokens(tokenPayload);
        setTokenCookies(res, accessToken, newRefreshToken);

        return res.status(200).json({
            success: true,
            message: 'Tokens refreshed successfully'
        });
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

        console.error('Refresh token error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Gets current authenticated user information
 * @param {AuthRequest} req - Express request object with authenticated user and tenant
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} JSON response with current user and tenant data
 * @description Returns the current authenticated user's information and tenant details
 */
export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const user = req.user;
        const tenant = req.tenant;

        if (!user || !tenant) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'User retrieved successfully',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role
                },
                tenant: {
                    id: tenant._id,
                    name: tenant.name,
                    slug: tenant.slug,
                    plan: tenant.plan,
                    maxNotes: tenant.maxNotes
                }
            }
        });
    } catch (error) {
        console.error('Get current user error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};