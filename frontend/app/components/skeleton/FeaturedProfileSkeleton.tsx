function SkeletonBox({ className }: { className: string }) {
  return <div className={`bg-pink-200/40 animate-pulse ${className}`} />;
}

export default function FeaturedProfilesSkeleton() {
  return (
    <div
      className="rounded-2xl"
      style={{
        background: "rgba(248,220,234,0.86)",
        backdropFilter: "blur(15px)",
        WebkitBackdropFilter: "blur(15px)",
        border: "1px solid rgba(248,220,234,0.3)",
        boxShadow: "0 4px 30px rgba(0,0,0,0.1)",
      }}
    >
      <div className="px-4 pt-4 pb-3 flex items-center gap-2.5">
        <SkeletonBox className="w-7 h-7 rounded-lg" />

        <div className="flex flex-col gap-1">
          <SkeletonBox className="h-3 w-32 rounded" />
          <SkeletonBox className="h-2 w-40 rounded" />
        </div>
      </div>

      <div className="mx-4 h-px bg-pink-200/40" />

      <div className="flex flex-col py-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2.5">

            <SkeletonBox className="w-4 h-3 rounded" />

            <SkeletonBox className="w-9 h-9 rounded-full" />

            <div className="flex-1 space-y-1">
              <SkeletonBox className="h-3 w-24 rounded" />
              <SkeletonBox className="h-2 w-20 rounded" />
            </div>

            <SkeletonBox className="h-6 w-14 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}