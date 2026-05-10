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
    pptUrl: String,
    pptPublicId: String,
    previewPdfUrl: String,
    previewPublicId: String,
    // Legacy Spring Boot fields kept for production compatibility with older records.
    pptFile: assetSchema,
    pdfPreviewFile: assetSchema,
    uploadedDate: Date
  },
  { timestamps: true }
);

const Ppt = mongoose.model("Ppt", pptSchema);

export default Ppt;
