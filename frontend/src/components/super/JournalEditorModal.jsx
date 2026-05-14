import SectionHeader from "../common/SectionHeader";
import { X } from "lucide-react";

export default function JournalEditorModal({
  open,
  modeLabel,
  form,
  setForm,
  status,
  onSubmit,
  onClose,
  isCreateForExistingUser = false,
  ownerNotice = "",
  description = ""
}) {
  if (!open) {
    return null;
  }

  const normalizedModeLabel = String(modeLabel || "").toLowerCase();
  const isCreateMode = !normalizedModeLabel.includes("edit") && !normalizedModeLabel.includes("update");

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 px-4 py-6">
      <div className="flex min-h-full items-start justify-center">
        <form onSubmit={onSubmit} className="card-panel relative my-2 w-full max-w-4xl max-h-[calc(100vh-2rem)] overflow-y-auto p-6 sm:p-7">
          <button
            type="button"
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-border bg-white text-brand-slate hover:border-brand-crimson hover:text-brand-crimson"
            onClick={onClose}
            aria-label="Close journal editor"
          >
            <X size={18} />
          </button>
        <SectionHeader
          label="Journals"
          title={modeLabel}
          description={
            description || (isCreateForExistingUser
              ? "Create a journal and map it directly to the selected user account."
              : isCreateMode
                ? "Create the journal and its linked user account in a single step."
                : "Update the selected journal record and its linked user metadata.")
          }
        />

        {!isCreateForExistingUser && !ownerNotice ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <input
              value={form.firstName}
              onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
              placeholder="First Name"
              required
            />
            <input
              value={form.lastName}
              onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))}
              placeholder="Last Name"
              required
            />
            <input
              value={form.username}
              onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
              placeholder="User Name"
              required
            />
            <input
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="Password"
              type="password"
              required
            />
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-brand-border bg-brand-elevated p-4 text-sm text-brand-slate">
            {ownerNotice || (
              <>
                Journal will be added for user <span className="font-semibold text-brand-ink">@{form.username}</span>.
              </>
            )}
          </div>
        )}

        <div className="mt-6 grid gap-4">
          <input
            value={form.managingJournalName}
            onChange={(event) => setForm((current) => ({ ...current, managingJournalName: event.target.value }))}
            placeholder="Managing Journal Name"
            required
          />
          <input
            value={form.journalDomainName}
            onChange={(event) => setForm((current) => ({ ...current, journalDomainName: event.target.value }))}
            placeholder="Journal Domain Name"
            required
          />
          <input
            value={form.journalUrl}
            onChange={(event) => setForm((current) => ({ ...current, journalUrl: event.target.value }))}
            placeholder="Journal URL"
            required
          />
          <textarea
            value={form.aboutJournal}
            onChange={(event) => setForm((current) => ({ ...current, aboutJournal: event.target.value }))}
            placeholder="About Journal"
            rows="4"
            required
          />
          <textarea
            value={form.journalInstructions}
            onChange={(event) => setForm((current) => ({ ...current, journalInstructions: event.target.value }))}
            placeholder="Journal Instructions"
            rows="4"
            required
          />
          <div className="rounded-3xl border border-brand-border bg-brand-surface p-5">
            <p className="text-sm font-semibold text-brand-ink">Optional Uploads</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-brand-slate">Journal Cover Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setForm((current) => ({ ...current, coverImageFile: event.target.files?.[0] || null }))}
                />
                {form.coverImage ? (
                  <div className="mt-3 flex items-center gap-3 rounded-2xl border border-brand-border bg-white p-3">
                    <img src={form.coverImage} alt="Current journal cover" className="h-20 w-16 rounded-xl object-cover" />
                    <p className="text-sm text-brand-slate">Current cover image will stay unless you upload a new one.</p>
                  </div>
                ) : null}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-brand-slate">PPT</label>
                <input
                  type="file"
                  accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                  onChange={(event) => setForm((current) => ({ ...current, pptFile: event.target.files?.[0] || null }))}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-brand-slate">PPT Preview PDF</label>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(event) => setForm((current) => ({ ...current, pptPreviewFile: event.target.files?.[0] || null }))}
                />
                <p className="mt-2 text-xs text-brand-slate">Recommended for production so PPT preview and presentation mode stay smooth.</p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-brand-slate">PDF</label>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(event) => setForm((current) => ({ ...current, pdfFile: event.target.files?.[0] || null }))}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-brand-slate">Video</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(event) => setForm((current) => ({ ...current, videoFile: event.target.files?.[0] || null }))}
                />
              </div>
            </div>
          </div>
        </div>

        {status ? <p className="mt-4 text-sm text-brand-slate">{status}</p> : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="submit" className="button-primary">
            Save Journal
          </button>
          <button type="button" className="button-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
        </form>
      </div>
    </div>
  );
}
