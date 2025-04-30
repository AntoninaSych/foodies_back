import { User } from '../models/index.js';
import HttpError from '../helpers/HttpError.js';

export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        next(HttpError(500, error.message));
    }
};
