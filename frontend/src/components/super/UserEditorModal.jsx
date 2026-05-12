import SectionHeader from "../common/SectionHeader";

export default function UserEditorModal({
  open,
  editingUserId,
  form,
  setForm,
  status,
  onSubmit,
  onClose
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
      <form onSubmit={onSubmit} className="card-panel w-full max-w-xl p-6">
        <SectionHeader
          label="Users"
          title={editingUserId ? "Edit user" : "Add new user"}
          description="Create or update a journal user account from the super user portal."
        />

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
            className="sm:col-span-2"
            value={form.username}
            onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
            placeholder="User Name"
            required
          />
          <input
            className="sm:col-span-2"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder={editingUserId ? "New Password (optional)" : "Password"}
            type="password"
            required={!editingUserId}
          />
        </div>

        {status ? <p className="mt-4 text-sm text-brand-slate">{status}</p> : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="submit" className="button-primary">
            {editingUserId ? "Update User" : "Create User"}
          </button>
          <button type="button" className="button-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
