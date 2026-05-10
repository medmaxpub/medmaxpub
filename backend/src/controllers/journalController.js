import Article from "../models/Article.js";
import Issue from "../models/Issue.js";
import Journal from "../models/Journal.js";
import Ppt from "../models/Ppt.js";
import User from "../models/User.js";
import Video from "../models/Video.js";
import { buildAccessibleJournalFilter, ensureJournalAccess, ensureSuperAdmin } from "../utils/accessControl.js";
import { deleteAsset, uploadAsset } from "../utils/assetStorage.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signToken } from "../utils/jwt.js";

function buildSections(body) {
  return {
    home: body.home || "",
    about: body.about || "",
    aimScope: body.aimScope || "",
    editorialBoard: body.editorialBoard || "",
    authorGuidelines: body.authorGuidelines || "",
    articleInPress: body.articleInPress || ""
  };
}

function buildAuthResponse(user, journal) {
  return {
    token: signToken({ id: user._id }),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      assignedJournalIds: (user.assignedJournals || []).map((item) => item.toString())
    },
    journal: {
      id: journal._id,
      slug: journal.slug,
      title: journal.title
    }
  };
}

async function buildJournalDetails(journal) {
  const issues = await Issue.find({ journal: journal._id }).sort({ year: -1, volume: -1, issue: -1 }).lean();
  const ppts = await Ppt.find({ journal: journal._id }).sort({ createdAt: -1 }).lean();
  const videos = await Video.find({ journal: journal._id }).sort({ createdAt: -1 }).lean();
  const issueIds = issues.map((item) => item._id);
  const articles = await Article.find({ issue: { $in: issueIds } }).lean();

  const byIssue = new Map();
  articles.forEach((article) => {
    const key = article.issue.toString();
    const list = byIssue.get(key) || [];
    list.push({
      id: article._id,
      title: article.title,
      authors: article.authors,
      pdfUrl: article.pdfFile?.secure_url || null
    });
    byIssue.set(key, list);
  });

  const formattedIssues = issues.map((issue) => ({
    id: issue._id,
    volume: issue.volume,
    issue: issue.issue,
    year: issue.year,
    articles: byIssue.get(issue._id.toString()) || []
  }));

  const currentIssue = formattedIssues.find((item, index) => issues[index].isCurrent) || formattedIssues[0] || null;

  const archiveMap = new Map();
  formattedIssues.forEach((issueItem) => {
    const yearMap = archiveMap.get(issueItem.year) || new Map();
    const volumeList = yearMap.get(issueItem.volume) || [];
    volumeList.push({
      issue: issueItem.issue,
      articles: issueItem.articles
    });
    yearMap.set(issueItem.volume, volumeList);
    archiveMap.set(issueItem.year, yearMap);
  });

  const archive = [...archiveMap.entries()].map(([year, volumeMap]) => ({
    year,
    volumes: [...volumeMap.entries()].map(([volume, issuesList]) => ({
      volume,
      issues: issuesList
    }))
  }));

  return {
    id: journal._id,
    slug: journal.slug,
    title: journal.title,
    issn: journal.issn,
    category: journal.category,
    description: journal.description,
    coverImageUrl: journal.coverImage?.secure_url || null,
    sections: {
      home: journal.sections?.home || "",
      about: journal.sections?.about || "",
      "aim-scope": journal.sections?.aimScope || "",
      "editorial-board": journal.sections?.editorialBoard || "",
      "author-guidelines": journal.sections?.authorGuidelines || "",
      "article-in-press": journal.sections?.articleInPress || ""
    },
    currentIssue,
    archive,
    ppts: ppts.map((ppt) => ({
      id: ppt._id,
      title: ppt.title,
      description: ppt.description,
      uploadedDate: ppt.createdAt,
      fileUrl: ppt.file?.secure_url || null,
      previewUrl: ppt.previewFile?.secure_url || null,
      file: ppt.file || null,
      previewFile: ppt.previewFile || null
    })),
    videos: videos.map((video) => ({
      id: video._id,
      title: video.title,
      description: video.description,
      youtubeUrl: video.youtubeUrl || "",
      videoUrl: video.videoFile?.secure_url || null,
      thumbnailUrl: video.thumbnail?.secure_url || null
    }))
  };
}

export const getJournals = asyncHandler(async (req, res) => {
  const journals = await Journal.find().sort({ createdAt: -1 }).lean();
  res.json(
    journals.map((journal) => ({
      id: journal._id,
      slug: journal.slug,
      title: journal.title,
      issn: journal.issn,
      category: journal.category,
      description: journal.description,
      coverImageUrl: journal.coverImage?.secure_url || null
    }))
  );
});

