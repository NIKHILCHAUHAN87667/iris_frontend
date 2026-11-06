import { useMemo, useState } from "react";
import { useAuth } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import { ArrowDownWideNarrow, ArrowUpRight, Check, ChevronDown, FileSpreadsheet, FileText, Info, LoaderCircle, LockKeyhole, Presentation, Search as SearchIcon, Sparkles, X } from "lucide-react";

import EmployeeLayout from "../../components/employee/layout/EmployeeLayout";
import { getEmployeeDocumentDownload, requestDocumentAccess, searchEmployeeDocuments } from "../../services/documentApi";

function fileIcon(type) {
  if (type === "XLSX") return FileSpreadsheet;
  if (type === "PPTX") return Presentation;
  return FileText;
}

function formatDate(value) {
  if (!value) return "Recently updated";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}

const filterGroups = ["Department", "Category", "File Type", "Date", "Status"];
const dateOptions = ["Last 7 days", "Last 30 days", "Last 3 months"];
const emptyFilters = { Department: [], Category: [], "File Type": [], Date: [], Status: [] };

function dateMatches(value, range) {
  const date = new Date(value || 0);
  if (Number.isNaN(date.getTime())) return false;
  const age = Date.now() - date.getTime();
  const days = range === "Last 7 days" ? 7 : range === "Last 30 days" ? 30 : 90;
  return age >= 0 && age <= days * 24 * 60 * 60 * 1000;
}

