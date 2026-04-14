# Examples

This directory contains runnable examples for `@edgebox-lite/react`.

Live demo: https://mikkop88.github.io/edgebox-lite/

## Requirements

- Node.js 18+ (recommended: latest LTS)
- npm 9+ (or pnpm/yarn)

## How to run

1) Build the library (this repo root):

```bash
npm install
npm run build
```

2) Install and run the example playground:

```bash
cd examples/playground
npm install
npm run dev
```

Then open the dev server URL shown in the terminal.

## GitHub Pages deployment

The playground is deployed automatically from `.github/workflows/deploy-playground.yml`.

- pushes to `main` rebuild the demo
- the published site is available at `https://mikkop88.github.io/edgebox-lite/`

## Included examples

The playground app contains these examples:

- `SimpleDraggableBox` – minimal centered drag example using `useEdgeBox()`
- `SimpleResizableBox` – minimal centered resize example with handles on all edges and corners
- `DragResizeWindow` – drag + resize combined (offset composition)
- `AutoSizedQuickMenu` – auto-sized element + `useEdgeBoxViewportClamp` for intrinsic-size changes
- `AutoFocusSnapBox` – snapping (auto focus) after drag/resize
- `AnchoredCssPositionShowcase` – all supported CSS anchor points using `useEdgeBoxCssPosition()`
