export function ProductListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-2xl border border-transparent bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="h-[60px] w-[60px] shrink-0 rounded-xl skeleton-shimmer" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 rounded-lg skeleton-shimmer" />
            <div className="h-3 w-1/4 rounded-full skeleton-shimmer" />
            <div className="h-4 w-1/5 rounded-lg skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}