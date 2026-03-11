import { useState, useRef, useEffect, useCallback } from "react";
import { EdgeBoxEdges } from "./useEdgeBoxPosition";
import { applyEdgeBoxAutoFocus, type EdgeBoxAutoFocus } from "./autoFocus";
import {
  DEFAULT_AUTO_FOCUS,
  DEFAULT_AUTO_FOCUS_SENSITIVITY,
  DEFAULT_COMMIT_TO_EDGES,
  DEFAULT_RESIZE_INITIAL_HEIGHT,
  DEFAULT_RESIZE_INITIAL_WIDTH,
  DEFAULT_SAFE_ZONE,
  DEFAULT_MIN_WIDTH,
  DEFAULT_MIN_HEIGHT,
  DEFAULT_VIEWPORT_FALLBACK_HEIGHT,
  DEFAULT_VIEWPORT_FALLBACK_WIDTH,
} from "./constants";
import type { ResizeDirection, Dimensions, Position } from "./types";

export interface UseEdgeBoxResizeOptions {
  edges: EdgeBoxEdges;
  updateEdges?: (edges: Partial<EdgeBoxEdges>) => void;
  commitToEdges?: boolean;
  onCommitSize?: (finalDimensions: Dimensions) => void;
  baseOffset?: Position;
  initialWidth?: number;
  initialHeight?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  safeZone?: number;
  autoFocus?: EdgeBoxAutoFocus;
  autoFocusSensitivity?: number;
  onResizeEnd?: (finalDimensions: Dimensions, finalOffset: Position) => void;
}

export interface UseEdgeBoxResizeResult {
  dimensions: Dimensions;
  resizeOffset: Position;
  isResizing: boolean;
  resizeDirection: ResizeDirection | null;
  handleResizeStart: (direction: ResizeDirection, e: React.MouseEvent) => void;
  resetDimensions: () => void;
}

