import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    storage: String,
    public_id: String,
    secure_url: String,
    resource_type: String,
    format: String,
    file_type: String,
    original_filename: String,
    size: Number,
    uploaded_at: String
  },
  { _id: false }
);

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    designation: { type: String, default: "" },
    message: { type: String, required: true },
    image: assetSchema
  },
  { timestamps: true }
);

const Testimonial = mongoose.model("Testimonial", testimonialSchema);

export default Testimonial;
