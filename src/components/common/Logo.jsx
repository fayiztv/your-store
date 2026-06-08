export function Logo({ onClick, light = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-80"
    >
        <img src="public\favicon.jpeg" alt="" className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-white"/>
      <span
        className={`font-outfit text-lg font-bold md:text-xl ${
          light ? "text-white" : "text-[var(--text-primary)]"
        }`}
      >
        Thread Store
      </span>
    </button>
  );
}