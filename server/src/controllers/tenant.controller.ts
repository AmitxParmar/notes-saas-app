import { Response } from 'express';
import Tenant, { SubscriptionPlan } from '../models/Tenant';
import { AuthRequest } from '../middleware/auth';

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
    
    const newMaxNotes = newPlan === SubscriptionPlan.PRO ? -1 : 3; // Unlimited for Pro, 10 for Free

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