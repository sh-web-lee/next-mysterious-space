"use client";

import { WorldButton, type WorldBtnConfig } from "./WorldButton";

interface WorldButtonsProps {
  buttons: WorldBtnConfig[];
  onClick: (name: string) => void;
}

export function WorldButtons({ buttons, onClick }: WorldButtonsProps) {
  return (
    <div className="button-wrap">
      {buttons.map((btn, i) => (
        <WorldButton
          key={i}
          worldPosition={btn.worldPosition}
          text={btn.text}
          name={btn.name}
          onClick={onClick}
        />
      ))}
    </div>
  );
}
