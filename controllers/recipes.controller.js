import { Recipe, Area, User,  Category } from '../models/index.js';
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
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name', 'thumb'],
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
