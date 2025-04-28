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

// ------ Swagger Docs and Routers ------

router.post('/register', register);

router.post('/login', login);

router.get('/current', auth, async (req, res) => {
    const { email, subscription } = req.user;
    res.status(200).json({ email, subscription });
});

router.post('/logout', auth, async (req, res, next) => {
    try {
        await req.user.update({ token: null });
        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

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
