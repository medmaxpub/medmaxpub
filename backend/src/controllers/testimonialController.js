import Testimonial from "../models/Testimonial.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.create({
    name: req.body.name,
    role: req.body.role,
    message: req.body.message,
    active: req.body.active !== "false"
  });

  res.status(201).json(testimonial);
});

export const getTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find({ active: true }).sort({ createdAt: -1 }).lean();
  res.json(testimonials);
});

