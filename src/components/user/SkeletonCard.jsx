export default function SkeletonCard({ layout = "vertical" }) {
  if (layout === "horizontal") {
    return (
      <div className="flex min-h-[110px] w-full overflow-hidden rounded-2xl bg-[var(--card-bg)] shadow-sm">
        <div className="w-28 shrink-0 skeleton-shimmer" />

        <div className="flex flex-1 flex-col justify-between p-3">
          <div>
            <div className="h-4 w-3/4 rounded-lg skeleton-shimmer" />
            <div className="mt-2 h-5 w-20 rounded-full skeleton-shimmer" />
            <div className="mt-2 h-3 w-1/2 rounded-lg skeleton-shimmer" />
          </div>

          <div className="flex items-center justify-between">
            <div className="h-6 w-20 rounded-lg skeleton-shimmer" />
            <div className="h-8 w-8 rounded-full skeleton-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-[var(--card-bg)] shadow-md">
      <div className="aspect-[4/3] skeleton-shimmer" />

      <div className="space-y-3 p-4">
        <div className="h-5 w-3/4 rounded-lg skeleton-shimmer" />

        <div className="h-5 w-20 rounded-full skeleton-shimmer" />

        <div className="h-3 w-1/2 rounded-lg skeleton-shimmer" />

        <div className="flex items-center justify-between pt-1">
          <div className="h-6 w-24 rounded-lg skeleton-shimmer" />
          <div className="h-10 w-10 rounded-full skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}