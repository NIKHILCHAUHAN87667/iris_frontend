import { useCallback, useEffect, useState } from "react";
import { Download, FileText, FolderOpen, RefreshCw } from "lucide-react";
import { useAuth } from "@clerk/react";

import EmployeeLayout from "../../components/employee/layout/EmployeeLayout";
import FileUploadArea from "../../components/employee/documents/FileUploadArea";
import { getEmployeeDocumentDownload, listAvailableDocuments } from "../../services/documentApi";
import { fetchCurrentAppUser } from "../../services/userApi";

function formatSize(value) {
  const size = Number(value || 0);
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadDocument() {
  const { getToken } = useAuth();
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [myUploads, setMyUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      const [user, result] = await Promise.all([fetchCurrentAppUser(token), listAvailableDocuments(token)]);
      setProfile(user);
      setDocuments(result.documents);
      setMyUploads(result.uploads || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { loadData(); }, [loadData]);

  const downloadDocument = async (document) => {
    const opened = window.open("about:blank", "_blank");
    try {
      const token = await getToken();
      const { url } = await getEmployeeDocumentDownload(document.id, token);
      if (opened) {
        opened.opener = null;
        opened.location = url;
      } else {
        window.location.assign(url);
      }
    } catch (downloadError) {
      opened?.close();
      setError(downloadError.message);
    }
  };

  return (
    <EmployeeLayout>
      <div className="min-h-full px-6 pb-10 pt-8 lg:px-10">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#6D9775]">DOCUMENT LIBRARY</p>
          <h1 className="text-3xl font-bold tracking-tight text-[#0C3B2E]">Documents</h1>
          <p className="mt-2 text-sm text-[#64746C]">Upload a document for review or open approved documents available to your department.</p>
        </div>

        {error && <div className="mt-5 rounded-lg border border-[#EBC8BD] bg-[#FFF5F1] px-4 py-3 text-sm text-[#934A39]" role="alert">{error}</div>}
        <section className="mt-6 rounded-xl border border-[#E2E7E1] bg-white px-5 py-1 shadow-sm lg:px-7">
          <FileUploadArea departmentName={profile?.department} onUploaded={loadData} />
        </section>

        {myUploads.length > 0 && <section className="mt-7 overflow-hidden rounded-xl border border-[#E2E7E1] bg-white shadow-sm">
          <div className="border-b border-[#E9EDE7] px-5 py-4 lg:px-6"><h2 className="font-semibold text-[#173D32]">Your uploads</h2><p className="mt-1 text-xs text-[#87938E]">Track review status for files you submitted.</p></div>
          <ul className="divide-y divide-[#EDF0EA]">
            {myUploads.map((upload) => <li key={upload.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 lg:px-6">
              <div className="min-w-0"><p className="truncate text-sm font-medium text-[#193B32]">{upload.title}</p><p className="mt-0.5 truncate text-xs text-[#87938E]">{upload.filename} · {new Date(upload.uploadedAt).toLocaleDateString()}</p></div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${upload.status === "approved" ? "bg-[#EAF4EA] text-[#34734B]" : upload.status === "pending_review" ? "bg-[#FFF4DB] text-[#8B6823]" : upload.status === "rejected" ? "bg-[#FFF0ED] text-[#934A39]" : "bg-[#F1F2F0] text-[#697570]"}`}>{upload.status.replaceAll("_", " ")}</span>
            </li>)}
          </ul>
        </section>}

        <section className="mt-7 overflow-hidden rounded-xl border border-[#E2E7E1] bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E9EDE7] px-5 py-4 lg:px-6">
            <div className="flex items-center gap-2.5"><FolderOpen size={19} className="text-[#567B67]" /><h2 className="font-semibold text-[#173D32]">Available to you</h2><span className="rounded-full bg-[#F0F3ED] px-2 py-0.5 text-xs text-[#64746C]">{documents.length}</span></div>
            <button type="button" onClick={loadData} disabled={loading} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[#52645D] transition hover:bg-[#F3F5F1] disabled:opacity-60"><RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh</button>
          </div>
          {loading ? <p className="px-6 py-9 text-sm text-[#758178]">Loading approved documents…</p> : documents.length === 0 ? (
            <div className="px-6 py-10 text-center"><FileText className="mx-auto mb-3 text-[#9DA99F]" size={26} /><p className="font-medium text-[#31594C]">No approved documents are available yet</p><p className="mt-1 text-sm text-[#87938E]">After an administrator approves your uploads, they’ll appear here for your department.</p></div>
          ) : (
            <ul className="divide-y divide-[#EDF0EA]">
              {documents.map((document) => <li key={document.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
                <div className="flex min-w-0 items-start gap-3"><span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#EAF2EC] text-[#28634F]"><FileText size={17} /></span><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#193B32]">{document.title}</p><p className="mt-1 truncate text-xs text-[#87938E]">{document.filename} · {formatSize(document.fileSize)} · {document.department}</p>{document.description && <p className="mt-1 line-clamp-2 text-xs text-[#64746C]">{document.description}</p>}</div></div>
                <button type="button" onClick={() => downloadDocument(document)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[#DCE4DA] px-3.5 py-2 text-sm font-medium text-[#31594C] transition hover:bg-[#F4F8F3]"><Download size={15} /> Open document</button>
              </li>)}
            </ul>
          )}
        </section>
      </div>
    </EmployeeLayout>
  );
}

export default UploadDocument;
