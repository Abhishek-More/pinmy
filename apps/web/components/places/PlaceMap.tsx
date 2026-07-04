"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  useMap,
  AttributionControl,
} from "react-leaflet";
import { divIcon, latLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";
import { CATEGORY_COLORS } from "@pinmy/config";
import type { PinWithSnippet } from "@/lib/requests/PinRequests";

export interface PlacePin extends PinWithSnippet {
  latitude: number;
  longitude: number;
}

interface PlaceMapProps {
  places: PlacePin[];
  selectedId: string | null;
  onSelect: (uniqueId: string) => void;
  /** Change to force a size recalculation (e.g. mobile list/map toggle). */
  visKey?: string;
}

function MapController({ places, selectedId, visKey }: Omit<PlaceMapProps, "onSelect">) {
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

export default function PlaceMap({ places, selectedId, onSelect, visKey }: PlaceMapProps) {
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
      {places.map((place, i) => {
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
              html: `<div class="place-marker${selected ? " place-marker-selected" : ""}" style="background:${selected ? "#111" : color}">${i + 1}</div>`,
              iconSize: [30, 30],
              iconAnchor: [15, 15],
            })}
            eventHandlers={{ click: () => onSelect(place.uniqueId) }}
          >
            <Tooltip direction="top" offset={[0, -18]}>
              {place.title}
            </Tooltip>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
