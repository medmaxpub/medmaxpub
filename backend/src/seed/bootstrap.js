import Article from "../models/Article.js";
import Issue from "../models/Issue.js";
import Journal from "../models/Journal.js";
import Ppt from "../models/Ppt.js";
import Testimonial from "../models/Testimonial.js";
import User from "../models/User.js";
import Video from "../models/Video.js";
import { normalizeRole } from "../utils/accessControl.js";

function fallbackName(value, backup) {
  const normalized = String(value || "").trim();
  return normalized || backup;
}

async function ensureUserAssignments(user) {
  const journals = await Journal.find({ owner: user._id }).select("_id").lean();
  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        assignedJournals: journals.map((journal) => journal._id)
      }
    }
  );
}

async function repairLegacyUsers() {
  const users = await User.find({
    $or: [
      { firstName: null },
      { firstName: "" },
      { firstName: { $exists: false } },
      { lastName: null },
      { lastName: "" },
      { lastName: { $exists: false } }
    ]
  })
    .select("_id firstName lastName userName email role")
    .lean();

  for (const user of users) {
    const userName = String(user.userName || "")
      .trim()
      .toLowerCase();
    const derivedBase =
      userName ||
      String(user.email || "")
        .trim()
        .toLowerCase()
        .split("@")[0] ||
      `legacy-user-${String(user._id).slice(-6).toLowerCase()}`;

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          firstName: fallbackName(user.firstName, normalizeRole(user.role) === "super_user" ? "Admin" : "Journal"),
          lastName: fallbackName(user.lastName, derivedBase || "User")
        }
      }
    );
  }
}

async function migrateExistingJournalOwners() {
  await repairLegacyUsers();
  const journals = await Journal.find().lean();

  for (const journal of journals) {
    if (journal.owner) {
      continue;
    }

    const derivedUserName = (journal.journalUrl || journal.managingJournalName || `journal-${journal._id}`)
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-");

    let owner = await User.findOne({ userName: derivedUserName });

    if (!owner) {
      owner = await User.create({
        firstName: journal.firstName || "Journal",
        lastName: journal.lastName || "Owner",
        userName: derivedUserName,
        password: process.env.MIGRATED_USER_DEFAULT_PASSWORD || "ChangeMe123!",
        role: "user"
      });
    }

    await Journal.updateOne(
      { _id: journal._id },
      {
        $set: {
          owner: owner._id,
          firstName: owner.firstName,
          lastName: owner.lastName
        }
      }
    );
  }

  const users = await User.find({ role: { $in: ["user", "journal_admin"] } });
  await Promise.all(users.map((user) => ensureUserAssignments(user)));
}

export async function bootstrapAdmin() {
  await repairLegacyUsers();
  const accounts = [
    {
      role: "admin",
      firstName: process.env.ADMIN_FIRST_NAME || "medmaxpub",
      lastName: process.env.ADMIN_LAST_NAME || "Admin",
      userName: (process.env.ADMIN_USERNAME || "admin").toLowerCase(),
      email: process.env.ADMIN_EMAIL || "admin@medmaxpub.com",
      password: process.env.ADMIN_PASSWORD || "ChangeMe123!"
    },
    {
      role: "super_admin",
      firstName: process.env.SUPER_USER_FIRST_NAME || process.env.SECOND_SUPER_ADMIN_FIRST_NAME || "medmaxpub",
      lastName: process.env.SUPER_USER_LAST_NAME || process.env.SECOND_SUPER_ADMIN_LAST_NAME || "Super User",
      userName: (process.env.SUPER_USER_USERNAME || process.env.SECOND_SUPER_ADMIN_USERNAME || "superuser").toLowerCase(),
      email: process.env.SUPER_USER_EMAIL || process.env.SECOND_SUPER_ADMIN_EMAIL || "superuser@medmaxpub.com",
      password: process.env.SUPER_USER_PASSWORD || process.env.SECOND_SUPER_ADMIN_PASSWORD || "ChangeMe123!"
    }
  ];

  for (const account of accounts) {
    const existingAdmin = await User.findOne({
      $or: [{ userName: account.userName }, { email: account.email }]
    });

    if (!existingAdmin) {
      await User.create({
        firstName: account.firstName,
        lastName: account.lastName,
        userName: account.userName,
        email: account.email,
        password: account.password,
        role: account.role
      });
      continue;
    }

    let shouldSave = false;

    if (existingAdmin.role !== account.role) {
      existingAdmin.role = account.role;
      shouldSave = true;
    }

    if (existingAdmin.firstName !== account.firstName) {
      existingAdmin.firstName = account.firstName;
      shouldSave = true;
    }

    if (existingAdmin.lastName !== account.lastName) {
      existingAdmin.lastName = account.lastName;
      shouldSave = true;
    }

    if (existingAdmin.userName !== account.userName) {
      existingAdmin.userName = account.userName;
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
    await migrateExistingJournalOwners();
    return;
  }

  const journalUser = await User.create({
    firstName: process.env.JOURNAL_ADMIN_FIRST_NAME || "Alicia",
    lastName: process.env.JOURNAL_ADMIN_LAST_NAME || "Carter",
    userName: (process.env.JOURNAL_ADMIN_USERNAME || "journaladmin").toLowerCase(),
    email: process.env.JOURNAL_ADMIN_EMAIL || "journaladmin@medmaxpub.com",
    password: process.env.JOURNAL_ADMIN_PASSWORD || "ChangeMe123!",
    role: "user"
  });

  const journal = await Journal.create({
    owner: journalUser._id,
    firstName: journalUser.firstName,
    lastName: journalUser.lastName,
    managingJournalName: "Journal of Global Clinical & Translational Research",
    journalDomainName: "Clinical, Medical, and Translational Research",
    journalUrl: "journal-global-clinical-translational-research",
    aboutJournal:
      "A peer-reviewed, open access journal supporting global researchers, conference presenters, clinicians, and interdisciplinary scholars.",
    journalInstructions:
      "Submit complete publication metadata, attach article files in the required format, and follow the editorial workflow defined by the assigned journal team."
  });

  journalUser.assignedJournals = [journal._id];
  await journalUser.save();

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
    title: `${journal.managingJournalName} PPT`,
    description: journal.aboutJournal,
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
    title: `${journal.managingJournalName} Video`,
    description: journal.aboutJournal,
    youtubeUrl: "https://www.youtube.com/embed/ysz5S6PUM-U",
    thumbnail: {
      secure_url: "https://placehold.co/800x450/081c3a/ffffff?text=Global+Scientific+Collaboration",
      resource_type: "image"
    }
  });

  await Testimonial.create({
    name: "Dr. Hannah Morris",
    designation: "Conference Speaker",
    message:
      "The platform captures a polished, research-focused feel while making publishing and speaker workflows much easier to manage."
  });
}
