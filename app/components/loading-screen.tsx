"use client";

import { useEffect, useState } from "react";

const DURATION_MS = 3000;
const SEGMENTS = 20;

interface LoadingScreenProps {
  labels: { start: string; half: string; done: string; skip: string };
}

export function LoadingScreen({ labels }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const startedAt = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const next = Math.min(100, ((now - startedAt) / DURATION_MS) * 100);
      setProgress(next);
      if (next < 100) frame = requestAnimationFrame(tick);
      else setLeaving(true);
    });
    const skip = () => setLeaving(true);
    // pointerdown too: touch screens have no keys to press.
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, []);

  if (gone) return null;

  const message = progress >= 100 ? labels.done : progress >= 50 ? labels.half : labels.start;
  const filled = Math.floor((progress / 100) * SEGMENTS);

  return (
    <div
      onTransitionEnd={(event) => event.target === event.currentTarget && setGone(true)}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-surface px-4 transition-opacity duration-500 ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <p role="status" className="text-center text-lg text-text">
        {message}
      </p>

      <div className="w-full max-w-md">
        <p className="mb-2 text-right text-sm text-muted">{Math.round(progress)}%</p>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          className="flex gap-1 rounded-sm border-2 border-line p-1"
        >
          {Array.from({ length: SEGMENTS }, (_, i) => (
            <span key={i} className={`h-4 flex-1 ${i < filled ? "bg-text" : "bg-line/40"}`} />
          ))}
        </div>
      </div>

      <p className="animate-pulse text-sm text-muted">{labels.skip}</p>
    </div>
  );
}
