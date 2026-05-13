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

const journalPdfSchema = new mongoose.Schema(
  {
    journal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Journal",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    file: {
      type: assetSchema,
      required: true
    }
  },
  { timestamps: true }
);

const JournalPdf = mongoose.model("JournalPdf", journalPdfSchema);

export default JournalPdf;
