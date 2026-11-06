import Sidebar from "./Sidebar";
import Header from "./Header";

function EmployeeLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F6EF]">
      {/* Sidebar stays fixed while content scrolls */}
      <div className="h-screen shrink-0">
        <Sidebar />
      </div>

      {/* Main application area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        {/* Only this area scrolls */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default EmployeeLayout;