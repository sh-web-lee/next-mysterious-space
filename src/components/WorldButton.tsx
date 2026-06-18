"use client";

import { useEffect, useRef, useState } from "react";
import { Vector3 } from "three";
import { camera } from "@/three/core";

export interface WorldBtnConfig {
  worldPosition: Vector3;
  text: string;
  name: string;
}

interface WorldButtonProps {
  worldPosition: Vector3;
  text: string;
  name: string;
  onClick: (name: string) => void;
}

export function WorldButton({
  worldPosition,
  text,
  name,
  onClick,
}: WorldButtonProps) {
  const [visible, setVisible] = useState(false);
  const [posStyle, setPosStyle] = useState<Record<string, string>>({});
  const animDelay = useRef(`${Math.random() * -10}s`);
  const rafRef = useRef(0);
  const camFwdRef = useRef(new Vector3());
  const camToBtnRef = useRef(new Vector3());

  useEffect(() => {
    function project(pos: Vector3) {
      const v = pos.clone().project(camera.instance!);
      return {
        x: (v.x * 0.5 + 0.5) * window.innerWidth,
        y: (-v.y * 0.5 + 0.5) * window.innerHeight,
        z: v.z,
      };
    }

    function update() {
      rafRef.current = requestAnimationFrame(update);
      if (!camera.instance) return;

      const { x, y, z } = project(worldPosition);
      if (z > 1) {
        setVisible(false);
        return;
      }
      camera.instance.getWorldDirection(camFwdRef.current);
      camToBtnRef.current
        .copy(worldPosition)
        .sub(camera.instance.position)
        .normalize();
      const rotY = (camToBtnRef.current.x - camFwdRef.current.x) * 120;
      const dist = camera.instance.position.distanceTo(worldPosition);
      const scale = Math.max(0.5, Math.min(1, 10 / dist));

      setPosStyle({
        left: `${x}px`,
        top: `${y}px`,
        "--anim-delay": animDelay.current,
        transform: `rotateY(${rotY}deg) scale(${scale})`,
      });
      setVisible(true);
    }

    update();
    return () => cancelAnimationFrame(rafRef.current);
  }, [worldPosition]);

  if (!visible) return null;

  return (
    <button
      className="world-btn"
      style={posStyle}
      onClick={() => onClick(name)}
    >
      <span className="world-btn__card">{text}</span>
    </button>
  );
}
