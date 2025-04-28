import { Recipe } from '../models/index.js';
import HttpError from '../helpers/HttpError.js';

export const getAllRecipes = async (req, res, next) => {
    try {
        const recipes = await Recipe.findAll();
        res.json(recipes);
    } catch (error) {
        next(HttpError(500, error.message));
    }
};
