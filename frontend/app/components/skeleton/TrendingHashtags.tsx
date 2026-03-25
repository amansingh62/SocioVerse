function SkeletonBox({ className }: { className: string }) {
  return <div className={`bg-pink-200/40 animate-pulse ${className}`} />;
}

export function TrendingHashtagsSkeleton() {
  return (
    <div
      className="rounded-2xl"
      style={{
        background: "rgba(248, 220, 234, 0.86)",
        borderRadius: "16px",
        boxShadow: "0 4px 30px rgba(0,0,0,0.1)",
        backdropFilter: "blur(15.2px)",
        WebkitBackdropFilter: "blur(15.2px)",
        border: "1px solid rgba(248,220,234,0.3)",
      }}
    >
      <div className="px-4 pt-4 pb-3 flex items-center gap-2.5">
        <SkeletonBox className="w-7 h-7 rounded-lg" />

        <div className="flex flex-col gap-1">
          <SkeletonBox className="h-3 w-32 rounded" />
          <SkeletonBox className="h-2 w-40 rounded" />
        </div>
      </div>

      <div className="flex flex-col py-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex justify-between px-4 py-2 items-center"
          >
            <div className="flex gap-2 items-center">
              <SkeletonBox className="h-3 w-4 rounded" />
              <SkeletonBox className="h-4 w-24 rounded" />
            </div>

            <SkeletonBox className="h-3 w-16 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}