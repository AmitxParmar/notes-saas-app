import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import Tenant from '../models/Tenant';

/**
 * Middleware to enforce tenant isolation by ensuring users can only access resources
 * belonging to their assigned tenant.
 * 
 * This middleware:
 * 1. Validates that the user is authenticated
 * 2. Extracts the tenant slug from URL parameters
 * 3. Verifies the tenant exists in the database
 * 4. Ensures the authenticated user belongs to the requested tenant
 * 5. Attaches the tenant object to the request for downstream use
 * 
 * @param req - Express request object extended with user and tenant properties
 * @param res - Express response object
 * @param next - Express next function to continue middleware chain
 * @returns Response with error status or calls next() to continue
 */
export const enforceTenantIsolation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Ensure user is authenticated before proceeding
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Get tenant slug from URL params
  const tenantSlug = req.params.slug;

  // Validate that tenant slug is provided in the URL
  if (!tenantSlug) {
    return res.status(400).json({
      success: false,
      message: 'Tenant slug is required'
    });
  }

  // Find the requested tenant in the database
  const requestedTenant = await Tenant.findOne({ slug: tenantSlug });

  // Return 404 if tenant doesn't exist
  if (!requestedTenant) {
    return res.status(404).json({
      success: false,
      message: 'Tenant not found'
    });
  }

  // Ensure user belongs to the requested tenant
  // Handle both populated and non-populated tenantId cases
  // If tenantId is populated (object), extract the _id, otherwise use the string value
  const userTenantId = typeof req.user.tenantId === 'object'
    ? String((req.user.tenantId as any)._id)
    : String(req.user.tenantId);

  // Compare user's tenant ID with the requested tenant ID
  if (userTenantId !== String(requestedTenant._id)) {
    // Log access denial for security monitoring
    console.log("Tenant access denied:", {
      userTenantId,
      requestedTenantId: String(requestedTenant._id),
      tenantSlug,
      userEmail: req.user.email
    });

    return res.status(403).json({
      success: false,
      message: 'Access denied: You do not have access to this tenant'
    });
  }

  // Set the tenant on the request for downstream use
  req.tenant = requestedTenant;

  // Log successful tenant access for audit purposes
  console.log("Tenant access granted:", {
    userEmail: req.user.email,
    userRole: req.user.role,
    tenantSlug: req.tenant.slug
  });

  // Continue to the next middleware or route handler
  next();
};