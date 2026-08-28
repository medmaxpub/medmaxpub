import {
  Anchor,
  Bold,
  CheckCheck,
  ClipboardPaste,
  Code2,
  Copy,
  Eye,
  FilePlus2,
  FileText,
  Frame,
  HelpCircle,
  Image as ImageIcon,
  IndentDecrease,
  IndentIncrease,
  Italic,
  LayoutGrid,
  Link2,
  List,
  ListOrdered,
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Maximize2,
  Minimize2,
  Minus,
  MoveLeft,
  MoveRight,
  Printer,
  Quote,
  Redo2,
  Replace as ReplaceIcon,
  Save as SaveIcon,
  Scissors,
  Search,
  SeparatorHorizontal,
  Smile,
  SpellCheck,
  Sparkles as SparklesIcon,
  Square,
  Table as TableIcon,
  Type,
  Underline,
  Undo2,
  Unlink,
  Zap
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const compactToolbarActions = [
  { icon: Bold, label: "Bold", command: "bold" },
  { icon: Italic, label: "Italic", command: "italic" },
  { icon: Underline, label: "Underline", command: "underline" },
  { icon: List, label: "Bullets", command: "insertUnorderedList" },
  { icon: ListOrdered, label: "Numbered List", command: "insertOrderedList" }
];

const fontOptions = ["Arial", "Georgia", "Times New Roman", "Verdana", "Tahoma", "Courier New"];
const fontSizeOptions = [
  { label: "8", value: "1" },
  { label: "10", value: "2" },
  { label: "12", value: "3" },
  { label: "14", value: "4" },
  { label: "18", value: "5" },
  { label: "24", value: "6" },
  { label: "32", value: "7" }
];
const styleOptions = [
  { label: "Styles", value: "" },
  { label: "Paragraph", value: "P" },
  { label: "Heading 1", value: "H1" },
  { label: "Heading 2", value: "H2" },
  { label: "Heading 3", value: "H3" },
  { label: "Heading 4", value: "H4" },
  { label: "Heading 5", value: "H5" },
  { label: "Heading 6", value: "H6" }
];
const formatOptions = [
  { label: "Format", value: "" },
  { label: "Normal", value: "P" },
  { label: "Preformatted", value: "PRE" },
  { label: "Address", value: "ADDRESS" },
  { label: "Quote", value: "BLOCKQUOTE" },
  { label: "Div Container", value: "DIV" }
];
const templateOptions = [
  { label: "Templates", value: "" },
  { label: "Section Heading", value: "<h2>Section Heading</h2><p>Start writing here...</p>" },
  { label: "Two Column Table", value: "<table><tbody><tr><th>Heading</th><th>Details</th></tr><tr><td>Item</td><td>Value</td></tr></tbody></table>" },
  { label: "Bullet Summary", value: "<h3>Key Points</h3><ul><li>Point one</li><li>Point two</li><li>Point three</li></ul>" },
  { label: "Citation Block", value: "<blockquote><p>Insert citation or highlighted content here.</p></blockquote>" }
];
const specialCharacters = ["©", "®", "™", "§", "¶", "•", "–", "—", "±", "µ", "∞", "≈", "≠", "≤", "≥", "α", "β", "γ", "Δ", "Ω"];
const smiles = ["😀", "🙂", "😉", "😍", "🎓", "📘", "📄", "⭐"];

function cleanWordHtml(value = "") {
  return String(value || "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s?class="[^"]*"/gi, "")
    .replace(/\s?style="[^"]*"/gi, "")
    .replace(/<o:p>\s*<\/o:p>/gi, "")
    .replace(/<o:p>[\s\S]*?<\/o:p>/gi, "&nbsp;")
    .replace(/<\/?span[^>]*>/gi, "")
    .replace(/<\/?font[^>]*>/gi, "")
    .replace(/\s?lang="[^"]*"/gi, "");
}

function stripHtml(value = "") {
  return String(value || "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();
}

function normalizeUrl(url = "") {
  const trimmed = String(url || "").trim();

  if (!trimmed) {
    return "";
  }

  if (/^(https?:|mailto:|tel:|#)/i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export default function RichTextEditor({
  label,
  value,
  onChange,
  required = false,
  placeholder = "",
  toolbarPreset = "compact",
  minHeight = 180
}) {
  const editorRef = useRef(null);
  const [mode, setMode] = useState("design");
  const [isMaximized, setIsMaximized] = useState(false);
  const [showBlocks, setShowBlocks] = useState(false);
  const [spellCheckEnabled, setSpellCheckEnabled] = useState(true);
  const [savedMessage, setSavedMessage] = useState("");
  const isFullToolbar = toolbarPreset === "full";

  useEffect(() => {
    if (!editorRef.current || editorRef.current.innerHTML === value) {
      return;
    }

    editorRef.current.innerHTML = value || "";
  }, [value]);

  useEffect(() => {
    if (!savedMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setSavedMessage(""), 1500);
    return () => window.clearTimeout(timeoutId);
  }, [savedMessage]);

  const editorStyle = useMemo(() => ({ minHeight: `${minHeight}px` }), [minHeight]);
  const plainTextValue = useMemo(() => stripHtml(value), [value]);

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  const syncEditorValue = () => {
    onChange(editorRef.current?.innerHTML || "");
  };

  const runCommand = (command, commandValue = null) => {
    if (mode !== "design") {
      setMode("design");
    }

    focusEditor();
    document.execCommand("styleWithCSS", false, true);
    document.execCommand(command, false, commandValue);
    syncEditorValue();
  };

  const insertHtml = (html) => {
    if (!html) {
      return;
    }

    if (mode !== "design") {
      setMode("design");
    }

    focusEditor();
    document.execCommand("insertHTML", false, html);
    syncEditorValue();
  };

  const insertPlainText = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        runCommand("insertText", text);
        return;
      }
    } catch {
      // Fall through to prompt.
    }

    const fallbackText = window.prompt("Paste plain text");
    if (fallbackText) {
      runCommand("insertText", fallbackText);
    }
  };

  const insertWordContent = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        insertHtml(`<p>${cleanWordHtml(text).replace(/\n/g, "<br />")}</p>`);
        return;
      }
    } catch {
      // Fall through to prompt.
    }

    const pastedContent = window.prompt("Paste content from Word");
    if (pastedContent) {
      insertHtml(`<p>${cleanWordHtml(pastedContent).replace(/\n/g, "<br />")}</p>`);
    }
  };

  const addLink = () => {
    const url = normalizeUrl(window.prompt("Enter a link URL") || "");
    if (!url) {
      return;
    }

    runCommand("createLink", url);
  };

  const removeLink = () => {
    runCommand("unlink");
  };

  const addAnchor = () => {
    const anchorName = window.prompt("Enter anchor name");
    if (!anchorName) {
      return;
    }

    insertHtml(`<span id="${anchorName}" data-anchor="${anchorName}">${anchorName}</span>`);
  };

  const insertImage = () => {
    const url = normalizeUrl(window.prompt("Enter image URL") || "");
    if (!url) {
      return;
    }

    const altText = window.prompt("Enter image alt text") || "Inserted image";
    insertHtml(`<img src="${url}" alt="${altText}" />`);
  };

  const insertFlash = () => {
    const url = normalizeUrl(window.prompt("Enter Flash/SWF URL") || "");
    if (!url) {
      return;
    }

    insertHtml(
      `<div class="rich-embed-placeholder" data-embed-type="flash"><strong>Flash content:</strong> <a href="${url}" target="_blank" rel="noreferrer">${url}</a></div>`
    );
  };

  const insertTable = () => {
    const rows = Math.max(1, Number.parseInt(window.prompt("Number of rows", "2") || "2", 10) || 2);
    const columns = Math.max(1, Number.parseInt(window.prompt("Number of columns", "2") || "2", 10) || 2);
    const tableRows = Array.from({ length: rows }, (_, rowIndex) => {
      const cellTag = rowIndex === 0 ? "th" : "td";
      const cells = Array.from({ length: columns }, (_, columnIndex) => `<${cellTag}>${rowIndex === 0 ? `Heading ${columnIndex + 1}` : `Cell ${rowIndex}.${columnIndex + 1}`}</${cellTag}>`).join("");
      return `<tr>${cells}</tr>`;
    }).join("");

    insertHtml(`<table><tbody>${tableRows}</tbody></table>`);
  };

  const insertSmiley = () => {
    const smile = window.prompt(`Choose a smiley: ${smiles.join(" ")}`);
    if (smile) {
      runCommand("insertText", smile);
    }
  };

  const insertSpecialCharacter = () => {
    const character = window.prompt(`Choose a special character: ${specialCharacters.join(" ")}`);
    if (character) {
      runCommand("insertText", character);
    }
  };

  const insertPageBreak = () => {
    insertHtml('<hr data-page-break="true" class="rich-page-break" />');
  };

  const insertIframe = () => {
    const url = normalizeUrl(window.prompt("Enter iframe URL") || "");
    if (!url) {
      return;
    }

    insertHtml(`<iframe src="${url}" title="Embedded frame" width="100%" height="360" frameborder="0" allowfullscreen></iframe>`);
  };

  const performFind = () => {
    const query = window.prompt("Find text");
    if (query) {
      window.find(query);
    }
  };

  const performReplace = () => {
    const findValue = window.prompt("Find what?");
    if (!findValue) {
      return;
    }

    const replaceValue = window.prompt("Replace with") ?? "";
    const currentValue = editorRef.current?.innerHTML || "";
    const escapedFindValue = findValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const nextValue = currentValue.replace(new RegExp(escapedFindValue, "g"), replaceValue);

    if (editorRef.current) {
      editorRef.current.innerHTML = nextValue;
    }

    onChange(nextValue);
  };

  const handleSave = () => {
    syncEditorValue();
    setSavedMessage("Saved");
  };

  const handleSourceChange = (nextValue) => {
    onChange(nextValue);
  };

  const handlePreviewToggle = () => {
    setMode((current) => (current === "preview" ? "design" : "preview"));
  };

  const handleSourceToggle = () => {
    setMode((current) => (current === "source" ? "design" : "source"));
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "noopener,noreferrer,width=960,height=720");
    if (!printWindow) {
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Preview</title>
          <style>
            body { font-family: Georgia, serif; padding: 32px; line-height: 1.7; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 10px; }
            blockquote { border-left: 4px solid #94a3b8; margin: 16px 0; padding-left: 16px; color: #334155; }
          </style>
        </head>
        <body>${value || ""}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleNewPage = () => {
    insertPageBreak();
  };

  const handleTemplateInsert = (event) => {
    const html = event.target.value;
    if (!html) {
      return;
    }

    insertHtml(html);
    event.target.value = "";
  };

  const handleStyleSelect = (event) => {
    if (!event.target.value) {
      return;
    }

    runCommand("formatBlock", event.target.value);
    event.target.value = "";
  };

  const handleFormatSelect = (event) => {
    if (!event.target.value) {
      return;
    }

    runCommand("formatBlock", event.target.value);
    event.target.value = "";
  };

  const handleFontSelect = (event) => {
    if (!event.target.value) {
      return;
    }

    runCommand("fontName", event.target.value);
    event.target.value = "";
  };

  const handleFontSizeSelect = (event) => {
    if (!event.target.value) {
      return;
    }

    runCommand("fontSize", event.target.value);
    event.target.value = "";
  };

  const applyEditorColor = (command, valueToApply) => {
    if (!valueToApply) {
      return;
    }

    runCommand(command, valueToApply);
  };

  if (!isFullToolbar) {
    return (
      <div>
        {label ? (
          <label className="form-label" data-required={required ? "true" : undefined}>
            {label}
          </label>
        ) : null}
        <div className="rich-editor-shell">
          {required ? <input type="text" tabIndex={-1} className="sr-only" value={plainTextValue} onChange={() => {}} required /> : null}
          <div className="rich-editor-toolbar">
            {compactToolbarActions.map((action) => (
              <button key={action.label} type="button" className="rich-editor-button" onClick={() => runCommand(action.command)}>
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
            spellCheck={spellCheckEnabled}
            suppressContentEditableWarning
            className="rich-editor-surface"
            style={editorStyle}
            data-placeholder={placeholder}
            onInput={(event) => onChange(event.currentTarget.innerHTML)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`rich-editor-shell ${isMaximized ? "rich-editor-shell-maximized" : ""}`}>
      {required ? <input type="text" tabIndex={-1} className="sr-only" value={plainTextValue} onChange={() => {}} required /> : null}
      {label ? (
        <label className="form-label" data-required={required ? "true" : undefined}>
          {label}
        </label>
      ) : null}

      <div className="rich-editor-toolbar rich-editor-toolbar-full">
        <div className="rich-editor-toolbar-group">
          <button type="button" className="rich-editor-button rich-editor-icon-only" title="Source" aria-label="Source" onClick={handleSourceToggle}>
            <Code2 size={16} />
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-only" title="Save" aria-label="Save" onClick={handleSave}>
            <SaveIcon size={16} />
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-only" title="New Page" aria-label="New Page" onClick={handleNewPage}>
            <FilePlus2 size={16} />
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-only" title="Preview" aria-label="Preview" onClick={handlePreviewToggle}>
            <Eye size={16} />
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-only" title="Print" aria-label="Print" onClick={handlePrint}>
            <Printer size={16} />
          </button>
          <select className="rich-editor-select" defaultValue="" onChange={handleTemplateInsert} title="Templates">
            {templateOptions.map((item) => (
              <option key={item.label} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="rich-editor-toolbar-group">
          <button type="button" className="rich-editor-button rich-editor-icon-only" title="Cut" aria-label="Cut" onClick={() => runCommand("cut")}>
            <Scissors size={16} />
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-only" title="Copy" aria-label="Copy" onClick={() => runCommand("copy")}>
            <Copy size={16} />
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-only" title="Paste" aria-label="Paste" onClick={() => runCommand("paste")}>
            <ClipboardPaste size={16} />
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-only" title="Paste as plain text" aria-label="Paste as plain text" onClick={insertPlainText}>
            <Type size={16} />
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-only" title="Paste from Word" aria-label="Paste from Word" onClick={insertWordContent}>
            <FileText size={16} />
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-only" title="Undo" aria-label="Undo" onClick={() => runCommand("undo")}>
            <Undo2 size={16} />
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-only" title="Redo" aria-label="Redo" onClick={() => runCommand("redo")}>
            <Redo2 size={16} />
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-only" title="Find" aria-label="Find" onClick={performFind}>
            <Search size={16} />
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-only" title="Replace" aria-label="Replace" onClick={performReplace}>
            <ReplaceIcon size={16} />
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-only" title="Select All" aria-label="Select All" onClick={() => runCommand("selectAll")}>
            <CheckCheck size={16} />
          </button>
          <button
            type="button"
            className="rich-editor-button rich-editor-icon-only"
            title="Toggle Spell Check"
            aria-label="Toggle Spell Check"
            onClick={() => setSpellCheckEnabled((current) => !current)}
          >
            <SpellCheck size={16} />
          </button>
        </div>

        <div className="rich-editor-toolbar-group">
          <button type="button" className="rich-editor-button rich-editor-icon-button" title="Bold" aria-label="Bold" onClick={() => runCommand("bold")}>
            <b>B</b>
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-button" title="Italic" aria-label="Italic" onClick={() => runCommand("italic")}>
            <i>I</i>
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-button" title="Underline" aria-label="Underline" onClick={() => runCommand("underline")}>
            <u>U</u>
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-button" title="Strikethrough" aria-label="Strikethrough" onClick={() => runCommand("strikeThrough")}>
            <s>S</s>
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-button" title="Subscript" aria-label="Subscript" onClick={() => runCommand("subscript")}>
            X<sub>2</sub>
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-button" title="Superscript" aria-label="Superscript" onClick={() => runCommand("superscript")}>
            X<sup>2</sup>
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-button" title="Clear formatting" aria-label="Clear formatting" onClick={() => runCommand("removeFormat")}>
            T<span className="rich-editor-clear-x">x</span>
          </button>
          <label className="rich-editor-color" title="Text color">
            <span className="rich-editor-icon-button" aria-hidden="true">A</span>
            <input type="color" defaultValue="#0f172a" onChange={(event) => applyEditorColor("foreColor", event.target.value)} />
          </label>
          <label className="rich-editor-color" title="Highlight color">
            <span className="rich-editor-icon-button" aria-hidden="true">H</span>
            <input type="color" defaultValue="#fff59d" onChange={(event) => applyEditorColor("hiliteColor", event.target.value)} />
          </label>
        </div>

        <div className="rich-editor-toolbar-group">
          <button type="button" className="rich-editor-button rich-editor-icon-only" title="Numbered List" aria-label="Numbered List" onClick={() => runCommand("insertOrderedList")}>
            <ListOrdered size={16} />
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-only" title="Bullet List" aria-label="Bullet List" onClick={() => runCommand("insertUnorderedList")}>
            <List size={16} />
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-only" title="Outdent" aria-label="Outdent" onClick={() => runCommand("outdent")}>
            <IndentDecrease size={16} />
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-only" title="Indent" aria-label="Indent" onClick={() => runCommand("indent")}>
            <IndentIncrease size={16} />
          </button>
          <button
            type="button"
            className="rich-editor-button rich-editor-icon-only"
            title="Quote"
            aria-label="Quote"
            onClick={() => runCommand("formatBlock", "BLOCKQUOTE")}
          >
            <Quote size={16} />
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-only" title="Div Container" aria-label="Div Container" onClick={() => runCommand("formatBlock", "DIV")}>
            <Square size={16} />
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-only" title="Align Left" aria-label="Align Left" onClick={() => runCommand("justifyLeft")}>
            <AlignLeft size={16} />
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-only" title="Align Center" aria-label="Align Center" onClick={() => runCommand("justifyCenter")}>
            <AlignCenter size={16} />
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-only" title="Align Right" aria-label="Align Right" onClick={() => runCommand("justifyRight")}>
            <AlignRight size={16} />
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-only" title="Justify" aria-label="Justify" onClick={() => runCommand("justifyFull")}>
            <AlignJustify size={16} />
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-only" title="Left to Right" aria-label="Left to Right" onClick={() => runCommand("direction", "ltr")}>
            <MoveRight size={16} />
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-only" title="Right to Left" aria-label="Right to Left" onClick={() => runCommand("direction", "rtl")}>
            <MoveLeft size={16} />
          </button>
        </div>

        <div className="rich-editor-toolbar-group">
          <button type="button" className="rich-editor-button rich-editor-icon-only" title="Insert Link" aria-label="Insert Link" onClick={addLink}>
            <Link2 size={16} />
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-only" title="Remove Link" aria-label="Remove Link" onClick={removeLink}>
            <Unlink size={16} />
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-only" title="Insert Anchor" aria-label="Insert Anchor" onClick={addAnchor}>
            <Anchor size={16} />
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-only" title="Insert Image" aria-label="Insert Image" onClick={insertImage}>
            <ImageIcon size={16} />
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-only" title="Insert Flash" aria-label="Insert Flash" onClick={insertFlash}>
            <Zap size={16} />
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-only" title="Insert Table" aria-label="Insert Table" onClick={insertTable}>
            <TableIcon size={16} />
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-only" title="Insert Line" aria-label="Insert Line" onClick={() => insertHtml("<hr />")}>
            <Minus size={16} />
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-only" title="Insert Smiley" aria-label="Insert Smiley" onClick={insertSmiley}>
            <Smile size={16} />
          </button>
          <button
            type="button"
            className="rich-editor-button rich-editor-icon-only"
            title="Insert Special Character"
            aria-label="Insert Special Character"
            onClick={insertSpecialCharacter}
          >
            <SparklesIcon size={16} />
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-only" title="Insert Page Break" aria-label="Insert Page Break" onClick={insertPageBreak}>
            <SeparatorHorizontal size={16} />
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-only" title="Insert Iframe" aria-label="Insert Iframe" onClick={insertIframe}>
            <Frame size={16} />
          </button>
        </div>

        <div className="rich-editor-toolbar-group">
          <select className="rich-editor-select" defaultValue="" onChange={handleStyleSelect}>
            {styleOptions.map((item) => (
              <option key={item.label} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <select className="rich-editor-select" defaultValue="" onChange={handleFormatSelect}>
            {formatOptions.map((item) => (
              <option key={item.label} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <select className="rich-editor-select" defaultValue="" onChange={handleFontSelect}>
            <option value="">Font</option>
            {fontOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select className="rich-editor-select" defaultValue="" onChange={handleFontSizeSelect}>
            <option value="">Size</option>
            {fontSizeOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <button type="button" className="rich-editor-button rich-editor-icon-only" title={isMaximized ? "Minimize" : "Maximize"} aria-label={isMaximized ? "Minimize" : "Maximize"} onClick={() => setIsMaximized((current) => !current)}>
            {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button type="button" className="rich-editor-button rich-editor-icon-only" title="Blocks" aria-label="Blocks" onClick={() => setShowBlocks((current) => !current)}>
            <LayoutGrid size={16} />
          </button>
          <button
            type="button"
            className="rich-editor-button rich-editor-icon-only"
            title="Help"
            aria-label="Help"
            onClick={() =>
              window.alert(
                "This editor supports source editing, formatting, links, media embeds, templates, layout controls, and preview/print tools."
              )
            }
          >
            <HelpCircle size={16} />
          </button>
        </div>
      </div>

      <div className="rich-editor-meta">
        <span>{mode === "design" ? "Design view" : mode === "source" ? "Source view" : "Preview view"}</span>
        <span>{spellCheckEnabled ? "Spell check on" : "Spell check off"}</span>
        {savedMessage ? <span className="text-brand-teal">{savedMessage}</span> : null}
      </div>

      {mode === "source" ? (
        <textarea
          className="rich-editor-source"
          style={editorStyle}
          value={value || ""}
          onChange={(event) => handleSourceChange(event.target.value)}
          placeholder={placeholder}
          spellCheck={spellCheckEnabled}
        />
      ) : null}

      {mode === "preview" ? (
        <div className="rich-editor-preview rich-copy" style={editorStyle} dangerouslySetInnerHTML={{ __html: value || "" }} />
      ) : null}

      {mode === "design" ? (
        <div
          ref={editorRef}
          contentEditable
          spellCheck={spellCheckEnabled}
          suppressContentEditableWarning
          className={`rich-editor-surface ${showBlocks ? "rich-editor-surface-blocks" : ""}`}
          style={editorStyle}
          data-placeholder={placeholder}
          dir="ltr"
          onInput={(event) => onChange(event.currentTarget.innerHTML)}
        />
      ) : null}
    </div>
  );
}