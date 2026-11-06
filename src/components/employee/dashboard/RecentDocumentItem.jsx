import {
  FileText,
  MoreHorizontal,
} from "lucide-react";

function RecentDocumentItem({
  title,
  type,
  updated,
  owner,
}) {
  return (
    <div className="flex items-center gap-4 border-b border-[#E2E7E1] px-5 py-4 last:border-b-0">

      {/* File icon */}
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF2EC] text-[#0C3B2E]">
        <FileText size={21} strokeWidth={1.8} />
      </div>

      {/* Document information */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-[#0C3B2E]">
          {title}
        </h3>

        <p className="mt-1 text-xs text-[#64746C]">
          {type} · Updated {updated}
        </p>
      </div>

      {/* Owner */}
      <div className="hidden text-right sm:block">
        <p className="text-xs text-[#64746C]">
          Owner
        </p>

        <p className="mt-1 text-sm font-medium text-[#18352D]">
          {owner}
        </p>
      </div>

      {/* More */}
      <button
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#64746C] transition hover:bg-[#EAF2EC] hover:text-[#0C3B2E]"
        aria-label="More options"
      >
        <MoreHorizontal size={19} />
      </button>
    </div>
  );
}

export default RecentDocumentItem;