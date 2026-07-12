import home4 from "../assets/home-4.jpg";
import homeBanner6 from "../assets/home-banner-6.jpg";
export const companyInfo = {
  name: "medmaxpub",
  email: import.meta.env.VITE_DEFAULT_CONTACT_EMAIL || "contact@medmaxpub.com",
  phone: "+1 (408) 601-8182",
  phoneHref: ("+1 (408) 601-8182").replace(/[^\d+]/g, ""),
  addressLines: [
    "Medmax Publishers LLC",
    "2705 Greystone Drive",
    "Apt A",
    "Columbus, Ohio - 43220",
    "USA"
  ]
};

export const mediaCollections = [
  {
    id: "collection-journals",
    title: "Journal Directory",
    description: "Browse journal homes, current issues, and archive-ready publication pages.",
    link: "/journals",
    linkLabel: "View Journals"
  },
  {
    id: "collection-ppts",
    title: "PPT Archive",
    description: "Open public slide decks with journal-linked context, preview access, and downloads.",
    link: "/ppts",
    linkLabel: "Browse PPTs"
  },
  {
    id: "collection-videos",
    title: "Video Library",
    description: "Watch journal-owned videos and embedded media with related publication details.",
    link: "/videos",
    linkLabel: "Browse Videos"
  }
];

export const heroShowcaseImages = [
  // {
  //   id: "hero-life-science",
  //   title: "Life Sciences",
  //   image:
  //     "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1200&q=80"
  // },
  // {
  //   id: "hero-clinical",
  //   title: "Clinical Research",
  //   image:
  //     "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=1200&q=80"
  // },
    {
    id: "hero-home4",
    title: "Life Sciences",
    image: home4
  },
  {
    id: "hero-banner6",
    title: "Clinical Research",
    image: homeBanner6
  },
  {
    id: "hero-engineering",
    title: "Engineering & Technology",
    image:
      "https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&w=1200&q=80"
  }
];

export const aboutMedmaxParagraphs = [
  "Medmax Publishers is a peer-reviewed, open access publisher covering a comprehensive range of topics in Clinical, Medicine, Life Sciences, Pharma, and Engineering & Technology. We support researchers, institutions, academic professionals, and emerging scholars in advancing healthcare, open science, and knowledge sharing for the benefit of humanity.",
  "Our vision is to build an optimized publishing platform and a meaningful scientific network for scholars and researchers around the world. Medmax Publishers works with qualified editorial and advisory members who support research development, publication quality, and long-term academic visibility.",
  "Medmax Journals follow a single-blind peer-review process, where each submitted manuscript is assigned to a relevant editor for editorial assessment and reviewer coordination. This helps maintain clarity, consistency, and scholarly publishing standards across every journal.",
  "We publish a wide range of manuscript types, including Original Research, Review Articles, Case Reports, Rapid Communications, Short Communications, Mini Reviews, Editorials, Letters to the Editor, Commentary, Perspectives, Case in Images, Clinical Images, and Research Highlights across medical, clinical, and engineering disciplines.",
  "All listed journals follow the open access model and are available to readers without subscription charges or access fees."
];

export const aboutMedmaxHighlights = [
  { label: "Publishing Model", value: "Peer-reviewed open access journals" },
  { label: "Review Process", value: "Single-blind peer review with editor assignment" },
  { label: "Article Types", value: "Original Research, Reviews, Case Reports, Editorials, Commentary, and more" },
  { label: "Reader Access", value: "No subscription fees or access charges" }
];

export const aboutMedmaxCoverage = ["Clinical", "Medicine", "Life Sciences", "Pharma", "Engineering", "Technology"];

export const websiteStats = [
  { value: "18+", label: "Active Journals" },
  { value: "260+", label: "Publications" },
  { value: "10+", label: "Years Publishing" },
  { value: "7+", label: "Index Databases" }
];

export const websiteStatHighlights = [
  "Crossref DOI",
  "Google Scholar",
  "DOAJ Indexed",
  "Creative Commons",
  "Double Blind Review",
  "Research Archive"
];

