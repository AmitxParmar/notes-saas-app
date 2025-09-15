import { Response } from 'express';
import Tenant, { SubscriptionPlan } from '../models/Tenant';
import { AuthRequest } from '../middleware/auth';

export const upgradeTenant = async (req: AuthRequest, res: Response) => {
  try {
    const { slug } = req.params;
    const tenant = req.tenant!;

    // Verify slug matches current tenant
    if (tenant.slug !== slug) {
      return res.status(403).json({
        success: false,
        message: 'Cannot upgrade different tenant'
      });
    }

    // Check if already on Pro plan
    if (tenant.plan === SubscriptionPlan.PRO) {
      return res.status(400).json({
        success: false,
        message: 'Tenant is already on Pro plan'
      });
    }

    // Upgrade tenant
    const updatedTenant = await Tenant.findByIdAndUpdate(
      tenant._id,
      {
        plan: SubscriptionPlan.PRO,
        maxNotes: -1 // Unlimited notes
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Tenant upgraded to Pro successfully',
      data: {
        tenant: {
          id: updatedTenant!._id,
          name: updatedTenant!.name,
          slug: updatedTenant!.slug,
          plan: updatedTenant!.plan,
          maxNotes: updatedTenant!.maxNotes
        }
      }
    });
  } catch (error) {
    console.error('Upgrade tenant error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};