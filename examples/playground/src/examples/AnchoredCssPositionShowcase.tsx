import {
  useEdgeBoxCssPosition,
  useEdgeBoxPaddingValues,
  type EdgePosition,
} from "@edgebox-lite/react";

function AnchorBadge({
  label,
  position,
  tint,
}: {
  label: string;
  position: EdgePosition;
  tint: string;
}) {
  const paddingValues = useEdgeBoxPaddingValues({ top: 24, right: 24, bottom: 24, left: 24 });
  const { initialCssPosition } = useEdgeBoxCssPosition({
    position,
    paddingValues,
  });

  const centered = position.endsWith("center");

  const style: React.CSSProperties = {
    position: "fixed",
    ...initialCssPosition,
    transform: centered ? "translateX(-50%)" : undefined,
    padding: "8px 10px",
    borderRadius: 999,
    border: `1px solid ${tint}`,
    background: "#070a14",
    color: "#f7f9ff",
    fontSize: 11,
    boxShadow: "0 10px 30px #000000",
    pointerEvents: "none",
    backdropFilter: "blur(8px)",
    maxWidth: "calc(33vw - 18px)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  return <div style={style}>{label}</div>;
}

export function AnchoredCssPositionShowcase() {
  return (
    <>
      <div className="card" style={{ marginTop: 16 }}>
        <strong>Anchored CSS positions</strong>
        <div style={{ marginTop: 8, fontSize: 13, color: "#d7deee", lineHeight: 1.35 }}>
          This compact example shows every supported CSS anchor point using <code>useEdgeBoxCssPosition</code>.
        </div>
      </div>

      <AnchorBadge label="top-left" position="top-left" tint="#67e8f9" />
      <AnchorBadge label="top-center" position="top-center" tint="#a78bfa" />
      <AnchorBadge label="top-right" position="top-right" tint="#4ade80" />
      <AnchorBadge label="bottom-left" position="bottom-left" tint="#f87171" />
      <AnchorBadge label="bottom-center" position="bottom-center" tint="#f472b6" />
      <AnchorBadge label="bottom-right" position="bottom-right" tint="#facc15" />
    </>
  );
}
