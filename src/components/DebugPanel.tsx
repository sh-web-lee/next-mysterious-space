"use client";

import { useEffect, useState, useCallback } from "react";
import gsap from "gsap";
import * as THREE from "three";
import { house } from "@/three/objects/house";
import { attitude } from "@/three/objects/attitude";
import { soul } from "@/three/objects/soul";
import { wish } from "@/three/objects/wish";
import { camera } from "@/three/core/camera";
import { controls } from "@/three/core/controls";
import type { ModelBase } from "@/three/objects/ModelBase";

interface AxisValues {
  x: number;
  y: number;
  z: number;
}

interface ModelEntry {
  name: string;
  instance: ModelBase;
  pos: AxisValues;
  rot: AxisValues;
  scl: AxisValues;
}

function round4(v: number) {
  return Number(v.toFixed(4));
}

function format(v: number) {
  return v.toFixed(2);
}

export function DebugPanel() {
  const [panelVisible, setPanelVisible] = useState(false);

  const [models] = useState<ModelEntry[]>(() => [
    {
      name: "House",
      instance: house,
      pos: { x: 0, y: 0, z: 0 },
      rot: { x: 0, y: 0, z: 0 },
      scl: { x: 1, y: 1, z: 1 },
    },
    {
      name: "Attitude",
      instance: attitude,
      pos: { x: 0, y: 0, z: 0 },
      rot: { x: 0, y: 0, z: 0 },
      scl: { x: 1, y: 1, z: 1 },
    },
    {
      name: "Soul",
      instance: soul,
      pos: { x: 0, y: 0, z: 0 },
      rot: { x: 0, y: 0, z: 0 },
      scl: { x: 1, y: 1, z: 1 },
    },
    {
      name: "Wish",
      instance: wish,
      pos: { x: 0, y: 0, z: 0 },
      rot: { x: 0, y: 0, z: 0 },
      scl: { x: 1, y: 1, z: 1 },
    },
  ]);

  const [camPos, setCamPos] = useState({ x: 0, y: 0, z: 0 });
  const [camTarget, setCamTarget] = useState({ x: 0, y: 0, z: 0 });
  const [camFov, setCamFov] = useState(75);
  const [camNear, setCamNear] = useState(0.1);
  const [camFar, setCamFar] = useState(1000);

  const syncCamera = useCallback(() => {
    if (!camera.instance || !controls.instance) return;
    setCamPos({
      x: round4(camera.instance.position.x),
      y: round4(camera.instance.position.y),
      z: round4(camera.instance.position.z),
    });
    setCamTarget({
      x: round4(controls.instance.target.x),
      y: round4(controls.instance.target.y),
      z: round4(controls.instance.target.z),
    });
    setCamFov(round4(camera.instance.fov));
    setCamNear(round4(camera.instance.near));
    setCamFar(round4(camera.instance.far));
  }, []);

  useEffect(() => {
    if (panelVisible) {
      gsap.ticker.add(syncCamera);
    } else {
      gsap.ticker.remove(syncCamera);
    }
    return () => {
      gsap.ticker.remove(syncCamera);
    };
  }, [panelVisible, syncCamera]);

  function updatePosition(
    entry: ModelEntry,
    axis: keyof AxisValues,
    raw: string
  ) {
    const val = parseFloat(raw);
    if (isNaN(val) || !entry.instance.model) return;
    entry.pos[axis] = val;
    entry.instance.model.scene.position[axis] = val;
  }

  function updateRotation(
    entry: ModelEntry,
    axis: keyof AxisValues,
    raw: string
  ) {
    const val = parseFloat(raw);
    if (isNaN(val) || !entry.instance.model) return;
    entry.rot[axis] = val;
    entry.instance.model.scene.rotation[axis] = THREE.MathUtils.degToRad(val);
  }

  function updateScale(
    entry: ModelEntry,
    axis: keyof AxisValues,
    raw: string
  ) {
    const val = parseFloat(raw);
    if (isNaN(val) || !entry.instance.model) return;
    entry.scl[axis] = val;
    entry.instance.model.scene.scale[axis] = val;
  }

  function updateCamPos(axis: keyof AxisValues, raw: string) {
    const val = parseFloat(raw);
    if (isNaN(val) || !camera.instance || !controls.instance) return;
    const delta = val - camera.instance.position[axis];
    camera.instance.position[axis] = val;
    controls.instance.target[axis] += delta;
  }

  function updateCamTarget(axis: keyof AxisValues, raw: string) {
    const val = parseFloat(raw);
    if (isNaN(val) || !controls.instance) return;
    controls.instance.target[axis] = val;
  }

  function updateCamFov(raw: string) {
    const val = parseFloat(raw);
    if (isNaN(val) || !camera.instance) return;
    camera.instance.fov = val;
    camera.instance.updateProjectionMatrix();
  }

  return (
    <>
      <button
        className="debug-toggle"
        onClick={() => setPanelVisible(!panelVisible)}
      >
        {panelVisible ? "✕" : "DBG"}
      </button>

      {panelVisible && (
        <div className="debug-panel">
          {/* ── Camera ── */}
          <div className="model-section camera-section">
            <div className="model-section__title">Camera</div>
            <div className="param-row">
              <span className="param-row__label">Pos</span>
              <input
                type="number"
                value={format(camPos.x)}
                step="0.1"
                onChange={(e) => updateCamPos("x", e.target.value)}
              />
              <input
                type="number"
                value={format(camPos.y)}
                step="0.1"
                onChange={(e) => updateCamPos("y", e.target.value)}
              />
              <input
                type="number"
                value={format(camPos.z)}
                step="0.1"
                onChange={(e) => updateCamPos("z", e.target.value)}
              />
            </div>
            <div className="param-row">
              <span className="param-row__label">Target</span>
              <input
                type="number"
                value={format(camTarget.x)}
                step="0.1"
                onChange={(e) => updateCamTarget("x", e.target.value)}
              />
              <input
                type="number"
                value={format(camTarget.y)}
                step="0.1"
                onChange={(e) => updateCamTarget("y", e.target.value)}
              />
              <input
                type="number"
                value={format(camTarget.z)}
                step="0.1"
                onChange={(e) => updateCamTarget("z", e.target.value)}
              />
            </div>
            <div className="param-row">
              <span className="param-row__label">FOV</span>
              <input
                type="number"
                value={format(camFov)}
                step="0.5"
                min="1"
                max="179"
                onChange={(e) => updateCamFov(e.target.value)}
              />
              <span className="param-row__label">Near</span>
              <input
                type="number"
                value={format(camNear)}
                step="0.01"
                min="0.001"
                readOnly
              />
              <span className="param-row__label">Far</span>
              <input
                type="number"
                value={format(camFar)}
                step="1"
                min="1"
                readOnly
              />
            </div>
          </div>

          {/* ── Models ── */}
          {models.map((entry) => (
            <div key={entry.name} className="model-section">
              <div className="model-section__title">
                {entry.name}
                {!entry.instance.model && (
                  <span className="model-section__inactive">
                    — not loaded
                  </span>
                )}
              </div>
              <div className="param-row">
                <span className="param-row__label">Pos</span>
                <input
                  type="number"
                  value={format(entry.pos.x)}
                  disabled={!entry.instance.model}
                  step="0.01"
                  onChange={(e) =>
                    updatePosition(entry, "x", e.target.value)
                  }
                />
                <input
                  type="number"
                  value={format(entry.pos.y)}
                  disabled={!entry.instance.model}
                  step="0.01"
                  onChange={(e) =>
                    updatePosition(entry, "y", e.target.value)
                  }
                />
                <input
                  type="number"
                  value={format(entry.pos.z)}
                  disabled={!entry.instance.model}
                  step="0.01"
                  onChange={(e) =>
                    updatePosition(entry, "z", e.target.value)
                  }
                />
              </div>
              <div className="param-row">
                <span className="param-row__label">Rot °</span>
                <input
                  type="number"
                  value={format(entry.rot.x)}
                  disabled={!entry.instance.model}
                  step="0.1"
                  onChange={(e) =>
                    updateRotation(entry, "x", e.target.value)
                  }
                />
                <input
                  type="number"
                  value={format(entry.rot.y)}
                  disabled={!entry.instance.model}
                  step="0.1"
                  onChange={(e) =>
                    updateRotation(entry, "y", e.target.value)
                  }
                />
                <input
                  type="number"
                  value={format(entry.rot.z)}
                  disabled={!entry.instance.model}
                  step="0.1"
                  onChange={(e) =>
                    updateRotation(entry, "z", e.target.value)
                  }
                />
              </div>
              <div className="param-row">
                <span className="param-row__label">Scale</span>
                <input
                  type="number"
                  value={format(entry.scl.x)}
                  disabled={!entry.instance.model}
                  step="0.01"
                  onChange={(e) =>
                    updateScale(entry, "x", e.target.value)
                  }
                />
                <input
                  type="number"
                  value={format(entry.scl.y)}
                  disabled={!entry.instance.model}
                  step="0.01"
                  onChange={(e) =>
                    updateScale(entry, "y", e.target.value)
                  }
                />
                <input
                  type="number"
                  value={format(entry.scl.z)}
                  disabled={!entry.instance.model}
                  step="0.01"
                  onChange={(e) =>
                    updateScale(entry, "z", e.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
