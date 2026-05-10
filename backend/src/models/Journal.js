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

const journalSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    issn: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    coverImage: assetSchema,
    sections: {
      home: { type: String, default: "" },
      about: { type: String, default: "" },
      aimScope: { type: String, default: "" },
      editorialBoard: { type: String, default: "" },
      authorGuidelines: { type: String, default: "" },
      articleInPress: { type: String, default: "" }
    }
  },
  { timestamps: true }
);

const Journal = mongoose.model("Journal", journalSchema);

export default Journal;
