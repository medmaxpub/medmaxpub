import { ChevronLeft, ChevronRight, Eye, EyeOff, LogIn, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api, { shouldUseDevelopmentFallback, withFallback } from "../../api/client";
import EmptyState from "../../components/common/EmptyState";
import SectionHeader from "../../components/common/SectionHeader";
import { useAuth } from "../../context/AuthContext";
import { mockJournals, mockTestimonials } from "../../data/mockData";
import useAutoRefresh from "../../hooks/useAutoRefresh";

const initialJournalForm = {
  firstName: "",
  lastName: "",
  username: "",
  password: "",
  managingJournalName: "",
  journalDomainName: "",
  journalUrl: "",
  aboutJournal: "",
  journalInstructions: "",
  pptFile: null,
  pdfFile: null,
  videoFile: null
};

const initialTestimonialForm = {
  name: "",
  designation: "",
  message: "",
  image: null
};

const initialUserForm = {
  firstName: "",
  lastName: "",
  username: "",
  password: ""
};

function normalizeItem(item) {
  return {
    ...item,
    id: item.id || item._id
  };
}

function mapJournalToForm(journal) {
  return {
    firstName: journal?.firstName || "",
    lastName: journal?.lastName || "",
    username: journal?.username || journal?.ownerUsername || "",
    password: "",
    managingJournalName: journal?.managingJournalName || "",
    journalDomainName: journal?.journalDomainName || "",
    journalUrl: journal?.journalUrl || "",
    aboutJournal: journal?.aboutJournal || "",
    journalInstructions: journal?.journalInstructions || "",
    pptFile: null,
    pdfFile: null,
    videoFile: null
  };
}

function mapTestimonialToForm(item) {
  return {
    name: item?.name || "",
    designation: item?.designation || "",
    message: item?.message || "",
    image: null
  };
}

function mapUserToForm(item) {
  return {
    firstName: item?.firstName || "",
    lastName: item?.lastName || "",
    username: item?.username || "",
    password: ""
  };
}

const defaultUserMeta = {
  total: 0,
  page: 1,
  pageSize: 10,
  totalPages: 1,
  orderBy: "date",
  direction: "desc",
  search: ""
};

export default function AdminDashboardPage({ mode = "admin" }) {
  const { beginImpersonation, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [journals, setJournals] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [editingUserId, setEditingUserId] = useState("");
  const [editingJournalId, setEditingJournalId] = useState("");
  const [editingTestimonialId, setEditingTestimonialId] = useState("");
  const [userForm, setUserForm] = useState(initialUserForm);
  const [journalForm, setJournalForm] = useState(initialJournalForm);
  const [testimonialForm, setTestimonialForm] = useState(initialTestimonialForm);
  const [revealedPasswords, setRevealedPasswords] = useState({});
  const [userEditorOpen, setUserEditorOpen] = useState(false);
  const [userQuery, setUserQuery] = useState(defaultUserMeta);
  const [userMeta, setUserMeta] = useState(defaultUserMeta);
  const [journalStatus, setJournalStatus] = useState("");
  const [userStatus, setUserStatus] = useState("");
  const [testimonialStatus, setTestimonialStatus] = useState("");
  const isSuperPortal = mode === "super";
  const isAdmin = user?.role === "admin";
  const canManageAll = isAdmin || isSuperPortal;
  const useDevelopmentFallback = shouldUseDevelopmentFallback();

  const loadUsers = useCallback(async () => {
    if (!isSuperPortal) {
      setUsers([]);
      setUserMeta(defaultUserMeta);
      return;
    }

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
      { items: [], meta: defaultUserMeta }
    );

    setUsers((data.items || []).map(normalizeItem));
    setUserMeta({ ...defaultUserMeta, ...(data.meta || {}) });
  }, [isSuperPortal, userQuery.direction, userQuery.orderBy, userQuery.page, userQuery.pageSize, userQuery.search]);

  const loadJournals = useCallback(async () => {
    const data = await withFallback(() => api.get("/admin/journals"), useDevelopmentFallback ? mockJournals : []);
    setJournals(data.map(normalizeItem));
  }, [useDevelopmentFallback]);

  const loadTestimonials = useCallback(async () => {
    const data = await withFallback(() => api.get("/testimonials"), useDevelopmentFallback ? mockTestimonials : []);
    setTestimonials(data.map(normalizeItem));
  }, [useDevelopmentFallback]);

  const refreshDashboardData = useCallback(() => {
    return Promise.all([loadUsers(), loadJournals(), loadTestimonials()]);
  }, [loadJournals, loadTestimonials, loadUsers]);

  useEffect(() => {
    refreshDashboardData();
  }, [refreshDashboardData]);

  useAutoRefresh(refreshDashboardData, { intervalMs: 15000 });

  useEffect(() => {
    const targetId = (location.hash || "#journals").replace("#", "");
    const targetSection = document.getElementById(targetId);

    if (!targetSection) {
      return;
    }

    window.requestAnimationFrame(() => {
      targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [location.hash]);

  const selectedUser = useMemo(() => users.find((item) => item.id === selectedUserId) || null, [selectedUserId, users]);

  const visibleJournals = useMemo(() => {
    const base = canManageAll ? journals : journals.filter((journal) => journal.ownerUserId?.toString() === user?.id?.toString());

    if (canManageAll && selectedUserId) {
      return base.filter((journal) => journal.ownerUserId?.toString() === selectedUserId.toString());
    }

    return base;
  }, [canManageAll, journals, selectedUserId, user?.id]);

  const openEditUserEditor = (item) => {
    setEditingUserId(item.id);
    setUserForm(mapUserToForm(item));
    setUserEditorOpen(true);
  };

  const attachJournalMedia = async (journalId, form, managingJournalName, aboutJournal) => {
    const messages = [];

    if (form.pptFile) {
      const pptData = new FormData();
      pptData.append("title", `${managingJournalName} PPT`);
      pptData.append("description", aboutJournal);
      pptData.append("pptFile", form.pptFile);

      await api.post(`/journals/${journalId}/ppts`, pptData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      messages.push("PPT uploaded.");
    }

    if (form.pdfFile) {
      const pdfData = new FormData();
      pdfData.append("pdfFile", form.pdfFile);
      await api.post(`/journals/${journalId}/pdf`, pdfData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      messages.push("PDF uploaded.");
    }

    if (form.videoFile) {
      const videoData = new FormData();
      videoData.append("title", `${managingJournalName} Video`);
      videoData.append("description", aboutJournal);
      videoData.append("videoFile", form.videoFile);
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

      const response = await api[editingJournalId ? "put" : "post"](
        editingJournalId ? `/journals/${editingJournalId}` : "/journals",
        payload
      );
      const savedJournal = normalizeItem(response.data);
      const mediaMessages = await attachJournalMedia(
        savedJournal.id,
        journalForm,
        payload.managingJournalName,
        payload.aboutJournal
      ).catch((error) => [`Media upload warning: ${error.response?.data?.message || error.message}`]);

      setJournalStatus(
        `${editingJournalId ? "Journal updated" : "User and journal created"} successfully. ${mediaMessages.join(" ")}`.trim()
      );

      setEditingJournalId("");
      setJournalForm(initialJournalForm);
      await Promise.all([loadUsers(), loadJournals()]);
    } catch (error) {
      setJournalStatus(error.response?.data?.message || "Journal save failed.");
    }
  };

  const deleteJournal = async (journalId) => {
    setJournalStatus("");

    try {
      await api.delete(`/journals/${journalId}`);
      setJournals((current) => current.filter((item) => item.id !== journalId));
      setEditingJournalId((current) => (current === journalId ? "" : current));
      setJournalForm((current) => (editingJournalId === journalId ? initialJournalForm : current));
      await loadUsers();
      setJournalStatus("Journal deleted successfully.");
    } catch (error) {
      setJournalStatus(error.response?.data?.message || "Journal delete failed.");
    }
  };

  const submitTestimonial = async (event) => {
    event.preventDefault();
    setTestimonialStatus("");

    try {
      const formData = new FormData();
      formData.append("name", testimonialForm.name);
      formData.append("designation", testimonialForm.designation);
      formData.append("message", testimonialForm.message);

      if (testimonialForm.image) {
        formData.append("image", testimonialForm.image);
      }

      const response = await api[editingTestimonialId ? "put" : "post"](
        editingTestimonialId ? `/testimonials/${editingTestimonialId}` : "/testimonials",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" }
        }
      );

      const savedTestimonial = normalizeItem(response.data);

      if (editingTestimonialId) {
        setTestimonials((current) => current.map((item) => (item.id === editingTestimonialId ? savedTestimonial : item)));
        setTestimonialStatus("Testimonial updated successfully.");
      } else {
        setTestimonials((current) => [savedTestimonial, ...current]);
        setTestimonialStatus("Testimonial created successfully.");
      }

      setEditingTestimonialId("");
      setTestimonialForm(initialTestimonialForm);
    } catch (error) {
      setTestimonialStatus(error.response?.data?.message || "Testimonial save failed.");
    }
  };

  const deleteTestimonial = async (testimonialId) => {
    setTestimonialStatus("");

    try {
      await api.delete(`/testimonials/${testimonialId}`);
      setTestimonials((current) => current.filter((item) => item.id !== testimonialId));
      setTestimonialStatus("Testimonial deleted successfully.");
    } catch (error) {
      setTestimonialStatus(error.response?.data?.message || "Testimonial delete failed.");
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

  const submitUser = async (event) => {
    event.preventDefault();
    setUserStatus("");

    if (!editingUserId) {
      setUserStatus("Create the user and journal together from the journal management section.");
      return;
    }

    try {
      const payload = {
        firstName: userForm.firstName,
        lastName: userForm.lastName,
        username: userForm.username,
        ...(userForm.password ? { password: userForm.password } : {})
      };

      const baseUrl = "/super/users";
      await api.put(`${baseUrl}/${editingUserId}`, payload);
      setUserStatus("User updated successfully.");
      setEditingUserId("");
      setUserForm(initialUserForm);
      setUserEditorOpen(false);
      await Promise.all([loadUsers(), loadJournals()]);
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
      setJournals((current) => current.filter((item) => item.ownerUserId?.toString() !== targetUser.id.toString()));
      setSelectedUserId((current) => (current === targetUser.id ? "" : current));
      setRevealedPasswords((current) => {
        const next = { ...current };
        delete next[targetUser.id];
        return next;
      });
      setEditingUserId((current) => (current === targetUser.id ? "" : current));
      setUserEditorOpen((current) => (editingUserId === targetUser.id ? false : current));
      setUserStatus(`User "${targetUser.username}" deleted successfully.`);
      await loadUsers();
    } catch (error) {
      setUserStatus(error.response?.data?.message || "User delete failed.");
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

  return (
    <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {isSuperPortal ? (
        <section id="welcome" className="card-panel p-6 sm:p-8">
          <SectionHeader
            label="Welcome"
            title="Super user control center"
            description="Review every user account, enter user sessions safely, and manage journal and testimonial operations from one privileged workspace."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-brand-border bg-brand-elevated p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-brand-gold">Users in view</p>
              <p className="mt-3 text-3xl font-semibold text-brand-ink">{userMeta.total}</p>
            </div>
            <div className="rounded-3xl border border-brand-border bg-brand-elevated p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-brand-gold">Journal records</p>
              <p className="mt-3 text-3xl font-semibold text-brand-ink">{journals.length}</p>
            </div>
            <div className="rounded-3xl border border-brand-border bg-brand-elevated p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-brand-gold">Testimonials</p>
              <p className="mt-3 text-3xl font-semibold text-brand-ink">{testimonials.length}</p>
            </div>
          </div>
        </section>
      ) : null}

      <section id="journals" className="card-panel p-6 sm:p-8">
        <SectionHeader
          label="Journals"
          title={canManageAll ? "Journal management" : "Your journals"}
          description={
            canManageAll
              ? "Create a journal and its linked user in one form. Updating a journal also updates the linked user credentials."
              : "Manage only the journals linked to your user account, including optional PPT, PDF, and video uploads."
          }
        />

        {canManageAll && selectedUser ? (
          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-3xl border border-brand-border bg-brand-elevated px-5 py-4">
            <p className="text-sm text-brand-ink">
              Filtering journals for <span className="font-semibold">{selectedUser.username}</span>
            </p>
            <button type="button" className="button-secondary px-4 py-2" onClick={() => setSelectedUserId("")}>
              Clear Filter
            </button>
          </div>
        ) : null}

        <div className="mt-8 grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-3xl border border-brand-border bg-brand-elevated p-6">
            <SectionHeader
              label="Journal Form"
              title={editingJournalId ? "Update journal" : "Add journal"}
              description="Only the required journal and linked-user fields are kept here. Re-enter the password whenever you update a journal."
            />
            <form onSubmit={submitJournal} className="mt-6 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  value={journalForm.firstName}
                  onChange={(event) => setJournalForm({ ...journalForm, firstName: event.target.value })}
                  placeholder="First Name"
                  required
                />
                <input
                  value={journalForm.lastName}
                  onChange={(event) => setJournalForm({ ...journalForm, lastName: event.target.value })}
                  placeholder="Last Name"
                  required
                />
              </div>
              <input
                value={journalForm.managingJournalName}
                onChange={(event) => setJournalForm({ ...journalForm, managingJournalName: event.target.value })}
                placeholder="Managing Journal Name"
                required
              />
              <input
                value={journalForm.journalDomainName}
                onChange={(event) => setJournalForm({ ...journalForm, journalDomainName: event.target.value })}
                placeholder="Journal Domain Name"
                required
              />
              <input
                value={journalForm.journalUrl}
                onChange={(event) => setJournalForm({ ...journalForm, journalUrl: event.target.value })}
                placeholder="Enter Journal URL"
                required
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  value={journalForm.username}
                  onChange={(event) => setJournalForm({ ...journalForm, username: event.target.value })}
                  placeholder="User Name"
                  required
                />
                <input
                  value={journalForm.password}
                  onChange={(event) => setJournalForm({ ...journalForm, password: event.target.value })}
                  placeholder="Password"
                  type="password"
                  required
                />
              </div>
              <textarea
                value={journalForm.aboutJournal}
                onChange={(event) => setJournalForm({ ...journalForm, aboutJournal: event.target.value })}
                placeholder="About Journal"
                rows="5"
                required
              />
              <textarea
                value={journalForm.journalInstructions}
                onChange={(event) => setJournalForm({ ...journalForm, journalInstructions: event.target.value })}
                placeholder="Journal Instructions"
                rows="5"
                required
              />
              <div className="rounded-3xl border border-brand-border bg-brand-surface p-5">
                <p className="text-sm font-semibold text-brand-ink">Optional Uploads</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-brand-slate">PPT</label>
                    <input
                      type="file"
                      accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                      onChange={(event) => setJournalForm({ ...journalForm, pptFile: event.target.files?.[0] || null })}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-brand-slate">PDF</label>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(event) => setJournalForm({ ...journalForm, pdfFile: event.target.files?.[0] || null })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-brand-slate">Video</label>
                    <input type="file" accept="video/*" onChange={(event) => setJournalForm({ ...journalForm, videoFile: event.target.files?.[0] || null })} />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="submit" className="button-primary">
                  {editingJournalId ? "Update Journal" : "Add User & Journal"}
                </button>
                {editingJournalId ? (
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => {
                      setEditingJournalId("");
                      setJournalForm(initialJournalForm);
                    }}
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
              {journalStatus ? <p className="text-sm text-brand-slate">{journalStatus}</p> : null}
            </form>
          </div>

          <div className="space-y-4">
            {visibleJournals.length ? (
              visibleJournals.map((journal) => (
                <div key={journal.id} className="rounded-3xl border border-brand-border bg-brand-surface p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-brand-ink">{journal.managingJournalName}</h3>
                      <p className="mt-1 text-sm text-brand-slate">{journal.journalDomainName}</p>
                      <p className="mt-1 text-sm text-brand-slate">URL: {journal.journalUrl}</p>
                      <p className="mt-3 text-sm text-brand-slate">
                        Owner: {journal.firstName} {journal.lastName}
                        {journal.username || journal.ownerUsername ? ` (@${journal.username || journal.ownerUsername})` : ""}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-brand-slate">{journal.aboutJournal}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="button-soft px-4 py-2"
                        onClick={() => {
                          setEditingJournalId(journal.id);
                          setJournalForm(mapJournalToForm(journal));
                        }}
                      >
                        <Pencil size={16} className="mr-2" />
                        Edit
                      </button>
                      <button
                        type="button"
                        className="button-secondary px-4 py-2 text-rose-600"
                        onClick={() => deleteJournal(journal.id)}
                      >
                        <Trash2 size={16} className="mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title={canManageAll ? "No journals available" : "No journals in your account"}
                description={
                  canManageAll
                    ? "Add a journal here and the linked user account will be created automatically."
                    : "Create your first journal or ask an admin to assign one to your account."
                }
              />
            )}
          </div>
        </div>
      </section>

      {isSuperPortal ? (
        <section id="users" className="card-panel p-6 sm:p-8">
        <SectionHeader
          label="Users"
          title="Super user users list"
          description="Search, sort, paginate, reveal passwords directly, edit existing accounts, delete users, and impersonate a user directly from this privileged table."
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

              <button
                type="button"
                className="button-primary px-4 py-2"
                onClick={() => document.getElementById("journals")?.scrollIntoView({ behavior: "smooth", block: "start" })}
              >
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
                            <button type="button" className="button-secondary min-h-10 px-3 py-2 text-rose-300" onClick={() => deleteUser(item)}>
                              <Trash2 size={16} />
                            </button>
                            <button
                              type="button"
                              className="button-secondary min-h-10 px-3 py-2"
                              onClick={() => {
                                setSelectedUserId(item.id);
                                navigate("/superuser/journals");
                              }}
                            >
                              View Journal
                            </button>
                            <button type="button" className="button-primary min-h-10 px-3 py-2" onClick={() => impersonateUser(item.id)}>
                              <LogIn size={16} className="mr-2" />
                              Login as User
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

            {userStatus ? <p className="text-sm text-brand-slate">{userStatus}</p> : null}
          </div>
        </section>
      ) : null}

      {canManageAll ? (
        <section id="testimonials" className="card-panel p-6 sm:p-8">
          <SectionHeader
            label="Testimonials"
            title="Testimonials management"
            description="Create, update, and delete testimonials shown on the public website."
          />
          <div className="mt-8 grid gap-8 xl:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-3xl border border-brand-border bg-brand-elevated p-6">
              <form onSubmit={submitTestimonial} className="grid gap-4">
                <input
                  value={testimonialForm.name}
                  onChange={(event) => setTestimonialForm({ ...testimonialForm, name: event.target.value })}
                  placeholder="Name"
                  required
                />
                <input
                  value={testimonialForm.designation}
                  onChange={(event) => setTestimonialForm({ ...testimonialForm, designation: event.target.value })}
                  placeholder="Designation (optional)"
                />
                <textarea
                  value={testimonialForm.message}
                  onChange={(event) => setTestimonialForm({ ...testimonialForm, message: event.target.value })}
                  placeholder="Message"
                  rows="5"
                  required
                />
                <div>
                  <label className="mb-2 block text-sm font-medium text-brand-slate">Image (optional)</label>
                  <input type="file" accept="image/*" onChange={(event) => setTestimonialForm({ ...testimonialForm, image: event.target.files?.[0] || null })} />
                </div>
                <div className="flex flex-wrap gap-3">
                  <button type="submit" className="button-primary">
                    {editingTestimonialId ? "Update Testimonial" : "Add Testimonial"}
                  </button>
                  {editingTestimonialId ? (
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={() => {
                        setEditingTestimonialId("");
                        setTestimonialForm(initialTestimonialForm);
                      }}
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
                {testimonialStatus ? <p className="text-sm text-brand-slate">{testimonialStatus}</p> : null}
              </form>
            </div>

            <div className="space-y-4">
              {testimonials.length ? (
                testimonials.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-brand-border bg-brand-surface p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-brand-ink">{item.name}</h3>
                        {item.designation ? <p className="mt-1 text-sm text-brand-slate">{item.designation}</p> : null}
                        <p className="mt-3 text-sm leading-7 text-brand-slate">"{item.message}"</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="button-soft px-4 py-2"
                          onClick={() => {
                            setEditingTestimonialId(item.id);
                            setTestimonialForm(mapTestimonialToForm(item));
                          }}
                        >
                          Edit
                        </button>
                        <button type="button" className="button-secondary px-4 py-2 text-rose-600" onClick={() => deleteTestimonial(item.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState title="No testimonials yet" description="Add testimonials here and they will appear on the public website." />
              )}
            </div>
          </div>
        </section>
      ) : null}

      {isSuperPortal && userEditorOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
          <form onSubmit={submitUser} className="card-panel w-full max-w-xl p-6">
            <SectionHeader
              label="Users"
              title="Edit user"
              description="Update the linked user account details for an existing journal."
            />

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <input
                value={userForm.firstName}
                onChange={(event) => setUserForm((current) => ({ ...current, firstName: event.target.value }))}
                placeholder="First Name"
                required
              />
              <input
                value={userForm.lastName}
                onChange={(event) => setUserForm((current) => ({ ...current, lastName: event.target.value }))}
                placeholder="Last Name"
                required
              />
              <input
                className="sm:col-span-2"
                value={userForm.username}
                onChange={(event) => setUserForm((current) => ({ ...current, username: event.target.value }))}
                placeholder="User Name"
                required
              />
              <input
                className="sm:col-span-2"
                value={userForm.password}
                onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="New Password (optional)"
                type="password"
                required={false}
              />
            </div>

            {userStatus ? <p className="mt-4 text-sm text-brand-slate">{userStatus}</p> : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <button type="submit" className="button-primary">
                Update User
              </button>
              <button
                type="button"
                className="button-secondary"
                onClick={() => {
                  setEditingUserId("");
                  setUserForm(initialUserForm);
                  setUserEditorOpen(false);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}

    </div>
  );
}
