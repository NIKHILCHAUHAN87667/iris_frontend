function StatCard({
  icon: Icon,
  label,
  value,
  badge,
  badgeType = "neutral",
}) {
  const badgeStyles = badgeType === "attention"
    ? "bg-[#FFF4D6] text-[#8A6500]"
    : "bg-[#EAF2EC] text-[#477052]";

  return (
    <article className="rounded-2xl border border-[#E2E7E1] bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF2EC] text-[#0C3B2E]">
          <Icon size={20} strokeWidth={1.8} />
        </div>

        {badge && <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${badgeStyles}`}>{badge}</span>}
      </div>

      <p className="mt-4 text-sm font-medium text-[#64746C]">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold tracking-tight text-[#0C3B2E]" aria-live="polite">
        {value}
      </p>
    </article>
  );
}

export default StatCard;
