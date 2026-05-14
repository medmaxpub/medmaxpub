import { ChevronLeft, ChevronRight, Eye, EyeOff, LogIn, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { shouldUseDevelopmentFallback, withFallback } from "../../api/client";
import EmptyState from "../../components/common/EmptyState";
import SectionHeader from "../../components/common/SectionHeader";
import JournalEditorModal from "../../components/super/JournalEditorModal";
import UserEditorModal from "../../components/super/UserEditorModal";
import { useAuth } from "../../context/AuthContext";
import useAutoRefresh from "../../hooks/useAutoRefresh";
import { getSuperUserUsersFallback } from "./superUserFallbacks";
import {
  defaultUserMeta,
  initialJournalForm,
  initialUserForm,
  mapUserToForm,
  normalizeItem
} from "../../components/super/superUserShared";

export default function SuperUserUsersPage() {
  const { beginImpersonation } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [revealedPasswords, setRevealedPasswords] = useState({});
  const [editingUserId, setEditingUserId] = useState("");
  const [userForm, setUserForm] = useState(initialUserForm);
  const [userEditorOpen, setUserEditorOpen] = useState(false);
  const [journalForm, setJournalForm] = useState(initialJournalForm);
  const [journalEditorOpen, setJournalEditorOpen] = useState(false);
  const [userQuery, setUserQuery] = useState(defaultUserMeta);
  const [userMeta, setUserMeta] = useState(defaultUserMeta);
  const [userStatus, setUserStatus] = useState("");
  const [journalStatus, setJournalStatus] = useState("");
  const useDevelopmentFallback = shouldUseDevelopmentFallback();

  const loadUsers = useCallback(async () => {
    const data = await withFallback(
      () =>
        api.get("/super/users", {
          params: {
            search: userQuery.search,
            orderBy: userQuery.orderBy,
            direction: userQuery.direction,
            page: userQuery.page,
            pageSize: userQuery.pageSize
          }
        }),
      getSuperUserUsersFallback()
    );

    setUsers((data.items || []).map(normalizeItem));
    setUserMeta({ ...defaultUserMeta, ...(data.meta || {}) });
  }, [userQuery.direction, userQuery.orderBy, userQuery.page, userQuery.pageSize, userQuery.search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useAutoRefresh(loadUsers, { intervalMs: 15000 });

  const openCreateAccountEditor = () => {
    setJournalForm(initialJournalForm);
    setJournalEditorOpen(true);
    setJournalStatus("");
  };

  const openEditUserEditor = (item) => {
    setEditingUserId(item.id);
    setUserForm(mapUserToForm(item));
    setUserEditorOpen(true);
    setUserStatus("");
  };

  const submitUser = async (event) => {
    event.preventDefault();
    setUserStatus("");

    try {
      const payload = {
        firstName: userForm.firstName,
        lastName: userForm.lastName,
        username: userForm.username,
        ...(userForm.password ? { password: userForm.password } : {})
      };

      if (!editingUserId && !payload.password) {
        setUserStatus("Password is required for new users.");
        return;
      }

      const baseUrl = "/super/users";
      await api[editingUserId ? "put" : "post"](editingUserId ? `${baseUrl}/${editingUserId}` : baseUrl, payload);
      setUserStatus(editingUserId ? "User updated successfully." : "User created successfully.");
      setEditingUserId("");
      setUserForm(initialUserForm);
      setUserEditorOpen(false);
      await loadUsers();
    } catch (error) {
      setUserStatus(error.response?.data?.message || "User save failed.");
    }
  };

  const deleteUser = async (targetUser) => {
    setUserStatus("");

    const confirmed = window.confirm(
      `Delete user "${targetUser.username}" and its linked journal, issues, articles, PPTs, and videos?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/super/users/${targetUser.id}`);
      setUserStatus(`User "${targetUser.username}" deleted successfully.`);
      await loadUsers();
    } catch (error) {
      setUserStatus(error.response?.data?.message || "User delete failed.");
    }
  };

  const impersonateUser = async (targetUserId) => {
    setUserStatus("");

    try {
      const response = await api.post(`/auth/impersonate/${targetUserId}`);
      beginImpersonation(response.data);
      navigate("/user/articles-in-press");
    } catch (error) {
      setUserStatus(error.response?.data?.message || "Unable to impersonate this user.");
    }
  };

  const revealPassword = async (userId) => {
    try {
      const response = await api.post(`/super/users/${userId}/reveal-password`);
      setRevealedPasswords((current) => ({
        ...current,
        [userId]: response.data.password
      }));
    } catch (error) {
      setUserStatus(error.response?.data?.message || "Password reveal failed.");
    }
  };

  const attachJournalMedia = async (journalId) => {
    const messages = [];

    if (journalForm.pptFile) {
      const pptData = new FormData();
      pptData.append("title", `${journalForm.managingJournalName} PPT`);
      pptData.append("description", journalForm.aboutJournal);
      pptData.append("pptFile", journalForm.pptFile);
      await api.post(`/journals/${journalId}/ppts`, pptData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      messages.push("PPT uploaded.");
    }

    if (journalForm.pdfFile) {
      const pdfData = new FormData();
      pdfData.append("pdfFile", journalForm.pdfFile);
      await api.post(`/journals/${journalId}/pdf`, pdfData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      messages.push("PDF uploaded.");
    }

    if (journalForm.videoFile) {
      const videoData = new FormData();
      videoData.append("title", `${journalForm.managingJournalName} Video`);
      videoData.append("description", journalForm.aboutJournal);
      videoData.append("videoFile", journalForm.videoFile);
      await api.post(`/journals/${journalId}/videos`, videoData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      messages.push("Video uploaded.");
    }

    return messages;
  };

  const submitJournal = async (event) => {
    event.preventDefault();
    setJournalStatus("");

    try {
      const payload = {
        firstName: journalForm.firstName,
        lastName: journalForm.lastName,
        username: journalForm.username,
        password: journalForm.password,
        managingJournalName: journalForm.managingJournalName,
        journalDomainName: journalForm.journalDomainName,
        journalUrl: journalForm.journalUrl,
        aboutJournal: journalForm.aboutJournal,
        journalInstructions: journalForm.journalInstructions
      };

      const response = await api.post("/journals", payload);
      const savedJournal = normalizeItem(response.data);
      const mediaMessages = await attachJournalMedia(savedJournal.id).catch((error) => [
        `Media upload warning: ${error.response?.data?.message || error.message}`
      ]);

      setJournalStatus(`User and journal created successfully. ${mediaMessages.join(" ")}`.trim());
      setJournalEditorOpen(false);
      setJournalForm(initialJournalForm);
      await loadUsers();
    } catch (error) {
      setJournalStatus(error.response?.data?.message || "Journal save failed.");
    }
  };

  return (
    <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="card-panel p-6 sm:p-8">
        <SectionHeader
          label="Users"
          title="Super user users list"
          description="Search, sort, paginate, reveal passwords, edit existing users, delete accounts, impersonate users, and create each new user together with one journal."
        />

        <div className="mt-8 rounded-3xl border border-brand-border bg-brand-elevated p-4 sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-slate" />
                <input
                  className="pl-11"
                  value={userQuery.search}
                  onChange={(event) => setUserQuery((current) => ({ ...current, search: event.target.value, page: 1 }))}
                  placeholder="Search user, journal, domain, or URL"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <select
                  value={userQuery.orderBy}
                  onChange={(event) => setUserQuery((current) => ({ ...current, orderBy: event.target.value, page: 1 }))}
                >
                  <option value="date">Order By Date</option>
                  <option value="id">Order By Id</option>
                  <option value="name">Order By Name</option>
                </select>
                <select
                  value={userQuery.direction}
                  onChange={(event) => setUserQuery((current) => ({ ...current, direction: event.target.value, page: 1 }))}
                >
                  <option value="desc">Desc</option>
                  <option value="asc">Asc</option>
                </select>
                <select
                  value={userQuery.pageSize}
                  onChange={(event) => setUserQuery((current) => ({ ...current, pageSize: Number(event.target.value), page: 1 }))}
                >
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                </select>
              </div>
            </div>

            <button type="button" className="button-primary px-4 py-2" onClick={openCreateAccountEditor}>
              <Plus size={16} className="mr-2" />
              Add User & Journal
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-brand-border bg-brand-surface">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-brand-elevated text-brand-ink">
                <tr className="border-b border-brand-border">
                  <th className="px-4 py-4 font-semibold">S.No</th>
                  <th className="px-4 py-4 font-semibold">User Name</th>
                  <th className="px-4 py-4 font-semibold">Managing Journal Name</th>
                  <th className="px-4 py-4 font-semibold">Journal Domain Name</th>
                  <th className="px-4 py-4 font-semibold">Journal URL</th>
                  <th className="px-4 py-4 font-semibold">Password</th>
                  <th className="px-4 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length ? (
                  users.map((item, index) => (
                    <tr key={item.id} className="border-b border-brand-border/60 text-brand-slate">
                      <td className="px-4 py-4">{(userMeta.page - 1) * userMeta.pageSize + index + 1}</td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-brand-ink">{item.username}</div>
                        <div className="mt-1 text-xs text-brand-slate">
                          {item.firstName} {item.lastName}
                        </div>
                      </td>
                      <td className="px-4 py-4">{item.managingJournalName || "No journal assigned"}</td>
                      <td className="px-4 py-4">{item.journalDomainName || "NA"}</td>
                      <td className="px-4 py-4">{item.journalUrl || "NA"}</td>
                      <td className="px-4 py-4 font-mono text-brand-ink">{revealedPasswords[item.id] || "******"}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {revealedPasswords[item.id] ? (
                            <button
                              type="button"
                              className="button-soft min-h-10 px-3 py-2"
                              onClick={() =>
                                setRevealedPasswords((current) => {
                                  const next = { ...current };
                                  delete next[item.id];
                                  return next;
                                })
                              }
                            >
                              <EyeOff size={16} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="button-soft min-h-10 px-3 py-2"
                              onClick={() => revealPassword(item.id)}
                            >
                              <Eye size={16} />
                            </button>
                          )}
                          <button type="button" className="button-soft min-h-10 px-3 py-2" onClick={() => openEditUserEditor(item)}>
                            <Pencil size={16} />
                          </button>
                          <button type="button" className="button-primary min-h-10 px-3 py-2" onClick={() => impersonateUser(item.id)}>
                            <LogIn size={16} className="mr-2" />
                            Login as User
                          </button>
                          <button type="button" className="button-secondary min-h-10 px-3 py-2 text-rose-300" onClick={() => deleteUser(item)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-10">
                      <EmptyState title="No users matched this view" description="Adjust search, sorting, or create a new user and journal pair." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 border-t border-brand-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-brand-slate">
              Showing page {userMeta.page} of {userMeta.totalPages} with {userMeta.total} total users
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="button-secondary min-h-10 px-3 py-2"
                disabled={userMeta.page <= 1}
                onClick={() => setUserQuery((current) => ({ ...current, page: Math.max(current.page - 1, 1) }))}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className="button-secondary min-h-10 px-3 py-2"
                disabled={userMeta.page >= userMeta.totalPages}
                onClick={() =>
                  setUserQuery((current) => ({ ...current, page: Math.min(current.page + 1, userMeta.totalPages || 1) }))
                }
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {userStatus ? <p className="text-sm text-brand-slate">{userStatus}</p> : null}
        {journalStatus ? <p className="text-sm text-brand-slate">{journalStatus}</p> : null}
      </section>

      <UserEditorModal
        open={userEditorOpen}
        editingUserId={editingUserId}
        form={userForm}
        setForm={setUserForm}
        status={userStatus}
        onSubmit={submitUser}
        onClose={() => {
          setEditingUserId("");
          setUserForm(initialUserForm);
          setUserEditorOpen(false);
        }}
      />

      <JournalEditorModal
        open={journalEditorOpen}
        modeLabel="Create user and journal"
        form={journalForm}
        setForm={setJournalForm}
        status={journalStatus}
        onSubmit={submitJournal}
        onClose={() => {
          setJournalEditorOpen(false);
          setJournalForm(initialJournalForm);
        }}
        description="Create the user account and its single linked journal together. Existing users cannot be assigned an extra journal later."
      />
    </div>
  );
}
