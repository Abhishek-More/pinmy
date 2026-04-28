"use client";

import { useState, useEffect, useRef } from "react";

const PALETTE = [
  "#D4A0FF", "#FFC04D", "#6EE8B0", "#FFA0A0", "#93B8FF",
  "#7EEDE4", "#FFB0CB", "#FFEAA7", "#B8AFFE", "#80FFD4",
];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/** Generate an abstract grid pattern as pixel data on a small canvas. */
function generatePattern(seed: string, gridSize: number): string {
  const rand = seededRandom(hashString(seed));
  const canvas = document.createElement("canvas");
  canvas.width = gridSize;
  canvas.height = gridSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Pick 2-3 colors for this pattern
  const numColors = 2 + Math.floor(rand() * 2);
  const colors: string[] = [];
  for (let i = 0; i < numColors; i++) {
    colors.push(PALETTE[Math.floor(rand() * PALETTE.length)]);
  }

  // Fill each cell
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const r = rand();
      if (r < 0.15) {
        // Empty / background
        ctx.fillStyle = "#f4f1e8";
      } else if (r < 0.3) {
        // Dark accent
        ctx.fillStyle = "#171717";
      } else {
        ctx.fillStyle = colors[Math.floor(rand() * colors.length)];
      }
      ctx.fillRect(x, y, 1, 1);
    }
  }

  return canvas.toDataURL();
}

const RESOLUTIONS = [4, 6, 8, 16];

export function GenerativeThumbnail({
  seed,
  size = 64,
  hovered = false,
}: {
  seed: string;
  size?: number;
  hovered?: boolean;
}) {
  const [srcs, setSrcs] = useState<string[]>([]);

  useEffect(() => {
    setSrcs(RESOLUTIONS.map((res) => generatePattern(seed, res)));
  }, [seed]);

  const [step, setStep] = useState(0);
  const stepRef = useRef(0);
  const animRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (animRef.current) clearTimeout(animRef.current);
    if (srcs.length <= 1) return;

    if (hovered) {
      const advance = () => {
        const next = Math.min(stepRef.current + 1, srcs.length - 1);
        stepRef.current = next;
        setStep(next);
        if (next < srcs.length - 1) {
          animRef.current = setTimeout(advance, 80);
        }
      };
      animRef.current = setTimeout(advance, 80);
    } else {
      const retreat = () => {
        const next = Math.max(stepRef.current - 1, 0);
        stepRef.current = next;
        setStep(next);
        if (next > 0) {
          animRef.current = setTimeout(retreat, 80);
        }
      };
      animRef.current = setTimeout(retreat, 80);
    }

    return () => {
      if (animRef.current) clearTimeout(animRef.current);
    };
  }, [hovered, srcs]);

  if (srcs.length === 0) {
    return (
      <div
        className="border-2 border-black bg-gray-200"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="shrink-0 overflow-hidden border-2 border-black"
      style={{ width: size, height: size }}
    >
      <img
        src={srcs[step]}
        alt=""
        className="h-full w-full object-cover"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}
