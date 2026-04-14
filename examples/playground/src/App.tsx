import { useState } from "react";
import { DragResizeWindow } from "./examples/DragResizeWindow";
import { AutoSizedQuickMenu } from "./examples/AutoSizedQuickMenu";
import { AutoFocusSnapBox } from "./examples/AutoFocusSnapBox";
import { AnchoredCssPositionShowcase } from "./examples/AnchoredCssPositionShowcase";
import { SimpleDraggableBox } from "./examples/SimpleDraggableBox";
import { SimpleResizableBox } from "./examples/SimpleResizableBox";

type ExampleId =
  | "simple-drag"
  | "simple-resize"
  | "drag-resize"
  | "auto-size-clamp"
  | "autofocus"
  | "css-position";

const exampleMeta: Record<ExampleId, { label: string; features: string[] }> = {
  "simple-drag": {
    label: "Simple draggable box",
    features: ["useEdgeBox", "useEdgeBoxViewportSize"],
  },
  "simple-resize": {
    label: "Simple resizable box",
    features: ["useEdgeBox", "useEdgeBoxViewportSize"],
  },
  "drag-resize": {
    label: "Drag + resize window",
    features: ["useEdgeBox", "useEdgeBoxViewportSize"],
  },
  "auto-size-clamp": {
    label: "Auto-sized quick menu + clamp",
    features: [
      "useEdgeBoxDrag",
      "useEdgeBoxPaddingValues",
      "useEdgeBoxPosition",
      "useEdgeBoxTransform",
      "useEdgeBoxViewportClamp",
      "useEdgeBoxViewportSize",
    ],
  },
  autofocus: {
    label: "Auto focus snapping",
    features: [
      "useEdgeBoxDrag",
      "useEdgeBoxPosition",
      "useEdgeBoxResize",
      "useEdgeBoxTransform",
      "useEdgeBoxViewportSize",
    ],
  },
  "css-position": {
    label: "CSS edge positioning",
    features: ["useEdgeBoxCssPosition", "useEdgeBoxPaddingValues"],
  },
};

export function App() {
  const [example, setExample] = useState<ExampleId>("simple-drag");
  const selectedMeta = exampleMeta[example];

  const exampleElement = (() => {
    switch (example) {
      case "simple-drag":
        return <SimpleDraggableBox />;
      case "simple-resize":
        return <SimpleResizableBox />;
      case "drag-resize":
        return <DragResizeWindow />;
      case "auto-size-clamp":
        return <AutoSizedQuickMenu />;
      case "autofocus":
        return <AutoFocusSnapBox />;
      case "css-position":
        return <AnchoredCssPositionShowcase />;
    }
  })();

  return (
    <div className="container">
      <div className="card">
        <div className="row">
          <label className="controlLabel">
            <span>Example</span>
            <select value={example} onChange={(e) => setExample(e.target.value as ExampleId)}>
              <option value="simple-drag">{exampleMeta["simple-drag"].label}</option>
              <option value="simple-resize">{exampleMeta["simple-resize"].label}</option>
              <option value="drag-resize">{exampleMeta["drag-resize"].label}</option>
              <option value="autofocus">{exampleMeta.autofocus.label}</option>
              <option value="auto-size-clamp">{exampleMeta["auto-size-clamp"].label}</option>
              <option value="css-position">{exampleMeta["css-position"].label}</option>
            </select>
          </label>
        </div>
        <div className="featureList">
          {selectedMeta.features.map((feature) => (
            <span key={feature} className="featurePill">{feature}</span>
          ))}
        </div>
      </div>

      {exampleElement}
    </div>
  );
}
