import { Category } from '../models/index.js';
import HttpError from '../helpers/HttpError.js';

export const getAllCategories = async (req, res, next) => {
    try {
        const categories = await Category.findAll();
        res.json(categories);
    } catch (error) {
        next(HttpError(500, error.message));
    }
};
