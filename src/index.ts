/**
 * EdgeBox
 *
 * Public entrypoint for the EdgeBox system.
 *
 * Note: this file uses explicit exports (and a couple namespaces) to avoid
 * type/name collisions (e.g. multiple `Position`/`Dimensions` types).
 */

export { useEdgeBoxPaddingValues } from "./useEdgeBoxPaddingValues";
export type { PaddingValue, PaddingValues } from "./useEdgeBoxPaddingValues";

export { useEdgeBoxCssPosition } from "./useEdgeBoxCssPosition";
export type { CssEdgePosition, EdgePosition, UseEdgeBoxCssPositionResult, UseCssEdgePositionResult } from "./useEdgeBoxCssPosition";

export type { ResizeDirection } from "./types";

export { useEdgeBoxPosition } from "./useEdgeBoxPosition";
export type { EdgeBoxEdges } from "./useEdgeBoxPosition";

export type { EdgeBoxAutoFocus } from "./autoFocus";

export { useEdgeBoxDrag } from "./useEdgeBoxDrag";

export { useEdgeBoxResize } from "./useEdgeBoxResize";

export { useEdgeBoxTransform } from "./useEdgeBoxTransform";
export type { UseEdgeBoxTransformOptions, UseEdgeBoxTransformResult } from "./useEdgeBoxTransform";

export { useEdgeBoxViewportClamp } from "./useEdgeBoxViewportClamp";