export function useEdgeBoxResize({
  edges,
  updateEdges,
  commitToEdges = DEFAULT_COMMIT_TO_EDGES,
  onCommitSize,
  baseOffset = { x: 0, y: 0 },
  initialWidth = DEFAULT_RESIZE_INITIAL_WIDTH,
  initialHeight = DEFAULT_RESIZE_INITIAL_HEIGHT,
  minWidth = DEFAULT_MIN_WIDTH,
  minHeight = DEFAULT_MIN_HEIGHT,
  maxWidth = typeof window !== 'undefined' ? window.innerWidth : DEFAULT_VIEWPORT_FALLBACK_WIDTH,
  maxHeight = typeof window !== 'undefined' ? window.innerHeight : DEFAULT_VIEWPORT_FALLBACK_HEIGHT,
  safeZone = DEFAULT_SAFE_ZONE,
  autoFocus = DEFAULT_AUTO_FOCUS,
  autoFocusSensitivity = DEFAULT_AUTO_FOCUS_SENSITIVITY,
  onResizeEnd,
}: UseEdgeBoxResizeOptions): UseEdgeBoxResizeResult {
  const edgesRef = useRef(edges);
  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  const [dimensions, setDimensions] = useState<Dimensions>({
    width: initialWidth,
    height: initialHeight,
  });

  const [resizeOffset, setResizeOffset] = useState<Position>({ x: 0, y: 0 });

  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection | null>(null);

  const resizeStartRef = useRef<Position>({ x: 0, y: 0 });
  const startDimensionsRef = useRef<Dimensions>({ width: initialWidth, height: initialHeight });
  const startOffsetRef = useRef<Position>({ x: 0, y: 0 });

  const dimensionsRef = useRef<Dimensions>({ width: initialWidth, height: initialHeight });
  const resizeOffsetRef = useRef<Position>({ x: 0, y: 0 });
  const baseOffsetRef = useRef<Position>(baseOffset);

  useEffect(() => {
    dimensionsRef.current = dimensions;
    resizeOffsetRef.current = resizeOffset;
  }, [dimensions, resizeOffset]);

  useEffect(() => {
    baseOffsetRef.current = baseOffset;
  }, [baseOffset]);

  useEffect(() => {
    if (isResizing) return;
    setDimensions({ width: initialWidth, height: initialHeight });
  }, [initialWidth, initialHeight, isResizing]);

  const applyResize = useCallback((dx: number, dy: number) => {
    const dir = resizeDirection;
    if (!dir) return;

    const startWidth = startDimensionsRef.current.width;
    const startHeight = startDimensionsRef.current.height;
    const startOffsetX = startOffsetRef.current.x;
    const startOffsetY = startOffsetRef.current.y;

    let newWidth = startWidth;
    let newHeight = startHeight;
    let newOffsetX = startOffsetX;
    let newOffsetY = startOffsetY;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const base = baseOffsetRef.current;
    const startLeft = edges.left + base.x + startOffsetX;
    const startTop = edges.top + base.y + startOffsetY;
    const startRight = startLeft + startWidth;
    const startBottom = startTop + startHeight;

    if (dir.includes('e') && !dir.includes('w')) {
      newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + dx));
      const maxWidthByRightBoundary = (viewportWidth - safeZone) - startLeft;
      newWidth = Math.min(newWidth, maxWidthByRightBoundary);
      newOffsetX = startOffsetX;
    }

    if (dir.includes('w')) {
      let newLeft = startLeft + dx;
      newLeft = Math.max(safeZone, newLeft);

      const maxLeftByMinWidth = startRight - minWidth;
      newLeft = Math.min(newLeft, maxLeftByMinWidth);

      const minLeftByMaxWidth = startRight - maxWidth;
      newLeft = Math.max(newLeft, minLeftByMaxWidth);

      newWidth = startRight - newLeft;
      newOffsetX = startOffsetX + (newLeft - startLeft);
    }

    if (dir.includes('s') && !dir.includes('n')) {
      newHeight = Math.max(minHeight, Math.min(maxHeight, startHeight + dy));
      const maxHeightByBottomBoundary = (viewportHeight - safeZone) - startTop;
      newHeight = Math.min(newHeight, maxHeightByBottomBoundary);
      newOffsetY = startOffsetY;
    }

    if (dir.includes('n')) {
      let newTop = startTop + dy;
      newTop = Math.max(safeZone, newTop);

      const maxTopByMinHeight = startBottom - minHeight;
      newTop = Math.min(newTop, maxTopByMinHeight);

      const minTopByMaxHeight = startBottom - maxHeight;
      newTop = Math.max(newTop, minTopByMaxHeight);

      newHeight = startBottom - newTop;
      newOffsetY = startOffsetY + (newTop - startTop);
    }

    setDimensions({ width: newWidth, height: newHeight });
    setResizeOffset({ x: newOffsetX, y: newOffsetY });
  }, [resizeDirection, edges, minWidth, minHeight, maxWidth, maxHeight, safeZone]);

  const handleResizeStart = useCallback((
    direction: ResizeDirection,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    e.preventDefault();

    setIsResizing(true);
    setResizeDirection(direction);

    const startX = Math.max(0, Math.min(window.innerWidth, e.clientX));
    const startY = Math.max(0, Math.min(window.innerHeight, e.clientY));
    resizeStartRef.current = { x: startX, y: startY };
    startDimensionsRef.current = { ...dimensions };
    startOffsetRef.current = { ...resizeOffset };
  }, [dimensions, resizeOffset]);

  const handleEndResize = useCallback(() => {
    const base = baseOffsetRef.current;
    const finalOffset = resizeOffsetRef.current;
    const finalDimensions = dimensionsRef.current;

    const baseEdges = edgesRef.current;

    const actualLeft = baseEdges.left + base.x + finalOffset.x;
    const actualTop = baseEdges.top + base.y + finalOffset.y;
    const actualBox = {
      left: actualLeft,
      top: actualTop,
      right: actualLeft + finalDimensions.width,
      bottom: actualTop + finalDimensions.height,
    };

    const focused = applyEdgeBoxAutoFocus(actualBox, {
      safeZone,
      autoFocus,
      autoFocusSensitivity,
    });

    const focusedDimensions = {
      width: focused.right - focused.left,
      height: focused.bottom - focused.top,
    };

    const focusedOffset = {
      x: focused.left - (baseEdges.left + base.x),
      y: focused.top - (baseEdges.top + base.y),
    };

    setIsResizing(false);
    setResizeDirection(null);

    setResizeOffset({ x: 0, y: 0 });

    if (commitToEdges && updateEdges) {
      const left = baseEdges.left + focusedOffset.x;
      const top = baseEdges.top + focusedOffset.y;
      updateEdges({
        left,
        top,
        right: left + focusedDimensions.width,
        bottom: top + focusedDimensions.height,
      });
      onCommitSize?.(focusedDimensions);
    }

    if (onResizeEnd) {
      onResizeEnd(focusedDimensions, focusedOffset);
    }
  }, [autoFocus, autoFocusSensitivity, commitToEdges, onCommitSize, onResizeEnd, safeZone, updateEdges]);

  const resetDimensions = useCallback(() => {
    setDimensions({ width: initialWidth, height: initialHeight });
    setResizeOffset({ x: 0, y: 0 });
  }, [initialWidth, initialHeight]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const clientX = Math.max(0, Math.min(window.innerWidth, e.clientX));
      const clientY = Math.max(0, Math.min(window.innerHeight, e.clientY));

      const dx = clientX - resizeStartRef.current.x;
      const dy = clientY - resizeStartRef.current.y;
      applyResize(dx, dy);
    };

    const handleMouseUp = () => {
      handleEndResize();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, applyResize, handleEndResize]);

  return {
    dimensions,
    resizeOffset,
    isResizing,
    resizeDirection,
    handleResizeStart,
    resetDimensions,
  };
}
