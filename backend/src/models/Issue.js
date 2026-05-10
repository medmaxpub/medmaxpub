import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    journal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Journal",
      required: true
    },
    volume: { type: Number, required: true },
    issue: { type: Number, required: true },
    year: { type: Number, required: true },
    isCurrent: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Issue = mongoose.model("Issue", issueSchema);

export default Issue;

