import Testimonial from "../models/Testimonial.js";
import { ensureElevatedAccess } from "../utils/accessControl.js";
import { deleteAsset, uploadAsset } from "../utils/assetStorage.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function serializeTestimonial(testimonial) {
  return {
    id: testimonial._id,
    name: testimonial.name,
    designation: testimonial.designation || "",
    message: testimonial.message,
    imageUrl: testimonial.image?.secure_url || "",
    createdAt: testimonial.createdAt
  };
}

export const createTestimonial = asyncHandler(async (req, res) => {
  ensureElevatedAccess(req.user);

  const testimonial = await Testimonial.create({
    name: req.body.name,
    designation: req.body.designation || "",
    message: req.body.message,
    image: await uploadAsset(req.file, "medmaxpub/testimonials", "image", req)
  });

  res.status(201).json(serializeTestimonial(testimonial));
});

export const updateTestimonial = asyncHandler(async (req, res) => {
  ensureElevatedAccess(req.user);

  const testimonial = await Testimonial.findById(req.params.id);

  if (!testimonial) {
    throw new AppError("Testimonial not found", 404);
  }

  if (req.file) {
    await deleteAsset(testimonial.image, "image");
    testimonial.image = await uploadAsset(req.file, "medmaxpub/testimonials", "image", req);
  }

  testimonial.name = req.body.name || testimonial.name;
  testimonial.designation = req.body.designation ?? testimonial.designation;
  testimonial.message = req.body.message || testimonial.message;
  await testimonial.save();

  res.json(serializeTestimonial(testimonial));
});

export const deleteTestimonial = asyncHandler(async (req, res) => {
  ensureElevatedAccess(req.user);

  const testimonial = await Testimonial.findById(req.params.id);

  if (!testimonial) {
    throw new AppError("Testimonial not found", 404);
  }

  await deleteAsset(testimonial.image, "image");
  await testimonial.deleteOne();
  res.status(204).send();
});

export const getTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find().sort({ createdAt: -1 }).lean();
  res.json(testimonials.map(serializeTestimonial));
});
