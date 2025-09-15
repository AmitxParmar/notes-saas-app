import { Router } from 'express';
import { login, logout, refreshToken, getCurrentUser } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.post('/refreshToken', refreshToken);
router.get('/me', authenticate, getCurrentUser);

export default router;
