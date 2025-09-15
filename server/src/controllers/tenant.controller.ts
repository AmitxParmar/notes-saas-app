import { Response } from 'express';
import Tenant, { SubscriptionPlan } from '../models/Tenant';
import { AuthRequest } from '../middleware/auth';

/**
 * Toggles a tenant's subscription plan between FREE and PRO
 * 
 * @param req - Express request object with authenticated tenant
 * @param res - Express response object
 * 
 * @description
 * This endpoint allows toggling between FREE and PRO subscription plans for a tenant.
 * - FREE plan: Limited to 3 notes maximum
 * - PRO plan: Unlimited notes (maxNotes = -1)
 * 
 * The function verifies that the authenticated tenant matches the slug parameter
 * before performing the plan toggle operation.
 * 
 * @returns JSON response with updated tenant information or error message
 */
export const toggleTenantPlan = async (req: AuthRequest, res: Response) => {
  try {
    const { slug } = req.params;
    const tenant = req.tenant!;

    // Verify slug matches current tenant
    if (tenant.slug !== slug) {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify different tenant'
      });
    }

    // Determine new plan and maxNotes based on current plan
    const newPlan = tenant.plan === SubscriptionPlan.PRO 
      ? SubscriptionPlan.FREE 
      : SubscriptionPlan.PRO;
    
    const newMaxNotes = newPlan === SubscriptionPlan.PRO ? -1 : 3; // Unlimited for Pro, 3 for Free

    // Update tenant plan
    const updatedTenant = await Tenant.findByIdAndUpdate(
      tenant._id,
      {
        plan: newPlan,
        maxNotes: newMaxNotes
      },
      { new: true }
    );

    const actionMessage = newPlan === SubscriptionPlan.PRO 
      ? 'Tenant upgraded to Pro successfully'
      : 'Tenant downgraded to Free successfully';

    res.status(200).json({
      success: true,
      message: actionMessage,
      data: {
        tenant: {
          _id: updatedTenant!._id,
          name: updatedTenant!.name,
          slug: updatedTenant!.slug,
          plan: updatedTenant!.plan,
          maxNotes: updatedTenant!.maxNotes
        }
      }
    });
  } catch (error) {
    console.error('Toggle tenant plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};