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

const videoSchema = new mongoose.Schema(
  {
    journal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Journal",
      required: true
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    authorName: { type: String, default: "" },
    doiNumber: { type: String, default: "" },
    youtubeUrl: String,
    thumbnail: assetSchema,
    videoFile: assetSchema
  },
  { timestamps: true }
);

const Video = mongoose.model("Video", videoSchema);

export default Video;
