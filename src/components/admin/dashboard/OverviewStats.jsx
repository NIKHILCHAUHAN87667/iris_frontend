import {
  AlertTriangle,
  Building2,
  Clock3,
  Database,
  FileText,
  HardDrive,
  UserRoundCheck,
  Users,
} from "lucide-react";
import StatCard from "./StatCard";

function formatBytes(bytes) {
  const value = Number(bytes || 0);
  if (value < 1024) return `${value} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let scaled = value;
  let unitIndex = -1;
  do {
    scaled /= 1024;
    unitIndex += 1;
  } while (scaled >= 1024 && unitIndex < units.length - 1);
  return `${scaled.toFixed(scaled >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function OverviewStats({ metrics, loading, unavailable }) {
  const cards = [
    { icon: FileText, label: "Total Documents", value: metrics?.totalDocuments, badge: "In repository" },
    { icon: Database, label: "Indexed Documents", value: metrics?.indexedDocuments, badge: "Completed jobs" },
    { icon: Clock3, label: "Pending Review", value: metrics?.pendingReview, badge: "Needs review", attention: metrics?.pendingReview > 0 },
    { icon: AlertTriangle, label: "Failed Ingestion", value: metrics?.failedIngestionJobs, badge: "Failed jobs", attention: metrics?.failedIngestionJobs > 0 },
    { icon: Users, label: "Active Users", value: metrics?.activeUsers, badge: "Active accounts" },
    { icon: Building2, label: "Departments", value: metrics?.departments, badge: "Active departments" },
    { icon: HardDrive, label: "Storage Used", value: formatBytes(metrics?.storageBytes), badge: "Uploaded files" },
    { icon: UserRoundCheck, label: "Access Requests", value: metrics?.pendingAccessRequests, badge: "Awaiting decision", attention: metrics?.pendingAccessRequests > 0 },
  ];

  return (
    <section className="px-10 pb-10" aria-label="Organization metrics" aria-busy={loading}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <StatCard
            key={card.label}
            {...card}
            value={loading ? "…" : unavailable ? "—" : (card.value ?? 0)}
            badge={unavailable ? "Unavailable" : card.badge}
            badgeType={card.attention ? "attention" : "neutral"}
          />
        ))}
      </div>
    </section>
  );
}

export default OverviewStats;
