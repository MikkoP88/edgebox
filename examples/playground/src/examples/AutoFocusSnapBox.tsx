import { useCallback, useEffect, useRef, useState } from "react";
import {
  useEdgeBoxDrag,
  useEdgeBoxPosition,
  useEdgeBoxResize,
  useEdgeBoxTransform,
  useEdgeBoxViewportSize,
  type EdgeBoxAutoFocus,
  type ResizeDirection,
} from "@edgebox-lite/react";

const maxBoxWidth = 200;
const maxBoxHeight = 100;
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
    background: "#ffffff",
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
  const { width: viewportWidth, height: viewportHeight } = useEdgeBoxViewportSize({ padding: viewportInset });
  const initialWidth = Math.min(maxBoxWidth, viewportWidth);
  const initialHeight = Math.min(maxBoxHeight, viewportHeight);
  const [autoFocus, setAutoFocus] = useState<EdgeBoxAutoFocus>("corners");
  const [autoFocusSensitivity, setAutoFocusSensitivity] = useState<number>(8);
  const [committedSize, setCommittedSize] = useState({ width: initialWidth, height: initialHeight });

  useEffect(() => {
    setCommittedSize((prev) => ({
      width: Math.min(prev.width, initialWidth),
      height: Math.min(prev.height, initialHeight),
    }));
  }, [initialHeight, initialWidth]);

  const {
    updateEdges,
    edges,
  } = useEdgeBoxPosition({
    position: "top-center",
    width: committedSize.width,
    height: committedSize.height,
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
    autoFocus,
    autoFocusSensitivity,
    elementRef: ref,
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
    onCommitSize: setCommittedSize,
    initialWidth: committedSize.width,
    initialHeight: committedSize.height,
    safeZone: viewportInset,
    autoFocus,
    autoFocusSensitivity,
    minWidth: Math.min(240, committedSize.width),
    minHeight: Math.min(150, committedSize.height),
  });

  const { transform } = useEdgeBoxTransform({
    dragOffset,
    resizeOffset,
    isResizing,
  });

  const centerBox = useCallback((width: number, height: number) => {
    if (typeof window === "undefined") {
      return;
    }

    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    updateEdges({
      left,
      top,
      right: left + width,
      bottom: top + height,
    });
  }, [updateEdges]);

  useEffect(() => {
    centerBox(initialWidth, initialHeight);
  }, [centerBox, initialHeight, initialWidth]);

  const snapBoxStyle: React.CSSProperties = {
    position: "fixed",
    left: edges.left,
    top: edges.top,
    width: dimensions.width,
    height: dimensions.height,
    transform,
    background: "#1b2337",
    border: "1px solid #45516f",
    borderRadius: 16,
    padding: 12,
    boxSizing: "border-box",
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
          <strong>Auto focus snap box</strong>
          <label className="controlLabel" style={{ marginLeft: "auto", minWidth: 160 }}>
            <span>Auto focus preset</span>
            <select value={autoFocus} onChange={(e) => setAutoFocus(e.target.value as EdgeBoxAutoFocus)}>
              {autoFocusOptions.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="controlLabel" style={{ minWidth: 140 }}>
            <span>Sensitivity</span>
            <select
              value={autoFocusSensitivity}
              onChange={(e) => setAutoFocusSensitivity(Number(e.target.value))}
            >
              {sensitivityOptions.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div
        ref={ref}
        style={snapBoxStyle}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Try snapping</div>
        <div style={{ fontSize: 13, color: "#d7deee" }}>
          Current preset: <code>{autoFocus}</code>
        </div>
        <div style={{ fontSize: 13, color: "#d7deee", marginTop: 4 }}>
          Sensitivity: <code>{autoFocusSensitivity}</code>
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
