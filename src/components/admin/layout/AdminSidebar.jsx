import {
  LayoutDashboard,
  Database,
  RefreshCw,
  Users,
  ShieldCheck,
  ClipboardList,
  BarChart3,
  FileCheck2,
  KeyRound,
} from "lucide-react";

import AdminSidebarItem from "./AdminSidebarItem";

import irisLogo from "../../../assets/iris-logo.png";
import dashboardDecoration from "../../../assets/dashboard-decoration.png";

function AdminSidebar() {
  return (
    <aside className="relative flex h-screen w-[290px] shrink-0 flex-col overflow-hidden border-r border-[#E5E9E5] bg-[#FCFBF7] px-5 py-7">

      {/* Logo */}
      <div className="relative z-20 mb-10 flex items-center px-3">
        <img
          src={irisLogo}
          alt="IRIS"
          className="h-12 w-auto object-contain"
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex flex-col gap-2">

        <AdminSidebarItem
          icon={LayoutDashboard}
          label="Admin Dashboard"
          to="/admin"
        />

        <AdminSidebarItem
          icon={RefreshCw}
          label="Ingestion Monitor"
          to="/admin/ingestion"
        />

        <AdminSidebarItem
          icon={FileCheck2}
          label="Document Review"
          to="/admin/documents"
        />

        <AdminSidebarItem
          icon={KeyRound}
          label="Access Requests"
          to="/admin/access-requests"
        />

        <AdminSidebarItem
          icon={Users}
          label="User Management"
          to="/admin/users"
        />

        <AdminSidebarItem
          icon={BarChart3}
          label="Analytics"
        />

      </nav>

      {/* Decoration */}
      <img
        src={dashboardDecoration}
        alt=""
        className="pointer-events-none absolute bottom-0 left-0 z-0 w-full opacity-90"
      />

    </aside>
  );
}

export default AdminSidebar;
