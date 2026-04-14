import { useCallback, useEffect, useState } from "react";
import {
  useEdgeBox,
  useEdgeBoxViewportSize,
  type ResizeDirection,
} from "@edgebox-lite/react";

const maxWindowWidth = 300;
const maxWindowHeight = 200;
const viewportInset = 20;

function ResizeHandle({
  dir,
  getHandleProps,
}: {
  dir: ResizeDirection;
  getHandleProps: (direction: ResizeDirection) => {
    onMouseDown?: (e: React.MouseEvent) => void;
    onTouchStart?: (e: React.TouchEvent) => void;
  };
}) {
  const cornerSize = 16;
  const edgeThickness = 12;
  const edgeLength = 44;
  const handleProps = getHandleProps(dir);
  const isCorner = dir.length === 2;

  const common: React.CSSProperties = {
    position: "absolute",
    width: isCorner ? cornerSize : dir === "n" || dir === "s" ? edgeLength : edgeThickness,
    height: isCorner ? cornerSize : dir === "n" || dir === "s" ? edgeThickness : edgeLength,
    background: "#ffffff",
    borderRadius: isCorner ? 999 : 10,
    pointerEvents: "auto",
    boxShadow: "0 6px 16px #000000",
    border: "1px solid #0b1020",
  };

  const pos: Record<ResizeDirection, React.CSSProperties> = {
    n: { top: -edgeThickness / 2, left: "50%", transform: "translateX(-50%)", cursor: "ns-resize" },
    s: { bottom: -edgeThickness / 2, left: "50%", transform: "translateX(-50%)", cursor: "ns-resize" },
    e: { right: -edgeThickness / 2, top: "50%", transform: "translateY(-50%)", cursor: "ew-resize" },
    w: { left: -edgeThickness / 2, top: "50%", transform: "translateY(-50%)", cursor: "ew-resize" },
    ne: { top: -cornerSize / 2, right: -cornerSize / 2, cursor: "nesw-resize" },
    nw: { top: -cornerSize / 2, left: -cornerSize / 2, cursor: "nwse-resize" },
    se: { bottom: -cornerSize / 2, right: -cornerSize / 2, cursor: "nwse-resize" },
    sw: { bottom: -cornerSize / 2, left: -cornerSize / 2, cursor: "nesw-resize" },
  };

  return (
    <div
      style={{ ...common, ...pos[dir] }}
      onMouseDown={(e) => {
        e.stopPropagation();
        handleProps.onMouseDown?.(e);
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
        handleProps.onTouchStart?.(e);
      }}
    />
  );
}

export function DragResizeWindow() {
  const [eventSummary, setEventSummary] = useState("Try dragging or resizing the window.");
  const { width: viewportWidth, height: viewportHeight } = useEdgeBoxViewportSize({ padding: viewportInset });
  const windowWidth = Math.min(maxWindowWidth, viewportWidth);
  const windowHeight = Math.min(maxWindowHeight, viewportHeight);
  const minWidth = Math.min(280, windowWidth);
  const minHeight = Math.min(180, windowHeight);

  const {
    ref,
    style,
    isDragging,
    isResizing,
    updateEdges,
    getDragProps,
    getResizeHandleProps,
  } = useEdgeBox({
    position: "bottom-center",
    width: windowWidth,
    height: windowHeight,
    padding: viewportInset,
    safeZone: 16,
    commitToEdges: true,
    autoFocus: "corners",
    autoFocusSensitivity: 6,
    onDragEnd: (finalOffset) => {
      setEventSummary(`Drag committed with offset ${Math.round(finalOffset.x)}, ${Math.round(finalOffset.y)}.`);
    },
    minWidth,
    minHeight,
    onResizeEnd: (finalDimensions, finalOffset) => {
      setEventSummary(
        `Resize committed to ${Math.round(finalDimensions.width)}×${Math.round(finalDimensions.height)} at ${Math.round(finalOffset.x)}, ${Math.round(finalOffset.y)}.`
      );
    },
  });

  const centerWindow = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    const left = (window.innerWidth - windowWidth) / 2;
    const top = (window.innerHeight - windowHeight) / 2;

    updateEdges({
      left,
      top,
      right: left + windowWidth,
      bottom: top + windowHeight,
    });
  }, [updateEdges, windowHeight, windowWidth]);

  useEffect(() => {
    centerWindow();
  }, [centerWindow]);

  const headerStyle: React.CSSProperties = {
    padding: 12,
    borderBottom: "1px solid #45516f",
    background: "#12192b",
  };

  return (
    <div
      ref={ref}
      style={{
        ...style,
        background: "#1b2337",
        border: "1px solid #45516f",
        borderRadius: 18,
        overflow: "hidden",
        cursor: isDragging ? "grabbing" : "grab",
        boxSizing: "border-box",
        boxShadow:
          isDragging || isResizing
            ? "0 28px 90px #000000"
            : "0 14px 40px #000000",
      }}
      {...getDragProps()}
    >
      <div style={headerStyle}>
        <strong>Drag + resize window</strong>
        <div style={{ fontSize: 13, color: "#d7deee", marginTop: 4 }}>
          Drag anywhere except the action buttons. Resize from any edge or corner.
        </div>
      </div>

      <div style={{ padding: 12, fontSize: 14, color: "#e8ecff", lineHeight: 1.3 }}>
        <div style={{ marginTop: 12, fontSize: 13, color: "#d7deee" }}>
          {eventSummary}
        </div>
      </div>

      {([
        "n",
        "s",
        "e",
        "w",
        "ne",
        "nw",
        "se",
        "sw",
      ] as const).map((dir) => (
        <ResizeHandle key={dir} dir={dir} getHandleProps={getResizeHandleProps} />
      ))}

      <div
        style={{
          position: "absolute",
          left: 10,
          bottom: 10,
          fontSize: 12,
          color: "#d7deee",
        }}
      >
        {isDragging ? "Dragging" : isResizing ? "Resizing" : "Idle"}
      </div>
    </div>
  );
}
