"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { three } from "@/three";
import { camera } from "@/three/core";
import { portalLoading } from "@/three/loading/index";
import { loadSources } from "@/utils/loadsources";
import sizes from "@/utils/Sizes";
import { house } from "@/three/objects/house";
import { attitude } from "@/three/objects/attitude";
import { soul } from "@/three/objects/soul";
import { wish } from "@/three/objects/wish";
import { ModelBase } from "@/three/objects/ModelBase";
import { modalContent } from "@/data/modalContent";
import { useIsTouch } from "@/hooks/useIsTouch";
import { ThreeCanvas } from "./ThreeCanvas";
import { LoadingCanvas } from "./LoadingCanvas";
import { AppHeader } from "./AppHeader";
import { WorldButtons } from "./WorldButtons";
import type { WorldBtnConfig } from "./WorldButton";
import { ButtomControl } from "./ButtomControl";
import { OverlayModal } from "./OverlayModal";
import { Cursor } from "./Cursor";

// Module-level guard for one-time init (survives HMR + Strict Mode remounts)
let didInit = false;

// Track the last canvas portalLoading was bound to, so we can rebind
// when Strict Mode recreates the DOM element.
let lastPortalCanvas: HTMLCanvasElement | null = null;

export default function App() {
  const isTouch = useIsTouch();

  // Remove SSR loading shell as soon as React mounts
  useEffect(() => {
    const shell = document.getElementById("ssr-loading-shell");
    if (shell) shell.style.display = "none";
  }, []);

  const threeCanvasRef = useRef<HTMLCanvasElement>(null);
  const loadingCanvasRef = useRef<HTMLCanvasElement>(null);

  const [worldBtns, setWorldBtns] = useState<WorldBtnConfig[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modal, setModal] = useState({ title: "", description: "" });
  const [loadingMounted, setLoadingMounted] = useState(true);
  const [loadingOpacity, setLoadingOpacity] = useState(1);

  const handleBtnClick = useCallback((name: string) => {
    setModalVisible(true);
    setModal(modalContent[name]);
  }, []);

  // ── One-time setup: sizes, loadSources, event listeners ──
  useEffect(() => {
    if (didInit) return;
    didInit = true;

    sizes.init();
    loadSources.startLoading();

    // Models ready → build 3D scene + world buttons
    loadSources.once("ready", () => {
      three.initCore(threeCanvasRef.current!);

      const btns: WorldBtnConfig[] = [];
      const mappings: [ModelBase, string, string, string][] = [
        [house, "立方体014", "ZGOODorDIE", "goodordie"],
        [attitude, "Retopo_POSE_FOUR_CLOTH002", "Z attitude", "attitude"],
        [soul, "Retopo_文本003", "Z soul", "soul"],
        [wish, "Retopo_Object___6_002002", "Z wish", "wish"],
      ];
      for (const [model, childName, text, name] of mappings) {
        const wp = model.getChildPosition(childName);
        if (wp) btns.push({ worldPosition: wp.clone(), text, name });
      }
      setWorldBtns(btns);
    });

    // Portal animation complete → crossfade to 3D scene
    portalLoading.once("complete", () => {
      const obj = { val: 1 };
      gsap.to(obj, {
        val: 0,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => setLoadingOpacity(obj.val),
        onComplete: () => {
          setLoadingMounted(false);
          camera.animateToEnd();
        },
      });
    });
  }, []);

  // ── Canvas binding: always ensure portalLoading is bound to the current canvas.
  // Runs on every render to handle Strict Mode DOM recreation. ──
  useEffect(() => {
    const canvas = loadingCanvasRef.current;
    if (canvas && canvas !== lastPortalCanvas) {
      lastPortalCanvas = canvas;
      portalLoading.init(canvas);
    }
  });

  return (
    <>
      {/* Header — hidden until loading completes */}
      {!loadingMounted && <AppHeader />}

      {/* 3D scene — fades in as loading overlay fades out */}
      <ThreeCanvas
        ref={threeCanvasRef}
        style={{ opacity: 1 - loadingOpacity }}
      />

      {/* Loading overlay — the ONLY visible element during load */}
      {loadingMounted && (
        <LoadingCanvas
          ref={loadingCanvasRef}
          style={{ opacity: loadingOpacity }}
        />
      )}

      {/* UI controls — only after loading */}
      {!loadingMounted && (
        <>
          <WorldButtons buttons={worldBtns} onClick={handleBtnClick} />
          <ButtomControl />
        </>
      )}

      <OverlayModal
        show={modalVisible}
        title={modal.title}
        description={modal.description}
        onClose={() => setModalVisible(false)}
      />

      {/* Custom cursor — always visible (global CSS hides default cursor) */}
      {!isTouch && <Cursor />}
    </>
  );
}
