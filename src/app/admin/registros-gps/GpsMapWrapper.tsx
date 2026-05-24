"use client";

import dynamic from "next/dynamic";
import type { GpsMarker } from "./GpsMap";

const GpsMap = dynamic(() => import("./GpsMap").then((m) => m.GpsMap), {
  ssr: false,
  loading: () => <div className="gps-map" style={{ background: "#eee" }} />
});

export function GpsMapWrapper({ markers }: { markers: GpsMarker[] }) {
  return <GpsMap markers={markers} />;
}
