import express from 'express';
import { register, login, getMe, updateAvatar } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.put('/avatar', authenticateToken, updateAvatar);

export default router;
