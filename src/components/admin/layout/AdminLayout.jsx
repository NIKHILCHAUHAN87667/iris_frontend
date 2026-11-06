import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

function AdminLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F6EF]">

      {/* Fixed Sidebar */}
      <div className="h-screen shrink-0">
        <AdminSidebar />
      </div>

      {/* Main Area */}
      <div className="flex min-w-0 flex-1 flex-col">

        <AdminHeader />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

      </div>
    </div>
  );
}

export default AdminLayout;