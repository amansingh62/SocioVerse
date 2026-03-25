function SkeletonBox({ style }: { style: React.CSSProperties }) {
  return (
    <div
      style={{
        background: "rgba(233,30,140,0.15)",
        borderRadius: "8px",
        animation: "pulse 1.5s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

export function PostCardSkeleton() {
  return (
    <article
      style={{
        background: "#FFFFFF",
        borderRadius: "20px",
        padding: "22px 24px 18px",
        display: "flex",
        flexDirection: "column",
        boxShadow:
          "0 2px 16px rgba(233,30,140,0.07), 0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "13px",
          marginBottom: "14px",
        }}
      >
        <SkeletonBox
          style={{
            width: "46px",
            height: "46px",
            borderRadius: "50%",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <SkeletonBox style={{ width: "120px", height: "14px" }} />
          <SkeletonBox style={{ width: "90px", height: "12px" }} />
        </div>

        <div style={{ marginLeft: "auto" }}>
          <SkeletonBox style={{ width: "60px", height: "20px" }} />
        </div>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <SkeletonBox style={{ width: "100%", height: "12px", marginBottom: "6px" }} />
        <SkeletonBox style={{ width: "85%", height: "12px", marginBottom: "6px" }} />
        <SkeletonBox style={{ width: "60%", height: "12px" }} />
      </div>

      <SkeletonBox
        style={{
          width: "100%",
          height: "260px",
          borderRadius: "14px",
          marginBottom: "16px",
        }}
      />

      <div style={{ display: "flex", gap: "14px", marginTop: "6px" }}>
        <SkeletonBox style={{ width: "50px", height: "20px" }} />
        <SkeletonBox style={{ width: "50px", height: "20px" }} />
        <SkeletonBox style={{ width: "60px", height: "20px" }} />
      </div>
    </article>
  );
}