"use client";

import { useState, useEffect, useRef } from "react";

// Resolutions for step animation.
// At 64px display: 16px res = 4×4 blocks, 32 = 2×2, 64 = 1×1 → then original
const PIXEL_RESOLUTIONS = [8, 32, 64, 128];

function downscale(img: HTMLImageElement, maxDim: number): string {
  const aspect = img.naturalWidth / img.naturalHeight;
  const w = aspect >= 1 ? maxDim : Math.round(maxDim * aspect);
  const h = aspect >= 1 ? Math.round(maxDim / aspect) : maxDim;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(w, 1);
  canvas.height = Math.max(h, 1);
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL();
}

export function PixelThumbnail({
  src,
  size = 64,
  hovered = false,
}: {
  src: string;
  size?: number;
  hovered?: boolean;
}) {
  const [srcs, setSrcs] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const stepRef = useRef(0);
  const animRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const results: string[] = [];
      for (const res of PIXEL_RESOLUTIONS) {
        const dataUrl = downscale(img, res);
        if (dataUrl) results.push(dataUrl);
      }
      results.push(src);
      setSrcs(results);
    };
    img.onerror = () => setSrcs([src]);
    img.src = src;
  }, [src]);

  useEffect(() => {
    if (animRef.current) clearTimeout(animRef.current);
    if (srcs.length <= 1) return;

    if (hovered) {
      const advance = () => {
        const next = Math.min(stepRef.current + 1, srcs.length - 1);
        stepRef.current = next;
        setStep(next);
        if (next < srcs.length - 1) {
          animRef.current = setTimeout(advance, 60);
        }
      };
      animRef.current = setTimeout(advance, 60);
    } else {
      const retreat = () => {
        const next = Math.max(stepRef.current - 1, 0);
        stepRef.current = next;
        setStep(next);
        if (next > 0) {
          animRef.current = setTimeout(retreat, 60);
        }
      };
      animRef.current = setTimeout(retreat, 60);
    }

    return () => {
      if (animRef.current) clearTimeout(animRef.current);
    };
  }, [hovered, srcs]);

  if (srcs.length === 0) {
    return (
      <div
        className="animate-pulse border-2 border-black bg-gray-200"
        style={{ width: size, height: size }}
      />
    );
  }

  const isPixelated = step < srcs.length - 1;

  return (
    <div
      className="shrink-0 overflow-hidden border-2 border-black"
      style={{ width: size, height: size }}
    >
      <img
        src={srcs[step]}
        alt=""
        className="h-full w-full object-cover"
        style={{ imageRendering: isPixelated ? "pixelated" : "auto" }}
      />
    </div>
  );
}
