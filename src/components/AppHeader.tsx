"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { VolumeIcon } from "./VolumeIcon";
import { audioManager } from "@/hooks/useAudio";

const AUDIO_KEY = "zgoddie-audio-playing";

export function AppHeader() {
  const [playing, setPlaying] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(AUDIO_KEY) === "true";
    }
    return false;
  });
  const initRef = useRef(false);

  const volumeSize = useMemo(() => {
    if (typeof window === "undefined") return 48;
    return window.innerWidth <= 768 ? 32 : 48;
  }, []);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    audioManager.setPlayingCallback(setPlaying);

    // 加载音频（Howler 内部处理 AudioContext 解锁）
    audioManager.load("/audio/entrance.mp3");

    // 如果上次是播放状态，请求播放（解锁后自动开始）
    if (playing) {
      audioManager.play();
    }
  }, [playing]);

  function handleToggle() {
    const next = !playing;
    setPlaying(next);
    localStorage.setItem(AUDIO_KEY, String(next));
    if (next) {
      audioManager.play();
    } else {
      audioManager.stop();
    }
  }

  return (
    <header className="app-header">
      <span className="app-header__title">ZGOODorDIE</span>
      <VolumeIcon
        playing={playing}
        size={volumeSize}
        onToggle={handleToggle}
      />
    </header>
  );
}
