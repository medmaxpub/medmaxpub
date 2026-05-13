import { Plus } from "lucide-react";
import { useState } from "react";
import api from "../../api/client";
import JournalEditorModal from "../super/JournalEditorModal";
import { initialJournalForm, normalizeItem } from "../super/superUserShared";
import { useAuth } from "../../context/AuthContext";

export default function UserJournalCreateAction({ className = "button-primary px-4 py-2", label = "Add Journal", onCreated }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    ...initialJournalForm,
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    username: user?.userName || ""
  });

  const openEditor = () => {
    setForm({
      ...initialJournalForm,
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      username: user?.userName || ""
    });
    setStatus("");
    setOpen(true);
  };

  const closeEditor = () => {
    setOpen(false);
    setStatus("");
  };

  const attachJournalMedia = async (journalId) => {
    const messages = [];

    if (form.pptFile) {
      const pptData = new FormData();
      pptData.append("title", `${form.managingJournalName} PPT`);
      pptData.append("description", form.aboutJournal);
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
      videoData.append("title", `${form.managingJournalName} Video`);
      videoData.append("description", form.aboutJournal);
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
    setStatus("");

    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        managingJournalName: form.managingJournalName,
        journalDomainName: form.journalDomainName,
        journalUrl: form.journalUrl,
        aboutJournal: form.aboutJournal,
        journalInstructions: form.journalInstructions
      };

      const response = await api.post("/journals", payload);
      const savedJournal = normalizeItem(response.data);
      const mediaMessages = await attachJournalMedia(savedJournal.id).catch((error) => [
        `Media upload warning: ${error.response?.data?.message || error.message}`
      ]);
      const message = `Journal created successfully. ${mediaMessages.join(" ")}`.trim();

      setOpen(false);
      setForm({
        ...initialJournalForm,
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        username: user?.userName || ""
      });

      if (onCreated) {
        await onCreated(savedJournal, message);
      }
    } catch (error) {
      setStatus(error.response?.data?.message || "Journal save failed.");
    }
  };

  return (
    <>
      <button type="button" className={className} onClick={openEditor}>
        <Plus size={16} className="mr-2" />
        {label}
      </button>

      <JournalEditorModal
        open={open}
        modeLabel="Add journal to your account"
        form={form}
        setForm={setForm}
        status={status}
        onSubmit={submitJournal}
        onClose={closeEditor}
        ownerNotice={
          user?.userName
            ? `Journal will be added to your account @${user.userName}.`
            : "Journal will be added to your account."
        }
      />
    </>
  );
}
