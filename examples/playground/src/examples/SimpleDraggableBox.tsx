import { useEffect } from "react";
import { useEdgeBox } from "@edgebox-lite/react";

const boxWidth = 220;
const boxHeight = 120;

export function SimpleDraggableBox() {
  const { ref, style, isDragging, getDragProps, updateEdges } = useEdgeBox({
    position: "bottom-left",
    width: boxWidth,
    height: boxHeight,
    padding: 24,
    safeZone: 16,
    commitToEdges: true,
    resizable: false,
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
      ref={ref}
      style={{
        ...style,
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.18)",
        borderRadius: 16,
        padding: 14,
        boxShadow: isDragging ? "0 20px 55px rgba(0,0,0,0.45)" : "0 14px 40px rgba(0,0,0,0.35)",
        touchAction: "none",
        cursor: isDragging ? "grabbing" : "grab",
      }}
      {...getDragProps()}
    >
      <strong>SimpleDraggableBox</strong>
      <p style={{ margin: "10px 0 0", fontSize: 13, opacity: 0.9, lineHeight: 1.3 }}>
        Minimal drag example using the new <code>useEdgeBox</code> helper.
      </p>
    </div>
  );
}
