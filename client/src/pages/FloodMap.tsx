import { useState } from "react";
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup, Marker, useMap } from "react-leaflet";
import { floodRiskRegions, rainfallPoints, elevationPoints, riverNetwork } from "@/data/geoJsonData";
import { getRiskColor, sensorDevices, sensorReadings } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Layers, Droplets, Mountain, AlertTriangle, Waves, Cpu, Navigation } from "lucide-react";
import { AreaChart, Area, LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip as ReTooltip } from "recharts";
import L from "leaflet";
import type { Feature } from "geojson";
import type { PathOptions, Layer } from "leaflet";
import { motion } from "framer-motion";

type LayerKey = "floodRisk" | "rainfall" | "elevation" | "ndwi" | "sensors" | "rivers";

const layerConfig: { key: LayerKey; label: string; icon: React.ElementType; color: string }[] = [
    { key: "floodRisk", label: "Flood Risk Zones", icon: AlertTriangle, color: "text-red-400" },
    { key: "rainfall", label: "Rainfall Intensity", icon: Droplets, color: "text-blue-400" },
    { key: "elevation", label: "Elevation", icon: Mountain, color: "text-amber-400" },
    { key: "ndwi", label: "NDWI Overlay", icon: Waves, color: "text-cyan-400" },
    { key: "rivers", label: "River Network", icon: Navigation, color: "text-indigo-400" },
    { key: "sensors", label: "Ground Sensors", icon: Cpu, color: "text-emerald-400" },
];

function regionStyle(feature: Feature | undefined): PathOptions {
    const level = feature?.properties?.riskLevel || "low";
    return { fillColor: getRiskColor(level), weight: 2, opacity: 0.9, color: getRiskColor(level), fillOpacity: 0.4 };
}

function onEachFeature(feature: Feature, layer: Layer) {
    if (feature.properties) {
        const p = feature.properties;
        layer.bindPopup(`
      <div style="font-family: Inter, sans-serif; min-width:200px; padding:4px;">
        <strong style="font-size:14px;">${p.name}</strong><br/>
        <div style="margin-top:6px; display:grid; grid-template-columns:1fr 1fr; gap:4px; font-size:12px;">
          <span>Risk Score:</span><b>${p.riskScore}</b>
          <span>Level:</span><b style="color:${getRiskColor(p.riskLevel)}">${p.riskLevel?.toUpperCase()}</b>
          <span>NDWI:</span><b>${p.ndwi || "N/A"}</b>
          <span>Elevation:</span><b>${p.elevation || "N/A"}m</b>
          <span>Slope:</span><b>${p.slope || "N/A"}°</b>
          <span>Population:</span><b>${p.population?.toLocaleString()}</b>
        </div>
      </div>
    `);
    }
}

function rainfallColor(intensity: number) {
    if (intensity > 300) return "hsl(214, 100%, 50%)";
    if (intensity > 200) return "hsl(214, 80%, 60%)";
    if (intensity > 100) return "hsl(214, 60%, 70%)";
    return "hsl(214, 40%, 80%)";
}

function elevationColor(elev: number) {
    if (elev > 60) return "hsl(30, 70%, 35%)";
    if (elev > 30) return "hsl(38, 80%, 50%)";
    if (elev > 15) return "hsl(50, 80%, 55%)";
    return "hsl(145, 60%, 45%)";
}

function ndwiColor(lat: number, lng: number) {
    const ndwi = Math.sin(lat * 10) * Math.cos(lng * 10) * 0.5 + 0.3;
    if (ndwi > 0.5) return "hsl(200, 100%, 40%)";
    if (ndwi > 0.3) return "hsl(200, 80%, 55%)";
    if (ndwi > 0.1) return "hsl(200, 60%, 70%)";
    return "hsl(200, 30%, 85%)";
}

