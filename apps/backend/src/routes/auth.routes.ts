import { Router } from 'express';
import { login, register, verifyOtp, verifyToken } from '../controllers/auth.controller';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.get('/verify', verifyToken);

export default router;