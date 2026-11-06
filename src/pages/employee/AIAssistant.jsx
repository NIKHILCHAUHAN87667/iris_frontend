import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/react";
import { Link, useLocation } from "react-router-dom";
import { AlertCircle, ArrowLeft, ArrowUpRight, LoaderCircle, RefreshCw, Search, Sparkles } from "lucide-react";

import EmployeeLayout from "../../components/employee/layout/EmployeeLayout";
import { explainSearchResults, getEmployeeDocumentDownload } from "../../services/documentApi";

function AIAssistant() {
  const { getToken } = useAuth();
  const location = useLocation();
  const query = typeof location.state?.query === "string" ? location.state.query : "";
  const documentIds = Array.isArray(location.state?.documentIds) ? location.state.documentIds : [];
  const requestKey = `${query}|${documentIds.join(",")}`;
  const requestCache = useRef(new Map());
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [sources, setSources] = useState([]);
  const [error, setError] = useState("");
  const [openingId, setOpeningId] = useState("");

  const generate = useCallback(async (force = false) => {
    if (!query || !documentIds.length) return;
    if (!force && requestCache.current.has(requestKey)) {
      setLoading(true);
      try {
        const response = await requestCache.current.get(requestKey);
        if (response) {
          setAnswer(response.answer);
          setSources(response.sources || []);
        }
      } catch (requestError) {
        requestCache.current.delete(requestKey);
        setError(requestError.message || "The assistant could not explain these results.");
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setError("");
    setAnswer(null);
    const request = (async () => {
      const token = await getToken();
      return explainSearchResults(query, documentIds.slice(0, 10), token);
    })();
    requestCache.current.set(requestKey, request);
    try {
      const response = await request;
      setAnswer(response.answer);
      setSources(response.sources || []);
    } catch (requestError) {
      requestCache.current.delete(requestKey);
      setError(requestError.message || "The assistant could not explain these results.");
    } finally {
      setLoading(false);
    }
  }, [documentIds, getToken, query, requestKey]);

  useEffect(() => { generate(); }, [generate]);

  const openSource = async (source) => {
    const target = window.open("about:blank", "_blank");
    setOpeningId(source.id);
    try {
      const token = await getToken();
      const { url } = await getEmployeeDocumentDownload(source.id, token);
      if (target) {
        target.opener = null;
        target.location = url;
      } else {
        window.location.assign(url);
      }
    } catch (openError) {
      target?.close();
      setError(openError.message || "The source document could not be opened.");
    } finally {
      setOpeningId("");
    }
  };

  const hasSearchContext = query.length > 0 && documentIds.length > 0;

  return (
    <EmployeeLayout>
      <div className="min-h-full px-6 pb-12 pt-8 md:px-8">
        <div className="mx-auto max-w-5xl">
          <Link to="/search" className="inline-flex items-center gap-2 text-sm font-medium text-[#527361] hover:text-[#0C3B2E]"><ArrowLeft size={16} />Back to search</Link>
          <section className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#71977D]">IRIS AI ASSISTANT</p>
            <div className="mt-2 flex flex-wrap items-center gap-3"><h1 className="text-3xl font-semibold tracking-tight text-[#0C3B2E] md:text-4xl">Search results, explained</h1><span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF2EC] px-2.5 py-1 text-xs font-medium text-[#37694E]"><Sparkles size={13} />Grounded in your documents</span></div>
            <p className="mt-2 text-base text-[#64746C]">A concise summary and explanation based on the documents returned by your search.</p>
          </section>

          {!hasSearchContext ? <div className="mt-8 rounded-xl border border-dashed border-[#D8E2D9] bg-[#FBFCF9] px-6 py-14 text-center"><Search size={32} className="mx-auto text-[#93A69A]" /><h2 className="mt-3 font-semibold text-[#18352D]">Start with a document search</h2><p className="mt-1 text-sm text-[#77847C]">Run a search, then choose “AI summary & explanation” above the results.</p><Link to="/search" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0C3B2E] px-4 py-2.5 text-sm font-semibold !text-white hover:bg-[#155342]">Go to search <ArrowUpRight size={15} /></Link></div> : <>
            <div className="mt-6 rounded-xl border border-[#E2E7E1] bg-white px-5 py-4 shadow-sm"><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#879189]">SEARCH QUERY</p><p className="mt-1 text-base font-medium text-[#18352D]">“{query}”</p><p className="mt-1 text-xs text-[#879189]">Using up to {Math.min(documentIds.length, 10)} selected search results</p></div>

            {error && <div role="alert" className="mt-5 flex items-start gap-2 rounded-xl border border-[#F2D3CE] bg-[#FFF1EE] px-4 py-3 text-sm text-[#9B4336]"><AlertCircle size={17} className="mt-0.5 shrink-0" /><span>{error}</span></div>}

            {loading && <div className="mt-6 flex min-h-56 flex-col items-center justify-center rounded-xl border border-[#E2E7E1] bg-white text-center"><LoaderCircle size={28} className="animate-spin text-[#4E8065]" /><p className="mt-3 font-medium text-[#315E4F]">Reading the search results</p><p className="mt-1 text-sm text-[#77847C]">Preparing a grounded summary and explanation…</p></div>}

            {!loading && answer && <>
              <section className="mt-6 rounded-xl border border-[#DDE8DD] bg-[#F6FAF5] p-5 md:p-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#315E4F]"><Sparkles size={17} />Summary</div>
                <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-[#29493B]">{answer.summary}</p>
              </section>
              <section className="mt-5 rounded-xl border border-[#E2E7E1] bg-white p-5 shadow-sm md:p-6">
                <h2 className="text-lg font-semibold text-[#18352D]">Explanation</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#4F6057]">{answer.explanation}</p>
                {answer.keyPoints?.length > 0 && <><h3 className="mt-6 text-sm font-semibold text-[#315E4F]">Key points</h3><ul className="mt-2 space-y-2">{answer.keyPoints.map((point, index) => <li key={`${index}-${point}`} className="flex gap-2 text-sm leading-6 text-[#4F6057]"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6D9775]" /><span>{point}</span></li>)}</ul></>}
              </section>
              <section className="mt-5 overflow-hidden rounded-xl border border-[#E2E7E1] bg-white shadow-sm">
                <div className="border-b border-[#E9EDE8] px-5 py-4"><h2 className="font-semibold text-[#18352D]">Sources</h2><p className="mt-1 text-xs text-[#879189]">Open a source to review the original document.</p></div>
                <div className="divide-y divide-[#EEF0EC]">{sources.map((source) => <div key={source.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"><div className="flex min-w-0 items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EAF2EC] text-xs font-semibold text-[#315E4F]">[{source.number}]</span><div className="min-w-0"><p className="truncate text-sm font-medium text-[#193F34]">{source.title}</p><p className="mt-1 truncate text-xs text-[#879189]">{source.filename} · {source.department}</p></div></div><button type="button" onClick={() => openSource(source)} disabled={Boolean(openingId)} className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-[#DCE4DD] px-3 py-2 text-xs font-medium text-[#315E4F] hover:bg-[#F3F7F3] disabled:opacity-60">{openingId === source.id ? <LoaderCircle size={14} className="animate-spin" /> : <ArrowUpRight size={14} />}{openingId === source.id ? "Opening…" : "Open source"}</button></div>)}</div>
              </section>
              <div className="mt-5 flex justify-end"><button type="button" onClick={() => generate(true)} disabled={loading} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#527361] hover:bg-white disabled:opacity-50"><RefreshCw size={15} />Regenerate</button></div>
            </>}
          </>}
        </div>
      </div>
    </EmployeeLayout>
  );
}

export default AIAssistant;
