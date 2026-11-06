import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../components/admin/layout/AdminLayout";
import AdminWelcomeHeader from "../../components/admin/dashboard/AdminWelcomeHeader";
import OverviewStats from "../../components/admin/dashboard/OverviewStats";
import DocumentActivity from "../../components/admin/dashboard/SearchActivity";
import RecentActivity from "../../components/admin/dashboard/RecentActivity";
import { getAdminDashboard } from "../../services/adminApi";

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshDashboard = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const result = await getAdminDashboard();
      setDashboard(result);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Could not load dashboard data.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDashboard();
    const interval = window.setInterval(() => refreshDashboard(false), 30_000);
    return () => window.clearInterval(interval);
  }, [refreshDashboard]);

  return (
    <AdminLayout>
      <div className="min-h-full pb-8">
        <AdminWelcomeHeader
          displayName={dashboard?.displayName}
          updatedAt={dashboard?.generatedAt}
          loading={loading}
          onRefresh={() => refreshDashboard()}
        />

        {error && (
          <div role="alert" className="mx-10 mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#F0D9AE] bg-[#FFF8E8] px-4 py-3 text-sm text-[#785812]">
            <span>{error}</span>
            {dashboard && <span className="text-xs text-[#927844]">Showing the last loaded values.</span>}
          </div>
        )}

        <OverviewStats metrics={dashboard?.metrics} loading={loading && !dashboard} unavailable={!dashboard && Boolean(error)} />

        <div className="grid grid-cols-1 gap-6 px-10 pb-10 xl:grid-cols-[1.6fr_1fr]">
          <DocumentActivity dailyUploads={dashboard?.dailyUploads} loading={loading && !dashboard} unavailable={!dashboard && Boolean(error)} />
          <RecentActivity items={dashboard?.recentActivity} loading={loading && !dashboard} unavailable={!dashboard && Boolean(error)} />
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
