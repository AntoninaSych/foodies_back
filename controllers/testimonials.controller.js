import { Testimonial } from '../models/index.js';
import HttpError from '../helpers/HttpError.js';

export const getAllTestimonials = async (req, res, next) => {
    try {
        const testimonials = await Testimonial.findAll();
        res.json(testimonials);
    } catch (error) {
        next(HttpError(500, error.message));
    }
};
