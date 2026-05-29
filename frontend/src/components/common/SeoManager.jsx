import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const siteUrl = "https://medmaxpub.com";
const siteName = "Medmax Publishers";
const defaultTitle = "Medmax Publishers | Open Access Scientific Journals";
const defaultDescription =
  "Medmax Publishers is a peer-reviewed open access publisher for clinical, medical, life sciences, pharma, technology, and research journals.";
const defaultImage = `${siteUrl}/medmax-logo.png`;

const publicRoutes = [
  {
    match: (path) => path === "/",
    title: defaultTitle,
    description: defaultDescription
  },
  {
    match: (path) => path === "/journals",
    title: "Journals | Medmax Publishers",
    description: "Browse peer-reviewed open access journal profiles, current issues, archives, and article pages from Medmax Publishers."
  },
  {
    match: (path) => path === "/about",
    title: "About Medmax Publishers",
    description: "Learn about Medmax Publishers, an open access scholarly publishing platform for global research communities."
  },
  {
    match: (path) => path === "/submit-manuscript",
    title: "Submit Manuscript | Medmax Publishers",
    description: "Submit your manuscript to Medmax Publishers journals using the online article submission form."
  },
  {
    match: (path) => path === "/membership",
    title: "Membership | Medmax Publishers",
    description: "Explore Medmax Publishers membership information for authors, institutions, and scholarly publishing partners."
  },
  {
    match: (path) => path === "/contact",
    title: "Contact Medmax Publishers",
    description: "Contact Medmax Publishers for publication support, journal coordination, and scholarly communication queries."
  },
  {
    match: (path) => path === "/ppts",
    title: "PPT Archive | Medmax Publishers",
    description: "Browse journal-linked PPT presentations and scholarly presentation records from Medmax Publishers."
  },
  {
    match: (path) => path === "/videos",
    title: "Video Library | Medmax Publishers",
    description: "Browse journal-linked videos, scholarly media records, and related publication resources from Medmax Publishers."
  },
  {
    match: (path) => path === "/terms-and-conditions",
    title: "Terms and Conditions | Medmax Publishers",
    description: "Read the terms and conditions for using Medmax Publishers websites, journals, and publishing services."
  },
  {
    match: (path) => path === "/withdraw-policy",
    title: "Withdraw Policy | Medmax Publishers",
    description: "Review the Medmax Publishers manuscript withdrawal policy and publication workflow expectations."
  },
  {
    match: (path) => path === "/privacy-policy",
    title: "Privacy Policy | Medmax Publishers",
    description: "Read how Medmax Publishers handles privacy, data, and communications across its publishing platform."
  },
  {
    match: (path) => path.startsWith("/journals/"),
    title: "Journal Details | Medmax Publishers",
    description: "View journal details, current issues, article archives, editorial board information, and author guidelines from Medmax Publishers."
  }
];

function getMetaElement(selector, createElement) {
  const existing = document.head.querySelector(selector);

  if (existing) {
    return existing;
  }

  const element = createElement();
  document.head.appendChild(element);
  return element;
}

function setNamedMeta(name, content) {
  const element = getMetaElement(`meta[name="${name}"]`, () => {
    const meta = document.createElement("meta");
    meta.setAttribute("name", name);
    return meta;
  });

  element.setAttribute("content", content);
}

function setPropertyMeta(property, content) {
  const element = getMetaElement(`meta[property="${property}"]`, () => {
    const meta = document.createElement("meta");
    meta.setAttribute("property", property);
    return meta;
  });

  element.setAttribute("content", content);
}

function setCanonical(url) {
  const element = getMetaElement('link[rel="canonical"]', () => {
    const link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    return link;
  });

  element.setAttribute("href", url);
}

function setJsonLd(data) {
  const element = getMetaElement('script[data-seo="organization"]', () => {
    const script = document.createElement("script");
    script.setAttribute("type", "application/ld+json");
    script.setAttribute("data-seo", "organization");
    return script;
  });

  element.textContent = JSON.stringify(data);
}

function resolveSeo(pathname) {
  const isPrivateRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/super") ||
    pathname.startsWith("/superuser") ||
    pathname.startsWith("/user") ||
    pathname === "/login" ||
    pathname === "/admin/login" ||
    pathname === "/user/login" ||
    pathname === "/super/login" ||
    pathname === "/superuser/login";

  if (isPrivateRoute) {
    return {
      title: `Login | ${siteName}`,
      description: "Secure Medmax Publishers portal.",
      robots: "noindex, nofollow"
    };
  }

  const route = publicRoutes.find((item) => item.match(pathname));

  return {
    title: route?.title || defaultTitle,
    description: route?.description || defaultDescription,
    robots: "index, follow"
  };
}

export default function SeoManager() {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname === "/home" ? "/" : location.pathname;
    const canonicalUrl = `${siteUrl}${pathname}`;
    const seo = resolveSeo(pathname);

    document.title = seo.title;
    setNamedMeta("description", seo.description);
    setNamedMeta("robots", seo.robots);
    setNamedMeta("application-name", siteName);
    setNamedMeta("apple-mobile-web-app-title", siteName);
    setCanonical(canonicalUrl);
    setPropertyMeta("og:site_name", siteName);
    setPropertyMeta("og:title", seo.title);
    setPropertyMeta("og:description", seo.description);
    setPropertyMeta("og:type", pathname === "/" ? "website" : "article");
    setPropertyMeta("og:url", canonicalUrl);
    setPropertyMeta("og:image", defaultImage);
    setNamedMeta("twitter:card", "summary_large_image");
    setNamedMeta("twitter:title", seo.title);
    setNamedMeta("twitter:description", seo.description);
    setNamedMeta("twitter:image", defaultImage);
    setJsonLd({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
      logo: defaultImage,
      sameAs: []
    });
  }, [location.pathname]);

  return null;
}
