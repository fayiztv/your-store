import { useLocation } from "react-router-dom";
import { Logo } from "../common/Logo";
import NavItems from "./AdminNavItems";
import { useLogout } from "../../hooks/useLogout";
import { LogOut } from "lucide-react";
import GlassCard from "../common/GlassCard";

export default function AdminSidebar() {
  const { pathname } = useLocation();
  const handleLogout = useLogout();

  return (
    <GlassCard className="fixed left-0 top-0 z-30 hidden h-full w-64 flex-col bg-gray-900 text-white dark:bg-gray-950 md:flex">
      <div className="p-6">
        <Logo />
      </div>

      <nav className="mt-4 flex-1 space-y-1 px-3">
        <NavItems pathname={pathname} />
      </nav>

      <div className="border-t border-gray-800 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-400 transition hover:text-red-400"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </GlassCard>
  );
}
