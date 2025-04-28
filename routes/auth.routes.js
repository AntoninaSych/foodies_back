import { Router } from 'express';
import { register, login } from '../controllers/authController.js';
import auth from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';
import { User } from '../models/index.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and user profile management
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already in use
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Successful login
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/current:
 *   get:
 *     summary: Get current logged-in user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *       401:
 *         description: Unauthorized
 */
router.get('/current', auth, async (req, res) => {
    const { email, subscription } = req.user;
    res.status(200).json({ email, subscription });
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Successfully logged out
 *       401:
 *         description: Unauthorized
 */
router.post('/logout', auth, async (req, res, next) => {
    try {
        await req.user.update({ token: null });
        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /api/auth/subscription:
 *   patch:
 *     summary: Update user subscription
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subscription
 *             properties:
 *               subscription:
 *                 type: string
 *                 enum: [starter, pro, business]
 *     responses:
 *       200:
 *         description: Subscription updated
 *       400:
 *         description: Invalid subscription type
 *       401:
 *         description: Unauthorized
 */
router.patch('/subscription', auth, async (req, res, next) => {
    try {
        const { subscription } = req.body;
        const allowed = ['starter', 'pro', 'business'];

        if (!allowed.includes(subscription)) {
            return res.status(400).json({ message: 'Invalid subscription type' });
        }

        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        user.subscription = subscription;
        await user.save();

        res.status(200).json({
            email: user.email,
            subscription: user.subscription,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/auth/avatars:
 *   patch:
 *     summary: Upload user avatar
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar updated
 *       400:
 *         description: File upload error
 *       401:
 *         description: Unauthorized
 */
router.patch('/avatars', auth, upload.single('avatar'), async (req, res, next) => {
    try {
        const { path: tempPath, filename } = req.file;
        const avatarsDir = path.join(__dirname, '../public/avatars');
        const resultPath = path.join(avatarsDir, filename);
        await fs.rename(tempPath, resultPath);

        const avatarURL = `/avatars/${filename}`;
        req.user.avatarURL = avatarURL;
        await req.user.save();

        res.json({ avatarURL });
    } catch (err) {
        next(err);
    }
});

export default router;
