function dayKey(date) {
  return date.toISOString().slice(0, 10);
}

function DocumentActivity({ dailyUploads = [], loading, unavailable }) {
  const today = new Date();
  const days = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - 29 + index));
    return { date, count: 0 };
  });
  const counts = new Map(dailyUploads.map((item) => [dayKey(new Date(item.day)), item.count]));
  days.forEach((item) => { item.count = counts.get(dayKey(item.date)) || 0; });

  const total = days.reduce((sum, item) => sum + item.count, 0);
  const maxValue = Math.max(1, ...days.map((item) => item.count));
  const width = 620;
  const height = 180;
  const coords = days.map((item, index) => ({
    x: index / (days.length - 1) * width,
    y: height - item.count / maxValue * (height - 12),
    ...item,
  }));
  const linePoints = coords.map(({ x, y }) => `${x},${y}`).join(" ");
  const areaPoints = `0,${height} ${linePoints} ${width},${height}`;
  const labels = [0, 7, 14, 21, 29].map((index) => days[index].date);

  return (
    <section className="rounded-2xl border border-[#E2E7E1] bg-white p-6 shadow-sm" aria-busy={loading}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[#0C3B2E]">Document uploads</h2>
          <p className="mt-1 text-sm text-[#87938E]">Daily uploads over the last 30 days</p>
        </div>
        <div className="rounded-xl bg-[#F4F7F3] px-4 py-2 text-right">
          <p className="text-lg font-bold text-[#0C3B2E]">{loading ? "…" : unavailable ? "—" : total}</p>
          <p className="text-[11px] font-medium uppercase tracking-wide text-[#87938E]">uploads</p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden">
        <div className="relative h-[224px] w-full">
          <div className="absolute left-0 top-0 flex h-[180px] flex-col justify-between text-xs text-[#87938E]">
            {[maxValue, Math.round(maxValue * 0.66), Math.round(maxValue * 0.33), 0].map((tick, index) => (
              <span key={`${tick}-${index}`}>{tick}</span>
            ))}
          </div>
          <div className="ml-9 h-[180px]">
            <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" preserveAspectRatio="none" role="img" aria-label="Daily document uploads over the last 30 days">
              {[0, 1, 2, 3].map((index) => (
                <line key={index} x1="0" y1={index * height / 3} x2={width} y2={index * height / 3} stroke="#E8EEE8" strokeWidth="1" />
              ))}
              <polygon points={areaPoints} fill="#DDEBE1" opacity="0.8" />
              <polyline points={linePoints} fill="none" stroke="#0C3B2E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              {coords.filter((point) => point.count > 0).map((point) => (
                <circle key={dayKey(point.date)} cx={point.x} cy={point.y} r="4" fill="#0C3B2E">
                  <title>{`${point.count} upload${point.count === 1 ? "" : "s"} on ${point.date.toLocaleDateString()}`}</title>
                </circle>
              ))}
            </svg>
          </div>
          <div className="ml-9 mt-2 flex justify-between text-[11px] text-[#87938E]">
            {labels.map((date) => <span key={date.toISOString()}>{date.toLocaleDateString([], { month: "short", day: "numeric", timeZone: "UTC" })}</span>)}
          </div>
        </div>
      </div>
      {unavailable && <p className="mt-1 text-sm text-[#8A6500]">Upload data is temporarily unavailable.</p>}
      <p className="mt-1 border-t border-[#EEF1ED] pt-3 text-xs leading-5 text-[#87938E]">
        Search queries are not currently logged, so this chart reports uploads rather than search activity.
      </p>
    </section>
  );
}

export default DocumentActivity;
