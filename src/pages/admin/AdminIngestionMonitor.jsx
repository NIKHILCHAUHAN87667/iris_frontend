import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Database, FileText, LoaderCircle, Play, RefreshCw, Search, XCircle } from "lucide-react";

import AdminLayout from "../../components/admin/layout/AdminLayout";
import { getAdminIngestion, startAdminIngestion } from "../../services/adminApi";

const statusStyles = {
  completed: "bg-[#E8F3EB] text-[#286344]",
  running: "bg-[#E8F0FF] text-[#355E9A]",
  queued: "bg-[#F1F0EC] text-[#66685F]",
  failed: "bg-[#FDEBE8] text-[#A94435]",
};

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function StatusBadge({ status }) {
  const Icon = status === "completed" ? CheckCircle2 : status === "failed" ? XCircle : status === "running" || status === "queued" ? LoaderCircle : AlertCircle;
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[status] || "bg-[#F1F0EC] text-[#66685F]"}`}><Icon size={13} className={status === "running" ? "animate-spin" : ""} />{status || "Not indexed"}</span>;
}

function AdminIngestionMonitor() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");

  const refresh = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true);
    else setLoading(true);
    try {
      const result = await getAdminIngestion();
      setData(result);
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  const hasActiveJobs = data?.jobs?.some((job) => ["running", "queued"].includes(job.status));
  useEffect(() => {
    if (!hasActiveJobs) return undefined;
    const timer = window.setInterval(() => refresh(true), 4000);
    return () => window.clearInterval(timer);
  }, [hasActiveJobs, refresh]);

  const start = async (document) => {
    setBusyId(document.id);
    setError("");
    setNotice("");
    try {
      await startAdminIngestion(document.id);
      setNotice(`Indexing started for “${document.title}”.`);
      await refresh(true);
    } catch (startError) {
      setError(startError.message);
    } finally {
      setBusyId("");
    }
  };

  const documents = useMemo(() => (data?.documents || []).filter((document) => {
    const needle = query.trim().toLowerCase();
    return !needle || [document.title, document.filename, document.department, document.uploader].some((value) => String(value || "").toLowerCase().includes(needle));
  }), [data?.documents, query]);
  const indexedCount = (data?.documents || []).filter((document) => document.latestJob?.status === "completed").length;
  const runningCount = (data?.jobs || []).filter((job) => ["running", "queued"].includes(job.status)).length;
  const failedCount = (data?.jobs || []).filter((job) => job.status === "failed").length;

  return (
    <AdminLayout>
      <div className="min-h-full px-8 py-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#71977D]">KNOWLEDGE OPERATIONS</p>
              <h1 className="text-3xl font-semibold tracking-tight text-[#103D32]">Ingestion monitor</h1>
              <p className="mt-2 text-sm text-[#728078]">Index approved documents into Qdrant for semantic and keyword search.</p>
            </div>
            <button type="button" onClick={() => refresh(true)} disabled={refreshing} className="inline-flex items-center gap-2 rounded-lg border border-[#DCE4DD] bg-white px-4 py-2.5 text-sm font-medium text-[#315E4F] hover:bg-[#F4F8F4] disabled:opacity-60">
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> Refresh monitor
            </button>
          </div>

          <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-[#E2E7E1] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between"><span className="text-sm text-[#718078]">Qdrant connection</span><Database size={18} className={data?.qdrant?.connected ? "text-[#39805C]" : "text-[#B66C36]"} /></div>
              <p className="mt-3 text-xl font-semibold text-[#153F34]">{loading ? "Checking…" : data?.qdrant?.connected ? "Connected" : "Not connected"}</p>
              <p className="mt-1 truncate text-xs text-[#879189]">Collection: {data?.qdrant?.collection || "iris_documents"}{data?.qdrant?.collectionExists ? ` · ${data.qdrant.pointsCount || 0} points` : ""}</p>
            </div>
            <Metric title="Approved documents" value={data?.documents?.length ?? "—"} detail="Ready to index" icon={FileText} />
            <Metric title="Indexed documents" value={indexedCount} detail="Latest job completed" icon={CheckCircle2} />
            <Metric title="Active / failed jobs" value={`${runningCount} / ${failedCount}`} detail="Running or needing attention" icon={LoaderCircle} />
          </section>

          {!data?.qdrant?.connected && !loading && <div className="mb-5 rounded-xl border border-[#F0DAB5] bg-[#FFF5DF] p-4 text-sm text-[#805F24]">
            <p className="font-semibold">Qdrant is not ready</p>
            <p className="mt-1">{data?.qdrant?.error || "Configure QDRANT_URL and QDRANT_API_KEY on the backend to enable indexing."}</p>
          </div>}
          {error && <div role="alert" className="mb-5 rounded-xl border border-[#F2D3CE] bg-[#FFF1EE] px-4 py-3 text-sm text-[#9B4336]">{error}</div>}
          {notice && <div role="status" className="mb-5 rounded-xl border border-[#CFE5D6] bg-[#EDF7EF] px-4 py-3 text-sm text-[#286344]">{notice}</div>}

          <section className="overflow-hidden rounded-xl border border-[#E2E7E1] bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E9EDE8] px-5 py-4">
              <div><h2 className="font-semibold text-[#153F34]">Approved documents</h2><p className="mt-1 text-xs text-[#879189]">Index a document or retry indexing. Reindexing replaces its existing Qdrant chunks.</p></div>
              <label className="flex w-full items-center gap-2 rounded-lg border border-[#E1E7E1] px-3 py-2 sm:w-72"><Search size={16} className="text-[#809087]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter documents…" className="w-full bg-transparent text-sm outline-none placeholder:text-[#A0AAA3]" /></label>
            </div>
            {loading ? <div className="flex items-center justify-center gap-2 px-5 py-16 text-sm text-[#718078]"><LoaderCircle size={18} className="animate-spin" /> Loading ingestion data…</div>
              : documents.length === 0 ? <div className="px-5 py-16 text-center"><FileText className="mx-auto mb-3 text-[#98A89D]" size={28} /><p className="font-medium text-[#315E4F]">No approved documents found</p><p className="mt-1 text-sm text-[#879189]">Approved documents will appear here when they are ready for indexing.</p></div>
                : <div className="overflow-x-auto"><table className="w-full min-w-[860px] text-left text-sm">
                  <thead className="bg-[#F8F9F6] text-[11px] uppercase tracking-[0.12em] text-[#7C8980]"><tr><th className="px-5 py-3 font-semibold">Document</th><th className="px-4 py-3 font-semibold">Department</th><th className="px-4 py-3 font-semibold">Index status</th><th className="px-4 py-3 font-semibold">Chunks</th><th className="px-4 py-3 font-semibold">Last indexed</th><th className="px-5 py-3 text-right font-semibold">Action</th></tr></thead>
                  <tbody className="divide-y divide-[#EEF0EC]">{documents.map((document) => {
                    const active = ["queued", "running"].includes(document.latestJob?.status);
                    const indexed = document.latestJob?.status === "completed";
                    const status = document.latestJob?.status;
                    return <tr key={document.id} className="align-top hover:bg-[#FCFDFB]">
                      <td className="px-5 py-4"><p className="max-w-[300px] truncate font-medium text-[#193F34]" title={document.title}>{document.title}</p><p className="mt-1 max-w-[300px] truncate text-xs text-[#879189]" title={document.filename}>{document.filename} · {document.uploader}</p>{status === "failed" && <p className="mt-2 max-w-sm text-xs text-[#A94435]">{document.latestJob.error || "Indexing failed."}</p>}</td>
                      <td className="px-4 py-4 text-[#59685F]">{document.department}</td>
                      <td className="px-4 py-4"><StatusBadge status={status} /></td>
                      <td className="px-4 py-4 text-[#59685F]">{indexed ? document.latestJob.chunks : status === "running" ? `${document.latestJob.discoveredChunks || 0} found` : "—"}</td>
                      <td className="px-4 py-4 text-xs text-[#758179]">{formatDate(document.latestJob?.completedAt)}</td>
                      <td className="px-5 py-4 text-right"><button type="button" onClick={() => start(document)} disabled={active || Boolean(busyId) || !data?.qdrant?.connected} className="inline-flex items-center gap-2 rounded-lg bg-[#0C3B2E] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#155342] disabled:cursor-not-allowed disabled:opacity-45">{busyId === document.id || active ? <LoaderCircle size={14} className="animate-spin" /> : <Play size={14} />}{active ? "Indexing…" : indexed ? "Reindex" : status === "failed" ? "Retry" : "Index"}</button></td>
                    </tr>;
                  })}</tbody>
                </table></div>}
          </section>

          <section className="mt-6 overflow-hidden rounded-xl border border-[#E2E7E1] bg-white shadow-sm">
            <div className="border-b border-[#E9EDE8] px-5 py-4"><h2 className="font-semibold text-[#153F34]">Recent ingestion jobs</h2><p className="mt-1 text-xs text-[#879189]">Latest indexing runs and their outcomes.</p></div>
            {!data?.jobs?.length ? <p className="px-5 py-8 text-sm text-[#879189]">No ingestion jobs have been started.</p> : <div className="divide-y divide-[#EEF0EC]">{data.jobs.slice(0, 8).map((job) => <div key={job.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"><div className="min-w-0"><p className="truncate text-sm font-medium text-[#193F34]">{job.title}</p><p className="mt-1 text-xs text-[#879189]">{formatDate(job.createdAt)}{job.filename ? ` · ${job.filename}` : ""}</p>{job.status === "failed" && <p className="mt-1 text-xs text-[#A94435]">{job.error}</p>}</div><div className="flex items-center gap-3"><span className="text-xs text-[#758179]">{job.chunks} chunks</span><StatusBadge status={job.status} /></div></div>)}</div>}
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}

function Metric({ title, value, detail, icon: Icon }) {
  return <div className="rounded-xl border border-[#E2E7E1] bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm text-[#718078]">{title}</span><Icon size={18} className="text-[#71977D]" /></div><p className="mt-3 text-2xl font-semibold text-[#153F34]">{value}</p><p className="mt-1 text-xs text-[#879189]">{detail}</p></div>;
}

export default AdminIngestionMonitor;
