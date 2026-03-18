import { useCallback, useEffect } from "react";
import type { EdgeBoxEdges } from "./useEdgeBoxPosition";
import { DEFAULT_SAFE_ZONE } from "./constants";
import { getViewportClampDelta } from "./viewportBounds";

export interface UseEdgeBoxViewportClampOptions {
  elementRef: React.RefObject<HTMLElement>;
  updateEdges: (edges: Partial<EdgeBoxEdges>) => void;
  safeZone?: number;
  disabled?: boolean;
  deps?: readonly unknown[];
}

export interface UseEdgeBoxViewportClampResult {
  clampNow: () => void;
}

/**
 * Keeps an auto-sized element inside the viewport by measuring its DOM rect and committing
 * corrected edges via `updateEdges`.
 *
 * Use this for elements whose size changes outside drag/resize gestures (menus, popovers, etc.).
 */
export function useEdgeBoxViewportClamp({
  elementRef,
  updateEdges,
  safeZone = DEFAULT_SAFE_ZONE,
  disabled = false,
  deps = [],
}: UseEdgeBoxViewportClampOptions): UseEdgeBoxViewportClampResult {
  const clampIntoViewport = useCallback(() => {
    if (disabled) return;
    if (typeof window === "undefined") return;

    const el = elementRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const { x: dx, y: dy } = getViewportClampDelta(
      rect,
      safeZone,
      window.innerWidth,
      window.innerHeight,
    );

    if (dx === 0 && dy === 0) return;

    updateEdges({
      left: rect.left + dx,
      right: rect.right + dx,
      top: rect.top + dy,
      bottom: rect.bottom + dy,
    });
  }, [disabled, elementRef, safeZone, updateEdges]);

  // Clamp after dependency changes (e.g. open/close) once the DOM has painted.
  useEffect(() => {
    if (disabled) return;
    if (typeof window === "undefined") return;

    const id = window.requestAnimationFrame(() => clampIntoViewport());
    return () => window.cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled, clampIntoViewport, ...deps]);

  // Clamp on intrinsic size changes (transitions, content updates, responsive changes).
  useEffect(() => {
    if (disabled) return;
    if (typeof window === "undefined") return;

    const el = elementRef.current;
    if (!el) return;

    if (typeof ResizeObserver === "undefined") return;

    const ro = new ResizeObserver(() => {
      clampIntoViewport();
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [disabled, clampIntoViewport, elementRef]);

  return {
    clampNow: clampIntoViewport,
  };
}
