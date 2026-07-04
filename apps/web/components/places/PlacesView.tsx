"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import useSWR from "swr";
import { Ellipsis, ExternalLink, MapPin } from "lucide-react";
import { Typography } from "../typography/Typography";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/clients/auth-browser";
import { PinRequests } from "@/lib/requests/PinRequests";
import { usePinStore } from "@/lib/stores/usePinStore";
import { useModalStore } from "@/lib/stores/useModalStore";
import { cleanURL, timeAgo } from "@/lib/utils";
import { CATEGORY_COLORS } from "@pinmy/config";
import type { PlacePin } from "./PlaceMap";

const PlaceMap = dynamic(() => import("./PlaceMap"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

const categoryColor = (category: string | undefined) =>
  CATEGORY_COLORS[(category ?? "Other") as keyof typeof CATEGORY_COLORS] ??
  CATEGORY_COLORS["Other"];

const PlaceCard = ({
  place,
  index,
  selected,
  onSelect,
}: {
  place: PlacePin;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) => {
  const openEditPin = useModalStore((s) => s.openEditPin);

  return (
    <div
      id={`place-${place.uniqueId}`}
      onClick={onSelect}
      className={`group flex cursor-pointer items-start gap-3 border-[3px] border-black p-3 ${
        selected ? "brutal-shadow-sm bg-white" : "bg-white hover:bg-gray-50"
      }`}
    >
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center border-2 border-black font-bold"
        style={{ backgroundColor: selected ? "#111" : categoryColor(place.category) }}
      >
        <Typography
          variant="small"
          className={`font-bold ${selected ? "text-white" : ""}`}
        >
          {index}
        </Typography>
      </div>

      <div className="min-w-0 flex-1">
        <Typography variant="large" className="line-clamp-2">
          {place.title}
        </Typography>
        <div className="mt-1 flex items-center gap-2">
          <Typography variant="small" className="font-semibold">
            {place.category ?? "Other"}
          </Typography>
          <Typography variant="muted" className="truncate">
            {cleanURL(place.link, 1)}
          </Typography>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <div className="relative">
          <Typography
            variant="muted"
            className="text-xs transition-opacity group-hover:opacity-0"
          >
            {timeAgo(place.createdAt)}
          </Typography>
          <button
            className="absolute inset-0 flex cursor-pointer items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              openEditPin(place);
            }}
          >
            <Ellipsis className="h-4 w-4" />
          </button>
        </div>
        <a
          href={place.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="hover:bg-accent border-2 border-black p-1"
          title="Open in Maps"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
};

export const PlacesView = () => {
  const searchQuery = usePinStore((s) => s.searchQuery);
  const { data: session } = authClient.useSession();
  const { data: pins } = useSWR(
    session?.user ? "/api/pins" : null,
    PinRequests.list,
    { refreshInterval: 5000 },
  );

  const [category, setCategory] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobilePane, setMobilePane] = useState<"list" | "map">("list");

  const allPlaces = useMemo(
    () =>
      (pins ?? []).filter(
        (p): p is PlacePin => p.latitude != null && p.longitude != null,
      ),
    [pins],
  );

  const chips = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of allPlaces) {
      const cat = p.category ?? "Other";
      counts[cat] = (counts[cat] ?? 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [allPlaces]);

  const q = searchQuery.trim().toLowerCase();
  const places = allPlaces.filter(
    (p) =>
      (!category || (p.category ?? "Other") === category) &&
      (!q || p.title.toLowerCase().includes(q)),
  );

  // Map click -> scroll the matching card into view.
  useEffect(() => {
    if (!selectedId) return;
    document
      .getElementById(`place-${selectedId}`)
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedId]);

  if (pins && allPlaces.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 border-[3px] border-dashed border-black/40 p-8">
        <MapPin className="h-8 w-8" />
        <Typography variant="large" className="text-center">
          No places yet
        </Typography>
        <Typography variant="muted" className="max-w-sm text-center">
          Pin a Google Maps or Apple Maps link (text it or use + NEW PIN) and
          it will show up here on the map.
        </Typography>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-3 pb-4">
      {/* Filter chips + mobile pane toggle */}
      <div className="flex w-full shrink-0 items-center justify-between gap-3">
        <div className="scrollbar-hide flex min-w-0 gap-2 overflow-x-auto">
          <button
            onClick={() => setCategory(null)}
            className={`shrink-0 cursor-pointer border-2 border-black px-2 py-0.5 text-sm font-semibold ${
              category === null ? "bg-black text-white" : "bg-white hover:bg-gray-50"
            }`}
          >
            ALL {allPlaces.length}
          </button>
          {chips.map(([name, count]) => (
            <button
              key={name}
              onClick={() => setCategory(category === name ? null : name)}
              className={`shrink-0 cursor-pointer border-2 border-black px-2 py-0.5 text-sm font-semibold ${
                category === name ? "text-white" : "hover:opacity-80"
              }`}
              style={{
                backgroundColor: category === name ? "#111" : categoryColor(name),
              }}
            >
              {name} {count}
            </button>
          ))}
        </div>
        <div className="flex shrink-0 md:hidden">
          {(["list", "map"] as const).map((pane) => (
            <button
              key={pane}
              onClick={() => setMobilePane(pane)}
              className={`cursor-pointer border-2 border-black px-2 py-0.5 text-sm font-semibold uppercase first:border-r-0 ${
                mobilePane === pane ? "bg-black text-white" : "bg-white"
              }`}
            >
              {pane}
            </button>
          ))}
        </div>
      </div>

      {/* Split: list + map */}
      <div className="flex min-h-0 w-full flex-1 gap-4">
        <div
          className={`${
            mobilePane === "map" ? "hidden" : "flex"
          } scrollbar-hide min-h-0 w-full flex-col gap-3 overflow-y-auto pt-1 pb-4 md:flex md:w-2/5`}
        >
          {!pins &&
            Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-20 w-full shrink-0" />
            ))}
          {places.map((place, i) => (
            <PlaceCard
              key={place.uniqueId}
              place={place}
              index={i + 1}
              selected={place.uniqueId === selectedId}
              onSelect={() => setSelectedId(place.uniqueId)}
            />
          ))}
          {pins && places.length === 0 && (
            <Typography variant="muted" className="p-4 text-center">
              Nothing matches this filter.
            </Typography>
          )}
        </div>
        <div
          className={`${
            mobilePane === "list" ? "hidden" : "block"
          } min-h-0 w-full flex-1 border-[3px] border-black md:block`}
        >
          <PlaceMap
            places={places}
            selectedId={selectedId}
            onSelect={setSelectedId}
            visKey={mobilePane}
          />
        </div>
      </div>
    </div>
  );
};
