import { Router } from 'express';
import { getAllRecipes } from '../controllers/recipes.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Recipes
 *   description: API endpoints for managing recipes
 */

/**
 * @swagger
 * /api/recipes:
 *   get:
 *     summary: Get all recipes
 *     tags: [Recipes]
 *     responses:
 *       200:
 *         description: List of all recipes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   instructions:
 *                     type: string
 *                   thumb:
 *                     type: string
 *                   time:
 *                     type: string
 */

router.get('/', getAllRecipes);

export default router;
