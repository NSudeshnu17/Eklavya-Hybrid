import React, { memo, useRef } from "react";
import TypewriterEffectSmoothDemo from "./Typewritertext";

const SparklesPreview = memo(
  ({ id, className, word, canvasId, particleClass }) => {
    let divhide = useRef(null);

    return (
      <div className="w-full flex flex-col items-center justify-center overflow-hidden rounded-md">
        <TypewriterEffectSmoothDemo words={word} classname={className} />
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function: only re-render if props change
    return (
      prevProps.word === nextProps.word &&
      prevProps.className === nextProps.className &&
      prevProps.canvasId === nextProps.canvasId &&
      prevProps.particleClass === nextProps.particleClass
    );
  }
);

export default SparklesPreview;
