import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, FileLock2, LoaderCircle, Send } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@clerk/react";

import EmployeeLayout from "../../components/employee/layout/EmployeeLayout";
import { getDocumentAccessInfo, getEmployeeDocumentDownload, requestDocumentAccess } from "../../services/documentApi";

function DocumentAccessRequest() {
  const { documentId } = useParams();
  const { getToken } = useAuth();
  const [details, setDetails] = useState(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      setDetails(await getDocumentAccessInfo(documentId, token));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [documentId, getToken]);

  useEffect(() => { load(); }, [load]);

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const token = await getToken();
      const result = await requestDocumentAccess(documentId, reason, token);
      setDetails((current) => ({ ...current, pendingRequest: result.request }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openDocument = async () => {
    const opened = window.open("about:blank", "_blank");
    try {
      const token = await getToken();
      const { url } = await getEmployeeDocumentDownload(documentId, token);
      if (opened) { opened.opener = null; opened.location = url; }
      else window.location.assign(url);
    } catch (openError) {
      opened?.close();
      setError(openError.message);
    }
  };

  return (
    <EmployeeLayout>
      <div className="mx-auto min-h-full max-w-3xl px-6 pb-12 pt-10 lg:px-10">
        <Link to="/documents/upload" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#567B67] hover:text-[#0C3B2E]"><ArrowLeft size={16} /> Documents</Link>
        {loading ? <div className="rounded-2xl border border-[#E2E7E1] bg-white px-6 py-14 text-center text-sm text-[#758178]">Loading document access…</div> : !details ? (
          <section className="rounded-2xl border border-[#E2E7E1] bg-white p-8 text-center"><FileLock2 size={31} className="mx-auto mb-4 text-[#9DA99F]" /><h1 className="text-xl font-semibold text-[#173D32]">This document link is unavailable</h1><p className="mt-2 text-sm text-[#64746C]">Ask the person who shared it to check the link or contact an administrator.</p>{error && <p className="mt-4 text-sm text-[#934A39]" role="alert">{error}</p>}</section>
        ) : (
          <section className="rounded-2xl border border-[#E2E7E1] bg-white p-7 shadow-sm sm:p-9">
            <span className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-[#EAF2EC] text-[#28634F]"><FileLock2 size={23} /></span>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6D9775]">DEPARTMENT RESTRICTED</p>
            <h1 className="mt-2 break-words text-2xl font-bold tracking-tight text-[#0C3B2E]">{details.document.title}</h1>
            <p className="mt-2 text-sm text-[#64746C]">This document is owned by <span className="font-semibold text-[#31594C]">{details.document.department}</span>. Your department does not currently have access.</p>

            {details.hasAccess ? <div className="mt-7 rounded-xl bg-[#F0F7F0] p-4"><p className="flex items-center gap-2 text-sm font-semibold text-[#28634F]"><CheckCircle2 size={17} /> You have access to this document.</p><button type="button" onClick={openDocument} className="mt-4 rounded-lg bg-[#0C3B2E] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#175440]">Open document</button></div>
              : details.pendingRequest ? <div className="mt-7 rounded-xl border border-[#EAD9AC] bg-[#FFF8E8] p-4"><p className="text-sm font-semibold text-[#806321]">Your access request is pending</p><p className="mt-1 text-sm text-[#8B7440]">An administrator will review your request. Access remains restricted until it is approved.</p></div>
                : <form onSubmit={submit} className="mt-7">
                  <label className="block text-sm font-semibold text-[#31594C]">Why do you need access?
                    <textarea required minLength={10} maxLength={1000} rows={4} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Describe the work need for this document..." className="mt-2 w-full resize-y rounded-lg border border-[#DCE4DA] px-3.5 py-3 text-sm font-normal text-[#193B32] outline-none placeholder:text-[#9AA69E] focus:border-[#6D9775] focus:ring-2 focus:ring-[#6D9775]/15" />
                  </label>
                  {error && <p className="mt-3 text-sm text-[#934A39]" role="alert">{error}</p>}
                  <button type="submit" disabled={submitting} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#0C3B2E] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#175440] disabled:opacity-60">{submitting ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={15} />}{submitting ? "Sending request…" : "Request department access"}</button>
                </form>}
            <p className="mt-6 border-t border-[#EDF0EA] pt-4 text-xs leading-5 text-[#87938E]">The file remains private while this request is pending. If approved, access will be granted to your department.</p>
          </section>
        )}
      </div>
    </EmployeeLayout>
  );
}

export default DocumentAccessRequest;
