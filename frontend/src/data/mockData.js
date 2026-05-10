export const companyInfo = {
  name: "medmaxpub",
  email: import.meta.env.VITE_DEFAULT_CONTACT_EMAIL || "contact@medmaxpub.com",
  phone: import.meta.env.VITE_DEFAULT_CONTACT_PHONE || "+1 (970) 642-3881",
  addressLines: [
    "7700 E Arapahoe Rd",
    "Colorado, USA"
  ]
};

function buildJournal(id, title, slug, issn, category, coverImageUrl, ppts = [], videos = []) {
  return {
    id,
    slug,
    title,
    issn,
    category,
    coverImageUrl,
    description:
      "A peer-reviewed publication stream supporting global researchers, conference presenters, clinicians, engineers and interdisciplinary scholars.",
    sections: {
      home: `<p>${title} supports the scientific publishing mission of medmaxpub by connecting conference-driven research with structured open access journal workflows.</p><p>This journal homepage mirrors the platform's confidence-forward layout while giving editors and authors a modern submission, issue, and archive experience.</p>`,
      about: `<p>${title} is an international journal for original research, reviews, case studies, perspectives, and scholarly communications relevant to emerging science and applied innovation.</p>`,
      "aim-scope": `<ul><li>Global multidisciplinary research exchange</li><li>Conference-aligned scholarly publication</li><li>Clinical, engineering, life science, and applied technology topics</li></ul>`,
      "editorial-board": `<p>Editorial board members, affiliations, and leadership roles are managed through the admin dashboard and rendered journal-by-journal.</p>`,
      "author-guidelines": `<ul><li>Submit manuscripts in PDF, DOC, or DOCX format</li><li>Include complete affiliations and corresponding author details</li><li>Ensure references, abstracts, and figures follow journal-specific policy</li></ul>`,
      "article-in-press": `<p>Accepted papers awaiting issue allocation appear here so authors and readers can preview upcoming publication activity.</p>`
    },
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
    "Journal of Global Clinical & Translational Research",
    "journal-global-clinical-translational-research",
    "ISSN 2999-1001",
    "Clinical Science",
    "https://placehold.co/600x800/0d1b2a/ffffff?text=Global+Clinical+Research",
    [
      {
        id: "ppt-1",
        title: "Global Scientific Network Keynote Deck",
        description: "A presentation resource aligned with speaker sessions, poster highlights, and conference dissemination.",
        uploadedDate: "2026-04-01",
        fileUrl: "https://example.com/presentation-1.pptx",
        previewUrl: "https://example.com/presentation-1.pdf"
      }
    ],
    [
      {
        id: "video-1",
        title: "Empowering Global Scientific Collaboration",
        description: "Keynote and research visibility overview for the journal audience.",
        thumbnailUrl: "https://placehold.co/800x450/081c3a/ffffff?text=Global+Scientific+Collaboration",
        youtubeUrl: "https://www.youtube.com/embed/ysz5S6PUM-U"
      }
    ]
  ),
  buildJournal(
    "j2",
    "Open Journal of Bioinformatics & Intelligent Systems",
    "open-journal-bioinformatics-intelligent-systems",
    "ISSN 2999-1002",
    "Artificial Intelligence",
    "https://placehold.co/600x800/144552/ffffff?text=Bioinformatics+AI",
    [
      {
        id: "ppt-2",
        title: "Emerging Research Trends in AI & Health Care",
        description: "A slide deck prepared for medmaxpub conference previews and author education.",
        uploadedDate: "2026-03-22",
        fileUrl: "https://example.com/presentation-2.pptx",
        previewUrl: "https://example.com/presentation-2.pdf"
      }
    ],
    [
      {
        id: "video-2",
        title: "How medmaxpub Supports Authors, Speakers & Delegates",
        description: "A journal-linked video resource for authors and contributors.",
        thumbnailUrl: "https://placehold.co/800x450/15616d/ffffff?text=medmaxpub+Support+Workflow",
        videoUrl: "https://res.cloudinary.com/demo/video/upload/dog.mp4"
      }
    ]
  ),
  buildJournal(
    "j3",
    "Journal of Sustainable Energy Engineering & Policy",
    "journal-sustainable-energy-engineering-policy",
    "ISSN 2999-1003",
    "Energy",
    "https://placehold.co/600x800/adc178/172033?text=Sustainable+Energy"
  ),
  buildJournal(
    "j4",
    "International Journal of Public Health Frontiers",
    "international-journal-public-health-frontiers",
    "ISSN 2999-1004",
    "Public Health",
    "https://placehold.co/600x800/1b4965/ffffff?text=Public+Health"
  ),
  buildJournal(
    "j5",
    "Journal of Advanced Pharmaceutical Discovery",
    "journal-advanced-pharmaceutical-discovery",
    "ISSN 2999-1005",
    "Pharmacy",
    "https://placehold.co/600x800/9c6644/ffffff?text=Pharmaceutical+Discovery"
  ),
  buildJournal(
    "j6",
    "Engineering, Robotics & Intelligent Machine Review",
    "engineering-robotics-intelligent-machine-review",
    "ISSN 2999-1006",
    "Engineering",
    "https://placehold.co/600x800/5e6472/ffffff?text=Engineering+Robotics"
  )
];

