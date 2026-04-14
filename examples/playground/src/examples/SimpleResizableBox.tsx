import { useEffect } from "react";
import { useEdgeBox } from "@edgebox-lite/react";

const boxWidth = 260;
const boxHeight = 160;

const resizeHandles = [
  { direction: "n", style: { top: -6, left: 12, right: 12, height: 12, cursor: "ns-resize" } },
  { direction: "s", style: { bottom: -6, left: 12, right: 12, height: 12, cursor: "ns-resize" } },
  { direction: "e", style: { top: 12, right: -6, bottom: 12, width: 12, cursor: "ew-resize" } },
  { direction: "w", style: { top: 12, left: -6, bottom: 12, width: 12, cursor: "ew-resize" } },
  { direction: "ne", style: { top: -6, right: -6, width: 16, height: 16, cursor: "nesw-resize" } },
  { direction: "nw", style: { top: -6, left: -6, width: 16, height: 16, cursor: "nwse-resize" } },
  { direction: "se", style: { right: -6, bottom: -6, width: 16, height: 16, cursor: "nwse-resize" } },
  { direction: "sw", style: { left: -6, bottom: -6, width: 16, height: 16, cursor: "nesw-resize" } },
] as const;

export function SimpleResizableBox() {
  const { style, dimensions, isResizing, getResizeHandleProps, updateEdges } = useEdgeBox({
    position: "top-right",
    width: boxWidth,
    height: boxHeight,
    padding: 24,
    safeZone: 16,
    draggable: false,
    commitToEdges: true,
    minWidth: 200,
    minHeight: 120,
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const left = (window.innerWidth - boxWidth) / 2;
    const top = (window.innerHeight - boxHeight) / 2;

    updateEdges({
      left,
      top,
      right: left + boxWidth,
      bottom: top + boxHeight,
    });
  }, [updateEdges]);

  return (
    <div
      style={{
        ...style,
        position: "fixed",
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.18)",
        borderRadius: 16,
        padding: 14,
        boxShadow: isResizing ? "0 20px 55px rgba(0,0,0,0.45)" : "0 14px 40px rgba(0,0,0,0.35)",
        touchAction: "none",
      }}
    >
      <strong>SimpleResizableBox</strong>
      <p style={{ margin: "10px 0 0", fontSize: 13, opacity: 0.9, lineHeight: 1.3 }}>
        Minimal resize example using <code>useEdgeBox</code> with resize handles on every edge and corner.
      </p>
      <div style={{ marginTop: 12, fontSize: 12, opacity: 0.82 }}>
        Size: <code>{Math.round(dimensions.width)}×{Math.round(dimensions.height)}</code>
      </div>

      {resizeHandles.map((handle) => (
        <div
          key={handle.direction}
          style={{
            position: "absolute",
            ...handle.style,
          }}
          {...getResizeHandleProps(handle.direction)}
        />
      ))}
    </div>
  );
}
