import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    journal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Journal",
      required: true,
      index: true
    },
    volume: { type: Number, required: true },
    issue: { type: Number, required: true },
    month: { type: String, default: "" },
    year: { type: Number, required: true },
    isCurrent: { type: Boolean, default: false }
  },
  { timestamps: true }
);

issueSchema.index({ journal: 1, year: -1, volume: -1, issue: -1 });

const Issue = mongoose.model("Issue", issueSchema);

export default Issue;