function buildJournal(
  id,
  firstName,
  lastName,
  managingJournalName,
  journalDomainName,
  journalUrl,
  issn,
  coverImage,
  ppts = [],
  videos = []
) {
  return {
    id,
    firstName,
    lastName,
    userName: `${journalUrl}-admin`,
    managingJournalName,
    journalDomainName,
    journalUrl,
    issn,
    coverImage,
    aboutJournal:
      `${managingJournalName} is a peer-reviewed publication stream supporting global researchers, conference presenters, clinicians, engineers, and interdisciplinary scholars.`,
    homeContent:
      `${managingJournalName} welcomes original research, reviews, and clinically relevant scholarship for a global audience across ${journalDomainName}.`,
    aimScope:
      `This journal focuses on ${journalDomainName} and prioritizes rigorous, peer-reviewed work that supports translational impact, interdisciplinary collaboration, and evidence-led publication outcomes.`,
    journalInstructions:
      "Prepare complete author metadata, submit all required files in the requested format, and follow the editor-assigned review workflow for publication processing.",
    authorGuidelines:
      "Submit complete author details, structure the manuscript clearly, upload all required files, and ensure the corresponding author information is accurate before final submission.",
    editorialBoard: [
      {
        id: `${id}-editor-1`,
        editorType: "Editor in Chief",
        name: `${firstName} ${lastName}`,
        designation: "Senior Editor",
        department: journalDomainName,
        country: "USA",
        editorDescription: `Leads the editorial direction for ${managingJournalName}.`
      }
    ],
    inPressArticles: [
      {
        id: `${id}-inpress-1`,
        title: "Accepted Manuscript Workflow for High-Trust Scholarly Publishing",
        authors: ["Alicia Carter", "Samuel Reed"],
        volume: 5,
        issueNumber: 3,
        releaseMonth: "May",
        releaseYear: 2026,
        abstractText: "An accepted article record awaiting placement into the current issue.",
        pdfUrl: "https://example.com/in-press-1.pdf"
      }
    ],
    currentIssue: {
      volume: 5,
      issue: 2,
      year: 2026,
      articles: [
        {
          id: `${id}-article-1`,
          title: "Scientific Conference Publishing Models for Cross-Disciplinary Research Networks",
          authors: ["Alicia Carter", "Samuel Reed"],
          pdfUrl: "https://example.com/article-1.pdf"
        },
        {
          id: `${id}-article-2`,
          title: "Structured Reviewer Coordination in Fast-Moving Global Research Communities",
          authors: ["Monica Alvarez", "Ibrahim Khan"],
          pdfUrl: "https://example.com/article-2.pdf"
        }
      ]
    },
    archive: [
      {
        year: 2025,
        volumes: [
          {
            volume: 4,
            issues: [
              {
                issue: 3,
                articles: [
                  {
                    id: `${id}-archive-1`,
                    title: "Editorial Operations for Conference-Linked Digital Journals",
                    authors: ["Priya Deshmukh"],
                    pdfUrl: "https://example.com/archive-1.pdf"
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    ppts,
    videos
  };
}

export const mockJournals = [
  buildJournal(
    "j1",
    "Alicia",
    "Carter",
    "Journal of Global Clinical & Translational Research",
    "Clinical, Medical, and Translational Research",
    "journal-global-clinical-translational-research",
    "ISSN 2584-1101",
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80",
    [
      {
        id: "ppt-1",
        title: "Journal of Global Clinical & Translational Research PPT",
        description: "A presentation resource aligned with the journal's current publication focus.",
        uploadedDate: "2026-04-01",
        fileUrl: "https://example.com/presentation-1.pptx",
        previewUrl: "https://example.com/presentation-1.pdf"
      }
    ],
    [
      {
        id: "video-1",
        title: "Journal of Global Clinical & Translational Research Video",
        description: "A journal-linked media record for the public library.",
        thumbnailUrl: "https://placehold.co/800x450/081c3a/ffffff?text=Journal+Video",
        videoUrl: "https://res.cloudinary.com/demo/video/upload/dog.mp4"
      }
    ]
  ),
  buildJournal(
    "j2",
    "Monica",
    "Alvarez",
    "Open Journal of Bioinformatics & Intelligent Systems",
    "Bioinformatics, Intelligent Systems, and Applied AI",
    "open-journal-bioinformatics-intelligent-systems",
    "ISSN 2584-1102",
    "https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&w=900&q=80",
    [
      {
        id: "ppt-2",
        title: "Open Journal of Bioinformatics & Intelligent Systems PPT",
        description: "A slide deck prepared for journal-linked education and public viewing.",
        uploadedDate: "2026-03-22",
        fileUrl: "https://example.com/presentation-2.pptx",
        previewUrl: "https://example.com/presentation-2.pdf"
      }
    ],
    [
      {
        id: "video-2",
        title: "Open Journal of Bioinformatics & Intelligent Systems Video",
        description: "A journal-linked video resource for authors and contributors.",
        thumbnailUrl: "https://placehold.co/800x450/15616d/ffffff?text=Journal+Support+Workflow",
        videoUrl: "https://res.cloudinary.com/demo/video/upload/dog.mp4"
      }
    ]
  ),
  buildJournal(
    "j3",
    "Priya",
    "Deshmukh",
    "Journal of Sustainable Energy Engineering & Policy",
    "Energy Engineering and Sustainability Policy",
    "journal-sustainable-energy-engineering-policy",
    "ISSN 2584-1103",
    "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=900&q=80"
  ),
  buildJournal(
    "j4",
    "Samuel",
    "Reed",
    "International Journal of Public Health Frontiers",
    "Public Health and Preventive Research",
    "international-journal-public-health-frontiers",
    "ISSN 2584-1104",
    "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=900&q=80"
  ),
  buildJournal(
    "j5",
    "Ibrahim",
    "Khan",
    "Journal of Advanced Pharmaceutical Discovery",
    "Pharmaceutical Discovery and Drug Development",
    "journal-advanced-pharmaceutical-discovery",
    "ISSN 2584-1105",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80"
  ),
  buildJournal(
    "j6",
    "Mia",
    "Brooks",
    "Engineering, Robotics & Intelligent Machine Review",
    "Engineering, Robotics, and Intelligent Machines",
    "engineering-robotics-intelligent-machine-review",
    "ISSN 2584-1106",
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=900&q=80"
  )
];

export const mockPpts = mockJournals.flatMap((journal) =>
  (journal.ppts || []).map((ppt) => ({
    ...ppt,
    journalTitle: journal.managingJournalName,
    journalUrl: journal.journalUrl
  }))
);

export const mockVideos = mockJournals.flatMap((journal) =>
  (journal.videos || []).map((video) => ({
    ...video,
    journalTitle: journal.managingJournalName,
    journalUrl: journal.journalUrl
  }))
);

export const mockTestimonials = [
  {
    id: "t1",
    name: "Dr. Hannah Morris",
    designation: "Conference Speaker",
    message:
      "The platform captures a polished, research-focused feel while making publishing and speaker workflows much easier to manage."
  },
  {
    id: "t2",
    name: "Prof. Daniel Rivera",
    designation: "Journal Editor",
    message:
      "Routing journals, conference assets, testimonials, and article metadata through one dashboard is a major operational improvement."
  },
  {
    id: "t3",
    name: "Mia Brooks",
    designation: "Event Coordinator",
    message:
      "The admin tools are practical and the public UI presents journals, media, and scientific content in a confident and trustworthy way."
  }
];

export const indexingPartners = [
  "Google Scholar",
  "Crossref",
  "DOAJ",
  "PubMed",
  "Scilit",
  "OpenAlex"
];


export const conferenceServices = [
  "Event Planning & Management",
  "Venue Sourcing",
  "Budget Management",
  "Attendee Registration",
  "Onsite Coordination",
  "Post-Event Evaluation"
];

export const scientificReach = [
  {
    title: "Peer-Reviewed Publishing",
    description:
      "Support clinical, medical, life science, pharma, and engineering researchers through structured open access publication workflows."
  },
  {
    title: "Editorial Coordination",
    description:
      "Maintain single-blind peer review, editor assignment, and publication-ready issue management across journal programs."
  },
  {
    title: "Global Knowledge Sharing",
    description:
      "Present journals, PPT resources, videos, and archive content in a format built for international scholarly visibility."
  }
];

export const regionBadges = ["USA", "Europe", "Middle East", "Asia"];