export const mockPpts = mockJournals.flatMap((journal) =>
  (journal.ppts || []).map((ppt) => ({
    ...ppt,
    journalTitle: journal.title,
    journalSlug: journal.slug
  }))
);

export const mockVideos = mockJournals.flatMap((journal) =>
  (journal.videos || []).map((video) => ({
    ...video,
    journalTitle: journal.title,
    journalSlug: journal.slug
  }))
);

export const mockTestimonials = [
  {
    id: "t1",
    name: "Dr. Hannah Morris",
    role: "Conference Speaker",
    message:
      "The platform captures a polished, research-focused feel while making publishing and speaker workflows much easier to manage."
  },
  {
    id: "t2",
    name: "Prof. Daniel Rivera",
    role: "Journal Editor",
    message:
      "Routing journals, conference assets, testimonials, and article metadata through one dashboard is a major operational improvement."
  },
  {
    id: "t3",
    name: "Mia Brooks",
    role: "Event Coordinator",
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

export const homeSlides = [
  {
    id: "slide-1",
    eyebrow: "Global Scientific Network",
    title: "Empowering global scientific collaboration",
    description: "Connect with researchers, innovators, clinicians, and industry leaders worldwide through conferences, journals, and publication support.",
    primaryLabel: "Explore Journals",
    primaryLink: "/journals",
    secondaryLabel: "Submit Manuscript",
    secondaryLink: "/submit-manuscript",
    image: "https://placehold.co/900x700/081c3a/ffffff?text=Global+Scientific+Collaboration"
  },
  {
    id: "slide-2",
    eyebrow: "50+ International Speakers",
    title: "Learn from world-class experts",
    description: "Surface keynote sessions, speaker insight, conference assets, and journal publication opportunities from one modern platform.",
    primaryLabel: "Browse Journals",
    primaryLink: "/journals",
    secondaryLabel: "Start Journal",
    secondaryLink: "/start-journal",
    image: "https://placehold.co/900x700/144552/ffffff?text=World+Class+Speakers"
  },
  {
    id: "slide-3",
    eyebrow: "Future-Focused Research",
    title: "Shaping the future of science and innovation",
    description: "Bring together emerging topics, interdisciplinary journals, manuscript workflows, and downloadable knowledge resources.",
    primaryLabel: "About medmaxpub",
    primaryLink: "/about",
    secondaryLabel: "Contact Us",
    secondaryLink: "/contact",
    image: "https://placehold.co/900x700/15616d/ffffff?text=Future+Focused+Research"
  }
];

export const scientificReach = [
  {
    title: "Global Dialogue",
    description:
      "Research communities come together across borders to discuss urgent scientific and technological priorities."
  },
  {
    title: "Collaboration",
    description:
      "Conferences connect scholars, innovators, clinicians, engineers, and decision-makers for meaningful collaboration."
  },
  {
    title: "Inspiration",
    description:
      "Every gathering is designed to spark ideas, elevate visibility, and inspire the next wave of scientific progress."
  }
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
