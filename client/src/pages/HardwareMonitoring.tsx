import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sensorDevices as defaultDevices, sensorReadings as defaultReadings, getSensorStatusColor, type SensorDevice, type SensorReading } from "@/data/mockData";
import { Cpu, Battery, MapPin, Droplets, Waves, RefreshCw, Signal, Plus, Trash2, ShieldCheck, TrendingUp, Wifi } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip as ReTooltip, CartesianGrid } from "recharts";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const sensorMapIcon = (status: string) => L.divIcon({
    className: "",
    html: `<div style="width:20px;height:20px;border-radius:50%;background:${status === "online" ? "#10b981" : status === "warning" ? "#f59e0b" : "#ef4444"};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20], iconAnchor: [10, 10],
});

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

interface DeviceInfo extends SensorDevice {
    isExternal?: boolean;
    reliability?: number;
    nearestRegion?: string;
    apiKey?: string;
}

interface RiskAdjustment {
    regionId: string;
    regionName: string;
    satelliteRisk: number;
    iotWaterLevel: number | null;
    adjustedRisk: number;
    delta: number;
    confidence: string;
    validatingSensor: string | null;
}

export default function HardwareMonitoring() {
    const [allDevices, setAllDevices] = useState<DeviceInfo[]>(defaultDevices.map(d => ({ ...d, isExternal: false })));
    const [allReadings, setAllReadings] = useState<Record<string, SensorReading[]>>(defaultReadings);
    const [selectedSensor, setSelectedSensor] = useState(defaultDevices[0].id);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [riskAdjustments, setRiskAdjustments] = useState<RiskAdjustment[]>([]);
    const [isPolling, setIsPolling] = useState(false);

    // Add device form state
    const [newName, setNewName] = useState("");
    const [newSensorId, setNewSensorId] = useState("");
    const [newLat, setNewLat] = useState("");
    const [newLng, setNewLng] = useState("");

    const device = allDevices.find(s => s.id === selectedSensor) || allDevices[0];
    const readings = allReadings[selectedSensor] || [];
    const latest = readings[readings.length - 1];
    const chartData = readings.slice(-24).map(r => ({
        time: format(new Date(r.timestamp), "HH:mm"),
        rain: +r.rainIntensity.toFixed(1),
        water: +r.waterLevel.toFixed(0),
    }));

    // Fetch risk adjustments
    const fetchRiskAdjustments = useCallback(async () => {
        try {
            const res = await fetch("/api/risk-adjustment");
            if (res.ok) setRiskAdjustments(await res.json());
        } catch { /* ignore */ }
    }, []);

    // Fetch live readings for external devices
    const fetchLiveReadings = useCallback(async () => {
        const externalDevices = allDevices.filter(d => d.isExternal);
        for (const d of externalDevices) {
            try {
                const res = await fetch(`/api/sensors/${d.id}/readings`);
                if (res.ok) {
                    const data = await res.json();
                    setAllReadings(prev => ({ ...prev, [d.id]: data }));
                }
            } catch { /* ignore */ }
        }
    }, [allDevices]);

    // Auto-poll every 5 seconds
    useEffect(() => {
        fetchRiskAdjustments();
        const interval = setInterval(() => {
            fetchLiveReadings();
            fetchRiskAdjustments();
        }, 5000);
        return () => clearInterval(interval);
    }, [fetchLiveReadings, fetchRiskAdjustments]);

    // Register new device
    const handleAddDevice = async () => {
        if (!newName || !newSensorId || !newLat || !newLng) return;
        try {
            const res = await fetch("/api/devices", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newName,
                    sensorId: newSensorId,
                    lat: parseFloat(newLat),
                    lng: parseFloat(newLng),
                }),
            });
            if (res.ok) {
                const data = await res.json();
                const newDevice: DeviceInfo = {
                    id: data.sensorId,
                    name: data.name,
                    lat: data.lat,
                    lng: data.lng,
                    status: "online",
                    lastReading: new Date().toISOString(),
                    batteryLevel: 100,
                    isExternal: true,
                    reliability: 0,
                    nearestRegion: data.nearestRegion,
                    apiKey: data.apiKey,
                };
                setAllDevices(prev => [...prev, newDevice]);
                setAllReadings(prev => ({ ...prev, [data.sensorId]: [] }));
                setSelectedSensor(data.sensorId);
                setShowAddDialog(false);
                setNewName(""); setNewSensorId(""); setNewLat(""); setNewLng("");
            }
        } catch { /* ignore */ }
    };

    // Delete external device
    const handleDeleteDevice = async (deviceId: string, sensorId: string) => {
        // Find the device entry ID from the API
        try {
            const res = await fetch("/api/devices");
            if (res.ok) {
                const devices = await res.json();
                const apiDevice = devices.find((d: any) => d.sensorId === sensorId && d.isExternal);
                if (apiDevice) {
                    await fetch(`/api/devices/${apiDevice.id}`, { method: "DELETE" });
                    setAllDevices(prev => prev.filter(d => d.id !== deviceId));
                    setAllReadings(prev => { const next = { ...prev }; delete next[deviceId]; return next; });
                    if (selectedSensor === deviceId) setSelectedSensor(allDevices[0].id);
                }
            }
        } catch { /* ignore */ }
    };

    // Get risk adjustment for selected device
    const deviceRegionRisk = riskAdjustments.find(r =>
        r.validatingSensor === selectedSensor ||
        (device && r.regionName === (device as DeviceInfo).nearestRegion)
    );

    return (
        <motion.div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8" variants={container} initial="hidden" animate="show">
            <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400">
                            Ground-Level Monitoring
                        </span>
                    </h1>
                    <p className="text-muted-foreground mt-1">ESP32 IoT sensor network — ground-truth validation layer for satellite predictions</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => { fetchLiveReadings(); fetchRiskAdjustments(); }}>
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh
                    </Button>
                    <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowAddDialog(true)}>
                        <Plus className="w-3.5 h-3.5" /> Add Device
                    </Button>
                </div>
            </motion.div>

            {/* Add Device Dialog */}
            <AnimatePresence>
                {showAddDialog && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <Card className="glass-card-strong border-emerald-500/30">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Wifi className="w-4 h-4 text-emerald-400" />
                                    Register ESP32 Device
                                </CardTitle>
                                <CardDescription>Connect an external IoT sensor to the validation network</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Device Name</Label>
                                        <Input placeholder="My ESP32 Sensor" value={newName} onChange={e => setNewName(e.target.value)} className="h-9" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Sensor ID</Label>
                                        <Input placeholder="ESP-001" value={newSensorId} onChange={e => setNewSensorId(e.target.value)} className="h-9" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Latitude</Label>
                                        <Input type="number" placeholder="23.8103" value={newLat} onChange={e => setNewLat(e.target.value)} className="h-9" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Longitude</Label>
                                        <Input type="number" placeholder="90.4125" value={newLng} onChange={e => setNewLng(e.target.value)} className="h-9" />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 mt-4">
                                    <Button variant="ghost" size="sm" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={handleAddDevice}>
                                        Register Device
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* IoT Risk Adjustment Summary */}
            {riskAdjustments.some(r => r.delta > 0) && (
                <motion.div variants={item}>
                    <Card className="glass-card border-amber-500/20 bg-amber-500/5">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <ShieldCheck className="w-4 h-4 text-amber-400" />
                                <span className="text-sm font-semibold text-amber-300">IoT Ground-Truth Risk Adjustments Active</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {riskAdjustments.filter(r => r.delta > 0).map(r => (
                                    <div key={r.regionId} className="flex flex-col gap-1 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                        <span className="text-[10px] font-mono text-muted-foreground">{r.regionName}</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs text-muted-foreground">{r.satelliteRisk.toFixed(2)}</span>
                                            <TrendingUp className="w-3 h-3 text-amber-400" />
                                            <span className="text-xs font-bold text-amber-300">{r.adjustedRisk.toFixed(2)}</span>
                                            <Badge variant="outline" className="text-[8px] text-amber-400 border-amber-500/30 px-1">+{r.delta.toFixed(3)}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sensor list */}
                <motion.div variants={item} className="space-y-3">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Sensor Devices</p>
                    {allDevices.map(s => (
                        <Card
                            key={s.id}
                            className={`cursor-pointer transition-all duration-200 ${selectedSensor === s.id ? "glass-card-strong border-primary/30 shadow-lg shadow-primary/10" : "glass-card hover:border-border"}`}
                            onClick={() => setSelectedSensor(s.id)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.status === "online" ? "bg-emerald-500/10" : s.status === "warning" ? "bg-amber-500/10" : "bg-red-500/10"
                                            }`}>
                                            <Cpu className={`w-5 h-5 ${s.status === "online" ? "text-emerald-400" : s.status === "warning" ? "text-amber-400" : "text-red-400"
                                                }`} />
                                        </div>
                                        <div className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${getSensorStatusColor(s.status)}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate">{s.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                            <span className="text-[10px] font-mono text-muted-foreground">{s.id}</span>
                                            <Badge variant="outline" className={`text-[9px] capitalize ${s.status === "online" ? "text-emerald-400 border-emerald-500/30" :
                                                s.status === "warning" ? "text-amber-400 border-amber-500/30" :
                                                    "text-red-400 border-red-500/30"
                                                }`}>{s.status}</Badge>
                                            {(s as DeviceInfo).isExternal && (
                                                <Badge variant="outline" className="text-[9px] text-cyan-400 border-cyan-500/30 bg-cyan-500/10">
                                                    External · IoT
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    {(s as DeviceInfo).isExternal && (
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                            onClick={(e) => { e.stopPropagation(); handleDeleteDevice(s.id, s.id); }}>
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground">
                                    <span className="flex items-center gap-1"><Battery className="w-3 h-3" /> {s.batteryLevel}%</span>
                                    <span className="flex items-center gap-1"><Signal className="w-3 h-3" /> {s.status === "offline" ? "Lost" : "Active"}</span>
                                    {(s as DeviceInfo).reliability !== undefined && (s as DeviceInfo).reliability! > 0 && (
                                        <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> {((s as DeviceInfo).reliability! * 100).toFixed(0)}%</span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </motion.div>

                {/* Detailed view */}
                <motion.div variants={item} className="lg:col-span-3 space-y-6">
                    {/* API Key display for external devices */}
                    {(device as DeviceInfo).isExternal && (device as DeviceInfo).apiKey && (
                        <Card className="glass-card border-cyan-500/20 bg-cyan-500/5">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Wifi className="w-4 h-4 text-cyan-400" />
                                    <span className="text-sm font-semibold text-cyan-300">Device API Key</span>
                                </div>
                                <code className="text-xs font-mono text-cyan-200 bg-cyan-900/30 px-3 py-2 rounded-lg block overflow-x-auto">
                                    {(device as DeviceInfo).apiKey}
                                </code>
                                <p className="text-[10px] text-muted-foreground mt-2">Use this key in the <code className="text-cyan-400">x-api-key</code> header when posting sensor data from your ESP32.</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* IoT Validation Status */}
                    {deviceRegionRisk && deviceRegionRisk.confidence !== "satellite-only" && (
                        <Card className="glass-card border-emerald-500/20 bg-emerald-500/5">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                        <span className="text-sm font-semibold text-emerald-300">
                                            {deviceRegionRisk.confidence === "iot-validated-critical" ? "⚠ IoT Critical Override" :
                                                deviceRegionRisk.confidence === "iot-validated" ? "IoT-Validated" : "IoT-Confirmed Stable"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs">
                                        <span className="text-muted-foreground">Satellite: <strong>{deviceRegionRisk.satelliteRisk.toFixed(2)}</strong></span>
                                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                                        <span className="text-emerald-300">IoT-Adjusted: <strong>{deviceRegionRisk.adjustedRisk.toFixed(2)}</strong></span>
                                        {deviceRegionRisk.delta > 0 && (
                                            <Badge variant="outline" className="text-[9px] text-amber-400 border-amber-500/30">+{deviceRegionRisk.delta.toFixed(3)}</Badge>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Current readings */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Rain Intensity", value: `${latest?.rainIntensity.toFixed(1) || "—"}`, unit: "mm/hr", icon: Droplets, color: "text-blue-400", bg: "bg-blue-500/10" },
                            { label: "Water Level", value: `${latest?.waterLevel.toFixed(0) || "—"}`, unit: "cm", icon: Waves, color: "text-cyan-400", bg: "bg-cyan-500/10" },
                            { label: "Battery", value: `${device.batteryLevel}`, unit: "%", icon: Battery, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                            { label: "Location", value: `${device.lat.toFixed(2)}°`, unit: `${device.lng.toFixed(2)}°E`, icon: MapPin, color: "text-violet-400", bg: "bg-violet-500/10" },
                        ].map(s => (
                            <Card key={s.label} className="glass-card hover-lift">
                                <CardContent className="p-4">
                                    <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
                                        <s.icon className={`w-4 h-4 ${s.color}`} />
                                    </div>
                                    <p className="text-2xl font-bold font-mono">{s.value}</p>
                                    <p className="text-[10px] text-muted-foreground">{s.label} <span className="text-muted-foreground/60">({s.unit})</span></p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Charts */}
                    <Card className="glass-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Rain Intensity — 24h Time Series</CardTitle>
                            <CardDescription>{device.name} ({device.id})</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(210, 100%, 55%)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(210, 100%, 55%)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(224 15% 18%)" />
                                    <XAxis dataKey="time" stroke="hsl(215 15% 55%)" fontSize={10} interval={3} />
                                    <YAxis stroke="hsl(215 15% 55%)" fontSize={10} />
                                    <ReTooltip contentStyle={{ background: "hsl(224 25% 12%)", border: "1px solid hsl(224 15% 18%)", borderRadius: 8, fontSize: 12 }} />
                                    <Area type="monotone" dataKey="rain" stroke="hsl(210, 100%, 55%)" fill="url(#rainGrad)" strokeWidth={2} name="mm/hr" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="glass-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Water Level — 24h Time Series</CardTitle>
                            <CardDescription>Ground-level water depth measured by ultrasonic sensor</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(145, 63%, 49%)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(145, 63%, 49%)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(224 15% 18%)" />
                                    <XAxis dataKey="time" stroke="hsl(215 15% 55%)" fontSize={10} interval={3} />
                                    <YAxis stroke="hsl(215 15% 55%)" fontSize={10} />
                                    <ReTooltip contentStyle={{ background: "hsl(224 25% 12%)", border: "1px solid hsl(224 15% 18%)", borderRadius: 8, fontSize: 12 }} />
                                    <Area type="monotone" dataKey="water" stroke="hsl(145, 63%, 49%)" fill="url(#waterGrad)" strokeWidth={2} name="cm" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Mini map */}
                    <Card className="glass-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Sensor Location</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 px-6 pb-6">
                            <div className="h-[200px] rounded-lg overflow-hidden border border-border">
                                <MapContainer center={[device.lat, device.lng]} zoom={10} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <Marker position={[device.lat, device.lng]} icon={sensorMapIcon(device.status)}>
                                        <Popup>{device.name}</Popup>
                                    </Marker>
                                </MapContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
