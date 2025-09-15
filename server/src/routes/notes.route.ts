import { Router } from 'express';
import { 
  createNote, 
  getNotes, 
  getNoteById, 
  updateNote, 
  deleteNote 
} from '../controllers/notes.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { enforceTenantIsolation } from '../middleware/tenantIsolation';


const router:Router = Router();

// All routes require authentication and tenant isolation
router.use(authenticate);
router.use(enforceTenantIsolation);

router.post('/', requireRole(['member']), createNote);
router.get('/', requireRole(['member', 'admin']), getNotes);
router.get('/:id', requireRole(['member']), getNoteById);
router.put('/:id', requireRole(['member' ]), updateNote);
router.delete('/:id', requireRole(['member']), deleteNote);

export default router;