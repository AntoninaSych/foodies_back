import { Area } from '../models/index.js';

export const getAllAreas = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const offset = (page - 1) * limit;

        const { count, rows: areas } = await Area.findAndCountAll({
            offset,
            limit
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            totalItems: count,
            totalPages,
            currentPage: page,
            areas,
        });
    } catch (error) {
        next(error);
    }
};
