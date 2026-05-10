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

const articleSchema = new mongoose.Schema(
  {
    journal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Journal",
      required: true
    },
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: true
    },
    title: { type: String, required: true },
    authors: [{ type: String }],
    articleType: String,
    abstractText: String,
    inPress: { type: Boolean, default: false },
    pdfFile: assetSchema
  },
  { timestamps: true }
);

const Article = mongoose.model("Article", articleSchema);

export default Article;
