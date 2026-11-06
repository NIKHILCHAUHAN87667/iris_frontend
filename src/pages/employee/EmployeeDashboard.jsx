import EmployeeLayout from "../../components/employee/layout/EmployeeLayout";
import WelcomeHeader from "../../components/employee/dashboard/WelcomeHeader";
import QuickActions from "../../components/employee/dashboard/QuickActions";
import RecentDocuments from "../../components/employee/dashboard/RecentDocuments";

function EmployeeDashboard() {
  return (
    <EmployeeLayout>
      <div className="min-h-full">
        <WelcomeHeader />

        <QuickActions />

        <RecentDocuments />

        {/* Temporary dashboard area */}
        <div className="px-10 pb-10">
          <div className="rounded-2xl border border-[#E2E7E1] bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-[#0C3B2E]">
              Dashboard content
            </h2>

            <p className="mt-2 text-[#64746C]">
              Recent documents and tasks will go here.
            </p>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
}

export default EmployeeDashboard;