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
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    managingJournalName: { type: String, required: true, trim: true },
    journalDomainName: { type: String, required: true, trim: true },
    journalUrl: { type: String, required: true, unique: true, trim: true, lowercase: true },
    aboutJournal: { type: String, required: true, trim: true },
    journalInstructions: { type: String, required: true, trim: true },
    pdfFile: assetSchema
  },
  { timestamps: true }
);

const Journal = mongoose.model("Journal", journalSchema);

export default Journal;
