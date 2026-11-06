
import {
  Bell,
  LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdminSession,
  getAdminAccessRequests,
  signOutAdmin,
} from "../../../services/adminApi";

function AdminHeader() {
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState(0);
  const [adminName, setAdminName] = useState("Administrator");

  useEffect(() => {
    let cancelled = false;

    const refreshRequests = async () => {
      try {
        const result = await getAdminAccessRequests();

        if (!cancelled) {
          setPendingRequests(
            result.requests.filter(
              (request) => request.status === "pending"
            ).length
          );
        }
      } catch {
        if (!cancelled) setPendingRequests(0);
      }
    };

    refreshRequests();
    getAdminSession().then((session) => {
      if (!cancelled && session.displayName) setAdminName(session.displayName);
    }).catch(() => {});

    const interval = window.setInterval(refreshRequests, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const initials = adminName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "AD";

  const handleSignOut = async () => {
    await signOutAdmin().catch(() => {});
    navigate("/admin/login", { replace: true });
  };

  return (
    <header className="flex h-[90px] shrink-0 items-center justify-end border-b border-[#E2E7E1] bg-[#F8F6EF] px-8">
      {/* Right side */}
      <div className="flex items-center gap-5">
        {/* Notification */}
        <button
          type="button"
          onClick={() => navigate("/admin/access-requests")}
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#0C3B2E] transition hover:bg-[#EAF2EC]"
          aria-label={
            pendingRequests
              ? `${pendingRequests} pending access requests`
              : "Access requests"
          }
          title="View access requests"
        >
          <Bell size={22} strokeWidth={1.8} />

          {pendingRequests > 0 && (
            <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#C84D3B] px-1 text-[10px] font-bold leading-none text-white">
              {pendingRequests > 9 ? "9+" : pendingRequests}
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-[#E2E7E1]" />

        {/* Admin profile */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0C3B2E] text-sm font-semibold text-white">
            {initials}
          </div>

          {/* User information */}
          <div className="hidden text-left md:block">
            <p className="text-sm font-semibold text-[#0C3B2E]">
              {adminName}
            </p>

            <p className="text-xs text-[#64746C]">
              Administrator
            </p>
          </div>

          {/* Sign out */}
          <button
            type="button"
            onClick={handleSignOut}
            className="ml-1 flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-[#64746C] transition hover:bg-[#EAF2EC] hover:text-[#0C3B2E]"
          >
            <LogOut size={15} />
            <span className="hidden lg:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
