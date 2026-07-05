"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  AttributionControl,
} from "react-leaflet";
import {
  divIcon,
  latLngBounds,
  point,
  type LocationEvent,
  type MarkerCluster,
} from "leaflet";
import "leaflet.markercluster"; // registers MarkerCluster types on the leaflet module
import MarkerClusterGroup from "react-leaflet-markercluster";
import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/styles";
import { ArrowUpRight, LocateFixed } from "lucide-react";
import { CATEGORY_COLORS } from "@pinmy/config";
import { useModalStore } from "@/lib/stores/useModalStore";
import type { PinWithSnippet } from "@/lib/requests/PinRequests";

export interface PlacePin extends PinWithSnippet {
  latitude: number;
  longitude: number;
  /** Stable 1-based number: oldest place = 1, doesn't shift as places are added. */
  number: number;
}

interface PlaceMapProps {
  places: PlacePin[];
  selectedId: string | null;
  onSelect: (uniqueId: string) => void;
  /** Change to force a size recalculation (e.g. mobile list/map toggle). */
  visKey?: string;
  userPos: [number, number] | null;
  onLocated: (pos: [number, number]) => void;
}

function MapController({ places, selectedId, visKey }: Pick<PlaceMapProps, "places" | "selectedId" | "visKey">) {
  const map = useMap();
  const fitKey = places.map((p) => p.uniqueId).join();

  const fit = () => {
    if (!places.length) return;
    map.fitBounds(latLngBounds(places.map((p) => [p.latitude, p.longitude])), {
      padding: [48, 48],
      maxZoom: 15,
    });
  };

  useEffect(() => {
    fit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, fitKey]);

  useEffect(() => {
    const place = places.find((p) => p.uniqueId === selectedId);
    if (!place) return;
    map.flyTo([place.latitude, place.longitude], Math.max(map.getZoom(), 14), {
      duration: 0.5,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, selectedId]);

  // The map initializes at size 0 when its pane starts hidden (mobile toggle),
  // so recalculate the size and refit whenever the pane becomes visible.
  // ponytail: refit discards the user's pan/zoom on toggle; track dirty state if it annoys.
  useEffect(() => {
    const t = setTimeout(() => {
      map.invalidateSize();
      fit();
    }, 50);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, visKey]);

  return null;
}

function LocateButton({ onLocated }: { onLocated: (pos: [number, number]) => void }) {
  const map = useMap();
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    const found = (e: LocationEvent) => {
      setLocating(false);
      onLocated([e.latlng.lat, e.latlng.lng]);
    };
    const fail = () => setLocating(false);
    map.on("locationfound", found);
    map.on("locationerror", fail);
    return () => {
      map.off("locationfound", found);
      map.off("locationerror", fail);
    };
  }, [map, onLocated]);

  return (
    <button
      title="Show my location"
      onClick={(e) => {
        e.stopPropagation();
        setLocating(true);
        map.locate({ setView: true, maxZoom: 15 });
      }}
      onDoubleClick={(e) => e.stopPropagation()}
      className="absolute top-3 right-3 z-[800] flex h-9 w-9 cursor-pointer items-center justify-center border-2 border-black bg-white hover:bg-gray-50"
    >
      <LocateFixed className={`h-4 w-4 ${locating ? "animate-pulse" : ""}`} />
    </button>
  );
}

export default function PlaceMap({
  places,
  selectedId,
  onSelect,
  visKey,
  userPos,
  onLocated,
}: PlaceMapProps) {
  const openEditPin = useModalStore((s) => s.openEditPin);
  return (
    <MapContainer
      center={[40.73, -73.99]}
      zoom={12}
      className="z-0 h-full w-full"
      scrollWheelZoom
      attributionControl={false}
    >
      {/* prefix="" drops the Leaflet flag; the OSM/CARTO credit is license-required */}
      <AttributionControl prefix="" position="bottomright" />
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      <MapController places={places} selectedId={selectedId} visKey={visKey} />
      <LocateButton onLocated={onLocated} />
      {userPos && (
        <Marker
          position={userPos}
          interactive={false}
          zIndexOffset={500}
          icon={divIcon({
            className: "",
            html: `<div class="user-dot"></div>`,
            iconSize: [18, 18],
            iconAnchor: [9, 9],
          })}
        />
      )}
      <MarkerClusterGroup
        showCoverageOnHover={false}
        maxClusterRadius={40}
        iconCreateFunction={(cluster: MarkerCluster) =>
          divIcon({
            className: "",
            html: `<div class="place-cluster">${cluster.getChildCount()}</div>`,
            iconSize: point(30, 30),
          })
        }
      >
        {places.map((place) => {
          const selected = place.uniqueId === selectedId;
          const color =
            CATEGORY_COLORS[(place.category ?? "Other") as keyof typeof CATEGORY_COLORS] ??
            CATEGORY_COLORS["Other"];
          return (
            <Marker
              key={place.uniqueId}
              position={[place.latitude, place.longitude]}
              zIndexOffset={selected ? 1000 : 0}
              icon={divIcon({
                className: "",
                html: `<div class="place-dot${selected ? " place-dot-selected" : ""}" style="background:${selected ? "#111" : color}"></div>`,
                iconSize: [selected ? 22 : 14, selected ? 22 : 14],
                iconAnchor: [selected ? 11 : 7, selected ? 11 : 7],
              })}
              eventHandlers={{ click: () => onSelect(place.uniqueId) }}
            >
              <Popup offset={[0, -8]} closeButton={false}>
                <div className="flex min-w-40 flex-col gap-2">
                  <span className="text-sm leading-tight font-bold">{place.title}</span>
                  <span
                    className="w-fit border-2 border-black px-1.5 py-0.5 text-xs font-semibold"
                    style={{ backgroundColor: color }}
                  >
                    {place.category ?? "Other"}
                  </span>
                  <div className="flex items-center gap-3">
                    <a
                      href={place.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-bold underline"
                    >
                      OPEN <ArrowUpRight className="h-3 w-3" />
                    </a>
                    <button
                      onClick={() => openEditPin(place)}
                      className="cursor-pointer text-xs font-bold underline"
                    >
                      EDIT
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
