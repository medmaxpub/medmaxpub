import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api, { shouldUseDevelopmentFallback, withFallback } from "../../api/client";
import EmptyState from "../../components/common/EmptyState";
import SectionHeader from "../../components/common/SectionHeader";
import { useAuth } from "../../context/AuthContext";
import { mockJournals, mockTestimonials } from "../../data/mockData";

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

export default function AdminDashboardPage() {
  const { beginImpersonation, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [journals, setJournals] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [editingJournalId, setEditingJournalId] = useState("");
  const [editingTestimonialId, setEditingTestimonialId] = useState("");
  const [journalForm, setJournalForm] = useState(initialJournalForm);
  const [testimonialForm, setTestimonialForm] = useState(initialTestimonialForm);
  const [revealedPasswords, setRevealedPasswords] = useState({});
  const [passwordPrompt, setPasswordPrompt] = useState({ open: false, userId: "", adminPassword: "", error: "" });
  const [journalStatus, setJournalStatus] = useState("");
  const [userStatus, setUserStatus] = useState("");
  const [testimonialStatus, setTestimonialStatus] = useState("");
  const isAdmin = user?.role === "admin";
  const useDevelopmentFallback = shouldUseDevelopmentFallback();

  const loadUsers = async () => {
    const data = await withFallback(() => api.get("/admin/users"), useDevelopmentFallback ? [] : []);
    setUsers(data.map(normalizeItem));
  };

  const loadJournals = async () => {
    const data = await withFallback(() => api.get("/admin/journals"), useDevelopmentFallback ? mockJournals : []);
    setJournals(data.map(normalizeItem));
  };

  const loadTestimonials = async () => {
    const data = await withFallback(() => api.get("/testimonials"), useDevelopmentFallback ? mockTestimonials : []);
    setTestimonials(data.map(normalizeItem));
  };

  useEffect(() => {
    loadUsers();
    loadJournals();
    loadTestimonials();
  }, [useDevelopmentFallback]);

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
    const base = isAdmin ? journals : journals.filter((journal) => journal.ownerUserId?.toString() === user?.id?.toString());

    if (isAdmin && selectedUserId) {
      return base.filter((journal) => journal.ownerUserId?.toString() === selectedUserId.toString());
    }

    return base;
  }, [isAdmin, journals, selectedUserId, user?.id]);

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
        `${editingJournalId ? "Journal updated" : "Journal created"} successfully. ${mediaMessages.join(" ")}`.trim()
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
    } catch (error) {
      setUserStatus(error.response?.data?.message || "Unable to impersonate this user.");
    }
  };

  const deleteUser = async (targetUser) => {
    setUserStatus("");

    const confirmed = window.confirm(
      `Delete user "${targetUser.username}" and all linked journals, issues, articles, PPTs, and videos?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/admin/users/${targetUser.id}`);
      setUsers((current) => current.filter((item) => item.id !== targetUser.id));
      setJournals((current) => current.filter((item) => item.ownerUserId?.toString() !== targetUser.id.toString()));
      setSelectedUserId((current) => (current === targetUser.id ? "" : current));
      setRevealedPasswords((current) => {
        const next = { ...current };
        delete next[targetUser.id];
        return next;
      });
      setUserStatus(`User "${targetUser.username}" deleted successfully.`);
    } catch (error) {
      setUserStatus(error.response?.data?.message || "User delete failed.");
    }
  };

  const confirmRevealPassword = async (event) => {
    event.preventDefault();

    try {
      const response = await api.post(`/admin/users/${passwordPrompt.userId}/reveal-password`, {
        adminPassword: passwordPrompt.adminPassword
      });
      setRevealedPasswords((current) => ({
        ...current,
        [passwordPrompt.userId]: response.data.password
      }));
      setPasswordPrompt({ open: false, userId: "", adminPassword: "", error: "" });
    } catch (error) {
      setPasswordPrompt((current) => ({
        ...current,
        error: error.response?.data?.message || "Password verification failed."
      }));
    }
  };

  return (
    <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section id="journals" className="card-panel p-6 sm:p-8">
        <SectionHeader
          label="Journals"
          title={isAdmin ? "Journal management" : "Your journals"}
          description={
            isAdmin
              ? "Create a journal and its linked user in one form. Updating a journal also updates the linked user credentials."
              : "Manage only the journals linked to your user account, including optional PPT, PDF, and video uploads."
          }
        />

        {isAdmin && selectedUser ? (
          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-3xl border border-brand-sky bg-brand-mist px-5 py-4">
            <p className="text-sm text-brand-ink">
              Filtering journals for <span className="font-semibold">{selectedUser.username}</span>
            </p>
            <button type="button" className="button-secondary px-4 py-2" onClick={() => setSelectedUserId("")}>
              Clear Filter
            </button>
          </div>
        ) : null}

        <div className="mt-8 grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
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
              <div className="rounded-3xl border border-brand-sky bg-white p-5">
                <p className="text-sm font-semibold text-brand-navy">Optional Uploads</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-600">PPT</label>
                    <input
                      type="file"
                      accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                      onChange={(event) => setJournalForm({ ...journalForm, pptFile: event.target.files?.[0] || null })}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-600">PDF</label>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(event) => setJournalForm({ ...journalForm, pdfFile: event.target.files?.[0] || null })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-600">Video</label>
                    <input type="file" accept="video/*" onChange={(event) => setJournalForm({ ...journalForm, videoFile: event.target.files?.[0] || null })} />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="submit" className="button-primary">
                  {editingJournalId ? "Update Journal" : "Add Journal"}
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
              {journalStatus ? <p className="text-sm text-slate-500">{journalStatus}</p> : null}
            </form>
          </div>

          <div className="space-y-4">
            {visibleJournals.length ? (
              visibleJournals.map((journal) => (
                <div key={journal.id} className="rounded-3xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-brand-navy">{journal.managingJournalName}</h3>
                      <p className="mt-1 text-sm text-slate-500">{journal.journalDomainName}</p>
                      <p className="mt-1 text-sm text-slate-500">URL: {journal.journalUrl}</p>
                      <p className="mt-3 text-sm text-slate-500">
                        Owner: {journal.firstName} {journal.lastName}
                        {journal.username || journal.ownerUsername ? ` (@${journal.username || journal.ownerUsername})` : ""}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{journal.aboutJournal}</p>
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
                title={isAdmin ? "No journals available" : "No journals in your account"}
                description={
                  isAdmin
                    ? "Add a journal here and the linked user account will be created automatically."
                    : "Create your first journal or ask an admin to assign one to your account."
                }
              />
            )}
          </div>
        </div>
      </section>

      {isAdmin ? (
        <section id="users" className="card-panel p-6 sm:p-8">
          <SectionHeader
            label="Users"
            title="Journal-linked users"
            description="These user accounts are created from journal credentials. Use View Journals to filter the Journals module or Login as User to enter that user's dashboard."
          />

          <div className="mt-8 space-y-4">
            {users.length ? (
              users.map((item) => (
                <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-brand-navy">
                        {item.firstName} {item.lastName}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">@{item.username}</p>
                      <p className="mt-2 text-sm text-slate-500">
                        {item.managingJournalName || "No linked journal yet."}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="button-soft px-4 py-2"
                        onClick={() => {
                          setSelectedUserId(item.id);
                          navigate("/admin/dashboard#journals");
                        }}
                      >
                        View Journals
                      </button>
                      <button type="button" className="button-secondary px-4 py-2" onClick={() => impersonateUser(item.id)}>
                        Login as User
                      </button>
                      <button
                        type="button"
                        className="button-secondary px-4 py-2 text-rose-600"
                        onClick={() => deleteUser(item)}
                      >
                        <Trash2 size={16} className="mr-2" />
                        Delete User
                      </button>
                      {revealedPasswords[item.id] ? (
                        <button
                          type="button"
                          className="button-soft px-4 py-2"
                          onClick={() =>
                            setRevealedPasswords((current) => {
                              const next = { ...current };
                              delete next[item.id];
                              return next;
                            })
                          }
                        >
                          <EyeOff size={16} className="mr-2" />
                          Hide Password
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="button-soft px-4 py-2"
                          onClick={() => setPasswordPrompt({ open: true, userId: item.id, adminPassword: "", error: "" })}
                        >
                          <Eye size={16} className="mr-2" />
                          View Password
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      Password: {revealedPasswords[item.id] || "******"}
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      Journals: {item.journals?.length || 0}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="No users available" description="Users will be created automatically when a journal is added." />
            )}
            {userStatus ? <p className="text-sm text-slate-500">{userStatus}</p> : null}
          </div>
        </section>
      ) : null}

      {isAdmin ? (
        <section id="testimonials" className="card-panel p-6 sm:p-8">
          <SectionHeader
            label="Testimonials"
            title="Testimonials management"
            description="Create, update, and delete testimonials shown on the public website."
          />
          <div className="mt-8 grid gap-8 xl:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
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
                  <label className="mb-2 block text-sm font-medium text-slate-600">Image (optional)</label>
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
                {testimonialStatus ? <p className="text-sm text-slate-500">{testimonialStatus}</p> : null}
              </form>
            </div>

            <div className="space-y-4">
              {testimonials.length ? (
                testimonials.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-brand-navy">{item.name}</h3>
                        {item.designation ? <p className="mt-1 text-sm text-slate-500">{item.designation}</p> : null}
                        <p className="mt-3 text-sm leading-7 text-slate-600">"{item.message}"</p>
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

      {passwordPrompt.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <form onSubmit={confirmRevealPassword} className="card-panel w-full max-w-md p-6">
            <SectionHeader
              label="Verification"
              title="Confirm admin password"
              description="The stored user password is only revealed after successful admin verification."
            />
            <input
              className="mt-6"
              value={passwordPrompt.adminPassword}
              onChange={(event) => setPasswordPrompt((current) => ({ ...current, adminPassword: event.target.value, error: "" }))}
              placeholder="Enter your admin password"
              type="password"
              required
            />
            {passwordPrompt.error ? <p className="mt-3 text-sm text-rose-500">{passwordPrompt.error}</p> : null}
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="submit" className="button-primary">
                Verify and Reveal
              </button>
              <button
                type="button"
                className="button-secondary"
                onClick={() => setPasswordPrompt({ open: false, userId: "", adminPassword: "", error: "" })}
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
