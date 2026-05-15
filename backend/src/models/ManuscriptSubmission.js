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

const manuscriptSubmissionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    postalAddress: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    journal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Journal",
      required: true,
      index: true
    },
    articleType: { type: String, required: true, trim: true },
    manuscriptTitle: { type: String, required: true, trim: true },
    abstract: { type: String, required: true, trim: true },
    files: [assetSchema],
    status: {
      type: String,
      enum: ["pending", "reviewed"],
      default: "pending"
    }
  },
  { timestamps: true }
);

const ManuscriptSubmission = mongoose.model("ManuscriptSubmission", manuscriptSubmissionSchema);

export default ManuscriptSubmission;
