// routes/recipes.routes.js
import { Router } from 'express';
import { getAllRecipes, getRecipeById } from '../controllers/recipes.controller.js';
import auth from '../middlewares/auth.js';

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
 *     summary: Get all recipes with pagination
 *     tags: [Recipes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of recipes per page (default 10)
 *     responses:
 *       200:
 *         description: A list of recipes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalItems:
 *                   type: integer
 *                   example: 100
 *                 totalPages:
 *                   type: integer
 *                   example: 10
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 recipes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6"
 *                       title:
 *                         type: string
 *                         example: "Chicken Curry"
 *                       description:
 *                         type: string
 *                         example: "Delicious spicy chicken curry recipe."
 *                       instructions:
 *                         type: string
 *                         example: "Mix spices, cook chicken, simmer for 30 minutes."
 *                       thumb:
 *                         type: string
 *                         example: "https://example.com/images/chicken-curry.jpg"
 *                       time:
 *                         type: string
 *                         example: "45 min"
 *                       area:
 *                         type: string
 *                         example: "Indian"
 *                       ownerId:
 *                         type: string
 *                         example: "123e4567-e89b-12d3-a456-426614174000"
 */
router.get('/', auth, getAllRecipes);

/**
 * @swagger
 * /api/recipes/{id}:
 *   get:
 *     summary: Get recipe by ID
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the recipe
 *     responses:
 *       200:
 *         description: Recipe found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   example: "a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6"
 *                 title:
 *                   type: string
 *                   example: "Chicken Curry"
 *                 description:
 *                   type: string
 *                   example: "Delicious spicy chicken curry recipe."
 *                 instructions:
 *                   type: string
 *                   example: "Mix spices, cook chicken, and simmer for 30 minutes."
 *                 thumb:
 *                   type: string
 *                   format: uri
 *                   example: "https://example.com/images/chicken-curry.jpg"
 *                 time:
 *                   type: string
 *                   example: "45 min"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-04-29T12:34:56.000Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-04-29T13:45:00.000Z"
 *                 area:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "b2a3c4d5-f6g7-8h9i-j0k1-l2m3n4o5p6q7"
 *                     name:
 *                       type: string
 *                       example: "Indian"
 *                 owner:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: "john@example.com"
 *                 ingredients:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: "789e0123-f456-789a-bcde-1234567890ab"
 *                       name:
 *                         type: string
 *                         example: "Chicken"
 *       404:
 *         description: Recipe not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Recipe not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Something went wrong"
 */
router.get('/:id', auth, getRecipeById);

export default router;
