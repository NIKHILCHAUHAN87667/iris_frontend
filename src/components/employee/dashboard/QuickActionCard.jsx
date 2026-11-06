function QuickActionCard({
  icon: Icon,
  title,
  description,
  accent,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full flex-col rounded-2xl border border-[#E2E7E1] bg-white p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#6D9775] hover:shadow-md"
    >
      {/* Icon */}
      <div
        className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${accent}`}
      >
        <Icon size={23} strokeWidth={1.8} />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-[#0C3B2E]">
        {title}
      </h3>

      {/* Description */}
      <p className="mt-2 text-sm leading-6 text-[#64746C]">
        {description}
      </p>

      {/* Action */}
      <div className="mt-5 text-sm font-semibold text-[#6D9775] transition group-hover:text-[#0C3B2E]">
        Get started →
      </div>
    </button>
  );
}

export default QuickActionCard;