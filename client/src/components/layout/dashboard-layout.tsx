import React, { ReactNode, useState } from "react";
import Sidebar from "./sidebar";
import Header from "./header";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div className={`fixed md:relative z-20 ${isSidebarOpen ? "" : "hidden md:block"}`}>
        <Sidebar isOpen={isSidebarOpen} />
      </div>
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-6 bg-white">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
