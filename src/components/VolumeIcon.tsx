"use client";

import { useState } from "react";

interface VolumeIconProps {
  playing?: boolean;
  size?: number;
  onToggle: () => void;
}

export function VolumeIcon({
  playing = true,
  size = 48,
  onToggle,
}: VolumeIconProps) {
  const [scaleTriggered, setScaleTriggered] = useState(false);

  function handleClick() {
    onToggle();
    setScaleTriggered(true);
    setTimeout(() => setScaleTriggered(false), 150);
  }

  return (
    <button
      className={`volume-icon${playing ? " volume-icon--playing" : ""}${scaleTriggered ? " volume-icon--scaling" : ""}`}
      onClick={handleClick}
      aria-label="Toggle sound"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="3.75"
          y="3.75"
          width="40.5"
          height="40.5"
          rx="1.25"
          stroke="url(#volume-border)"
          strokeWidth="1.5"
        />
        <path
          className="volume-icon__bar volume-icon__bar--1"
          d="M11 22.5V25.5"
          stroke="url(#volume-bar-1)"
          strokeWidth="1.5"
          strokeLinecap="square"
        />
        <path
          className="volume-icon__bar volume-icon__bar--2"
          d="M15.5 21V27"
          stroke="url(#volume-bar-2)"
          strokeWidth="1.5"
          strokeLinecap="square"
        />
        <path
          className="volume-icon__bar volume-icon__bar--3"
          d="M20 19.5V28.5"
          stroke="url(#volume-bar-3)"
          strokeWidth="1.5"
          strokeLinecap="square"
        />
        <path
          className="volume-icon__bar volume-icon__bar--4"
          d="M24.5 18L24.5 30"
          stroke="url(#volume-bar-4)"
          strokeWidth="1.5"
          strokeLinecap="square"
        />
        <path
          className="volume-icon__bar volume-icon__bar--5"
          d="M29 19.5V28.5"
          stroke="url(#volume-bar-5)"
          strokeWidth="1.5"
          strokeLinecap="square"
        />
        <path
          className="volume-icon__bar volume-icon__bar--6"
          d="M33.5 21V27"
          stroke="url(#volume-bar-6)"
          strokeWidth="1.5"
          strokeLinecap="square"
        />
        <path
          className="volume-icon__bar volume-icon__bar--7"
          d="M38 22.5V25.5"
          stroke="url(#volume-bar-7)"
          strokeWidth="1.5"
          strokeLinecap="square"
        />
        <defs>
          <radialGradient
            id="volume-border"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(24 24) rotate(90) scale(33)"
          >
            <stop offset="0.665288" stopColor="white" stopOpacity="0" />
            <stop offset="0.824072" stopColor="white" />
          </radialGradient>
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <linearGradient
              key={n}
              id={`volume-bar-${n}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="white" />
              <stop offset="0.5" stopColor="white" />
              <stop offset="1" stopColor="white" />
            </linearGradient>
          ))}
        </defs>
      </svg>
    </button>
  );
}
