import { useState } from "react";
import {
  useEdgeBoxPaddingValues,
  useEdgeBoxPosition,
  useEdgeBoxResize,
  useEdgeBoxTransform,
} from "@edgebox-lite/react";

export function SimpleResizableBox() {
  const safeZone = 16;
  const paddingValues = useEdgeBoxPaddingValues(24);
  const [size, setSize] = useState({ width: 260, height: 160 });

  const { edges, updateEdges } = useEdgeBoxPosition({
    position: "top-right",
    width: size.width,
    height: size.height,
    padding: paddingValues,
    safeZone,
  });

  const { dimensions, resizeOffset, isResizing, handleResizeStart } = useEdgeBoxResize({
    edges,
    updateEdges,
    commitToEdges: true,
    onCommitSize: setSize,
    initialWidth: size.width,
    initialHeight: size.height,
    minWidth: 200,
    minHeight: 120,
    safeZone,
  });

  const { transform } = useEdgeBoxTransform({
    resizeOffset,
    isResizing,
  });

  return (
    <div
      style={{
        position: "fixed",
        left: edges.left,
        top: edges.top,
        width: dimensions.width,
        height: dimensions.height,
        transform,
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
        Minimal resize example with one bottom-right handle.
      </p>
      <div style={{ marginTop: 12, fontSize: 12, opacity: 0.82 }}>
        Size: <code>{Math.round(dimensions.width)}×{Math.round(dimensions.height)}</code>
      </div>

      <button
        style={{ position: "absolute", right: 10, bottom: 10, cursor: "nwse-resize" }}
        onMouseDown={(e) => handleResizeStart("se", e)}
        onTouchStart={(e) => handleResizeStart("se", e)}
      >
        Resize
      </button>
    </div>
  );
}
