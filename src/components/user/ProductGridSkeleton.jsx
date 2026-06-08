import SkeletonCard from "./SkeletonCard";

export function ProductGridSkeleton({
  count = 8,
  layout = "vertical",
}) {
  if (layout === "horizontal") {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} layout="horizontal" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}