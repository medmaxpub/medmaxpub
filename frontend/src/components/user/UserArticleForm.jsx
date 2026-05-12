import RichTextEditor from "./RichTextEditor";
import { accessTypeOptions, articleTypeOptions, indexingLinkFields, monthOptions, stripHtml } from "./userPortalShared";

export default function UserArticleForm({
  form,
  setForm,
  onSubmit,
  onReset,
  submitLabel,
  journalName,
  statusMessage,
  isEditing = false
}) {
  const currentYear = new Date().getFullYear();
  const releaseYears = Array.from({ length: 10 }, (_, index) => String(currentYear + 2 - index));

  return (
    <section className="card-panel p-6 sm:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">{isEditing ? "Edit Article" : "New Article"}</p>
        </div>
        <button type="button" className="button-secondary px-4 py-2" onClick={onReset}>
          {isEditing ? "Cancel Edit" : "Reset Form"}
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-8">
        <div className="grid gap-5 xl:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-brand-slate">Article Access Type *</label>
            <select value={form.accessType} onChange={(event) => setForm((current) => ({ ...current, accessType: event.target.value }))} required>
              <option value="">Select access type</option>
              {accessTypeOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-brand-slate">Volume no *</label>
              <input
                type="number"
                min="1"
                value={form.volume}
                onChange={(event) => setForm((current) => ({ ...current, volume: event.target.value }))}
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-brand-slate">Issue no *</label>
              <input
                type="number"
                min="1"
                value={form.issueNumber}
                onChange={(event) => setForm((current) => ({ ...current, issueNumber: event.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-brand-slate">Issue Releasing Month *</label>
              <select
                value={form.releaseMonth}
                onChange={(event) => setForm((current) => ({ ...current, releaseMonth: event.target.value }))}
                required
              >
                <option value="">Select month</option>
                {monthOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-brand-slate">Issue Releasing Year *</label>
              <select
                value={form.releaseYear}
                onChange={(event) => setForm((current) => ({ ...current, releaseYear: event.target.value }))}
                required
              >
                <option value="">Select year</option>
                {releaseYears.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-brand-slate">Special Issue Title</label>
            <input
              value={form.specialIssueTitle}
              onChange={(event) => setForm((current) => ({ ...current, specialIssueTitle: event.target.value }))}
              placeholder="Special issue title"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-brand-slate">Article Type</label>
            <select value={form.articleType} onChange={(event) => setForm((current) => ({ ...current, articleType: event.target.value }))}>
              <option value="">Select article type</option>
              {articleTypeOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-brand-slate">Upload PDF</label>
            <input type="file" accept=".pdf" onChange={(event) => setForm((current) => ({ ...current, pdfFile: event.target.files?.[0] || null }))} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-brand-slate">Enter DOI Number</label>
            <input value={form.doiNumber} onChange={(event) => setForm((current) => ({ ...current, doiNumber: event.target.value }))} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-brand-slate">Corresponding Author's Email *</label>
            <input
              type="email"
              value={form.correspondingAuthorEmail}
              onChange={(event) => setForm((current) => ({ ...current, correspondingAuthorEmail: event.target.value }))}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-brand-slate">Enter Keywords *</label>
            <input value={form.keywords} onChange={(event) => setForm((current) => ({ ...current, keywords: event.target.value }))} required />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-brand-slate">Enter First Page Number *</label>
              <input
                type="number"
                min="1"
                value={form.firstPageNumber}
                onChange={(event) => setForm((current) => ({ ...current, firstPageNumber: event.target.value }))}
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-brand-slate">Enter Last Page Number *</label>
              <input
                type="number"
                min="1"
                value={form.lastPageNumber}
                onChange={(event) => setForm((current) => ({ ...current, lastPageNumber: event.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-brand-slate">Country *</label>
            <input value={form.country} onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))} required />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-brand-slate">Select Article Published Date *</label>
            <input
              type="date"
              value={form.publishedDate}
              onChange={(event) => setForm((current) => ({ ...current, publishedDate: event.target.value }))}
              required
            />
          </div>
        </div>

        <div className="grid gap-6">
          <RichTextEditor
            label="Article Title"
            value={form.title}
            onChange={(value) => setForm((current) => ({ ...current, title: value }))}
            required
            placeholder="Enter article title"
          />

          <RichTextEditor
            label="Author Names"
            value={form.authorNames}
            onChange={(value) => setForm((current) => ({ ...current, authorNames: value }))}
            required
            placeholder="Enter author names"
          />

          <RichTextEditor
            label="Cite this article As"
            value={form.citeAs}
            onChange={(value) => setForm((current) => ({ ...current, citeAs: value }))}
            required
            placeholder="Enter citation text"
          />

          <RichTextEditor
            label="Enter Abstract"
            value={form.abstractText}
            onChange={(value) => setForm((current) => ({ ...current, abstractText: value }))}
            required
            placeholder="Enter abstract"
          />
        </div>

        <div className="rounded-3xl border border-brand-border bg-brand-elevated p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-teal">Indexing Links</p>
          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            {indexingLinkFields.map((item) => (
              <div key={item.key}>
                <label className="mb-2 block text-sm font-medium text-brand-slate">Enter Article's {item.label}</label>
                <input
                  type="url"
                  placeholder={`https://example.com/${item.key}`}
                  value={form.indexingLinks[item.key]}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      indexingLinks: {
                        ...current.indexingLinks,
                        [item.key]: event.target.value
                      }
                    }))
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-brand-border bg-brand-elevated p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-teal">Supplementary Files</p>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-brand-slate">Enter Supplementary file (Upload)</label>
              <input
                type="file"
                onChange={(event) => setForm((current) => ({ ...current, supplementaryFileOne: event.target.files?.[0] || null }))}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-brand-slate">Enter Supplementary file (Upload)</label>
              <input
                type="file"
                onChange={(event) => setForm((current) => ({ ...current, supplementaryFileTwo: event.target.files?.[0] || null }))}
              />
            </div>
          </div>
        </div>

        {statusMessage ? <p className="text-sm text-brand-slate">{statusMessage}</p> : null}
        {!stripHtml(form.title) || !stripHtml(form.authorNames) || !stripHtml(form.citeAs) || !stripHtml(form.abstractText) ? (
          <p className="text-xs text-amber-300">Title, author names, citation text, and abstract must contain content.</p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button type="submit" className="button-primary px-5 py-3">
            {submitLabel}
          </button>
          <button type="button" className="button-secondary px-5 py-3" onClick={onReset}>
            {isEditing ? "Discard Changes" : "Clear Draft"}
          </button>
        </div>
      </form>
    </section>
  );
}
