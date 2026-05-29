import Journal from "../models/Journal.js";
import Testimonial from "../models/Testimonial.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ensureSuperAdmin } from "../utils/accessControl.js";

const sampleJournalFilter = {
  journalUrl: {
    $nin: [
      "journal-global-clinical-translational-research",
      "open-journal-bioinformatics-intelligent-systems",
      "journal-sustainable-energy-engineering-policy",
      "international-journal-public-health-frontiers",
      "advances-in-digital-pharma-analytics",
      "journal-computational-materials-nano-systems"
    ]
  },
  slug: {
    $nin: [
      "journal-global-clinical-translational-research",
      "open-journal-bioinformatics-intelligent-systems",
      "journal-sustainable-energy-engineering-policy",
      "international-journal-public-health-frontiers",
      "advances-in-digital-pharma-analytics",
      "journal-computational-materials-nano-systems"
    ]
  }
};

export const getAdminDashboardStats = asyncHandler(async (req, res) => {
  ensureSuperAdmin(req.user);

  const [users, journals, testimonials] = await Promise.all([
    User.countDocuments({ role: { $nin: ["admin", "super_admin", "super_user"] } }),
    Journal.countDocuments(sampleJournalFilter),
    Testimonial.countDocuments()
  ]);

  res.json({ users, journals, testimonials });
});
