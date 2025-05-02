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
    <div className="dashboard-grid">
      <Sidebar isOpen={isSidebarOpen} />
      <div className="flex flex-col min-h-screen">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-grow p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
