import { Howl, Howler } from "howler";
import gsap from "gsap";
import { lerp } from "@/utils/math";
import { useState, useCallback, useRef } from "react";

// ── 模块加载时立即静音，确保任何音频播放前不会有声音 ──
Howler.volume(0);

const TARGET_VOLUME = 1;
const LERP_SPEED = 0.05; // lerp 系数，每帧逼近目标

class AudioManager {
  private _howl: Howl | null = null;
  private _unlocked = false;
  private _tickerAdded = false;
  private _playing = false;
  private _wantsToPlay = false;
  private _onPlayingChange: ((v: boolean) => void) | null = null;

  // lerp 当前值
  private _currentVolume = 0;

  setPlayingCallback(cb: (v: boolean) => void) {
    this._onPlayingChange = cb;
  }

  load(src: string) {
    this._howl = new Howl({
      src: [src],
      html5: false, // Web Audio API
      preload: true,
      onload: () => {
        this._startUnlockPolling();
      },
    });
  }

  /**
   * GSAP Ticker 轮询 AudioContext 状态（核心机制）。
   * AudioContext 变为 "running" → 触发解锁。
   */
  private _startUnlockPolling() {
    if (this._tickerAdded) return;
    this._tickerAdded = true;

    const poll = () => {
      const ctx = Howler.ctx;
      if (ctx && ctx.state === "running") {
        this._unlock();
      }
    };
    gsap.ticker.add(poll);
  }

  /**
   * 解锁后：用 lerp 平滑过渡音量 0 → TARGET_VOLUME
   */
  private _unlock() {
    if (this._unlocked) return;
    this._unlocked = true;

    // 启动 lerp 渐变（复用 gsap ticker）
    const fadeIn = () => {
      this._currentVolume = lerp(this._currentVolume, TARGET_VOLUME, LERP_SPEED);
      Howler.volume(this._currentVolume);

      // 接近目标值时停止 lerp
      if (Math.abs(TARGET_VOLUME - this._currentVolume) < 0.001) {
        Howler.volume(TARGET_VOLUME);
        gsap.ticker.remove(fadeIn);

        // 解锁后如果之前请求了播放，现在开始
        if (this._wantsToPlay && this._howl && !this._howl.playing()) {
          this._howl.play();
        }
      }
    };
    gsap.ticker.add(fadeIn);
  }

  play(loopStart?: number, loopEnd?: number) {
    this._wantsToPlay = true;
    if (!this._howl) return;

    if (loopStart !== undefined) {
      this._howl.seek(loopStart);
    }

    // 已解锁 → 直接播放；未解锁 → 等解锁后自动播放
    if (this._unlocked) {
      if (!this._howl.playing()) {
        this._howl.play();
      }
    }

    this._setPlaying(true);
  }

  stop() {
    this._wantsToPlay = false;
    this._howl?.stop();
    this._setPlaying(false);
  }

  private _setPlaying(v: boolean) {
    this._playing = v;
    this._onPlayingChange?.(v);
  }
}

export const audioManager = new AudioManager();

export function useAudio() {
  const [playing, setPlaying] = useState(false);
  const initRef = useRef(false);

  if (!initRef.current) {
    initRef.current = true;
    audioManager.setPlayingCallback(setPlaying);
  }

  const toggle = useCallback(() => {
    setPlaying((prev) => !prev);
  }, []);

  return { playing, toggle };
}
