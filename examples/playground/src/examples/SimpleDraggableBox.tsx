import { useEffect } from "react";
import { useEdgeBox, useEdgeBoxViewportSize } from "@edgebox-lite/react";

const maxBoxWidth = 200;
const maxBoxHeight = 100;
const viewportInset = 20;

export function SimpleDraggableBox() {
  const { width: viewportWidth, height: viewportHeight } = useEdgeBoxViewportSize({ padding: viewportInset });
  const boxWidth = Math.min(maxBoxWidth, viewportWidth);
  const boxHeight = Math.min(maxBoxHeight, viewportHeight);

  const { ref, style, isDragging, getDragProps, updateEdges } = useEdgeBox({
    position: "bottom-left",
    width: boxWidth,
    height: boxHeight,
    padding: viewportInset,
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
  }, [boxHeight, boxWidth, updateEdges]);

  return (
    <div
      ref={ref}
      style={{
        ...style,
        background: "#24304b",
        border: "1px solid #45516f",
        borderRadius: 16,
        padding: 14,
        boxShadow: isDragging ? "0 20px 55px #000000" : "0 14px 40px #000000",
        touchAction: "none",
        cursor: isDragging ? "grabbing" : "grab",
        boxSizing: "border-box",
      }}
      {...getDragProps()}
    >
      <strong>Simple draggable box</strong>
      <p style={{ margin: "10px 0 0", fontSize: 13, color: "#d7deee", lineHeight: 1.3 }}>
        Press anywhere on the box and move it around.
      </p>
    </div>
  );
}
