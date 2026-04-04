import React, { ReactNode } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/index";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  // Use typed selector to avoid unknown state issues
  const sidebarOpen = useSelector((state: RootState) => state.ui.sidebarOpen);

  return (
    <div className="layout">
      <Sidebar />
      <main className={`main ${!sidebarOpen ? 'sidebar-collapsed' : ''}`}>
        <Topbar />
        <div className="main-inner">
          {children}
        </div>
      </main>
    </div>
  );
}
