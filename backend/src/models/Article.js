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
      required: false
    },
    title: { type: String, required: true },
    authors: [{ type: String }],
    authorNames: { type: String, default: "" },
    articleType: String,
    accessType: { type: String, default: "" },
    volume: { type: Number, default: null },
    issueNumber: { type: Number, default: null },
    releaseMonth: { type: String, default: "" },
    releaseYear: { type: Number, default: null },
    specialIssueTitle: { type: String, default: "" },
    correspondingAuthorEmail: { type: String, default: "" },
    citeAs: { type: String, default: "" },
    keywords: { type: String, default: "" },
    firstPageNumber: { type: Number, default: null },
    lastPageNumber: { type: Number, default: null },
    abstractText: { type: String, default: "" },
    country: { type: String, default: "" },
    publishedDate: { type: Date, default: null },
    doiNumber: { type: String, default: "" },
    indexingLinks: {
      googleScholar: { type: String, default: "" },
      researchGate: { type: String, default: "" },
      pubMed: { type: String, default: "" },
      worldCat: { type: String, default: "" },
      scilit: { type: String, default: "" },
      drji: { type: String, default: "" },
      baiduScholar: { type: String, default: "" },
      academia: { type: String, default: "" },
      microsoftAcademic: { type: String, default: "" }
    },
    supplementaryFiles: {
      type: [assetSchema],
      default: []
    },
    status: {
      type: String,
      enum: ["IN_PRESS", "CURRENT_ISSUE", "ARCHIVED"],
      default: "IN_PRESS"
    },
    inPress: { type: Boolean, default: false },
    pdfFile: assetSchema
  },
  { timestamps: true }
);

const Article = mongoose.model("Article", articleSchema);

export default Article;
