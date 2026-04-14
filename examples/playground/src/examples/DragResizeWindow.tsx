import { useCallback, useEffect, useState } from "react";
import {
  useEdgeBox,
  type ResizeDirection,
} from "@edgebox-lite/react";

const windowWidth = 420;
const windowHeight = 260;

function ResizeHandle({
  dir,
  getHandleProps,
  disabled,
}: {
  dir: ResizeDirection;
  getHandleProps: (direction: ResizeDirection) => {
    onMouseDown?: (e: React.MouseEvent) => void;
    onTouchStart?: (e: React.TouchEvent) => void;
  };
  disabled?: boolean;
}) {
  const size = 12;
  const handleProps = getHandleProps(dir);

  const common: React.CSSProperties = {
    position: "absolute",
    width: size,
    height: size,
    background: disabled ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.9)",
    borderRadius: 999,
    pointerEvents: disabled ? "none" : "auto",
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

export function DragResizeWindow() {
  const [autoRecalc, setAutoRecalc] = useState(true);
  const [eventSummary, setEventSummary] = useState("Try dragging or resizing the panel.");

  const {
    ref,
    style,
    isDragging,
    isPendingDrag,
    isResizing,
    resetSize,
    recalculate,
    cancelDrag,
    updateEdges,
    getDragProps,
    getResizeHandleProps,
  } = useEdgeBox({
    position: "bottom-center",
    width: windowWidth,
    height: windowHeight,
    padding: 24,
    safeZone: 16,
    disableAutoRecalc: !autoRecalc,
    commitToEdges: true,
    autoFocus: "corners",
    autoFocusSensitivity: 6,
    onDragEnd: (finalOffset) => {
      setEventSummary(`Drag committed with offset ${Math.round(finalOffset.x)}, ${Math.round(finalOffset.y)}.`);
    },
    minWidth: 320,
    minHeight: 200,
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
  }, [updateEdges]);

  useEffect(() => {
    centerWindow();
  }, [centerWindow]);

  const dragSafeButtonProps = {
    onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => e.stopPropagation(),
    onTouchStart: (e: React.TouchEvent<HTMLButtonElement>) => e.stopPropagation(),
  };

  const headerStyle: React.CSSProperties = {
    padding: 12,
    borderBottom: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.2)",
  };

  const handleResetAll = () => {
    cancelDrag();
    centerWindow();
    resetSize({ commit: true });
    setEventSummary("Position reset to center and size reset to its default.");
  };

  return (
    <div
      ref={ref}
      style={{
        ...style,
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.18)",
        borderRadius: 18,
        overflow: "hidden",
        cursor: isDragging ? "grabbing" : "grab",
        boxShadow:
          isDragging || isResizing
            ? "0 28px 90px rgba(0,0,0,0.55)"
            : "0 14px 40px rgba(0,0,0,0.35)",
      }}
      {...getDragProps()}
    >
      <div style={headerStyle}>
        <strong>DragResizeWindow</strong>
        <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
          Drag from anywhere except the buttons. Resize from corners or edges. This version uses the new <code>useEdgeBox</code> helper.
        </div>
      </div>

      <div style={{ padding: 12, fontSize: 14, opacity: 0.92, lineHeight: 1.3 }}>
        <p style={{ margin: 0 }}>
          Key idea: drag and resize both produce offsets. When you use both together,
          compose them into one <code>transform</code>.
        </p>

        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <button {...dragSafeButtonProps} onClick={centerWindow}>Reset position</button>
          <button {...dragSafeButtonProps} onClick={() => resetSize({ commit: true })}>Reset size</button>
          <button {...dragSafeButtonProps} onClick={() => recalculate()}>Manual recalc</button>
          <button {...dragSafeButtonProps} onClick={handleResetAll}>Reset all</button>
          <button {...dragSafeButtonProps} onClick={() => setAutoRecalc((value) => !value)}>
            Auto recalc: {autoRecalc ? "on" : "off"}
          </button>
        </div>

        <div style={{ marginTop: 12, fontSize: 13, opacity: 0.9 }}>
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
          opacity: 0.8,
        }}
      >
        {isDragging ? "Dragging" : isResizing ? "Resizing" : "Idle"}
      </div>
    </div>
  );
}
