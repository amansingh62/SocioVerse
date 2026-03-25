import { PostCardSkeleton } from "./PostSkeleton";

function SkeletonBox({ className }: { className: string }) {
  return <div className={`bg-pink-200/40 animate-pulse ${className}`} />;
}

export function ProfilePageSkeleton() {
  return (
    <div className="max-w-[640px] mx-auto flex flex-col gap-8">

      <div
        className="rounded-3xl p-8 flex flex-col gap-6"
        style={{
          background: "rgba(255,230,242,0.85)",
          border: "1px solid rgba(224,86,164,0.25)",
        }}
      >
        <div className="flex items-start gap-6">

          <SkeletonBox className="w-24 h-24 rounded-full" />

          <div className="flex-1 space-y-3 pt-2">
            <SkeletonBox className="h-6 w-1/3 rounded" />
            <SkeletonBox className="h-4 w-1/4 rounded" />
            <SkeletonBox className="h-3 w-full rounded mt-3" />
            <SkeletonBox className="h-3 w-2/3 rounded" />
          </div>
        </div>

        <div className="flex justify-between pt-5 border-t border-[rgba(224,86,164,0.18)]">
          <div className="flex gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center space-y-2">
                <SkeletonBox className="h-5 w-10 mx-auto rounded" />
                <SkeletonBox className="h-3 w-12 mx-auto rounded" />
              </div>
            ))}
          </div>

          <SkeletonBox className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      <div className="flex gap-1 p-1 rounded-2xl bg-pink-100">
        <SkeletonBox className="flex-1 h-10 rounded-xl" />
        <SkeletonBox className="flex-1 h-10 rounded-xl" />
      </div>

      <div className="flex flex-col gap-5 pb-10">
        {Array.from({ length: 3 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}