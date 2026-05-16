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

const editorialBoardMemberSchema = new mongoose.Schema(
  {
    journal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Journal",
      required: true,
      index: true
    },
    editorType: {
      type: String,
      default: "",
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    designation: {
      type: String,
      default: "",
      trim: true
    },
    department: {
      type: String,
      default: "",
      trim: true
    },
    country: {
      type: String,
      default: "",
      trim: true
    },
    editorDescription: {
      type: String,
      default: "",
      trim: true
    },
    editorBiography: {
      type: String,
      default: "",
      trim: true
    },
    profileUrl: {
      type: String,
      default: "",
      trim: true
    },
    profileImage: assetSchema
  },
  { timestamps: true }
);

editorialBoardMemberSchema.index({ journal: 1, createdAt: -1 });

const EditorialBoardMember = mongoose.model("EditorialBoardMember", editorialBoardMemberSchema);

export default EditorialBoardMember;
