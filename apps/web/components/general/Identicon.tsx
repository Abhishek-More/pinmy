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

export const Identicon = ({
  id,
  size = 36,
}: {
  id: string;
  size?: number;
}) => {
  const hash = hashCode(id);
  const rand = seededRandom(hash);
  const color = COLORS[hash % COLORS.length];
  const cells = 5;
  const cellSize = size / cells;

  // 5x5 grid, left half random, mirrored to right
  type Shape = "square" | "circle" | "triangle";
  const grid: Array<{ r: number; c: number; shape: Shape; flip: boolean }> = [];
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c <= 2; c++) {
      const v = rand();
      if (v < 0.4) continue; // empty
      const shape: Shape = v > 0.85 ? "circle" : v > 0.65 ? "triangle" : "square";
      const flip = rand() > 0.5;
      grid.push({ r, c, shape, flip });
      if (c < 2) {
        grid.push({ r, c: cells - 1 - c, shape, flip: !flip });
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="#1a1a1a" />
      {grid.map(({ r, c, shape, flip }) => {
        const x = c * cellSize;
        const y = r * cellSize;

        if (shape === "circle") {
          return (
            <circle
              key={`${r}-${c}`}
              cx={x + cellSize / 2}
              cy={y + cellSize / 2}
              r={cellSize * 0.4}
              fill={color}
            />
          );
        }
        if (shape === "triangle") {
          const points = flip
            ? `${x},${y + cellSize} ${x + cellSize / 2},${y} ${x + cellSize},${y + cellSize}`
            : `${x},${y} ${x + cellSize},${y} ${x + cellSize / 2},${y + cellSize}`;
          return <polygon key={`${r}-${c}`} points={points} fill={color} />;
        }
        return (
          <rect
            key={`${r}-${c}`}
            x={x}
            y={y}
            width={cellSize}
            height={cellSize}
            fill={color}
          />
        );
      })}
    </svg>
  );
};
