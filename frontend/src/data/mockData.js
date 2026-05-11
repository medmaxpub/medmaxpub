export const companyInfo = {
  name: "medmaxpub",
  email: import.meta.env.VITE_DEFAULT_CONTACT_EMAIL || "contact@medmaxpub.com",
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
  {
    id: "hero-life-science",
    title: "Life Sciences",
    image:
      "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "hero-clinical",
    title: "Clinical Research",
    image:
      "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "hero-engineering",
    title: "Engineering & Technology",
    image:
      "https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&w=1200&q=80"
  }
];

export const aboutMedmaxParagraphs = [
  "Medmax Publishers is a peer-reviewed, open access publisher covering a comprehensive range of topics in Clinical, Medicine, Life Sciences, Pharma, and Engineering & Technology. We help scientific researchers, institutions, academic professionals, and young professionals advance healthcare, open science, and performance for the benefit of humanity.",
  "Medmax Publishers is moving ahead with a vision to develop an optimized knowledge-sharing platform and an enlightening interactive network for scholars and scientific researchers all over the world through its scientific publications. Medmax Publishers works with well-qualified community and advisory board members who support new research and development for the organization. Medmax Journals follow a single-blind peer-review process, where each manuscript submitted by an author is assigned to a particular editor.",
  "Medmax Publishers publishes many kinds of manuscripts, including Original Research, Review Articles, Case Reports, Rapid Communications, Short Communications, Mini Reviews, Editorials, Letters to the Editor, Commentary, Perspectives, Case in Images, Clinical Images, and Research Highlights across medical, clinical, and engineering fields.",
  "All listed journals are part of the open access process and are available to read without access fees or subscription charges."
];

function buildJournal(id, firstName, lastName, managingJournalName, journalDomainName, journalUrl, ppts = [], videos = []) {
  return {
    id,
    firstName,
    lastName,
    userName: `${journalUrl}-admin`,
    managingJournalName,
    journalDomainName,
    journalUrl,
    aboutJournal:
      `${managingJournalName} is a peer-reviewed publication stream supporting global researchers, conference presenters, clinicians, engineers, and interdisciplinary scholars.`,
    journalInstructions:
      "Prepare complete author metadata, submit all required files in the requested format, and follow the editor-assigned review workflow for publication processing.",
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
    "journal-sustainable-energy-engineering-policy"
  ),
  buildJournal(
    "j4",
    "Samuel",
    "Reed",
    "International Journal of Public Health Frontiers",
    "Public Health and Preventive Research",
    "international-journal-public-health-frontiers"
  ),
  buildJournal(
    "j5",
    "Ibrahim",
    "Khan",
    "Journal of Advanced Pharmaceutical Discovery",
    "Pharmaceutical Discovery and Drug Development",
    "journal-advanced-pharmaceutical-discovery"
  ),
  buildJournal(
    "j6",
    "Mia",
    "Brooks",
    "Engineering, Robotics & Intelligent Machine Review",
    "Engineering, Robotics, and Intelligent Machines",
    "engineering-robotics-intelligent-machine-review"
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

export const regionBadges = ["USA", "Europe", "Middle East", "Asia"];
