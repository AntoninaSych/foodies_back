import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import gravatar from 'gravatar';
import Joi from 'joi';
import { User } from '../models/index.js';

const registerSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

const SECRET_KEY = process.env.JWT_SECRET || 'defaultsecret';

export const register = async (req, res, next) => {
    try {
        const { error } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.message });
        }

        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            return res.status(409).json({ message: 'Email in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const avatarURL = 'http:' + gravatar.url(email, { s: '250', d: 'retro' });

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            avatarURL,
        });

        res.status(201).json({
            user: {
                name: newUser.name,
                email: newUser.email,
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

        const payload = { id: user.id };
        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '24h' });

        await user.update({ token });

        res.status(200).json({
            token,
            user: {
                name: user.name,
                email: user.email,
                avatarURL: user.avatarURL,
            },
        });
    } catch (err) {
        next(err);
    }
};

export const getCurrent = async (req, res) => {
    const { name, email, avatarURL } = req.user;
    res.status(200).json({ name, email, avatarURL });
};

export const logout = async (req, res, next) => {
    try {
        await req.user.update({ token: null });
        res.status(204).send();
    } catch (err) {
        next(err);
    }
};