const sensorIcon = (status: string) => L.divIcon({
    className: "",
    html: `<div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">
    <div style="position:absolute;inset:0;border-radius:50%;background:${status === "online" ? "rgba(16,185,129,0.3)" : status === "warning" ? "rgba(245,158,11,0.3)" : "rgba(239,68,68,0.3)"};animation:${status === "online" || status === "warning" ? "pulse 2s infinite" : "none"}"></div>
    <div style="width:12px;height:12px;border-radius:50%;background:${status === "online" ? "#10b981" : status === "warning" ? "#f59e0b" : "#ef4444"};border:2px solid rgba(255,255,255,0.8);z-index:1;"></div>
  </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});

function SensorPopup({ sensorId }: { sensorId: string }) {
    const readings = sensorReadings[sensorId]?.slice(-12) || [];
    const device = sensorDevices.find(s => s.id === sensorId);
    const latest = readings[readings.length - 1];

    return (
        <div style={{ width: 280, fontFamily: "Inter, sans-serif" }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{device?.name}</div>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 8 }}>ID: {sensorId} • Battery: {device?.batteryLevel}%</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                <div style={{ background: "rgba(59,130,246,0.1)", borderRadius: 6, padding: "6px 8px" }}>
                    <div style={{ fontSize: 10, color: "#888" }}>Rain Intensity</div>
                    <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "monospace" }}>{latest?.rainIntensity.toFixed(1)}</div>
                    <div style={{ fontSize: 9, color: "#888" }}>mm/hr</div>
                </div>
                <div style={{ background: "rgba(16,185,129,0.1)", borderRadius: 6, padding: "6px 8px" }}>
                    <div style={{ fontSize: 10, color: "#888" }}>Water Level</div>
                    <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "monospace" }}>{latest?.waterLevel.toFixed(0)}</div>
                    <div style={{ fontSize: 9, color: "#888" }}>cm</div>
                </div>
            </div>

            <div style={{ height: 60, marginBottom: 4 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={readings}>
                        <Area type="monotone" dataKey="rainIntensity" stroke="#3b82f6" fill="rgba(59,130,246,0.15)" strokeWidth={1.5} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <div style={{ fontSize: 9, color: "#888", textAlign: "center" }}>Rain intensity (12h)</div>

            <div style={{ height: 60, marginTop: 4 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={readings}>
                        <Line type="monotone" dataKey="waterLevel" stroke="#10b981" strokeWidth={1.5} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div style={{ fontSize: 9, color: "#888", textAlign: "center" }}>Water level (12h)</div>
        </div>
    );
}

export default function FloodMap() {
    const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
        floodRisk: true, rainfall: false, elevation: false, ndwi: false, sensors: true, rivers: true,
    });

    const toggleLayer = (key: LayerKey) => setLayers(prev => ({ ...prev, [key]: !prev[key] }));

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 pb-2 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">Flood Intelligence Map</span>
                    </h1>
                    <p className="text-sm text-muted-foreground">Interactive geospatial visualization with real-time sensor overlay</p>
                </div>
            </div>

            <div className="flex-1 relative px-4 pb-4">
                {/* Layer Control */}
                <Card className="absolute top-2 right-6 z-[1000] w-60 glass-card-strong">
                    <CardContent className="p-3 space-y-2.5">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <Layers className="h-4 w-4 text-primary" /> Map Layers
                        </div>
                        {layerConfig.map(({ key, label, icon: Icon, color }) => (
                            <div key={key} className="flex items-center justify-between py-0.5">
                                <div className="flex items-center gap-2">
                                    <Icon className={`h-3.5 w-3.5 ${layers[key] ? color : "text-muted-foreground/50"}`} />
                                    <Label className="text-xs cursor-pointer">{label}</Label>
                                </div>
                                <Switch checked={layers[key]} onCheckedChange={() => toggleLayer(key)} className="scale-75" />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Legend */}
                <div className="absolute bottom-6 left-6 z-[1000] glass-card-strong rounded-lg p-3 text-xs space-y-1.5">
                    <p className="font-semibold text-foreground">Risk Levels</p>
                    {(["critical", "high", "medium", "low"] as const).map(level => (
                        <div key={level} className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: getRiskColor(level) }} />
                            <span className="capitalize text-muted-foreground">{level}</span>
                        </div>
                    ))}
                </div>

                <div className="h-full rounded-xl overflow-hidden border border-border shadow-lg">
                    <MapContainer center={[23.7, 90.4]} zoom={7} style={{ height: "100%", width: "100%" }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {layers.floodRisk && <GeoJSON key="flood-risk" data={floodRiskRegions} style={regionStyle} onEachFeature={onEachFeature} />}

                        {layers.rivers && <GeoJSON key="rivers" data={riverNetwork} style={() => ({ color: "hsl(220, 80%, 60%)", weight: 2, opacity: 0.6, dashArray: "5,5" })} />}

                        {layers.rainfall && rainfallPoints.map((p, i) => (
                            <CircleMarker key={`rain-${i}`} center={[p.lat, p.lng]} radius={p.intensity / 20}
                                pathOptions={{ fillColor: rainfallColor(p.intensity), fillOpacity: 0.6, color: rainfallColor(p.intensity), weight: 1 }}>
                                <Popup>Rainfall: {p.intensity} mm</Popup>
                            </CircleMarker>
                        ))}

                        {layers.elevation && elevationPoints.map((p, i) => (
                            <CircleMarker key={`elev-${i}`} center={[p.lat, p.lng]} radius={8}
                                pathOptions={{ fillColor: elevationColor(p.elevation), fillOpacity: 0.7, color: elevationColor(p.elevation), weight: 1 }}>
                                <Popup>Elevation: {p.elevation} m</Popup>
                            </CircleMarker>
                        ))}

                        {layers.ndwi && rainfallPoints.map((p, i) => (
                            <CircleMarker key={`ndwi-${i}`} center={[p.lat, p.lng]} radius={12}
                                pathOptions={{ fillColor: ndwiColor(p.lat, p.lng), fillOpacity: 0.5, color: ndwiColor(p.lat, p.lng), weight: 1 }}>
                                <Popup>NDWI: {(Math.sin(p.lat * 10) * Math.cos(p.lng * 10) * 0.5 + 0.3).toFixed(3)}</Popup>
                            </CircleMarker>
                        ))}

                        {layers.sensors && sensorDevices.map(s => (
                            <Marker key={s.id} position={[s.lat, s.lng]} icon={sensorIcon(s.status)}>
                                <Popup minWidth={300} maxWidth={320}>
                                    <SensorPopup sensorId={s.id} />
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
}
