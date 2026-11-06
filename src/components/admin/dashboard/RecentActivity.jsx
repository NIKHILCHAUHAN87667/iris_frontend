import { Activity, FileSearch } from "lucide-react";
import ActivityItem from "./ActivityItem";

function relativeTime(value) {
  const elapsed = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(value).toLocaleDateString([], { month: "short", day: "numeric" });
}

function RecentActivity({ items = [], loading, unavailable }) {
  return (
    <section className="rounded-2xl border border-[#E2E7E1] bg-white p-6 shadow-sm" aria-busy={loading}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#0C3B2E]">Recent activity</h2>
          <p className="mt-1 text-sm text-[#87938E]">Latest document, user, and indexing events</p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F4F7F3] text-[#477052]"><Activity size={18} /></span>
      </div>

      <div className="mt-3">
        {loading ? (
          <div className="space-y-4 py-3" aria-label="Loading recent activity">
            {[0, 1, 2].map((item) => <div key={item} className="h-14 animate-pulse rounded-lg bg-[#F4F7F3]" />)}
          </div>
        ) : unavailable ? (
          <div className="flex min-h-44 items-center justify-center text-sm text-[#8A6500]">Recent activity is temporarily unavailable.</div>
        ) : items.length ? items.map((item, index) => (
          <ActivityItem
            key={`${item.type}-${item.createdAt}-${index}`}
            type={item.type}
            title={item.title}
            description={item.description}
            time={relativeTime(item.createdAt)}
          />
        )) : (
          <div className="flex min-h-44 flex-col items-center justify-center text-center">
            <FileSearch size={24} className="text-[#93A69A]" />
            <p className="mt-3 text-sm font-medium text-[#18352D]">No activity yet</p>
            <p className="mt-1 max-w-xs text-xs leading-5 text-[#87938E]">New uploads, employee registrations, and indexing jobs will appear here.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default RecentActivity;
