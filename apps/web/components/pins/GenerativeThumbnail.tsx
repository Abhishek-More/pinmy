"use client";

import { useState, useEffect, useRef } from "react";
import qrcode from "qrcode-generator";

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

function getQrModules(url: string): boolean[][] {
  const qr = qrcode(0, "L");
  qr.addData(url);
  qr.make();
  const count = qr.getModuleCount();
  const modules: boolean[][] = [];
  for (let row = 0; row < count; row++) {
    const r: boolean[] = [];
    for (let col = 0; col < count; col++) {
      r.push(qr.isDark(row, col));
    }
    modules.push(r);
  }
  return modules;
}

function renderColorfulQr(
  modules: boolean[][],
  seed: string,
  scale: number,
): string {
  const count = modules.length;
  const px = Math.max(1, Math.round(scale / count));
  const dim = count * px;
  const canvas = document.createElement("canvas");
  canvas.width = dim;
  canvas.height = dim;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const rand = seededRandom(hashString(seed));
  const n = 2 + Math.floor(rand() * 2);
  const colors: string[] = [];
  for (let i = 0; i < n; i++) {
    colors.push(PALETTE[Math.floor(rand() * PALETTE.length)]);
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, dim, dim);

  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (modules[row][col]) {
        ctx.fillStyle = colors[Math.floor(rand() * colors.length)];
        ctx.fillRect(col * px, row * px, px, px);
      }
    }
  }

  return canvas.toDataURL();
}

function downscaleDataUrl(dataUrl: string, targetSize: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(dataUrl); return; }
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, targetSize, targetSize);
      resolve(canvas.toDataURL());
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

const PIXELATED_SIZES = [4, 8, 16];

export function GenerativeThumbnail({
  seed,
  link,
  size = 64,
  hovered = false,
}: {
  seed: string;
  link?: string;
  size?: number;
  hovered?: boolean;
}) {
  const [srcs, setSrcs] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const stepRef = useRef(0);
  const animRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    let cancelled = false;
    const url = link || seed;
    const modules = getQrModules(url);
    const fullQr = renderColorfulQr(modules, seed, 128);
    if (!fullQr) return;

    Promise.all(
      PIXELATED_SIZES.map((s) => downscaleDataUrl(fullQr, s)),
    ).then((pixelated) => {
      if (!cancelled) setSrcs([...pixelated, fullQr]);
    });

    return () => { cancelled = true; };
  }, [seed, link]);

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
        style={{ imageRendering: step < srcs.length - 1 ? "pixelated" : "auto" }}
      />
    </div>
  );
}
