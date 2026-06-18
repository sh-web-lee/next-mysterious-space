"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { lerp } from "@/utils/math";

const CURSOR_W = 40;
const CURSOR_H = 40;

export function Cursor() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const mouseRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Start at screen center
    mouseRef.current = {
      x: window.innerWidth / 2 - CURSOR_W / 2,
      y: window.innerHeight / 2 - CURSOR_H / 2,
    };
    currentRef.current = { ...mouseRef.current };

    function onMouseMove(e: MouseEvent) {
      mouseRef.current = {
        x: e.clientX - CURSOR_W / 2,
        y: e.clientY - CURSOR_H / 2,
      };
    }
    function onMouseEnter() {
      setVisible(true);
    }
    function onMouseLeave() {
      setVisible(false);
    }

    function tick() {
      currentRef.current.x = lerp(
        currentRef.current.x,
        mouseRef.current.x,
        1
      );
      currentRef.current.y = lerp(
        currentRef.current.y,
        mouseRef.current.y,
        1
      );
      if (wrapperRef.current) {
        wrapperRef.current.style.transform = `translate(${currentRef.current.x}px, ${currentRef.current.y}px)`;
      }
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseenter", onMouseEnter);
    document.addEventListener("mouseleave", onMouseLeave);
    gsap.ticker.add(tick);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mouseleave", onMouseLeave);
      gsap.ticker.remove(tick);
    };
  }, []);

  if (!visible) return null;

  return (
    <div ref={wrapperRef} className="custom-cursor">
      <svg
        width="40"
        height="40"
        viewBox="0 0 81 81"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#cursor-filter-ring)">
          <circle
            cx="40.2963"
            cy="40.2963"
            r="22.842"
            stroke="white"
            strokeWidth="0.316049"
            shapeRendering="crispEdges"
          />
        </g>
        <g filter="url(#cursor-filter-dot)">
          <circle cx="40.2961" cy="40.2961" r="3.79259" fill="white" />
        </g>
        <g filter="url(#cursor-filter-left)">
          <path
            d="M35.2963 40.2963L22.2963 40.2963L25.3915 37.2963"
            stroke="white"
            strokeLinejoin="round"
          />
        </g>
        <g filter="url(#cursor-filter-right)">
          <path
            d="M45.2963 40.2963L58.2963 40.2963L55.201 43.2963"
            stroke="white"
            strokeLinejoin="round"
          />
        </g>
        <g filter="url(#cursor-filter-up)">
          <path
            d="M40.2963 35.2963V22.2963L43.2963 25.3915"
            stroke="white"
            strokeLinejoin="round"
          />
        </g>
        <g filter="url(#cursor-filter-down)">
          <path
            d="M40.2963 45.2963L40.2963 58.2963L37.2963 55.2011"
            stroke="white"
            strokeLinejoin="round"
          />
        </g>
        <path
          d="M66.2963 34.2963L72.2963 40.2963L66.2963 46.2963L66.2963 34.2963Z"
          fill="white"
        />
        <path
          d="M14.2963 46.2963L8.29627 40.2963L14.2963 34.2963L14.2963 46.2963Z"
          fill="white"
        />
        <path
          d="M34.2963 14.2963L40.2963 8.2963L46.2963 14.2963H34.2963Z"
          fill="white"
        />
        <path
          d="M46.2963 66.2963L40.2963 72.2963L34.2963 66.2963L46.2963 66.2963Z"
          fill="white"
        />
        <defs>
          {[
            "cursor-filter-ring",
            "cursor-filter-dot",
            "cursor-filter-left",
            "cursor-filter-right",
            "cursor-filter-up",
            "cursor-filter-down",
          ].map((id, idx) => {
            // Approximate bounding boxes for each filter
            const coords = [
              { x: 8.99997, y: 9, w: 62.5926, h: 62.5926 },
              { x: 28.2072, y: 28.2072, w: 24.1778, h: 24.1778 },
              { x: 13.5, y: 28.641, w: 30.0926, h: 20.4516 },
              { x: 37, y: 31.5, w: 30.0926, h: 20.4516 },
              { x: 31.5, y: 13.5, w: 20.4517, h: 30.0926 },
              { x: 28.6408, y: 37, w: 20.4517, h: 30.0926 },
            ][idx];
            return (
              <filter
                key={id}
                id={id}
                x={coords.x}
                y={coords.y}
                width={coords.w}
                height={coords.h}
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset />
                <feGaussianBlur stdDeviation="4.14815" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"
                />
                <feBlend
                  mode="normal"
                  in2="BackgroundImageFix"
                  result="effect1_dropShadow"
                />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="effect1_dropShadow"
                  result="shape"
                />
              </filter>
            );
          })}
        </defs>
      </svg>
    </div>
  );
}
