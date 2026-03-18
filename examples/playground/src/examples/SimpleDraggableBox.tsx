import { useRef } from "react";
import {
  useEdgeBoxDrag,
  useEdgeBoxPaddingValues,
  useEdgeBoxPosition,
  useEdgeBoxTransform,
} from "@edgebox-lite/react";

export function SimpleDraggableBox() {
  const boxRef = useRef<HTMLDivElement>(null);
  const width = 220;
  const height = 120;
  const safeZone = 16;
  const paddingValues = useEdgeBoxPaddingValues(24);

  const { edges, updateEdges } = useEdgeBoxPosition({
    position: "bottom-left",
    width,
    height,
    padding: paddingValues,
    safeZone,
  });

  const { dragOffset, isDragging, handleMouseDown, handleTouchStart } = useEdgeBoxDrag({
    edges,
    updateEdges,
    commitToEdges: true,
    elementRef: boxRef,
    safeZone,
  });

  const { transform } = useEdgeBoxTransform({ dragOffset });

  return (
    <div
      ref={boxRef}
      style={{
        position: "fixed",
        left: edges.left,
        top: edges.top,
        width,
        height,
        transform,
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.18)",
        borderRadius: 16,
        padding: 14,
        boxShadow: isDragging ? "0 20px 55px rgba(0,0,0,0.45)" : "0 14px 40px rgba(0,0,0,0.35)",
        touchAction: "none",
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <strong>SimpleDraggableBox</strong>
      <p style={{ margin: "10px 0 0", fontSize: 13, opacity: 0.9, lineHeight: 1.3 }}>
        Minimal drag example with committed edges and a single transform.
      </p>
    </div>
  );
}
