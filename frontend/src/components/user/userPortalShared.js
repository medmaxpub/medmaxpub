export const ARTICLE_STATUSES = {
  IN_PRESS: "IN_PRESS",
  CURRENT_ISSUE: "CURRENT_ISSUE",
  ARCHIVED: "ARCHIVED"
};

export const monthOptions = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

export const accessTypeOptions = ["Open Access", "Subscription Access", "Hybrid Access"];

export const articleTypeOptions = [
  "Research Article",
  "Review Article",
  "Case Report",
  "Editorial",
  "Commentary",
  "Short Communication",
  "Perspective"
];

export const indexingLinkFields = [
  { key: "googleScholar", label: "Google Scholar Link" },
  { key: "researchGate", label: "ResearchGate Link" },
  { key: "pubMed", label: "PubMed Link" },
  { key: "worldCat", label: "WorldCat Link" },
  { key: "scilit", label: "Scilit Link" },
  { key: "drji", label: "DRJI Link" },
  { key: "baiduScholar", label: "Baidu Scholar Link" },
  { key: "academia", label: "Academia.edu Link" },
  { key: "microsoftAcademic", label: "Microsoft Academic Link" }
];

export const initialArticleForm = {
  accessType: "",
  volume: "",
  issueNumber: "",
  releaseMonth: "",
  releaseYear: String(new Date().getFullYear()),
  specialIssueTitle: "",
  articleType: "",
  title: "",
  authorNames: "",
  correspondingAuthorEmail: "",
  citeAs: "",
  keywords: "",
  firstPageNumber: "",
  lastPageNumber: "",
  abstractText: "",
  country: "",
  publishedDate: new Date().toISOString().slice(0, 10),
  doiNumber: "",
  indexingLinks: {
    googleScholar: "",
    researchGate: "",
    pubMed: "",
    worldCat: "",
    scilit: "",
    drji: "",
    baiduScholar: "",
    academia: "",
    microsoftAcademic: ""
  },
  pdfFile: null,
  supplementaryFileOne: null,
  supplementaryFileTwo: null,
  status: ARTICLE_STATUSES.IN_PRESS
};

export const initialEditorialBoardForm = {
  editorType: "",
  name: "",
  editorDescription: "",
  editorBiography: "",
  profileUrl: "",
  profileImage: null
};

export function stripHtml(value) {
  return String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function mapArticleToForm(article) {
  return {
    accessType: article?.accessType || "",
    volume: article?.volume ? String(article.volume) : "",
    issueNumber: article?.issueNumber ? String(article.issueNumber) : "",
    releaseMonth: article?.releaseMonth || "",
    releaseYear: article?.releaseYear ? String(article.releaseYear) : String(new Date().getFullYear()),
    specialIssueTitle: article?.specialIssueTitle || "",
    articleType: article?.articleType || "",
    title: article?.title || "",
    authorNames: article?.authorNames || "",
    correspondingAuthorEmail: article?.correspondingAuthorEmail || "",
    citeAs: article?.citeAs || "",
    keywords: article?.keywords || "",
    firstPageNumber: article?.firstPageNumber ? String(article.firstPageNumber) : "",
    lastPageNumber: article?.lastPageNumber ? String(article.lastPageNumber) : "",
    abstractText: article?.abstractText || "",
    country: article?.country || "",
    publishedDate: article?.publishedDate ? String(article.publishedDate).slice(0, 10) : "",
    doiNumber: article?.doiNumber || "",
    indexingLinks: {
      googleScholar: article?.indexingLinks?.googleScholar || "",
      researchGate: article?.indexingLinks?.researchGate || "",
      pubMed: article?.indexingLinks?.pubMed || "",
      worldCat: article?.indexingLinks?.worldCat || "",
      scilit: article?.indexingLinks?.scilit || "",
      drji: article?.indexingLinks?.drji || "",
      baiduScholar: article?.indexingLinks?.baiduScholar || "",
      academia: article?.indexingLinks?.academia || "",
      microsoftAcademic: article?.indexingLinks?.microsoftAcademic || ""
    },
    pdfFile: null,
    supplementaryFileOne: null,
    supplementaryFileTwo: null,
    status: article?.status || ARTICLE_STATUSES.IN_PRESS
  };
}

export function buildArticleFormData(form, journalId) {
  const formData = new FormData();
  formData.append("journalId", journalId);
  formData.append("accessType", form.accessType);
  formData.append("volume", form.volume);
  formData.append("issueNumber", form.issueNumber);
  formData.append("releaseMonth", form.releaseMonth);
  formData.append("releaseYear", form.releaseYear);
  formData.append("specialIssueTitle", form.specialIssueTitle);
  formData.append("articleType", form.articleType);
  formData.append("title", form.title);
  formData.append("authorNames", form.authorNames);
  formData.append("correspondingAuthorEmail", form.correspondingAuthorEmail);
  formData.append("citeAs", form.citeAs);
  formData.append("keywords", form.keywords);
  formData.append("firstPageNumber", form.firstPageNumber);
  formData.append("lastPageNumber", form.lastPageNumber);
  formData.append("abstractText", form.abstractText);
  formData.append("country", form.country);
  formData.append("publishedDate", form.publishedDate);
  formData.append("doiNumber", form.doiNumber);
  formData.append("status", form.status);

  Object.entries(form.indexingLinks).forEach(([key, value]) => {
    formData.append(key, value);
  });

  if (form.pdfFile) {
    formData.append("pdfFile", form.pdfFile);
  }

  [form.supplementaryFileOne, form.supplementaryFileTwo].filter(Boolean).forEach((file) => {
    formData.append("supplementaryFiles", file);
  });

  return formData;
}

export function mapEditorialBoardMemberToForm(item) {
  return {
    editorType: item?.editorType || item?.designation || "",
    name: item?.name || "",
    editorDescription: item?.editorDescription || "",
    editorBiography: item?.editorBiography || "",
    profileUrl: item?.profileUrl || "",
    profileImage: null
  };
}
