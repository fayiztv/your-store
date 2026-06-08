export function AdminProductFormToggle({ enabled, onChange, label, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className="flex flex-1 items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 transition-colors hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800"
    >
      <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        {Icon && <Icon className="h-4 w-4 text-amber-500" />}
        {label}
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
          enabled ? "bg-primary" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}