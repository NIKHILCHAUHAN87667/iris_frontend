import {
  FileText,
  UserPlus,
  RefreshCw,
} from "lucide-react";

function ActivityItem({
  type,
  title,
  description,
  time,
}) {
  const config = {
    document: {
      icon: FileText,
      style: "bg-[#EAF2EC] text-[#0C3B2E]",
    },

    user: {
      icon: UserPlus,
      style: "bg-[#FFF4D6] text-[#8A6500]",
    },

    ingestion: {
      icon: RefreshCw,
      style: "bg-[#FCE8E6] text-[#C62828]",
    },
  };

  const selected = config[type] || config.document;
  const Icon = selected.icon;

  return (
    <div className="flex items-center gap-3 border-b border-[#E2E7E1] py-4 last:border-b-0">

      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${selected.style}`}
      >
        <Icon size={19} strokeWidth={1.8} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#0C3B2E]">
          {title}
        </p>

        <p className="mt-1 truncate text-xs text-[#64746C]">
          {description}
        </p>
      </div>

      <span className="shrink-0 text-xs text-[#64746C]">
        {time}
      </span>

    </div>
  );
}

export default ActivityItem;