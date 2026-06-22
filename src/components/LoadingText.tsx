"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import gsap from "gsap";
import { loadSources } from "@/utils/loadsources";

interface LoadingTextProps {
  onExitComplete: () => void;
}

export function LoadingText({ onExitComplete }: LoadingTextProps) {
  const [progress, setProgress] = useState(0);
  const textRef = useRef<HTMLDivElement>(null);
  const displayProgress = useMemo(
    () => Math.min(Math.floor(progress * 100), 100),
    [progress],
  );

  useEffect(() => {
    loadSources.on("progress", setProgress);
    loadSources.once("ready", () => {
      if (textRef.current) {
        gsap.to(textRef.current, {
          scale: 0,
          opacity: 0,
          duration: 3.5,
          ease: "power4.in",
          onComplete: onExitComplete,
        });
      }
    });

    return () => {
      loadSources.off("progress", setProgress);
    };
  }, [onExitComplete]);

  return (
    <div ref={textRef} className="loading-text">
      <div className="subtitle">ENTER ZGOODorDIE SPACE</div>
      <div className="progress-text">{displayProgress}%</div>
    </div>
  );
}
