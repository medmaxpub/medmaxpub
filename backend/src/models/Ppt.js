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

const pptSchema = new mongoose.Schema(
  {
    journal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Journal",
      required: true
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    file: assetSchema,
    previewFile: assetSchema,
    pptFileName: String,
    pptUrl: String,
    pptPublicId: String,
    previewPdfUrl: String,
    previewPublicId: String,
    previewStatus: {
      type: String,
      enum: ["pending", "ready", "missing", "failed"],
      default: "pending"
    },
    previewError: String,
    previewRequestedAt: Date,
    previewReadyAt: Date,
    // Legacy Spring Boot fields kept for production compatibility with older records.
    pptFile: assetSchema,
    pdfPreviewFile: assetSchema,
    uploadedDate: Date
  },
  { timestamps: true }
);

const Ppt = mongoose.model("Ppt", pptSchema);

export default Ppt;
