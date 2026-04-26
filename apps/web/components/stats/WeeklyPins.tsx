"use client";

import { Typography } from "../typography/Typography";
import { Skeleton } from "@/components/ui/skeleton";
import useSWR from "swr";
import { authClient } from "@/lib/clients/auth-browser";
import { PinRequests, type DayCount } from "@/lib/requests/PinRequests";

const SKELETON_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const SKELETON_HEIGHTS = [32, 16, 8, 48, 24, 6, 12];

const WeeklyPinsSkeleton = () => (
  <>
    <Skeleton className="h-10 w-16 bg-white/10" />
    <div className="flex items-end justify-between gap-2" style={{ height: 80 }}>
      {SKELETON_DAYS.map((day, i) => (
        <div key={day} className="flex flex-1 flex-col items-center gap-1">
          <Skeleton
            className="w-full bg-white/10"
            style={{ height: SKELETON_HEIGHTS[i] }}
          />
          <span className="text-[10px] font-medium text-white/50">{day}</span>
        </div>
      ))}
    </div>
  </>
);

const WeeklyPinsChart = ({ data }: { data: DayCount[] }) => {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold text-white">{total}</span>
        <span className="text-lg text-white/50">pins</span>
      </div>
      <div className="flex items-end justify-between gap-2" style={{ height: 80 }}>
        {data.map((d) => (
          <div key={d.day} className="group flex flex-1 flex-col items-center gap-1">
            <span className="text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
              {d.count}
            </span>
            <div
              className="bg-accent w-full"
              style={{
                height: d.count > 0 ? Math.max((d.count / max) * 64, 4) : 2,
                opacity: d.count > 0 ? 1 : 0.3,
              }}
            />
            <span className="text-[10px] font-medium text-white/50">
              {d.day}
            </span>
          </div>
        ))}
      </div>
    </>
  );
};

export const WeeklyPins = () => {
  const { data: session, isPending } = authClient.useSession();
  const { data } = useSWR<DayCount[]>(
    session?.user ? "/api/pins/weekly" : null,
    PinRequests.weekly,
  );

  if (!isPending && !session?.user) return null;

  const isLoading = isPending || !data;

  return (
    <div className="flex flex-col gap-4 border-[3px] border-black bg-[#1a1a1a] p-5">
      <Typography
        variant="small"
        className="text-xs tracking-widest text-white/60 uppercase"
      >
        Last 7 Days
      </Typography>
      {isLoading ? <WeeklyPinsSkeleton /> : <WeeklyPinsChart data={data} />}
    </div>
  );
};
