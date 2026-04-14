import { useEffect, useRef, useState } from "react";
import {
  useEdgeBoxDrag,
  useEdgeBoxTransform,
  useEdgeBoxPosition,
  useEdgeBoxViewportClamp,
  useEdgeBoxPaddingValues,
  useEdgeBoxViewportSize,
} from "@edgebox-lite/react";

export function AutoSizedQuickMenu() {
  const menuRef = useRef<HTMLDivElement>(null);

  const paddingValues = useEdgeBoxPaddingValues({ all: 24, right: 32 });
  const safeZone = 16;
  const { width: viewportWidth, height: viewportHeight } = useEdgeBoxViewportSize({ padding: 24 });

  const [open, setOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => setIsHydrated(true), []);

  // When closed, we leave width/height as `undefined` (auto-size).
  // When opened, we provide explicit dimensions so clamping math is stable.
  const compactWidth = Math.min(300, viewportWidth);
  const detailWidth = Math.min(340, viewportWidth);
  const compactHeight = Math.min(250, viewportHeight);
  const detailHeight = Math.min(320, viewportHeight);
  const numericWidth = open ? (showDetails ? detailWidth : compactWidth) : undefined;
  const numericHeight = open ? (showDetails ? detailHeight : compactHeight) : undefined;

  const { edges, updateEdges } = useEdgeBoxPosition({
    position: "top-right",
    width: numericWidth,
    height: numericHeight,
    padding: paddingValues,
    safeZone,
  });

  const { dragOffset, isDragging, isPendingDrag, handleMouseDown, handleTouchStart } = useEdgeBoxDrag({
    edges,
    updateEdges,
    commitToEdges: true,
    elementRef: menuRef,
    safeZone,
  });

  // Keep the menu inside the viewport when its intrinsic size changes.
  // Typical use-case: a submenu opens/closes or content loads.
  useEdgeBoxViewportClamp({
    elementRef: menuRef,
    updateEdges,
    safeZone,
    disabled: !isHydrated || isDragging || isPendingDrag,
    deps: [open, showDetails],
  });

  const { transform } = useEdgeBoxTransform({ dragOffset });

  const style: React.CSSProperties = {
    position: "fixed",
    left: edges.left,
    top: edges.top,
    transform,
    background: "#1b2337",
    border: "1px solid #45516f",
    borderRadius: 16,
    padding: 12,
    width: open ? numericWidth : "auto",
    maxWidth: "calc(100vw - 32px)",
    boxSizing: "border-box",
    userSelect: "none",
    touchAction: "none",
    boxShadow: "0 16px 50px #000000",
  };

  return (
    <div
      ref={menuRef}
      style={style}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <strong style={{ flex: "1 1 120px" }}>AutoSizedQuickMenu</strong>
        <button onClick={() => setOpen((v) => !v)}>{open ? "Close" : "Open"}</button>
        {open ? (
          <button onClick={() => setShowDetails((value) => !value)}>
            {showDetails ? "Compact view" : "Show details"}
          </button>
        ) : null}
      </div>

      <div style={{ marginTop: 10, fontSize: 13, color: "#d7deee", lineHeight: 1.25 }}>
        Drag the menu and keep it in view as its size changes.
      </div>

      {open ? (
        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          <button>Action A</button>
          <button>Action B</button>
          <button>Action C</button>
          {showDetails ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
              <button>Action D</button>
              <button>Action E</button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
