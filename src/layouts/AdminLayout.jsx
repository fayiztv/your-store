import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminMobileHeader from "../components/admin/AdminMobileHeader";
import AdminMobileDrawer from "../components/admin/AdminMobileDrawer";
import AdminBottomNav from "../components/admin/AdminBottomNav";

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950">
      <AdminSidebar />

      <AdminMobileHeader onMenuOpen={() => setMobileOpen(true)} />

      <AdminMobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="ml-0 flex flex-1 flex-col pb-14 md:ml-64 md:pb-0">
        <main className="flex-1 bg-gray-100 p-6 mt-10 dark:bg-gray-950">
          <Outlet />
        </main>
      </div>

      <AdminBottomNav/>
    </div>
  );
}
