function getJournalId(journal) {
  return journal?.id || journal?._id || "";
}

export default function UserJournalSelector({ journals, selectedJournalId, onChange }) {
  return (
    <div className="grid gap-2 sm:max-w-md">
      <label className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-slate">Select Journal</label>
      <select value={selectedJournalId} onChange={(event) => onChange(event.target.value)} disabled={!journals.length}>
        <option value="">Select journal</option>
        {journals.map((journal) => (
          <option key={getJournalId(journal)} value={getJournalId(journal)}>
            {journal.managingJournalName || journal.journalName || journal.shortName || "Untitled Journal"}
          </option>
        ))}
      </select>
    </div>
  );
}
