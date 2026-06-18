"use client";

import { forwardRef, useRef, useCallback } from "react";
import { portalLoading } from "@/three/loading/index";
import { LoadingText } from "./LoadingText";

interface LoadingCanvasProps {
  style?: React.CSSProperties;
}

export const LoadingCanvas = forwardRef<HTMLCanvasElement, LoadingCanvasProps>(
  function LoadingCanvas({ style }, ref) {
    const lineSetupRef = useRef(false);

    const handleExitComplete = useCallback(() => {
      if (!lineSetupRef.current) {
        lineSetupRef.current = true;
        portalLoading.setupLineMaterial();
      }
    }, []);

    return (
      <div className="scene-container" style={style}>
        <canvas ref={ref} className="canvas-anchor"></canvas>
        <LoadingText onExitComplete={handleExitComplete} />
      </div>
    );
  }
);
