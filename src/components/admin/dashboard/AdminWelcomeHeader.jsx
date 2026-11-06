import { RefreshCw } from "lucide-react";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function AdminWelcomeHeader({ displayName, updatedAt, loading, onRefresh }) {
  const firstName = displayName?.trim().split(/\s+/)[0] || "Administrator";

  return (
    <section className="flex flex-col gap-5 px-10 pb-8 pt-10 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.16em] text-[#6D9775]">Administration</p>
        <h1 className="text-3xl font-bold tracking-tight text-[#0C3B2E] sm:text-4xl">
          {getGreeting()}, {firstName} <span aria-hidden="true">👋</span>
        </h1>
        <p className="mt-3 max-w-2xl text-base text-[#64746C] sm:text-lg">
          Here&apos;s an overview of your organization&apos;s knowledge system.
        </p>
      </div>
      <div className="flex items-center gap-3 self-start sm:self-auto">
        {updatedAt && <span className="text-xs text-[#87938E]">Updated {new Date(updatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>}
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-[#DCE5DD] bg-white px-3.5 py-2.5 text-sm font-medium text-[#18352D] shadow-sm transition hover:bg-[#F4F7F3] disabled:cursor-wait disabled:opacity-60"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>
    </section>
  );
}

export default AdminWelcomeHeader;
