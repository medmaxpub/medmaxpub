import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";
import EmptyState from "../../components/common/EmptyState";
import SectionHeader from "../../components/common/SectionHeader";
import useManagedJournal from "../../hooks/useManagedJournal";

function stripHtml(value) {
  return String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export default function UserEditorialBoardPage() {
  const navigate = useNavigate();
  const { journal, loading: journalLoading, error: journalError } = useManagedJournal();
  const [members, setMembers] = useState([]);
  const [status, setStatus] = useState("");

  const loadMembers = async () => {
    try {
      const response = await api.get("/user/editorial-board");
      setMembers(response.data || []);
    } catch (error) {
      setMembers([]);
      setStatus(error.response?.data?.message || "Unable to load editorial board members.");
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const deleteMember = async (member) => {
    const confirmed = window.confirm(`Delete editorial board member "${member.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/user/editorial-board/${member.id}`);
      setStatus("Editorial board member deleted successfully.");
      await loadMembers();
    } catch (error) {
      setStatus(error.response?.data?.message || "Editorial board delete failed.");
    }
  };

  if (journalLoading) {
    return null;
  }

  return (
    <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="card-panel p-6 sm:p-8">
        <SectionHeader label="Editorial Board" />

        <div className="mt-8 flex flex-col gap-4 border-b border-brand-border pb-5 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-2xl font-semibold text-brand-ink">List Of Editorialboard Members:</h3>
          <button type="button" className="button-primary px-4 py-2" onClick={() => navigate("/user/editorial-board/add")}>
            <Plus size={16} className="mr-2" />
            Add Member
          </button>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-brand-border bg-brand-surface">
          <div className="responsive-table-shell">
            <table className="responsive-table text-left">
              <thead className="bg-brand-elevated text-brand-ink">
                <tr className="border-b border-brand-border">
                  <th className="px-4 py-4 font-semibold">Sno</th>
                  <th className="px-4 py-4 font-semibold">Editor Type</th>
                  <th className="px-4 py-4 font-semibold">Editor Information</th>
                  <th className="px-4 py-4 font-semibold">Photo</th>
                  <th className="px-4 py-4 font-semibold">Edit</th>
                  <th className="px-4 py-4 font-semibold">Delete</th>
                </tr>
              </thead>
              <tbody>
                {members.length ? (
                  members.map((member, index) => (
                    <tr key={member.id} className="border-b border-brand-border/60 text-brand-slate align-top">
                      <td className="px-4 py-5">{index + 1}</td>
                      <td className="px-4 py-5">{member.editorType || "Editor"}</td>
                      <td className="px-4 py-5">
                        <p className="font-medium text-brand-ink">{member.name}</p>
                        {member.editorDescription ? <p className="mt-2 max-w-2xl leading-6">{stripHtml(member.editorDescription)}</p> : null}
                        {member.profileUrl ? (
                          <a href={member.profileUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-brand-teal hover:text-brand-ink">
                            {member.profileUrl}
                          </a>
                        ) : null}
                      </td>
                      <td className="px-4 py-5">
                        {member.profileImageUrl ? (
                          <img src={member.profileImageUrl} alt={member.name} className="h-24 w-20 rounded-xl border border-brand-border object-cover" />
                        ) : (
                          <div className="flex h-24 w-20 items-center justify-center rounded-xl border border-brand-border bg-brand-elevated text-brand-slate">
                            NA
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-5">
                        <button
                          type="button"
                          className="rounded-xl border border-brand-border bg-brand-elevated p-3 text-brand-ink hover:border-brand-teal hover:bg-brand-sky"
                          onClick={() => navigate(`/user/editorial-board/${member.id}/edit`)}
                        >
                          <Pencil size={16} />
                        </button>
                      </td>
                      <td className="px-4 py-5">
                        <button
                          type="button"
                          className="rounded-xl border border-brand-border bg-brand-elevated p-3 text-rose-300 hover:border-rose-400 hover:bg-rose-950/30"
                          onClick={() => deleteMember(member)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-10">
                      <EmptyState
                        title="No editorial board members yet"
                        description="Use the Add Member button to create the first editorial board record for this journal."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {status ? <p className="mt-4 text-sm text-brand-slate">{status}</p> : null}
      </section>
    </div>
  );
}
