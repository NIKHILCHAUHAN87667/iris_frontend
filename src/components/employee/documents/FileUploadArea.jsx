import { useRef, useState } from "react";
import { CloudUpload, FileText, LoaderCircle, Upload, X } from "lucide-react";
import { useAuth } from "@clerk/react";
import leftDecoration from "../../../assets/upload-decoration-left.png";
import rightDecoration from "../../../assets/upload-decoration-right.png";

import { uploadEmployeeDocument } from "../../../services/documentApi";

const allowedExtensions = new Set(["pdf", "docx", "pptx", "xlsx", "txt"]);
const categories = ["policy", "technical", "project", "process", "report", "training", "other"];

function FileUploadArea({ departmentName, onUploaded }) {
  const { getToken } = useAuth();
  const fileInput = useRef(null);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("policy");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragging, setDragging] = useState(false);

  const chooseFile = (nextFile) => {
    if (!nextFile) return;
    const extension = nextFile.name.split(".").pop()?.toLowerCase();
    if (!allowedExtensions.has(extension)) {
      setError("Choose a PDF, DOCX, PPTX, XLSX, or TXT file.");
      return;
    }
    if (nextFile.size > 20 * 1024 * 1024) {
      setError("Files must be 20 MB or smaller.");
      return;
    }
    setFile(nextFile);
    setTitle((current) => current || nextFile.name.replace(/\.[^.]+$/, ""));
    setError("");
    setSuccess("");
  };

  const addTag = () => {
    const nextTag = tagInput.trim().slice(0, 50);
    if (
      nextTag &&
      !tags.some((tag) => tag.toLowerCase() === nextTag.toLowerCase()) &&
      tags.length < 20
    ) {
      setTags((current) => [...current, nextTag]);
    }
    setTagInput("");
  };

  const resetForm = () => {
    setFile(null);
    setTitle("");
    setDescription("");
    setCategory("policy");
    setTags([]);
    setTagInput("");
    if (fileInput.current) fileInput.current.value = "";
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError("Choose a file to upload.");
      return;
    }
    setUploading(true);
    setError("");
    setSuccess("");
    try {
      const token = await getToken();
      const result = await uploadEmployeeDocument(
        file,
        {
          title: title.trim(),
          description: description.trim(),
          category,
          tags,
        },
        token
      );
      setSuccess(
        `“${result.document.title}” was uploaded and is waiting for admin review.`
      );
      resetForm();
      await onUploaded?.();
    } catch (uploadError) {
      setError(uploadError.message || "The upload could not be completed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-7 pb-12">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setDragging(false);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          chooseFile(event.dataTransfer.files?.[0]);
        }}
        className={`relative flex min-h-[260px] flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
          dragging
            ? "border-[#0C6B55] bg-[#EAF4EC]"
            : "border-[#C9D5CC] bg-[#F3F8F3]"
        }`}
      >
        {/* Decorative images */}
        <img
          src={leftDecoration}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 z-0 h-36 w-auto object-contain opacity-80"
        />
        <img
          src={rightDecoration}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 right-0 z-0 h-36 w-auto object-contain opacity-80"
        />

        <CloudUpload
          size={52}
          strokeWidth={1.6}
          className="relative z-10 mb-4 text-[#0C6B55]"
        />

        <h2 className="relative z-10 text-xl font-semibold text-[#0C3B2E]">
          Drag and drop your file here
        </h2>

        <p className="relative z-10 mt-2 text-sm text-[#64746C]">
          or{" "}
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="font-semibold text-[#0C6B55] hover:text-[#0C3B2E]"
          >
            click to browse
          </button>
        </p>

        <input
          ref={fileInput}
          type="file"
          accept=".pdf,.docx,.pptx,.xlsx,.txt"
          className="sr-only"
          onChange={(event) => chooseFile(event.target.files?.[0])}
        />

        <p className="relative z-10 mt-4 text-xs text-[#87938E]">
          PDF, DOCX, PPTX, XLSX, or TXT · up to 20 MB
        </p>
      </div>

      {file && (
        <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-[#D9DED9] bg-white px-4 py-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#EAF2EC] text-[#0C3B2E]">
              <FileText size={20} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#0C3B2E]">
                {file.name}
              </p>
              <p className="mt-0.5 text-xs text-[#87938E]">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setFile(null);
              if (fileInput.current) fileInput.current.value = "";
            }}
            aria-label="Remove selected file"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[#64746C] transition hover:bg-[#F1F3EF]"
          >
            <X size={17} />
          </button>
        </div>
      )}

      <div className="mt-7">
        <h2 className="text-xl font-semibold text-[#0C3B2E]">
          Document information
        </h2>
        <p className="mt-1 text-lg text-[#64746C]">
          The file is stored privately until an administrator reviews it.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <label className="admin-field md:col-span-2 !text-base">
            Document title
            <input
              required
              minLength={2}
              maxLength={500}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter document title"
            />
          </label>

          <label className="admin-field !text-base">
            Department
            <input
              readOnly
              value={departmentName || "Loading your department…"}
              className="!bg-[#F5F7F4]"
            />
            <span className="text-xs font-normal text-[#87938E]">
              Documents are first available to this department after approval.
            </span>
          </label>

          <label className="admin-field !text-base">
            Category
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item[0].toUpperCase() + item.slice(1)}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-field md:col-span-2 !text-base">
            <span className="flex items-center gap-1">
              Description
              <span className="font-normal text-[#95A097]">(optional)</span>
            </span>
            <textarea
              rows={3}
              maxLength={5000}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Briefly describe what this document contains..."
              className="resize-y"
            />
          </label>

          <div className="admin-field md:col-span-2 !text-base">
            <span className="flex items-center gap-1">
              Tags
              <span className="font-normal text-[#95A097]">
                (optional, up to 20)
              </span>
            </span>
            <div className="flex min-h-12 flex-wrap items-center gap-2 rounded-lg border border-[#D9DED9] bg-white px-3 py-2 focus-within:border-[#6D9775] focus-within:ring-2 focus-within:ring-[#6D9775]/15">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-md bg-[#EAF2EC] px-2.5 py-1 text-xs font-lg text-[#0C3B2E]"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() =>
                      setTags((current) =>
                        current.filter((entry) => entry !== tag)
                      )
                    }
                    aria-label={`Remove ${tag}`}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addTag();
                  }
                }}
                placeholder={
                  tags.length
                    ? "Add a tag…"
                    : "Type a tag and press Enter"
                }
                className="min-w-[180px] flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-[#9AA39E]"
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <p
          className="mt-5 rounded-lg border border-[#EBC8BD] bg-[#FFF5F1] px-4 py-3 text-sm text-[#934A39]"
          role="alert"
        >
          {error}
        </p>
      )}

      {success && (
        <p
          className="mt-5 rounded-lg border border-[#C9DFCD] bg-[#F0F7F0] px-4 py-3 text-sm text-[#28634F]"
          role="status"
        >
          {success}
        </p>
      )}

      <div className="mt-7 flex flex-wrap items-center justify-end gap-3 border-t border-[#E2E7E1] pt-5">
        <button
          type="button"
          onClick={resetForm}
          disabled={uploading}
          className="rounded-lg border border-[#D9DED9] bg-white px-5 py-3 text-sm font-semibold text-[#18352D] transition hover:bg-[#F5F6F3] disabled:opacity-60"
        >
          Clear
        </button>
        <button
          type="submit"
          disabled={uploading || !departmentName}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#0C3B2E] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#14503F] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? (
            <>
              <LoaderCircle size={17} className="animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <Upload size={17} />
              Upload for review
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default FileUploadArea;