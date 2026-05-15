import mongoose from "mongoose";

const siteStatsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "homepage",
      unique: true,
      trim: true
    },
    values: {
      activeJournals: {
        type: String,
        default: "18+",
        trim: true
      },
      publications: {
        type: String,
        default: "260+",
        trim: true
      },
      yearsPublishing: {
        type: String,
        default: "10+",
        trim: true
      },
      indexDatabases: {
        type: String,
        default: "7+",
        trim: true
      }
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("SiteStats", siteStatsSchema);
