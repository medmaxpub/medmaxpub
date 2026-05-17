import { Link } from "react-router-dom";
import { buildJournalArchiveIssuePath } from "../../utils/journalLinks";

function flattenIssues(yearBlock) {
  return (yearBlock?.volumes || []).flatMap((volumeBlock) =>
    (volumeBlock.issues || []).map((issue) => ({
      year: yearBlock.year,
      volume: volumeBlock.volume,
      issueNumber: issue.issue,
      issueKey: `${yearBlock.year}-${volumeBlock.volume}-${issue.issue}`
    }))
  );
}

export default function IssueAccordion({ archive, journalUrl }) {
  return (
    <div className="space-y-4">
      {archive.map((yearBlock) => {
        const issues = flattenIssues(yearBlock);

        return (
          <div key={yearBlock.year} className="card-panel overflow-hidden">
            <div className="px-4 py-5 sm:px-6">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-brand-teal">Archive Year</p>
                <h3 className="mt-1 text-xl font-semibold text-brand-ink">{yearBlock.year}</h3>
              </div>
            </div>

            <div className="border-t border-brand-border px-4 py-5 sm:px-6">
              <div className="space-y-1">
                {issues.map((issue) => (
                  <Link
                    key={issue.issueKey}
                    to={buildJournalArchiveIssuePath(journalUrl, issue.year, issue.volume, issue.issueNumber)}
                    className="block px-3 py-2 text-left text-[#405bb7] transition hover:bg-brand-surface"
                  >
                    <span className="text-lg font-medium">
                      Volume {issue.volume} Issue {issue.issueNumber}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
