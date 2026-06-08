import { useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "../common/ThemeToggle";
import { navLinks } from "../../utils/constents";

export default function AdminBottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-gray-200 bg-white px-2 py-2 dark:border-gray-800 dark:bg-gray-900 md:hidden">
      {navLinks.map(({ to, label, icon: Icon }) => {
        const active =
          to === "/admin/products"
            ? pathname.startsWith("/admin/products")
            : pathname === to;

        return (
          <button
            key={to}
            type="button"
            onClick={() => navigate(to)}
            className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium ${
              active ? "text-primary" : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        );
      })}
      <ThemeToggle className="!h-auto !w-auto flex-col gap-0.5 px-3 py-1.5" />
    </nav>
  );
}