function SearchPage() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [results, setResults] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [sortByNewest, setSortByNewest] = useState(false);
  const [openingId, setOpeningId] = useState("");
  const [openFilter, setOpenFilter] = useState("");
  const [filters, setFilters] = useState(emptyFilters);
  const [accessRequestDocument, setAccessRequestDocument] = useState(null);
  const [accessReason, setAccessReason] = useState("");
  const [submittingAccessRequest, setSubmittingAccessRequest] = useState(false);
  const [notice, setNotice] = useState("");

  const filterOptions = useMemo(() => ({
    Department: [...new Set(results.map((result) => result.department).filter(Boolean))].sort(),
    Category: [...new Set(results.map((result) => result.category).filter(Boolean))].sort(),
    "File Type": [...new Set(results.map((result) => result.fileType).filter(Boolean))].sort(),
    Date: dateOptions,
    Status: [...new Set(results.map((result) => result.status).filter(Boolean))].sort(),
  }), [results]);

  const activeFilterCount = Object.values(filters).reduce((total, selected) => total + selected.length, 0);

  const toggleFilter = (group, value) => {
    setFilters((current) => {
      const values = current[group];
      return { ...current, [group]: values.includes(value) ? values.filter((item) => item !== value) : [...values, value] };
    });
  };

  const clearFilters = () => {
    setFilters(emptyFilters);
    setOpenFilter("");
  };

  const filteredResults = useMemo(() => results.filter((result) => {
    const regularGroups = ["Department", "Category", "File Type", "Status"];
    const matchesGroups = regularGroups.every((group) => filters[group].length === 0 || filters[group].includes({
      Department: result.department,
      Category: result.category,
      "File Type": result.fileType,
      Status: result.status,
    }[group]));
    const matchesDate = filters.Date.length === 0 || filters.Date.some((range) => dateMatches(result.updatedAt, range));
    return matchesGroups && matchesDate;
  }), [results, filters]);

  const displayedResults = useMemo(() => {
    if (!sortByNewest) return filteredResults;
    return [...filteredResults].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  }, [filteredResults, sortByNewest]);

  const runSearch = async (event) => {
    event?.preventDefault();
    const query = searchText.trim();
    if (query.length < 2) {
      setError("Enter at least two characters to search.");
      return;
    }
    setLoading(true);
    setError("");
    setNotice("");
    setSearched(true);
    setSubmittedQuery(query);
    try {
      const token = await getToken();
      const response = await searchEmployeeDocuments(query, token);
      setResults(response.results || []);
      setMetrics(response.metrics || null);
      setFilters(emptyFilters);
      setOpenFilter("");
    } catch (searchError) {
      setResults([]);
      setMetrics(null);
      setError(searchError.message || "Search could not be completed.");
    } finally {
      setLoading(false);
    }
  };

  const openDocument = async (document) => {
    const target = window.open("about:blank", "_blank");
    setOpeningId(document.id);
    setError("");
    try {
      const token = await getToken();
      const { url } = await getEmployeeDocumentDownload(document.id, token);
      if (target) {
        target.opener = null;
        target.location = url;
      } else {
        window.location.assign(url);
      }
    } catch (openError) {
      target?.close();
      setError(openError.message || "The document could not be opened.");
    } finally {
      setOpeningId("");
    }
  };

  const submitAccessRequest = async (event) => {
    event.preventDefault();
    if (!accessRequestDocument || accessReason.trim().length < 10) {
      setError("Please explain why you need access in at least 10 characters.");
      return;
    }
    setSubmittingAccessRequest(true);
    setError("");
    try {
      const token = await getToken();
      await requestDocumentAccess(accessRequestDocument.id, accessReason.trim(), token);
      setResults((current) => current.map((document) => document.id === accessRequestDocument.id ? { ...document, hasRequestedAccess: true } : document));
      setNotice(`Your access request for “${accessRequestDocument.title}” was sent to the administrator.`);
      setAccessRequestDocument(null);
      setAccessReason("");
    } catch (requestError) {
      setError(requestError.message || "Could not submit the access request.");
    } finally {
      setSubmittingAccessRequest(false);
    }
  };

  return (
    <EmployeeLayout>
      <div className="min-h-full px-6 pb-12 pt-8 md:px-8">
        <div className="mx-auto max-w-6xl">
          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#71977D]">KNOWLEDGE LIBRARY</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#0C3B2E] md:text-4xl">Search documents</h1>
            <p className="mt-2 text-base text-[#64746C]">Search your organization’s indexed documents. Restricted documents include an access request option.</p>
          </section>

          <form onSubmit={runSearch} className="mt-7 flex flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <SearchIcon size={21} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64746C]" />
              <input
                type="search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search by a phrase, topic, or exact keyword…"
                className="h-14 w-full rounded-xl border border-[#D9DED9] bg-white pl-12 pr-4 text-base text-[#18352D] outline-none transition placeholder:text-[#9AA39E] focus:border-[#6D9775] focus:ring-2 focus:ring-[#6D9775]/15"
                aria-label="Search documents"
              />
            </label>
            <button type="submit" disabled={loading} className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-[#0C3B2E] px-7 text-sm font-semibold text-white transition hover:bg-[#155342] disabled:cursor-wait disabled:opacity-70">
              {loading ? <LoaderCircle size={18} className="animate-spin" /> : <SearchIcon size={18} />}
              {loading ? "Searching…" : "Search"}
            </button>
          </form>

          <div className="mt-3 flex items-center gap-2 text-xs text-[#77847C]">
            <Sparkles size={14} className="text-[#77937E]" />
            <span>Semantic + keyword search, ranked together by relevance</span>
          </div>

          {error && <div role="alert" className="mt-5 rounded-xl border border-[#F2D3CE] bg-[#FFF1EE] px-4 py-3 text-sm text-[#9B4336]">{error}</div>}
          {notice && <div role="status" className="mt-5 rounded-xl border border-[#CFE5D6] bg-[#EDF7EF] px-4 py-3 text-sm text-[#286344]">{notice}</div>}

          {searched && results.length > 0 && <div className="mt-5 flex flex-wrap items-center gap-2.5">
            {filterGroups.map((group) => {
              const isOpen = openFilter === group;
              const selected = filters[group];
              const options = filterOptions[group];
              return <div key={group} className="relative">
                <button type="button" aria-expanded={isOpen} onClick={() => setOpenFilter(isOpen ? "" : group)} className={`flex h-10 items-center gap-2 rounded-lg border bg-white px-3.5 text-sm transition hover:bg-[#FAFCFA] ${selected.length ? "border-[#6D9775] text-[#0C3B2E]" : "border-[#E0E4DF] text-[#18352D]"}`}>
                  {group}{selected.length > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0C6B55] px-1 text-[11px] font-semibold text-white">{selected.length}</span>}<ChevronDown size={14} className={`text-[#64746C] transition ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && <div className="absolute left-0 top-12 z-40 max-h-72 w-60 overflow-y-auto rounded-xl border border-[#E2E7E1] bg-white p-2 shadow-lg">
                  {options.length === 0 ? <p className="px-3 py-2 text-sm text-[#879189]">No options in these results</p> : options.map((option) => {
                    const checked = selected.includes(option);
                    const label = group === "Category" ? String(option).replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase()) : option;
                    return <button key={option} type="button" aria-pressed={checked} onClick={() => toggleFilter(group, option)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[#465850] hover:bg-[#F3F7F3]">
                      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${checked ? "border-[#0C6B55] bg-[#0C6B55] text-white" : "border-[#BFC8C1] bg-white"}`}>{checked && <Check size={12} />}</span>{label}
                    </button>;
                  })}
                </div>}
              </div>;
            })}
            {activeFilterCount > 0 && <button type="button" onClick={clearFilters} className="ml-auto px-2 text-sm font-semibold text-[#0C6B55] hover:text-[#0C3B2E]">Clear filters ({activeFilterCount})</button>}
          </div>}

          {searched && metrics && <section aria-label="Dense and keyword overlap metrics" className="mt-5 rounded-xl border border-[#DDE6DD] bg-white p-4 shadow-sm md:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h2 className="text-sm font-semibold text-[#18352D]">Dense / BM25 overlap <span className="font-normal text-[#879189]">(proxy)</span></h2><p className="mt-1 text-xs leading-5 text-[#77847C]">Agreement between semantic and keyword top-20 document candidates, not a measure of judged relevance.</p></div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F6F2] px-2.5 py-1 text-[11px] text-[#728078]"><Info size={13} />{metrics.overlapCount} shared · {metrics.denseCount} semantic · {metrics.keywordCount} keyword</div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <MetricCard label="Precision" value={metrics.precision} definition="Shared ÷ keyword candidates" />
              <MetricCard label="Recall" value={metrics.recall} definition="Shared ÷ semantic candidates" />
              <MetricCard label="F1" value={metrics.f1} definition="Harmonic mean of precision & recall" />
            </div>
          </section>}

          <section className="mt-8">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-[#64746C]">
                {searched ? <>{loading ? "Searching" : <><span className="font-semibold text-[#18352D]">{displayedResults.length}</span> results for <span className="font-semibold text-[#18352D]">“{submittedQuery}”</span></>}</> : "Search approved and indexed documents"}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {searched && displayedResults.some((result) => result.canAccess) && <button type="button" onClick={() => navigate("/ai-assistant", { state: { query: submittedQuery, documentIds: displayedResults.filter((result) => result.canAccess).slice(0, 10).map((result) => result.id) } })} className="inline-flex items-center gap-2 rounded-lg bg-[#0C3B2E] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[#155342]"><Sparkles size={15} />AI summary &amp; explanation</button>}
                {searched && results.length > 1 && <button type="button" onClick={() => setSortByNewest((value) => !value)} className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-[#465850] hover:bg-white"><ArrowDownWideNarrow size={16} />{sortByNewest ? "Newest" : "Relevance"}</button>}
              </div>
            </div>

            {loading ? <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-[#E2E7E1] bg-white text-center"><LoaderCircle size={27} className="animate-spin text-[#4E8065]" /><p className="mt-3 text-sm text-[#64746C]">Searching by meaning and keywords…</p></div>
              : !searched ? <div className="rounded-xl border border-dashed border-[#D8E2D9] bg-[#FBFCF9] px-6 py-14 text-center"><SearchIcon size={32} className="mx-auto text-[#93A69A]" /><h2 className="mt-3 font-semibold text-[#18352D]">What are you looking for?</h2><p className="mt-1 text-sm text-[#77847C]">Try a question, topic, document name, or exact term.</p></div>
                : displayedResults.length === 0 ? <div className="rounded-xl border border-[#E2E7E1] bg-white px-6 py-14 text-center"><SearchIcon size={36} className="mx-auto text-[#A8B5AC]" /><h2 className="mt-3 font-semibold text-[#18352D]">No matching documents</h2><p className="mx-auto mt-1 max-w-md text-sm text-[#77847C]">Try another phrase or keyword. Search results include approved documents that have been indexed.</p></div>
                  : <div className="overflow-hidden rounded-xl border border-[#E2E7E1] bg-white shadow-sm">{displayedResults.map((result, index) => {
                    const Icon = fileIcon(result.fileType);
                    return <article key={result.id} className={`flex flex-col gap-4 px-5 py-5 transition hover:bg-[#FCFDFB] sm:flex-row sm:items-start ${index < displayedResults.length - 1 ? "border-b border-[#E8ECE8]" : ""}`}>
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF2EC] text-[#315E4F]"><Icon size={22} strokeWidth={1.7} /></div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">{!result.canAccess && <LockKeyhole size={15} className="text-[#A77935]" aria-label="Access restricted" />}<h2 className="text-base font-semibold text-[#18352D]">{result.title}</h2><span className="rounded-full bg-[#F1F5F0] px-2 py-0.5 text-[10px] font-semibold text-[#5C7462]">{result.fileType}</span>{!result.canAccess && <span className="rounded-full bg-[#FFF3DD] px-2 py-0.5 text-[10px] font-semibold text-[#9B701D]">Restricted</span>}</div>
                        <p className="mt-1 truncate text-xs text-[#879189]">{result.filename}{result.uploader ? ` · ${result.uploader}` : ""} · Updated {formatDate(result.updatedAt)}</p>
                        {result.excerpt && <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#4F6057]">{result.excerpt}</p>}
                        {result.description && <p className="mt-2 text-sm text-[#77847C]">{result.description}</p>}
                        {!result.canAccess && <p className="mt-3 text-sm text-[#7C6A4D]">Access is limited to {result.department}. Request permission from an administrator to open this document.</p>}
                        <div className="mt-3 flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#EAF2EC] px-2.5 py-1 text-xs font-medium text-[#267052]">{result.department}</span><span className="rounded-full bg-[#FFF3DD] px-2.5 py-1 text-xs font-medium capitalize text-[#9B701D]">{String(result.category).replaceAll("_", " ")}</span>{(result.tags || []).slice(0, 5).map((tag) => <span key={tag} className="rounded-full bg-[#EEF2F8] px-2.5 py-1 text-xs font-medium text-[#526A91]">{tag}</span>)}</div>
                      </div>
                      {result.canAccess ? <button type="button" onClick={() => openDocument(result)} disabled={Boolean(openingId)} className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-[#DCE4DD] px-3.5 py-2 text-sm font-medium text-[#315E4F] hover:bg-[#F3F7F3] disabled:opacity-60">{openingId === result.id ? <LoaderCircle size={15} className="animate-spin" /> : <ArrowUpRight size={15} />}{openingId === result.id ? "Opening…" : "Open document"}</button>
                        : result.hasRequestedAccess ? <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg bg-[#FFF3DD] px-3.5 py-2 text-sm font-medium text-[#8A671E]"><LockKeyhole size={14} />Request pending</span>
                          : <button type="button" onClick={() => { setAccessRequestDocument(result); setAccessReason(""); setError(""); }} className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-[#D8C69E] px-3.5 py-2 text-sm font-semibold text-[#805F24] hover:bg-[#FFF8E9]"><LockKeyhole size={14} />Request access</button>}
                    </article>;
                  })}</div>}
          </section>
        </div>
      </div>
      {accessRequestDocument && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#10251F]/45 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !submittingAccessRequest) setAccessRequestDocument(null); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="access-request-title" className="w-full max-w-lg rounded-2xl border border-[#E2E7E1] bg-white p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#71977D]">DOCUMENT PERMISSION</p><h2 id="access-request-title" className="mt-2 text-xl font-semibold text-[#18352D]">Request access</h2><p className="mt-1 text-sm text-[#77847C]">An administrator will review your request.</p></div><button type="button" onClick={() => setAccessRequestDocument(null)} disabled={submittingAccessRequest} aria-label="Close dialog" className="rounded-lg p-2 text-[#64746C] hover:bg-[#F1F3EF]"><X size={18} /></button></div>
          <div className="mt-5 rounded-lg bg-[#F6F8F4] px-3.5 py-3"><p className="text-sm font-medium text-[#315E4F]">{accessRequestDocument.title}</p><p className="mt-1 text-xs text-[#879189]">Owned by {accessRequestDocument.department}</p></div>
          <form onSubmit={submitAccessRequest} className="mt-5"><label htmlFor="access-request-reason" className="text-sm font-medium text-[#315E4F]">Why do you need access?</label><textarea id="access-request-reason" value={accessReason} onChange={(event) => setAccessReason(event.target.value)} minLength={10} maxLength={1000} rows={4} required placeholder="Describe the work or task that requires this document…" className="mt-2 w-full resize-y rounded-lg border border-[#DCE4DD] px-3.5 py-3 text-sm text-[#18352D] outline-none focus:border-[#6D9775] focus:ring-2 focus:ring-[#6D9775]/15"/><p className="mt-1 text-right text-xs text-[#879189]">{accessReason.trim().length}/1000 characters (10 minimum)</p>
            <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setAccessRequestDocument(null)} disabled={submittingAccessRequest} className="rounded-lg border border-[#DCE4DD] px-4 py-2.5 text-sm font-medium text-[#52645A] hover:bg-[#F6F8F4]">Cancel</button><button type="submit" disabled={submittingAccessRequest || accessReason.trim().length < 10} className="inline-flex items-center gap-2 rounded-lg bg-[#0C3B2E] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#155342] disabled:cursor-not-allowed disabled:opacity-50">{submittingAccessRequest && <LoaderCircle size={15} className="animate-spin" />}{submittingAccessRequest ? "Sending…" : "Send request"}</button></div>
          </form>
        </section>
      </div>}
    </EmployeeLayout>
  );
}

function MetricCard({ label, value, definition }) {
  return <div className="rounded-lg bg-[#F7F9F6] px-3.5 py-3"><div className="flex items-baseline justify-between gap-2"><span className="text-xs font-medium text-[#64746C]">{label}</span><span className="text-xl font-semibold tabular-nums text-[#0C3B2E]">{Math.round((Number(value) || 0) * 100)}%</span></div><p className="mt-1 text-[10px] text-[#879189]">{definition}</p></div>;
}

export default SearchPage;