export const getAdminJournals = asyncHandler(async (req, res) => {
  const journals = await Journal.find(buildAccessibleJournalFilter(req.user, "_id")).sort({ createdAt: -1 }).lean();
  res.json(
    journals.map((journal) => ({
      id: journal._id,
      slug: journal.slug,
      title: journal.title,
      issn: journal.issn,
      category: journal.category,
      description: journal.description,
      coverImageUrl: journal.coverImage?.secure_url || null,
      sections: {
        home: journal.sections?.home || "",
        about: journal.sections?.about || "",
        aimScope: journal.sections?.aimScope || "",
        editorialBoard: journal.sections?.editorialBoard || "",
        authorGuidelines: journal.sections?.authorGuidelines || "",
        articleInPress: journal.sections?.articleInPress || ""
      }
    }))
  );
});

export const getJournalBySlug = asyncHandler(async (req, res) => {
  const journal = await Journal.findOne({ slug: req.params.slug }).lean();

  if (!journal) {
    throw new AppError("Journal not found", 404);
  }

  res.json(await buildJournalDetails(journal));
});

export const createJournal = asyncHandler(async (req, res) => {
  ensureSuperAdmin(req.user);

  const coverImage = await uploadAsset(req.file, "medmaxpub/journals", "image", req);
  const journal = await Journal.create({
    title: req.body.title,
    slug: req.body.slug,
    issn: req.body.issn,
    category: req.body.category,
    description: req.body.description,
    coverImage,
    sections: buildSections(req.body)
  });

  res.status(201).json({
    id: journal._id,
    slug: journal.slug,
    title: journal.title,
    issn: journal.issn,
    category: journal.category,
    description: journal.description,
    coverImageUrl: journal.coverImage?.secure_url || null
  });
});

export const createJournalWithOwner = asyncHandler(async (req, res) => {
  const { ownerName, ownerEmail, ownerPassword, title, slug, issn, category, description } = req.body;

  if (!ownerName || !ownerEmail || !ownerPassword) {
    throw new AppError("Owner name, email, and password are required", 400);
  }

  const existingUser = await User.findOne({ email: ownerEmail });

  if (existingUser) {
    throw new AppError("An account already exists with this email", 400);
  }

  const existingJournal = await Journal.findOne({ slug });

  if (existingJournal) {
    throw new AppError("A journal already exists with this slug", 400);
  }

  const coverImage = await uploadAsset(req.file, "medmaxpub/journals", "image", req);
  let journal = null;

  try {
    journal = await Journal.create({
      title,
      slug,
      issn,
      category,
      description,
      coverImage,
      sections: buildSections(req.body)
    });

    const user = await User.create({
      name: ownerName,
      email: ownerEmail,
      password: ownerPassword,
      role: "journal_admin",
      assignedJournals: [journal._id]
    });

    res.status(201).json(buildAuthResponse(user, journal));
  } catch (error) {
    if (journal) {
      await journal.deleteOne();
    }

    if (coverImage) {
      await deleteAsset(coverImage, "image");
    }

    throw error;
  }
});

export const updateJournal = asyncHandler(async (req, res) => {
  const journal = await Journal.findById(req.params.id);

  if (!journal) {
    throw new AppError("Journal not found", 404);
  }

  ensureJournalAccess(req.user, journal._id);

  if (req.file) {
    await deleteAsset(journal.coverImage, "image");
    journal.coverImage = await uploadAsset(req.file, "medmaxpub/journals", "image", req);
  }

  journal.title = req.body.title || journal.title;
  journal.slug = req.body.slug || journal.slug;
  journal.issn = req.body.issn || journal.issn;
  journal.category = req.body.category || journal.category;
  journal.description = req.body.description || journal.description;
  journal.sections = {
    ...journal.sections.toObject(),
    ...buildSections(req.body)
  };

  await journal.save();
  res.json(journal);
});

export const deleteJournal = asyncHandler(async (req, res) => {
  ensureSuperAdmin(req.user);

  const journal = await Journal.findById(req.params.id);

  if (!journal) {
    throw new AppError("Journal not found", 404);
  }

  await deleteAsset(journal.coverImage, "image");
  await Article.deleteMany({ journal: journal._id });
  await Issue.deleteMany({ journal: journal._id });
  await Ppt.deleteMany({ journal: journal._id });
  await Video.deleteMany({ journal: journal._id });
  await journal.deleteOne();

  res.status(204).send();
});

export const getJournalIssues = asyncHandler(async (req, res) => {
  const issues = await Issue.find({ journal: req.params.id }).sort({ year: -1, volume: -1, issue: -1 }).lean();
  res.json(issues);
});
