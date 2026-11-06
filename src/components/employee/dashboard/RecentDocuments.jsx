import RecentDocumentItem from "./RecentDocumentItem";

function RecentDocuments() {
  return (
    <section className="px-10 pb-10">
      
      {/* Section heading */}
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#0C3B2E]">
            Recent Documents
          </h2>

          <p className="mt-1 text-sm text-[#64746C]">
            Documents you've recently accessed or updated.
          </p>
        </div>

        <button className="text-sm font-semibold text-[#6D9775] transition hover:text-[#0C3B2E]">
          View all
        </button>
      </div>

      {/* Documents card */}
      <div className="overflow-hidden rounded-2xl border border-[#E2E7E1] bg-white shadow-sm">

        <RecentDocumentItem
          title="Employee Handbook 2026"
          type="PDF"
          updated="2 hours ago"
          owner="HR"
        />

        <RecentDocumentItem
          title="Engineering Architecture Guidelines"
          type="DOCX"
          updated="Yesterday"
          owner="Engineering"
        />

        <RecentDocumentItem
          title="Q3 Product Roadmap"
          type="PPTX"
          updated="2 days ago"
          owner="Product"
        />

        <RecentDocumentItem
          title="Information Security Policy"
          type="PDF"
          updated="3 days ago"
          owner="Security"
        />

      </div>
    </section>
  );
}

export default RecentDocuments;