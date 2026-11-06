import { useCallback, useEffect, useState } from "react";
import { Check, Eye, FileText, RefreshCw, ShieldCheck, X } from "lucide-react";

import AdminLayout from "../../components/admin/layout/AdminLayout";
import { getAdminAccessRequests, getAdminDepartments, getAdminDocumentDownload, getAdminDocuments, reviewAdminAccessRequest, reviewAdminDocument } from "../../services/adminApi";

function formatSize(value) {
  const size = Number(value || 0);
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function AdminDocumentReview({ initialView = "documents" }) {
  const [documents, setDocuments] = useState([]);
  const [accessRequests, setAccessRequests] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [sharedDepartments, setSharedDepartments] = useState({});
  const [comments, setComments] = useState({});
  const [filter, setFilter] = useState("pending_review");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [view, setView] = useState(initialView);
  const [copiedLinkId, setCopiedLinkId] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [docResult, deptResult, requestResult] = await Promise.all([getAdminDocuments(), getAdminDepartments(), getAdminAccessRequests()]);
      setDocuments(docResult.documents);
      setDepartments(deptResult.departments);
      setAccessRequests(requestResult.requests);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const toggleDepartment = (documentId, departmentId) => {
    setSharedDepartments((current) => {
      const selected = new Set(current[documentId] || []);
      if (selected.has(departmentId)) selected.delete(departmentId);
      else selected.add(departmentId);
      return { ...current, [documentId]: [...selected] };
    });
  };

  const submitReview = async (document, action) => {
    setBusyId(document.id);
    setError("");
    setNotice("");
    try {
      await reviewAdminDocument(document.id, {
        action,
        comments: comments[document.id] || "",
        departmentIds: action === "approve" ? sharedDepartments[document.id] || [] : [],
      });
      setNotice(action === "approve" ? `“${document.title}” was approved and published.` : `“${document.title}” was rejected.`);
      await refresh();
    } catch (reviewError) {
      setError(reviewError.message);
    } finally {
      setBusyId("");
    }
  };

  const preview = async (document) => {
    const previewWindow = window.open("about:blank", "_blank");
    try {
      const { url } = await getAdminDocumentDownload(document.id);
      if (previewWindow) {
        previewWindow.opener = null;
        previewWindow.location = url;
      } else {
        window.location.assign(url);
      }
    } catch (previewError) {
      previewWindow?.close();
      setError(previewError.message);
    }
  };

  const decideAccessRequest = async (request, action) => {
    setBusyId(request.id);
    setError("");
    setNotice("");
    try {
      await reviewAdminAccessRequest(request.id, { action });
      setNotice(action === "approve" ? `Access granted to ${request.requestingDepartment.name} for “${request.document.title}”.` : `Access request for “${request.document.title}” was rejected.`);
      await refresh();
    } catch (reviewError) {
      setError(reviewError.message);
    } finally {
      setBusyId("");
    }
  };

  const copyRequestLink = async (document) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/documents/request/${document.id}`);
      setCopiedLinkId(document.id);
    } catch {
      setError("Could not copy the access request link.");
    }
  };

  const visibleDocuments = documents.filter((document) => filter === "all" || document.status === filter);
  const pendingCount = documents.filter((document) => document.status === "pending_review").length;
  const pendingRequestCount = accessRequests.filter((request) => request.status === "pending").length;

  return (
    <AdminLayout>
      <div className="min-h-full bg-[#F8F6EF] px-6 pb-12 pt-8 lg:px-10">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#6D9775]">CONTENT GOVERNANCE</p>
            <h1 className="text-3xl font-bold tracking-tight text-[#0C3B2E]">{view === "requests" ? "Access requests" : "Document review"}</h1>
            <p className="mt-2 text-sm text-[#64746C]">{view === "requests" ? "Review requests from employees whose departments need a document." : "Review employee uploads and choose which departments can access approved documents."}</p>
          </div>
          <button type="button" onClick={refresh} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-[#DCE4DA] bg-white px-3.5 py-2.5 text-sm font-medium text-[#31594C] transition hover:bg-[#F0F5EF] disabled:opacity-60">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh queue
          </button>
        </div>

        {error && <div className="mb-5 rounded-lg border border-[#EBC8BD] bg-[#FFF5F1] px-4 py-3 text-sm text-[#934A39]" role="alert">{error}</div>}
        {notice && <div className="mb-5 rounded-lg border border-[#C9DFCD] bg-[#F0F7F0] px-4 py-3 text-sm text-[#28634F]" role="status">{notice}</div>}

        <section className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E2E7E1] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#173D32]"><ShieldCheck size={18} className="text-[#567B67]" />{view === "requests" ? `${pendingRequestCount} pending access requests` : `${pendingCount} awaiting document review`}</div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Admin document views">
            <button type="button" onClick={() => setView("documents")} className={`rounded-lg px-3 py-2 text-sm font-medium transition ${view === "documents" ? "bg-[#0C3B2E] text-white" : "bg-[#F3F5F1] text-[#52645D] hover:bg-[#E8EEE7]"}`}>Documents</button>
            <button type="button" onClick={() => setView("requests")} className={`rounded-lg px-3 py-2 text-sm font-medium transition ${view === "requests" ? "bg-[#0C3B2E] text-white" : "bg-[#F3F5F1] text-[#52645D] hover:bg-[#E8EEE7]"}`}>Access requests <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.5 text-xs">{pendingRequestCount}</span></button>
            {view === "documents" && [{ id: "pending_review", label: "Needs review" }, { id: "all", label: "All documents" }].map((option) => <button key={option.id} type="button" onClick={() => setFilter(option.id)} className={`rounded-lg px-3 py-2 text-sm font-medium transition ${filter === option.id ? "bg-[#0C3B2E] text-white" : "bg-[#F3F5F1] text-[#52645D] hover:bg-[#E8EEE7]"}`}>{option.label}</button>)}
          </div>
        </section>

        {view === "requests" ? loading ? <div className="rounded-xl border border-[#E2E7E1] bg-white px-6 py-12 text-center text-sm text-[#758178]">Loading access requests…</div> : accessRequests.length === 0 ? (
          <div className="rounded-xl border border-[#E2E7E1] bg-white px-6 py-14 text-center"><ShieldCheck className="mx-auto mb-3 text-[#9DA99F]" size={28} /><p className="font-medium text-[#31594C]">No access requests yet</p><p className="mt-1 text-sm text-[#87938E]">Requests submitted by employees will appear here.</p></div>
        ) : <div className="space-y-4">{accessRequests.map((request) => <article key={request.id} className="rounded-xl border border-[#E2E7E1] bg-white p-5 shadow-sm lg:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-[#173D32]">{request.document.title}</h2><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${request.status === "pending" ? "bg-[#FFF4DB] text-[#8B6823]" : request.status === "approved" ? "bg-[#EAF4EA] text-[#34734B]" : "bg-[#FFF0ED] text-[#934A39]"}`}>{request.status}</span></div>
              <p className="mt-1 text-xs text-[#87938E]">{request.requester.name} ({request.requester.email}) requests access for <span className="font-semibold text-[#52645D]">{request.requestingDepartment.name}</span> · owned by {request.document.department} · {new Date(request.createdAt).toLocaleString()}</p>
            </div>
            {request.status === "pending" && <div className="flex gap-2"><button type="button" onClick={() => decideAccessRequest(request, "reject")} disabled={Boolean(busyId)} className="rounded-lg border border-[#E6C5BB] px-3.5 py-2 text-sm font-semibold text-[#934A39] hover:bg-[#FFF5F1] disabled:opacity-60">Reject</button><button type="button" onClick={() => decideAccessRequest(request, "approve")} disabled={Boolean(busyId)} className="rounded-lg bg-[#0C3B2E] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#175440] disabled:opacity-60">{busyId === request.id ? "Saving…" : "Approve department"}</button></div>}
          </div>
          <p className="mt-4 rounded-lg bg-[#F8F9F6] px-4 py-3 text-sm leading-6 text-[#52645D]">{request.reason}</p>
          {request.reviewerComment && <p className="mt-2 text-xs text-[#87938E]">Admin note: {request.reviewerComment}</p>}
        </article>)}</div> : loading ? <div className="rounded-xl border border-[#E2E7E1] bg-white px-6 py-12 text-center text-sm text-[#758178]">Loading document queue…</div> : visibleDocuments.length === 0 ? (
          <div className="rounded-xl border border-[#E2E7E1] bg-white px-6 py-14 text-center">
            <FileText className="mx-auto mb-3 text-[#9DA99F]" size={28} />
            <p className="font-medium text-[#31594C]">{filter === "all" ? "No documents uploaded yet" : "The review queue is clear"}</p>
            <p className="mt-1 text-sm text-[#87938E]">Employee uploads will appear here before they are available to their department.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleDocuments.map((document) => {
              const isPending = document.status === "pending_review";
              const otherDepartments = departments.filter((department) => department.dept_id !== document.departmentId);
              return (
                <article key={document.id} className="overflow-hidden rounded-xl border border-[#E2E7E1] bg-white shadow-sm">
                  <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-start lg:justify-between lg:p-6">
                    <div className="flex min-w-0 gap-4">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#EAF2EC] text-[#28634F]"><FileText size={21} /></span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="break-words font-semibold text-[#173D32]">{document.title}</h2>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${isPending ? "bg-[#FFF4DB] text-[#8B6823]" : document.status === "approved" ? "bg-[#EAF4EA] text-[#34734B]" : "bg-[#FFF0ED] text-[#934A39]"}`}>{document.status.replaceAll("_", " ")}</span>
                        </div>
                        <p className="mt-1 break-all text-xs text-[#87938E]">{document.filename} · {formatSize(document.fileSize)} · {document.category}</p>
                        <p className="mt-2 text-sm text-[#64746C]">{document.description || "No description provided."}</p>
                        <p className="mt-3 text-xs text-[#758178]">Uploaded by <span className="font-medium text-[#52645D]">{document.uploader}</span> ({document.uploaderEmail}) · {document.department} · {new Date(document.createdAt).toLocaleString()}</p>
                        {document.tags?.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{document.tags.map((tag) => <span key={tag} className="rounded-full bg-[#F2F4F0] px-2.5 py-1 text-[11px] text-[#64746C]">{tag}</span>)}</div>}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2"><button type="button" onClick={() => preview(document)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#DCE4DA] px-3.5 py-2.5 text-sm font-medium text-[#31594C] transition hover:bg-[#F4F8F3]"><Eye size={16} /> Preview file</button>{document.status === "approved" && <button type="button" onClick={() => copyRequestLink(document)} className="rounded-lg border border-[#DCE4DA] px-3.5 py-2.5 text-sm font-medium text-[#31594C] transition hover:bg-[#F4F8F3]">{copiedLinkId === document.id ? "Link copied" : "Copy request link"}</button>}</div>
                  </div>

                  {isPending && <div className="border-t border-[#E9EDE7] bg-[#FBFCF9] px-5 py-5 lg:px-6">
                    <p className="mb-1 text-sm font-semibold text-[#173D32]">Department access</p>
                    <p className="mb-4 text-xs text-[#758178]">{document.department} receives access automatically. Select any additional departments to share with when approving.</p>
                    {otherDepartments.length ? <div className="mb-4 flex flex-wrap gap-2">{otherDepartments.map((department) => {
                      const checked = (sharedDepartments[document.id] || []).includes(department.dept_id);
                      return <label key={department.dept_id} className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${checked ? "border-[#8FB299] bg-[#EEF6EF] text-[#28634F]" : "border-[#E1E7DE] bg-white text-[#52645D] hover:border-[#B9CBB9]"}`}><input type="checkbox" checked={checked} onChange={() => toggleDepartment(document.id, department.dept_id)} className="accent-[#0C6B55]" />{department.dept_name}</label>;
                    })}</div> : <p className="mb-4 text-xs text-[#87938E]">No other active departments are available.</p>}
                    <label className="mb-4 block text-xs font-medium text-[#64746C]">Review note <span className="font-normal text-[#95A097]">(optional)</span>
                      <textarea rows={2} maxLength={2000} value={comments[document.id] || ""} onChange={(event) => setComments((current) => ({ ...current, [document.id]: event.target.value }))} placeholder="Add a note for the audit record" className="mt-2 w-full resize-y rounded-lg border border-[#DCE4DA] bg-white px-3 py-2.5 text-sm text-[#193B32] outline-none focus:border-[#6D9775] focus:ring-2 focus:ring-[#6D9775]/15" />
                    </label>
                    <div className="flex flex-wrap justify-end gap-2">
                      <button type="button" onClick={() => submitReview(document, "reject")} disabled={Boolean(busyId)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#E6C5BB] bg-white px-4 text-sm font-semibold text-[#934A39] transition hover:bg-[#FFF5F1] disabled:opacity-60"><X size={15} /> Reject</button>
                      <button type="button" onClick={() => submitReview(document, "approve")} disabled={Boolean(busyId)} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#0C3B2E] px-4 text-sm font-semibold text-white transition hover:bg-[#175440] disabled:opacity-60"><Check size={16} />{busyId === document.id ? "Saving…" : "Approve & publish"}</button>
                    </div>
                  </div>}
                  {!isPending && document.review?.comments && <p className="border-t border-[#E9EDE7] bg-[#FBFCF9] px-6 py-3 text-sm text-[#64746C]">Review note: {document.review.comments}</p>}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminDocumentReview;
