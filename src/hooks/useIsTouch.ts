"use client";

import { useEffect, useState } from "react";

export function useIsTouch(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(
      "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        (window.matchMedia && window.matchMedia("(pointer: coarse)").matches)
    );
  }, []);

  return isTouch;
}
