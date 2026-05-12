import { Bold, Italic, Link2, List, ListOrdered, Underline } from "lucide-react";
import { useEffect, useRef } from "react";

const toolbarActions = [
  { icon: Bold, label: "Bold", command: "bold" },
  { icon: Italic, label: "Italic", command: "italic" },
  { icon: Underline, label: "Underline", command: "underline" },
  { icon: List, label: "Bullets", command: "insertUnorderedList" },
  { icon: ListOrdered, label: "Numbered List", command: "insertOrderedList" }
];

export default function RichTextEditor({ label, value, onChange, required = false, placeholder = "" }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current || editorRef.current.innerHTML === value) {
      return;
    }

    editorRef.current.innerHTML = value || "";
  }, [value]);

  const applyCommand = (command) => {
    editorRef.current?.focus();
    document.execCommand(command, false);
    onChange(editorRef.current?.innerHTML || "");
  };

  const addLink = () => {
    const url = window.prompt("Enter a link URL");

    if (!url) {
      return;
    }

    editorRef.current?.focus();
    document.execCommand("createLink", false, url);
    onChange(editorRef.current?.innerHTML || "");
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-brand-slate">
        {label}
        {required ? " *" : ""}
      </label>
      <div className="rich-editor-shell">
        <div className="rich-editor-toolbar">
          {toolbarActions.map((action) => (
            <button key={action.label} type="button" className="rich-editor-button" onClick={() => applyCommand(action.command)}>
              <action.icon size={15} />
              {action.label}
            </button>
          ))}
          <button type="button" className="rich-editor-button" onClick={addLink}>
            <Link2 size={15} />
            Link
          </button>
        </div>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="rich-editor-surface"
          data-placeholder={placeholder}
          onInput={(event) => onChange(event.currentTarget.innerHTML)}
        />
      </div>
    </div>
  );
}
