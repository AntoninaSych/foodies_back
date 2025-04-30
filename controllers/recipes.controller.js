import { Recipe, Area, User, Ingredient } from '../models/index.js';
import HttpError from '../helpers/HttpError.js';

export const getAllRecipes = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const recipes = await Recipe.findAll({
            include: [
                {
                    model: Area,
                    as: 'area',
                    attributes: ['id', 'name'],
                },
                {
                    model: User,
                    as: 'owner',
                    attributes: ['id', 'name', 'email'],
                },
            ],
            offset,
            limit: parseInt(limit),
            order: [['createdAt', 'DESC']],
        });

        res.json(recipes);
    } catch (error) {
        next(HttpError(500, error.message));
    }
};

export const getRecipeById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const recipe = await Recipe.findOne({
            where: { id },
            include: [
                {
                    model: Area,
                    as: 'area',
                    attributes: ['id', 'name'],
                },
                {
                    model: User,
                    as: 'owner',
                    attributes: ['id', 'name', 'email'],
                },
                {
                    model: Ingredient,
                    attributes: ['id', 'name'],
                    through: { attributes: [] },
                },
            ],
        });

        if (!recipe) {
            return next(HttpError(404, 'Recipe not found'));
        }

        res.json(recipe);
    } catch (error) {
        next(HttpError(500, error.message));
    }
};
