"use client";

import { useEffect, useState } from "react";

export function ButtomControl() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function checkDevice() {
      setIsMobile(window.innerWidth < 768);
    }
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  return (
    <div className="bottom-controls-container">
      <div className="bottom-controls-pill" id="bottom-controls-pill">
        {/* Scroll To Zoom Segment */}
        <div className="control-segment">
          <div className="icon-wrapper">
            <img
              className="control-icon"
              src="/assets/icons/scroll.svg"
              alt="scroll"
            />
          </div>
          <span className="control-label">SCROLL TO ZOOM</span>
        </div>

        {/* Drag To Rotate Segment */}
        <div className="control-segment">
          <div className="icon-wrapper">
            <img
              className="control-icon"
              src="/assets/icons/drag.svg"
              alt="drag"
            />
          </div>
          <span className="control-label">CLICK & DRAG TO ROTATE</span>
        </div>
      </div>
    </div>
  );
}
