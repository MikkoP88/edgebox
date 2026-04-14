import { useEffect } from "react";
import { useEdgeBox, useEdgeBoxViewportSize } from "@edgebox-lite/react";

const maxBoxWidth = 230;
const maxBoxHeight = 135;
const viewportInset = 20;

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
  const { width: viewportWidth, height: viewportHeight } = useEdgeBoxViewportSize({ padding: viewportInset });
  const boxWidth = Math.min(maxBoxWidth, viewportWidth);
  const boxHeight = Math.min(maxBoxHeight, viewportHeight);

  const { style, dimensions, isResizing, getResizeHandleProps, updateEdges } = useEdgeBox({
    position: "top-right",
    initialWidth: boxWidth,
    initialHeight: boxHeight,
    padding: viewportInset,
    safeZone: 16,
    draggable: false,
    commitToEdges: true,
    minWidth: Math.min(180, boxWidth),
    minHeight: Math.min(110, boxHeight),
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
  }, [boxHeight, boxWidth, updateEdges]);

  return (
    <div
      style={{
        ...style,
        position: "fixed",
        background: "#24304b",
        border: "1px solid #45516f",
        borderRadius: 16,
        padding: 14,
        boxShadow: isResizing ? "0 20px 55px #000000" : "0 14px 40px #000000",
        touchAction: "none",
        boxSizing: "border-box",
      }}
    >
      <strong>Simple resizable box</strong>
      <p style={{ margin: "10px 0 0", fontSize: 13, color: "#d7deee", lineHeight: 1.3 }}>
        Resize demo with touch-friendly handles on every edge and corner.
      </p>
      <div style={{ marginTop: 12, fontSize: 12, color: "#d7deee" }}>
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
