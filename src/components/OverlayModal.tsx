"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";

interface OverlayModalProps {
  show: boolean;
  title: string;
  description: string;
  onClose: () => void;
}

export function OverlayModal({
  show,
  title,
  description,
  onClose,
}: OverlayModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Mount when show becomes true
  useEffect(() => {
    if (show) {
      setMounted(true);
    }
  }, [show]);

  // Animate in after mount
  useEffect(() => {
    if (!mounted || !backdropRef.current || !wrapperRef.current) return;

    gsap.set(wrapperRef.current, { height: 0 });
    gsap.set(backdropRef.current, { opacity: 0 });

    const tl = gsap.timeline();
    tl.to(backdropRef.current, { opacity: 1, duration: 0.3 });
    tl.to(
      wrapperRef.current,
      { height: "auto", duration: 0.5, ease: "power1.inOut" },
      "+=0.1"
    );
  }, [mounted]);

  function handleClose() {
    if (!backdropRef.current || !wrapperRef.current) {
      setMounted(false);
      onClose();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setMounted(false);
        onClose();
      },
    });
    tl.to(wrapperRef.current, {
      height: 0,
      duration: 0.5,
      ease: "power1.inOut",
    });
    tl.to(backdropRef.current, { opacity: 0, duration: 0.3 }, "+=0.3");
  }

  if (!mounted) return null;

  return createPortal(
    <div
      ref={backdropRef}
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="modal-wrapper" ref={wrapperRef}>
        {/* Header Row (Title and CLOSE) */}
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button onClick={handleClose} className="modal-close-btn">
            CLOSE
          </button>
        </div>

        {/* Main Modal Plate */}
        <div className="modal-plate">
          {/* Left side: Description */}
          <div className="modal-left">
            <p className="modal-desc">
              {description}
            </p>
          </div>

          {/* Vertical Divider line inside modal plate */}
          <div className="modal-divider"></div>

          {/* Right side: QR Code Box */}
          <div className="modal-right">
            <div className="qr-wrap">
              <div className="qr-wrap-content">
                <img src="/assets/image/miniCode.jpg" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
