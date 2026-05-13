import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="app-shell d-flex" style={{ minHeight: "100vh" }}>
      <Sidebar />
      <main className="main-content flex-grow-1 p-4">
        <Outlet />
      </main>
    </div>
  );
}
