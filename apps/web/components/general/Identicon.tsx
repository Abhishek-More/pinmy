"use client";

const COLORS = [
  "#C77DFF", "#FFD800", "#FF6B6B", "#4ECDC4", "#45B7D1",
  "#96CEB4", "#DDA0DD", "#F7DC6F", "#FF8A65", "#98D8C8",
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

// GitHub-style identicon: 5x5 mirrored grid of colored squares,
// deterministic per id via hash-seeded PRNG.
export const Identicon = ({
  id,
  size = 36,
}: {
  id: string;
  size?: number;
}) => {
  const rand = seededRandom(hashCode(id));
  const cells = 5;
  const cellSize = size / cells;

  // Left half + middle column random, mirrored to the right
  const grid: Array<{ r: number; c: number; color: string }> = [];
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c <= 2; c++) {
      const v = rand();
      const color = COLORS[Math.floor(rand() * COLORS.length)];
      if (v < 0.45) continue; // empty cell
      grid.push({ r, c, color });
      if (c < 2) {
        grid.push({ r, c: cells - 1 - c, color });
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="#1a1a1a" />
      {grid.map(({ r, c, color }) => (
        <rect
          key={`${r}-${c}`}
          x={c * cellSize}
          y={r * cellSize}
          width={cellSize}
          height={cellSize}
          fill={color}
        />
      ))}
    </svg>
  );
};
