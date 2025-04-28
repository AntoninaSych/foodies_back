import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import gravatar from 'gravatar';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/index.js';

const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

const emailSchema = Joi.object({
    email: Joi.string().email().required(),
});

const SECRET_KEY = process.env.JWT_SECRET || 'defaultsecret';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

export const register = async (req, res, next) => {
    try {
        const { error } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.message });
        }

        const { email, password } = req.body;
        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            return res.status(409).json({ message: 'Email in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const avatarURL = 'http:' + gravatar.url(email, { s: '250', d: 'retro' });
        const verificationToken = uuidv4();

        const newUser = await User.create({
            email,
            password: hashedPassword,
            avatarURL,
            verificationToken,
            verify: false,
        });

        const verifyLink = `${BASE_URL}/api/auth/verify/${verificationToken}`;
        await sendEmail({
            to: email,
            subject: 'Verify your email',
            html: `<p>Please confirm your email by clicking the link: <a href="${verifyLink}">Verify email</a></p>`,
        });

        res.status(201).json({
            user: {
                email: newUser.email,
                subscription: newUser.subscription,
                avatarURL: newUser.avatarURL,
            },
        });
    } catch (err) {
        next(err);
    }
};

export const login = async (req, res, next) => {
    try {
        const { error } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.message });
        }

        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Email or password is wrong' });
        }

        if (!user.verify) {
            return res.status(401).json({ message: 'Email not verified' });
        }

        const payload = { id: user.id };
        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '24h' });

        await user.update({ token });

        res.status(200).json({
            token,
            user: {
                email: user.email,
                subscription: user.subscription,
                avatarURL: user.avatarURL,
            },
        });
    } catch (err) {
        next(err);
    }
};
