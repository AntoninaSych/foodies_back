import { Recipe, Area, User, Ingredient, Category, RecipeIngredient } from '../models/index.js';
import HttpError from '../helpers/HttpError.js';
import { Sequelize } from 'sequelize';
import fs from 'fs/promises';
import path from 'path';

export const getAllRecipes = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const options = {
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
        };

        if (req.user) {
            options.where = { ownerId: req.user.id };
        }

        const recipes = await Recipe.findAll(options);
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
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name', 'thumb'],
                },
                {
                    model: Ingredient,
                    attributes: ['id', 'name', 'thumb'],
                    through: { attributes: ['measure'] },
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

export const createRecipe = async (req, res, next) => {
    try {
        const {
            title,
            description,
            instructions,
            time,
            categoryId,
            areaId,
            ingredients,
        } = req.body;

        const parsedIngredients = JSON.parse(ingredients || '[]');

        if (!title || !categoryId || parsedIngredients.length === 0) {
            return next(HttpError(400, 'Title, category and at least one ingredient are required.'));
        }

        let thumbPath = null;
        if (req.file) {
            const { path: oldPath, filename } = req.file;
            const imagesDir = path.resolve('images', 'recipies');
            const newPath = path.join(imagesDir, filename);

            await fs.mkdir(imagesDir, { recursive: true });

            await fs.rename(oldPath, newPath);

            thumbPath = `/images/recipies/${filename}`;
        }

        const newRecipe = await Recipe.create({
            title,
            description,
            instructions,
            time,
            categoryId,
            areaId: areaId || null,
            ownerId: req.user.id,
            thumb: thumbPath,
        });

        const ingredientsToInsert = parsedIngredients.map(ing => ({
            recipeId: newRecipe.id,
            ingredientId: ing.id,
            measure: ing.measure || null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));

        await RecipeIngredient.bulkCreate(ingredientsToInsert);

        res.status(201).json({ message: 'Recipe created successfully', recipeId: newRecipe.id });
    } catch (error) {
        next(HttpError(500, error.message));
    }
};


export const deleteOwnRecipe = async (req, res, next) => {
    try {
        const { id } = req.params;
        const recipe = await Recipe.findByPk(id);

        if (!recipe) {
            return next(HttpError(404, 'Рецепт не найден'));
        }

        if (recipe.ownerId !== req.user.id) {
            return next(HttpError(403, 'У вас нет прав на удаление этого рецепта'));
        }
        await recipe.destroy();

        res.status(204).send();
    } catch (error) {
        next(HttpError(500, error.message));
    }
};

export const getOwnRecipes = async (req, res, next) => {
  return getAllRecipes(req, res, next);
}

export const addToFavorites = async (req, res, next) => {
  try {
    const user = req.user; // set by auth middleware
    const { id: favoriteId } = req.params; // ID to follow

    const target = await Recipe.findByPk(favoriteId);
    if (!target) {
      throw HttpError(404, "Recipe not found");
    }

    await user.addFavorites(target);

    res.json({ message: `Added recipe ${favoriteId} to favorites` });
  } catch (err) {
    next(err.status ? err : HttpError(500, err.message));
  }
};

export const removeFromFavorites = async (req, res, next) => {
  try {
    const user = req.user;
    const { id: favoriteId } = req.params;

    const target = await Recipe.findByPk(favoriteId);
    if (!target) {
      throw HttpError(404, "Recipe not found");
    }

    await user.removeFavorites(target);

    res.json({ message: `Removed ${favoriteId} recipe from favorites` });
  } catch (err) {
    next(err.status ? err : HttpError(500, err.message));
  }
};

export const getFavorites = async (req, res, next) => {
  try {
    const user = req.user;
    const favorites = await user.getFavorites();
    res.json(favorites);
  } catch (err) {
    next(err.status ? err : HttpError(500, err.message));
  }
};

export const getPopular = async (_, res, next) => {
  try {
    const popularRecipes = await Recipe.findAll({
      attributes: {
        include: [
          [
            Sequelize.fn("COUNT", Sequelize.col("favorited.id")),
            "favoritesCount",
          ],
        ],
      },
      include: [
        {
          model: User,
          as: "favorited",
          attributes: [],
          through: { attributes: [] },
        },
    ],
      group: ["Recipe.id"],
      having: Sequelize.literal('COUNT("favorited"."id") > 0'),
      order: [[Sequelize.fn("COUNT", Sequelize.col("favorited.id")), "DESC"]],
    });

    res.json(popularRecipes);
  } catch (err) {
    next(err.status ? err : HttpError(500, err.message));
 }
};