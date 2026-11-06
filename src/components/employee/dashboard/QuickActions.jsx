import {
  Search,
  Sparkles,
  Upload,
} from "lucide-react";

import QuickActionCard from "./QuickActionCard";

function QuickActions() {
  return (
    <section className="px-10 pb-10">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-[#0C3B2E]">
          Quick Actions
        </h2>

        <p className="mt-1 text-sm text-[#64746C]">
          Access the tools you use most.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <QuickActionCard
          icon={Search}
          title="Search"
          description="Find documents and knowledge across your organization."
          accent="bg-[#EAF2EC] text-[#0C3B2E]"
        />

        <QuickActionCard
          icon={Sparkles}
          title="Ask IRIS"
          description="Ask questions and get answers grounded in your knowledge base."
          accent="bg-[#FFF4D6] text-[#8A6500]"
        />

        <QuickActionCard
          icon={Upload}
          title="Upload"
          description="Add a document to the organization's knowledge base."
          accent="bg-[#F2E8DC] text-[#8A6035]"
        />
      </div>
    </section>
  );
}

export default QuickActions;