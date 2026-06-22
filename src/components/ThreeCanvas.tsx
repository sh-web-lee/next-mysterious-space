"use client";

import { forwardRef } from "react";

interface ThreeCanvasProps {
  style?: React.CSSProperties;
}

export const ThreeCanvas = forwardRef<HTMLCanvasElement, ThreeCanvasProps>(
  function ThreeCanvas({ style }, ref) {
    return (
      <main className="container" style={style}>
        <canvas ref={ref} className="three-canvas"></canvas>
      </main>
    );
  }
);
