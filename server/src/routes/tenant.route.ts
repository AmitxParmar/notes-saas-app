import { Router } from 'express';
import { toggleTenantPlan } from '../controllers/tenant.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { enforceTenantIsolation } from '../middleware/tenantIsolation';

const router:Router = Router();

router.post('/:slug/upgrade', authenticate, requireRole(['admin']), enforceTenantIsolation, toggleTenantPlan);

export default router;