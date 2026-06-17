import { useNavigate } from "react-router-dom";
import { navLinks } from "../../utils/constents";

export default function NavItems({ pathname, onNavigate }) {
  const navigate = useNavigate();

  function handleNav(to) {
    navigate(to);
    onNavigate?.();
  }

  return (
    <>
      {navLinks.map(({ to, label, icon: Icon }) => {
        const active =
          to === "/admin/products"
            ? pathname.startsWith("/admin/products")
            : pathname === to;

        return (
          <button
            key={to}
            type="button"
            onClick={() => handleNav(to)}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
              active
                ? "bg-[var(--primary-dark)] text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        );
      })}
    </>
  );
}