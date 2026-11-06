import {
  Home,
  Search,
  Sparkles,
  FileText,
  Folder,
  BriefcaseBusiness,
  CircleHelp,
} from "lucide-react";

import SidebarItem from "./SidebarItem";

import irisLogo from "../../../assets/iris-logo.png";
import dashboardDecoration from "../../../assets/dashboard-decoration.png";

function Sidebar() {
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

        <SidebarItem
          icon={Home}
          label="Dashboard"
          to="/dashboard"
        />

        <SidebarItem
          icon={Search}
          label="Search"
          to="/search"
        />

        <SidebarItem
          icon={Sparkles}
          label="AI Assistant"
          to="/ai-assistant"
        />

        <SidebarItem
          icon={FileText}
          label="Documents"
          to="/documents/upload"
        />

        

        

      </nav>

      {/* Bottom Section */}
      <div className="relative z-20 mt-auto pb-40">
        <div className="mb-5 border-y border-[#E2E7E1]" />

        <SidebarItem
          icon={CircleHelp}
          label="Help"
          to="/help"
        />
      </div>

      {/* Decoration */}
      <img
        src={dashboardDecoration}
        alt=""
        className="pointer-events-none absolute bottom-0 left-0 z-0 w-full opacity-90"
      />

    </aside>
  );
}

export default Sidebar;