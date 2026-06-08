export function ProductDetailSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="aspect-[4/3] w-full rounded-2xl skeleton-shimmer" />
      <div className="space-y-4">
        <div className="h-4 w-24 rounded-lg skeleton-shimmer" />
        <div className="h-8 w-3/4 rounded-lg skeleton-shimmer" />
        <div className="h-10 w-1/3 rounded-lg skeleton-shimmer" />
        <div className="h-4 w-full rounded-lg skeleton-shimmer" />
        <div className="h-4 w-full rounded-lg skeleton-shimmer" />
        <div className="h-4 w-2/3 rounded-lg skeleton-shimmer" />
        <div className="mt-6 h-12 w-full rounded-2xl skeleton-shimmer" />
        <div className="h-12 w-full rounded-2xl skeleton-shimmer" />
      </div>
    </div>
  );
}