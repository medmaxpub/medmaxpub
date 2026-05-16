import { mockJournals, mockTestimonials } from "../../data/mockData";
import { normalizeItem } from "../../components/super/superUserShared";

function buildMockUsers() {
  const byUsername = new Map();

  mockJournals.forEach((journal, index) => {
    const key = journal.username || journal.ownerUsername || journal.userName || `journal-user-${index + 1}`;
    const existing = byUsername.get(key) || {
      id: `mock-user-${index + 1}`,
      firstName: journal.firstName || "Journal",
      lastName: journal.lastName || "User",
      username: key,
      role: "user",
      managingJournalName: "",
      journalDomainName: "",
      journalUrl: "",
      createdAt: new Date(Date.now() - index * 86400000).toISOString(),
      journalCount: 0,
      journals: []
    };

    existing.journals.push({
      id: journal.id,
      managingJournalName: journal.managingJournalName,
      journalDomainName: journal.journalDomainName,
      journalUrl: journal.journalUrl,
      issn: journal.issn,
      aboutJournal: journal.aboutJournal,
      aimScope: journal.aimScope,
      journalInstructions: journal.journalInstructions,
      firstName: journal.firstName,
      lastName: journal.lastName
    });
    existing.journalCount = existing.journals.length;

    if (!existing.managingJournalName) {
      existing.managingJournalName = journal.managingJournalName;
      existing.journalDomainName = journal.journalDomainName;
      existing.journalUrl = journal.journalUrl;
    }

    byUsername.set(key, existing);
  });

  return [...byUsername.values()].map(normalizeItem);
}

export function getSuperUserUsersFallback() {
  const items = buildMockUsers();

  return {
    items,
    meta: {
      total: items.length,
      page: 1,
      pageSize: items.length || 10,
      totalPages: 1,
      orderBy: "date",
      direction: "desc",
      search: ""
    }
  };
}

export function getSuperUserJournalsFallback() {
  return mockJournals.map(normalizeItem);
}

export function getSuperUserTestimonialsFallback() {
  return mockTestimonials.map(normalizeItem);
}
