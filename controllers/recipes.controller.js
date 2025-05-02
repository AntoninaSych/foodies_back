import {
  Recipe,
  Area,
  User,
  Ingredient,
  Category,
  RecipeIngredient,
} from "../models/index.js";
import HttpError from "../helpers/HttpError.js";

import path from "path";

export const getAllRecipes = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const recipes = await Recipe.findAll({
      include: [
        {
          model: Area,
          as: "area",
          attributes: ["id", "name"],
        },
        {
          model: User,
          as: "owner",
          attributes: ["id", "name", "email"],
        },
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "thumb"],
        },
      ],
      offset,
      limit: parseInt(limit),
      order: [["createdAt", "DESC"]],
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
          as: "area",
          attributes: ["id", "name"],
        },
        {
          model: User,
          as: "owner",
          attributes: ["id", "name", "email"],
        },
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "thumb"],
        },
        {
          model: Ingredient,
          as: "ingredients",
          attributes: ["id", "name", "thumb"],
          through: { attributes: ["measure"] },
        },
      ],
    });

    if (!recipe) {
      return next(HttpError(404, "Recipe not found"));
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

    // ✅ Парсимо масив інгредієнтів (frontend надсилає JSON.stringify)
    const parsedIngredients = JSON.parse(ingredients || "[]");

    if (!title || !categoryId || parsedIngredients.length === 0) {
      return next(
        HttpError(
          400,
          "Title, category and at least one ingredient are required."
        )
      );
    }

    const thumbPath = req.file
      ? path.join("images", "recipies", req.file.filename)
      : null;

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

    // Зберігаємо інгредієнти з мірками у pivot таблицю
    const ingredientsToInsert = parsedIngredients.map((ing) => ({
      recipeId: newRecipe.id,
      ingredientId: ing.id,
      measure: ing.measure || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await RecipeIngredient.bulkCreate(ingredientsToInsert);

    res
      .status(201)
      .json({ message: "Recipe created successfully", recipeId: newRecipe.id });
  } catch (error) {
    next(HttpError(500, error.message));
  }
};

export const deleteOwnRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    const recipe = await Recipe.findByPk(id);

    if (!recipe) {
      return next(HttpError(404, "Рецепт не найден"));
    }

    if (recipe.ownerId !== req.user.id) {
      return next(HttpError(403, "У вас нет прав на удаление этого рецепта"));
    }
    await recipe.destroy();

    res.status(204).send();
  } catch (error) {
    next(HttpError(500, error.message));
  }
};

export const searchRecipes = async (req, res, next) => {
  try {
    const {
      categoryId,
      ingredientId,
      areaId,
      page = 1,
      limit = 10,
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    // фільтри на полях самої моделі
    const where = {};
    if (categoryId) where.categoryId = categoryId;
    if (areaId) where.areaId = areaId;

    // підключаємо асоціації
    const include = [
      {
        model: Category,
        as: "category",
        attributes: ["id", "name"],
      },
      {
        model: Area,
        as: "area",
        attributes: ["id", "name"],
      },
    ];

    // якщо шукаємо по інгредієнту — робимо include з required: true
    if (ingredientId) {
      include.push({
        model: Ingredient,
        as: "ingredients",
        where: { id: ingredientId },
        attributes: ["id", "name", "thumb"],
        through: { attributes: [] },
        required: true,
      });
    } else {
      include.push({
        model: Ingredient,
        as: "ingredients",
        attributes: ["id", "name", "thumb"],
        through: { attributes: [] },
      });
    }

    const { count, rows } = await Recipe.findAndCountAll({
      where,
      include,
      distinct: true,
      offset,
      limit: Number(limit),
      order: [["createdAt", "DESC"]],
    });

    const totalPages = Math.ceil(count / Number(limit));

    res.json({
      total: count,
      page: Number(page),
      totalPages,
      limit: Number(limit),
      recipes: rows,
    });
  } catch (err) {
    next(HttpError(500, err.message));
  }
};
