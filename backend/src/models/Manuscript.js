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

const manuscriptSchema = new mongoose.Schema(
  {
    authorName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    journal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Journal",
      required: true
    },
    manuscriptTitle: { type: String, required: true },
    comments: String,
    file: assetSchema
  },
  { timestamps: true }
);

const Manuscript = mongoose.model("Manuscript", manuscriptSchema);

export default Manuscript;
