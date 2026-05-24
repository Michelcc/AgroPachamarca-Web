"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export type GpsMarker = {
  lat: number;
  lng: number;
  titulo: string;
  origen: string;
  usuario: string;
  fecha: string;
};

export function GpsMap({ markers }: { markers: GpsMarker[] }) {
  const center: [number, number] =
    markers.length > 0 ? [markers[0].lat, markers[0].lng] : [-12.0464, -77.0428];

  return (
    <MapContainer center={center} zoom={6} className="gps-map" style={{ height: 400, width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((m, i) => (
        <Marker key={`${m.lat}-${m.lng}-${i}`} position={[m.lat, m.lng]} icon={icon}>
          <Popup>
            <strong>{m.titulo}</strong>
            <br />
            {m.origen} · {m.usuario}
            <br />
            <small>{m.fecha}</small>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
