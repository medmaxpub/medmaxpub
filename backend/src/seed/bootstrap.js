import Article from "../models/Article.js";
import Issue from "../models/Issue.js";
import Journal from "../models/Journal.js";
import Ppt from "../models/Ppt.js";
import Testimonial from "../models/Testimonial.js";
import User from "../models/User.js";
import Video from "../models/Video.js";
import { normalizeRole } from "../utils/accessControl.js";

async function bootstrapJournalAdmin(journal) {
  if (!journal) {
    return;
  }

  const journalAdminEmail = process.env.JOURNAL_ADMIN_EMAIL || "journaladmin@medmaxpub.com";
  const existingJournalAdmin = await User.findOne({ email: journalAdminEmail });

  if (!existingJournalAdmin) {
    await User.create({
      name: process.env.JOURNAL_ADMIN_NAME || `${journal.title} Admin`,
      email: journalAdminEmail,
      password: process.env.JOURNAL_ADMIN_PASSWORD || "ChangeMe123!",
      role: "journal_admin",
      assignedJournals: [journal._id]
    });
    return;
  }

  existingJournalAdmin.role = "journal_admin";
  existingJournalAdmin.assignedJournals = [journal._id];
  await existingJournalAdmin.save();
}

export async function bootstrapAdmin() {
  const superAdmins = [
    {
      name: process.env.ADMIN_NAME || "medmaxpub Super Admin 1",
      email: process.env.ADMIN_EMAIL || "admin@medmaxpub.com",
      password: process.env.ADMIN_PASSWORD || "ChangeMe123!"
    },
    {
      name: process.env.SECOND_SUPER_ADMIN_NAME || "medmaxpub Super Admin 2",
      email: process.env.SECOND_SUPER_ADMIN_EMAIL || "superadmin2@medmaxpub.com",
      password: process.env.SECOND_SUPER_ADMIN_PASSWORD || "ChangeMe123!"
    }
  ];

  for (const admin of superAdmins) {
    const existingAdmin = await User.findOne({ email: admin.email });

    if (!existingAdmin) {
      await User.create({
        name: admin.name,
        email: admin.email,
        password: admin.password,
        role: "super_admin"
      });
      continue;
    }

    let shouldSave = false;

    if (normalizeRole(existingAdmin.role) !== "super_admin") {
      existingAdmin.role = "super_admin";
      shouldSave = true;
    }

    if (existingAdmin.name !== admin.name) {
      existingAdmin.name = admin.name;
      shouldSave = true;
    }

    if (shouldSave) {
      await existingAdmin.save();
    }
  }
}

export async function seedSampleContent() {
  const count = await Journal.countDocuments();

  if (count > 0) {
    const existingJournal = await Journal.findOne().sort({ createdAt: 1 });
    await bootstrapJournalAdmin(existingJournal);
    return;
  }

  const journal = await Journal.create({
    title: "Journal of Global Clinical & Translational Research",
    slug: "journal-global-clinical-translational-research",
    issn: "ISSN 2999-1001",
    category: "Clinical Science",
    description:
      "A peer-reviewed publication stream supporting global researchers, conference presenters, clinicians, engineers and interdisciplinary scholars.",
    coverImage: {
      secure_url: "https://placehold.co/600x800/0d1b2a/ffffff?text=Global+Clinical+Research",
      resource_type: "image"
    },
    sections: {
      home: "<p>This journal supports medmaxpub research exchange with structured issue publishing and archive management.</p>",
      about: "<p>An international open access journal for translational, clinical, and interdisciplinary research.</p>",
      aimScope: "<ul><li>Conference-linked research dissemination</li><li>Clinical and translational science</li><li>Collaborative scholarly communication</li></ul>",
      editorialBoard: "<p>Editorial board members are managed from the admin dashboard.</p>",
      authorGuidelines: "<p>Prepare article files in the requested format and include complete publication metadata.</p>",
      articleInPress: "<p>Accepted papers waiting for issue assignment are displayed here.</p>"
    }
  });

  const issue = await Issue.create({
    journal: journal._id,
    volume: 5,
    issue: 2,
    year: 2026,
    isCurrent: true
  });

  await Article.create({
    journal: journal._id,
    issue: issue._id,
    title: "Scientific Conference Publishing Models for Cross-Disciplinary Research Networks",
    authors: ["Alicia Carter", "Samuel Reed"],
    pdfFile: {
      secure_url: "https://example.com/article-1.pdf",
      resource_type: "raw"
    }
  });

  await Ppt.create({
    journal: journal._id,
    title: "Global Scientific Network Keynote Deck",
    description: "Sample PPT record for local development.",
    file: {
      secure_url: "https://example.com/presentation-1.pptx",
      resource_type: "raw"
    },
    previewFile: {
      secure_url: "https://example.com/presentation-1.pdf",
      resource_type: "raw"
    }
  });

  await Video.create({
    journal: journal._id,
    title: "Empowering Global Scientific Collaboration",
    description: "Sample video record for local development.",
    youtubeUrl: "https://www.youtube.com/embed/ysz5S6PUM-U",
    thumbnail: {
      secure_url: "https://placehold.co/800x450/081c3a/ffffff?text=Global+Scientific+Collaboration",
      resource_type: "image"
    }
  });

  await Testimonial.create({
    name: "Dr. Hannah Morris",
    role: "Conference Speaker",
    message:
      "The platform captures a polished, research-focused feel while making publishing and speaker workflows much easier to manage."
  });
  await bootstrapJournalAdmin(journal);
}
