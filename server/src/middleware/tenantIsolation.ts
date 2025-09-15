import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import Tenant from '../models/Tenant';

export const enforceTenantIsolation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Get tenant slug from URL params
  const tenantSlug = req.params.slug;

  if (!tenantSlug) {
    return res.status(400).json({
      success: false,
      message: 'Tenant slug is required'
    });
  }

  // Find the requested tenant
  const requestedTenant = await Tenant.findOne({ slug: tenantSlug });

  if (!requestedTenant) {
    return res.status(404).json({
      success: false,
      message: 'Tenant not found'
    });
  }

  // Ensure user belongs to the requested tenant
  // Handle both populated and non-populated tenantId
  const userTenantId = typeof req.user.tenantId === 'object'
    ? String((req.user.tenantId as any)._id)
    : String(req.user.tenantId);

  if (userTenantId !== String(requestedTenant._id)) {
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

  console.log("Tenant access granted:", {
    userEmail: req.user.email,
    userRole: req.user.role,
    tenantSlug: req.tenant.slug
  });

  next();
};