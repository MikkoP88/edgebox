import { useCallback, useEffect, useRef, useState } from "react";
import {
  useEdgeBoxDrag,
  useEdgeBoxPosition,
  useEdgeBoxResize,
  useEdgeBoxTransform,
  type EdgeBoxAutoFocus,
  type ResizeDirection,
} from "@edgebox-lite/react";

const boxWidth = 360;
const boxHeight = 220;
const viewportInset = 24;
const sensitivityOptions = [4, 8, 12, 16, 24] as const;
const autoFocusOptions: EdgeBoxAutoFocus[] = ["unset", "corners", "horizontal", "vertical", "all", "full", "1,2,10"];

function Handle({
  dir,
  getHandleProps,
}: {
  dir: ResizeDirection;
  getHandleProps: (direction: ResizeDirection) => {
    onMouseDown?: (e: React.MouseEvent) => void;
    onTouchStart?: (e: React.TouchEvent) => void;
  };
}) {
  const size = 10;
  const handleProps = getHandleProps(dir);
  const common: React.CSSProperties = {
    position: "absolute",
    width: size,
    height: size,
    background: "rgba(255,255,255,0.85)",
    borderRadius: 999,
  };

  const pos: Record<ResizeDirection, React.CSSProperties> = {
    n: { top: -size / 2, left: "50%", transform: "translateX(-50%)", cursor: "ns-resize" },
    s: { bottom: -size / 2, left: "50%", transform: "translateX(-50%)", cursor: "ns-resize" },
    e: { right: -size / 2, top: "50%", transform: "translateY(-50%)", cursor: "ew-resize" },
    w: { left: -size / 2, top: "50%", transform: "translateY(-50%)", cursor: "ew-resize" },
    ne: { top: -size / 2, right: -size / 2, cursor: "nesw-resize" },
    nw: { top: -size / 2, left: -size / 2, cursor: "nwse-resize" },
    se: { bottom: -size / 2, right: -size / 2, cursor: "nwse-resize" },
    sw: { bottom: -size / 2, left: -size / 2, cursor: "nesw-resize" },
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

export function AutoFocusSnapBox() {
  const ref = useRef<HTMLDivElement>(null);
  const [dragAutoFocus, setDragAutoFocus] = useState<EdgeBoxAutoFocus>("corners");
  const [resizeAutoFocus, setResizeAutoFocus] = useState<EdgeBoxAutoFocus>("all");
  const [dragSensitivity, setDragSensitivity] = useState<number>(8);
  const [resizeSensitivity, setResizeSensitivity] = useState<number>(8);
  const [lastSnap, setLastSnap] = useState("No snap commit yet");

  const {
    updateEdges,
    edges,
  } = useEdgeBoxPosition({
    position: "top-center",
    width: boxWidth,
    height: boxHeight,
    padding: viewportInset,
    safeZone: viewportInset,
  });

  const {
    dragOffset,
    isDragging,
    handleMouseDown,
    handleTouchStart,
  } = useEdgeBoxDrag({
    edges,
    updateEdges,
    commitToEdges: true,
    safeZone: viewportInset,
    autoFocus: dragAutoFocus,
    autoFocusSensitivity: dragSensitivity,
    elementRef: ref,
    onDragEnd: (finalOffset) => {
      setLastSnap(`Drag ended near ${Math.round(finalOffset.x)}, ${Math.round(finalOffset.y)}`);
    },
  });

  const {
    dimensions,
    resizeOffset,
    isResizing,
    handleResizeStart,
  } = useEdgeBoxResize({
    edges,
    updateEdges,
    commitToEdges: true,
    initialWidth: boxWidth,
    initialHeight: boxHeight,
    safeZone: viewportInset,
    autoFocus: resizeAutoFocus,
    autoFocusSensitivity: resizeSensitivity,
    minWidth: 260,
    minHeight: 160,
    onResizeEnd: (finalDimensions, finalOffset) => {
      setLastSnap(
        `Resize snapped to ${Math.round(finalDimensions.width)}×${Math.round(finalDimensions.height)} at ${Math.round(finalOffset.x)}, ${Math.round(finalOffset.y)}`
      );
    },
  });

  const { transform } = useEdgeBoxTransform({
    dragOffset,
    resizeOffset,
    isResizing,
  });

  const centerBox = useCallback(() => {
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

  useEffect(() => {
    centerBox();
  }, [centerBox]);

  const snapBoxStyle: React.CSSProperties = {
    position: "fixed",
    left: edges.left,
    top: edges.top,
    width: dimensions.width,
    height: dimensions.height,
    transform,
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 16,
    padding: 12,
    touchAction: "none",
    cursor: isDragging ? "grabbing" : "grab",
  };

  const getResizeHandleProps = useCallback((direction: ResizeDirection) => ({
    onMouseDown: (e: React.MouseEvent) => handleResizeStart(direction, e),
    onTouchStart: (e: React.TouchEvent) => handleResizeStart(direction, e),
  }), [handleResizeStart]);

  return (
    <div>
      <div className="card" style={{ marginTop: 16 }}>
        <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
          <strong>AutoFocusSnapBox</strong>
          <label style={{ marginLeft: "auto" }}>
            drag autoFocus:{" "}
            <select value={dragAutoFocus} onChange={(e) => setDragAutoFocus(e.target.value as EdgeBoxAutoFocus)}>
              {autoFocusOptions.map((value) => (
                <option key={`drag-${value}`} value={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            drag sensitivity:{" "}
            <select
              value={dragSensitivity}
              onChange={(e) => setDragSensitivity(Number(e.target.value))}
            >
              {sensitivityOptions.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            resize autoFocus:{" "}
            <select value={resizeAutoFocus} onChange={(e) => setResizeAutoFocus(e.target.value as EdgeBoxAutoFocus)}>
              {autoFocusOptions.map((value) => (
                <option key={`resize-${value}`} value={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            resize sensitivity:{" "}
            <select
              value={resizeSensitivity}
              onChange={(e) => setResizeSensitivity(Number(e.target.value))}
            >
              {sensitivityOptions.map((value) => (
                <option key={`resize-${value}`} value={value}>{value}</option>
              ))}
            </select>
          </label>
        </div>
        <div style={{ marginTop: 8, fontSize: 13, opacity: 0.9, lineHeight: 1.25 }}>
          Drag and resize use separate auto-focus selections here, and snapping respects the same 24px inset on every side.
        </div>
        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
          Last snap: <code>{lastSnap}</code>
        </div>
      </div>

      <div
        ref={ref}
        style={snapBoxStyle}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Try snapping</div>
        <div style={{ fontSize: 13, opacity: 0.9 }}>
          Drag preset: <code>{dragAutoFocus}</code> · Resize preset: <code>{resizeAutoFocus}</code>
        </div>
        <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
          Drag sensitivity: <code>{dragSensitivity}</code> · Resize sensitivity: <code>{resizeSensitivity}</code>
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
          <Handle key={dir} dir={dir} getHandleProps={getResizeHandleProps} />
        ))}
      </div>
    </div>
  );
}
