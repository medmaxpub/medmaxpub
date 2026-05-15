import SiteStats from "../models/SiteStats.js";
import { ensureElevatedAccess } from "../utils/accessControl.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const DEFAULT_SITE_STATS_VALUES = {
  activeJournals: "18+",
  publications: "260+",
  yearsPublishing: "10+",
  indexDatabases: "7+"
};

const SITE_STATS_FIELDS = [
  { key: "activeJournals", label: "Active Journals" },
  { key: "publications", label: "Publications" },
  { key: "yearsPublishing", label: "Years Publishing" },
  { key: "indexDatabases", label: "Index Databases" }
];

function normalizeSiteStatsValues(values = {}) {
  return SITE_STATS_FIELDS.reduce((accumulator, field) => {
    const nextValue = values[field.key];
    accumulator[field.key] = String(nextValue ?? DEFAULT_SITE_STATS_VALUES[field.key]).trim() || DEFAULT_SITE_STATS_VALUES[field.key];
    return accumulator;
  }, {});
}

function serializeSiteStats(values = {}) {
  const normalizedValues = normalizeSiteStatsValues(values);

  return {
    values: normalizedValues,
    stats: SITE_STATS_FIELDS.map((field) => ({
      key: field.key,
      label: field.label,
      value: normalizedValues[field.key]
    }))
  };
}

export const getSiteStats = asyncHandler(async (req, res) => {
  const siteStats = await SiteStats.findOne({ key: "homepage" }).lean();
  res.json(serializeSiteStats(siteStats?.values));
});

export const getAdminSiteStats = asyncHandler(async (req, res) => {
  ensureElevatedAccess(req.user);

  const siteStats = await SiteStats.findOne({ key: "homepage" }).lean();
  res.json(serializeSiteStats(siteStats?.values));
});

export const updateAdminSiteStats = asyncHandler(async (req, res) => {
  ensureElevatedAccess(req.user);

  const existingSiteStats = await SiteStats.findOne({ key: "homepage" }).lean();
  const mergedValues = normalizeSiteStatsValues({
    ...(existingSiteStats?.values || DEFAULT_SITE_STATS_VALUES),
    ...req.body
  });

  const siteStats = await SiteStats.findOneAndUpdate(
    { key: "homepage" },
    {
      key: "homepage",
      values: mergedValues
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
  ).lean();

  res.json(serializeSiteStats(siteStats?.values));
});
