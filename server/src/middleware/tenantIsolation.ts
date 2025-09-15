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

  // Get tenant slug from header if provided
  const tenantSlug = req.headers['x-tenant-slug'] as string;

  if (tenantSlug) {
    // If tenant slug is provided in header, validate it matches user's tenant
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
      console.log("Tenant mismatch detected:", {
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
  } else {
    // If no tenant slug in header, use the tenant from JWT (already set in auth middleware)
    if (!req.tenant) {
      return res.status(401).json({
        success: false,
        message: 'Tenant information required'
      });
    }
  }

  // Final validation: ensure user belongs to the tenant
  // Handle both populated and non-populated tenantId
  const userTenantId = typeof req.user.tenantId === 'object' 
    ? String((req.user.tenantId as any)._id) 
    : String(req.user.tenantId);
  const requestTenantId = String(req.tenant._id);
  
  console.log("Final tenant validation:", {
    userTenantId,
    requestTenantId,
    userEmail: req.user.email,
    userRole: req.user.role,
    tenantSlug: req.tenant.slug,
    tenantIdType: typeof req.user.tenantId,
    match: userTenantId === requestTenantId
  });

  if (userTenantId !== requestTenantId) {
    console.error("TENANT MISMATCH - Final validation failed:", {
      userTenantId,
      requestTenantId,
      userEmail: req.user.email,
      tenantIdType: typeof req.user.tenantId
    });
    
    return res.status(403).json({
      success: false,
      message: 'Access denied: Tenant mismatch'
    });
  }

  next();
};