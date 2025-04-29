import { Router } from 'express';
import { getAllAreas } from '../controllers/areas.controller.js';

/**
 * @swagger
 * tags:
 *   name: Areas
 *   description: API endpoints for managing areas
 */

/**
 * @swagger
 * /api/areas:
 *   get:
 *     summary: Get all areas with pagination
 *     tags: [Areas]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number (default is 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page (default is 10)
 *     responses:
 *       200:
 *         description: A list of areas with pagination
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
 *                 areas:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6"
 *                       name:
 *                         type: string
 *                         example: "Downtown"
 */
const router = Router();

router.get('/', getAllAreas);

export default router;
