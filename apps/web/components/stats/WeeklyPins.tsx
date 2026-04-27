"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Typography } from "../typography/Typography";
import { Skeleton } from "@/components/ui/skeleton";
import useSWR from "swr";
import { authClient } from "@/lib/clients/auth-browser";
import { PinRequests, type DayCount } from "@/lib/requests/PinRequests";

const CELL = 12;
const GAP = 3;
const LABEL_WIDTH = 24;
const PADDING = 20; // p-5 = 1.25rem = 20px
const DOW_LABELS = ["", "MON", "", "WED", "", "FRI", ""];

const INTENSITY_COLORS = [
  "bg-black/5",
  "bg-teal-200",
  "bg-teal-300",
  "bg-teal-400",
  "bg-teal-500",
];

function getIntensity(count: number, max: number): number {
  if (count === 0) return 0;
  if (max <= 0) return 1;
  const ratio = count / max;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

function buildGrid(data: DayCount[]) {
  const first = data[0];
  if (!first) return { grid: [] as (DayCount | null)[][], cols: 0 };

  const startDow = first.dow;
  const totalSlots = startDow + data.length;
  const cols = Math.ceil(totalSlots / 7);

  const grid: (DayCount | null)[][] = Array.from({ length: 7 }, () =>
    Array(cols).fill(null),
  );

  let col = 0;
  let row = startDow;
  for (const day of data) {
    grid[row][col] = day;
    row++;
    if (row >= 7) {
      row = 0;
      col++;
    }
  }

  return { grid, cols };
}

function useCols(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [cols, setCols] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const available = el.clientWidth - PADDING * 2 - LABEL_WIDTH - GAP - CELL;
      setCols(Math.max(Math.floor((available + GAP) / (CELL + GAP)), 4));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef]);

  return cols;
}

function colsToDays(cols: number) {
  // We need enough days to fill `cols` columns.
  // Last column ends on today (Saturday = dow 6 at most).
  // Extra days for the partial first column are handled by the grid builder.
  return cols * 7;
}

const ChartSkeleton = ({ cols }: { cols: number }) => (
  <div className="flex" style={{ gap: GAP }}>
    <div
      className="flex shrink-0 flex-col"
      style={{ width: LABEL_WIDTH, gap: GAP }}
    >
      {DOW_LABELS.map((label, i) => (
        <div
          key={i}
          className="flex items-center justify-end"
          style={{ height: CELL }}
        >
          {label && (
            <span className="pr-1 text-[9px] leading-none text-black/60">
              {label}
            </span>
          )}
        </div>
      ))}
    </div>
    <div className="flex" style={{ gap: GAP }}>
      {Array.from({ length: Math.max(cols, 4) }).map((_, c) => (
        <div key={c} className="flex flex-col" style={{ gap: GAP }}>
          {Array.from({ length: 7 }).map((_, r) => (
            <Skeleton
              key={r}
              className="rounded-full bg-black/5"
              style={{ height: CELL, width: CELL }}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);

const Chart = ({ data }: { data: DayCount[] }) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const max = Math.max(...data.map((d) => d.count), 1);
  const { grid, cols } = useMemo(() => buildGrid(data), [data]);

  return (
    <div className="mt-3 flex flex-col gap-4">
      <div className="flex" style={{ gap: GAP }}>
        {/* Day-of-week labels */}
        <div
          className="flex shrink-0 flex-col"
          style={{ width: LABEL_WIDTH, gap: GAP }}
        >
          {DOW_LABELS.map((label, i) => (
            <div
              key={i}
              className="flex items-center justify-end"
              style={{ height: CELL }}
            >
              {label && (
                <span className="pr-1 text-[9px] leading-none text-black/60">
                  {label}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div ref={gridRef} className="flex" style={{ gap: GAP }}>
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="flex flex-col" style={{ gap: GAP }}>
              {grid.map((row, r) => {
                const cell = row[c];
                if (!cell) {
                  return <div key={r} style={{ height: CELL, width: CELL }} />;
                }
                const level = getIntensity(cell.count, max);
                return (
                  <div
                    key={r}
                    className="relative"
                    style={{ height: CELL, width: CELL }}
                    onMouseEnter={(e) => {
                      const tip =
                        e.currentTarget.querySelector<HTMLElement>(
                          "[data-tip]",
                        );
                      const gridEl = gridRef.current;
                      if (!tip || !gridEl) return;
                      tip.style.left = `${CELL / 2}px`;
                      tip.style.transform = "translateX(-50%)";
                      tip.style.opacity = "1";
                      requestAnimationFrame(() => {
                        const tipRect = tip.getBoundingClientRect();
                        const gridRect = gridEl.getBoundingClientRect();
                        const overRight = tipRect.right - gridRect.right;
                        const overLeft = gridRect.left - tipRect.left;
                        if (overRight > 0) {
                          tip.style.left = `${CELL / 2 - overRight}px`;
                        } else if (overLeft > 0) {
                          tip.style.left = `${CELL / 2 + overLeft}px`;
                        }
                      });
                    }}
                    onMouseLeave={(e) => {
                      const tip =
                        e.currentTarget.querySelector<HTMLElement>(
                          "[data-tip]",
                        );
                      if (tip) tip.style.opacity = "0";
                    }}
                  >
                    <div
                      className={`h-full w-full rounded-full border border-black/20 ${INTENSITY_COLORS[level]}`}
                    />
                    <div
                      data-tip
                      className="pointer-events-none absolute z-10 rounded border border-black bg-white px-1.5 py-0.5 text-[10px] font-bold text-black shadow"
                      style={{
                        opacity: 0,
                        top: -28,
                        left: CELL / 2,
                        transform: "translateX(-50%)",
                        transition: "opacity 0.15s",
                        width: "max-content",
                      }}
                    >
                      {cell.count} pin{cell.count !== 1 ? "s" : ""} ·{" "}
                      {cell.date.slice(5)}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const WeeklyPins = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cols = useCols(containerRef);
  const days = colsToDays(cols);

  const { data: session, isPending } = authClient.useSession();
  const { data } = useSWR<DayCount[]>(
    session?.user && cols > 0 ? `/api/pins/weekly?days=${days}` : null,
    PinRequests.weekly,
  );

  if (!isPending && !session?.user) return null;

  const isLoading = isPending || !data;

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col gap-4 border-[3px] border-black bg-white p-5"
    >
      {/* Tag */}
      <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 border-2 border-black bg-[#ffd800] px-2 py-0.5">
        <div className="h-2 w-2 rounded-sm bg-black" />
        <Typography variant="tag">Activity</Typography>
      </div>
      {isLoading ? <ChartSkeleton cols={cols} /> : <Chart data={data} />}
      {/* Footer */}
      <div className="flex items-center justify-between">
        <Typography variant="label" className="text-black/60">
          {data ? data.reduce((sum, d) => sum + d.count, 0) : 0} Pins
        </Typography>
        <div className="flex items-center gap-1">
          <span className="mr-1 text-xs font-medium text-black/60">LESS</span>
          {INTENSITY_COLORS.map((color, i) => (
            <div
              key={i}
              className={`rounded-full border border-black/10 ${color}`}
              style={{ height: CELL - 2, width: CELL - 2 }}
            />
          ))}
          <span className="ml-1 text-xs font-medium text-black/60">MORE</span>
        </div>
      </div>
    </div>
  );
};
