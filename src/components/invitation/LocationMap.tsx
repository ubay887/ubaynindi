"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getEventsForSide } from "@/config/wedding";
import type { EventDetail } from "@/types/wedding";
import { copyToClipboard } from "@/lib/utils";
import { useInviteSide } from "@/hooks/useInviteSide";
import { Button, LinkButton } from "@/components/ui/Button";
import { InView, SectionHead } from "@/components/motion/primitives";

type Loc = EventDetail & { lat: number; lng: number };

function isLocated(e: EventDetail): e is Loc {
  return typeof e.lat === "number" && typeof e.lng === "number";
}

function createPinIcon(active: boolean) {
  const fill = active ? "#2e3f2c" : "#4f6d4c";
  const ring = active ? "#b89a6a" : "rgba(255,255,255,0.9)";
  return L.divIcon({
    className: "wedding-map-pin",
    iconSize: [40, 52],
    iconAnchor: [20, 50],
    popupAnchor: [0, -44],
    html: `
      <div class="pin-wrap ${active ? "is-active" : ""}">
        <svg width="40" height="52" viewBox="0 0 40 52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M20 50c0 0 16-14.2 16-28A16 16 0 1 0 4 22c0 13.8 16 28 16 28z" fill="${fill}" stroke="${ring}" stroke-width="1.5"/>
          <circle cx="20" cy="20" r="7.5" fill="#f7f6f2"/>
          <circle cx="20" cy="20" r="3.2" fill="${fill}"/>
        </svg>
      </div>
    `,
  });
}

function FlyTo({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.85 });
  }, [center, zoom, map]);
  return null;
}

function MapCanvas({
  locations,
  activeId,
  onSelect,
}: {
  locations: Loc[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const active = locations.find((l) => l.id === activeId) ?? locations[0];
  const center: [number, number] = [active.lat, active.lng];

  const icons = useMemo(() => {
    const map = new Map<string, L.DivIcon>();
    locations.forEach((loc) => {
      map.set(loc.id, createPinIcon(loc.id === activeId));
    });
    return map;
  }, [locations, activeId]);

  return (
    <MapContainer
      center={center}
      zoom={15}
      scrollWheelZoom={false}
      className="location-map-canvas h-full w-full"
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CARTO'
      />
      <FlyTo center={center} zoom={15} />
      {locations.map((loc) => (
        <Marker
          key={loc.id}
          position={[loc.lat, loc.lng]}
          icon={icons.get(loc.id)}
          eventHandlers={{
            click: () => onSelect(loc.id),
          }}
        >
          <Popup className="wedding-map-popup">
            <strong className="block font-serif text-sm text-[#2e3f2c]">
              {loc.title}
            </strong>
            <span className="mt-0.5 block text-xs text-[#556058]">
              {loc.venue}
            </span>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export function LocationMap() {
  const side = useInviteSide();
  const locations = useMemo(
    () => getEventsForSide(side).filter(isLocated),
    [side],
  );
  const [activeId, setActiveId] = useState(locations[0]?.id ?? "");
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (locations[0]?.id) setActiveId(locations[0].id);
  }, [locations]);

  if (!locations.length) return null;

  const active = locations.find((l) => l.id === activeId) ?? locations[0];
  const mapsHref =
    active.mapsUrl ??
    `https://www.google.com/maps?q=${active.lat},${active.lng}`;

  return (
    <section id="location" className="section-cream section-pad sm:px-8">
      <div className="mx-auto max-w-[380px]">
        <SectionHead
          script="Location"
          title="Lokasi Acara"
          subtitle="Ketuk pin pada peta untuk melihat detail lokasi."
        />

        {/* Location tabs */}
        {locations.length > 1 ? (
          <InView className="mb-4 flex gap-2">
            {locations.map((loc) => {
              const on = loc.id === activeId;
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setActiveId(loc.id)}
                  className={`flex-1 rounded-full border px-3 py-2.5 text-xs font-semibold tracking-wide transition-all duration-200 ${
                    on
                      ? "border-primary-dark bg-primary-dark text-cream shadow-[0_8px_20px_-10px_rgba(46,63,44,0.45)]"
                      : "border-primary/15 bg-white/70 text-primary-dark hover:border-primary/30"
                  }`}
                >
                  {loc.title}
                </button>
              );
            })}
          </InView>
        ) : null}

        <InView>
          <div className="location-map-shell overflow-hidden rounded-[1.35rem] border border-primary/10 bg-white/80 shadow-[0_18px_40px_-22px_rgba(46,63,44,0.22)]">
            <div className="relative h-[280px] w-full sm:h-[320px]">
              {mounted ? (
                <MapCanvas
                  locations={locations}
                  activeId={activeId}
                  onSelect={setActiveId}
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-[#e8efe6] text-sm text-muted">
                  Memuat peta…
                </div>
              )}

              {/* Soft gradient frame over map edges */}
              <div
                className="pointer-events-none absolute inset-0 rounded-[inherit]"
                style={{
                  boxShadow: "inset 0 0 0 1px rgba(46,63,44,0.06)",
                }}
              />
            </div>

            <div className="border-t border-primary/8 px-5 py-5">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-dark text-cream shadow-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-soft">
                    {active.title}
                  </p>
                  <p className="mt-1 font-serif text-[1.15rem] text-primary-dark">
                    {active.venue}
                  </p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
                    {active.address}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
                <Button
                  type="button"
                  variant="double"
                  size="md"
                  className="w-full sm:w-auto sm:min-w-[140px]"
                  onClick={async () => {
                    const text = `${active.venue}\n${active.address}`;
                    const ok = await copyToClipboard(text);
                    if (ok) {
                      setCopied(true);
                      window.setTimeout(() => setCopied(false), 2000);
                    }
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                  {copied ? "Tersalin ✓" : "Salin Alamat"}
                </Button>
                <LinkButton
                  href={mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="double-solid"
                  size="md"
                  className="w-full sm:w-auto sm:min-w-[160px]"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                  Google Maps
                </LinkButton>
              </div>
            </div>
          </div>
        </InView>
      </div>
    </section>
  );
}
