import SectionHeader from "../common/SectionHeader";

export default function PasswordRevealModal({ open, prompt, setPrompt, title, description, onSubmit, onClose }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 px-4 py-6">
      <div className="flex min-h-full items-start justify-center">
        <form onSubmit={onSubmit} className="card-panel my-2 w-full max-w-md p-5 sm:p-6">
          <SectionHeader label="Verification" title={title} description={description} />
          <div className="mt-6">
            <label className="form-label" data-required="true">Super User Password</label>
            <input
              value={prompt.adminPassword}
              onChange={(event) => setPrompt((current) => ({ ...current, adminPassword: event.target.value, error: "" }))}
              placeholder="Enter your super user password"
              type="password"
              required
            />
          </div>
          {prompt.error ? <p className="mt-3 text-sm text-rose-500">{prompt.error}</p> : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="submit" className="button-primary">
              Verify and Reveal
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
