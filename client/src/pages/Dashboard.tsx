import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { alerts, regionRisks, getRiskColor, getRiskBadgeClasses, sensorDevices, getSensorStatusColor } from "@/data/mockData";
import { floodRiskRegions } from "@/data/geoJsonData";
import { AlertTriangle, Droplets, MapPin, TrendingUp, Cpu, Waves, ArrowUpRight, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import type { Feature } from "geojson";
import type { PathOptions } from "leaflet";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip as ReTooltip } from "recharts";
import { motion } from "framer-motion";

const stats = [
    { label: "Active Alerts", value: alerts.filter(a => !a.acknowledged).length, icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
    { label: "Regions Monitored", value: regionRisks.length, icon: MapPin, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { label: "Avg Risk Score", value: (regionRisks.reduce((a, b) => a + b.riskScore, 0) / regionRisks.length).toFixed(2), icon: TrendingUp, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { label: "NDWI Index", value: "0.34", icon: Droplets, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    { label: "Sensors Online", value: sensorDevices.filter(s => s.status === "online").length + "/" + sensorDevices.length, icon: Cpu, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { label: "Flood Coverage", value: "12.4%", icon: Waves, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
];

function regionStyle(feature: Feature | undefined): PathOptions {
    const level = feature?.properties?.riskLevel || "low";
    return { fillColor: getRiskColor(level), weight: 2, opacity: 0.8, color: getRiskColor(level), fillOpacity: 0.35 };
}

// Mini sparkline data
const sparkData = Array.from({ length: 12 }, (_, i) => ({
    x: i,
    risk: 0.4 + Math.sin(i * 0.6) * 0.3 + Math.random() * 0.1,
}));

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function Dashboard() {
    return (
        <motion.div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8" variants={container} initial="hidden" animate="show">
            {/* Header */}
            <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400">
                            Command Center
                        </span>
                    </h1>
                    <p className="text-muted-foreground mt-1">Real-time flood risk intelligence powered by geospatial AI</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1.5 py-1 px-3 text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                        <Shield className="w-3 h-3" /> System Operational
                    </Badge>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {stats.map((s) => (
                    <Card key={s.label} className={`hover-lift glass-card border ${s.border}`}>
                        <CardContent className="p-4">
                            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                                <s.icon className={`w-4 h-4 ${s.color}`} />
                            </div>
                            <p className="text-2xl font-bold font-mono">{s.value}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map */}
                <motion.div variants={item} className="lg:col-span-2">
                    <Card className="glass-card overflow-hidden">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">Global Risk Overview</CardTitle>
                                    <CardDescription>AI-analyzed flood risk regions with geospatial overlay</CardDescription>
                                </div>
                                <Link to="/map" className="text-xs text-primary flex items-center gap-1 hover:underline">
                                    Full Map <ArrowUpRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 px-6 pb-6">
                            <div className="h-[420px] w-full rounded-lg overflow-hidden border border-border">
                                <MapContainer center={[23.7, 90.4]} zoom={7} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <GeoJSON data={floodRiskRegions} style={regionStyle} />
                                </MapContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Alerts + Sensor Status */}
                <motion.div variants={item} className="space-y-6">
                    {/* Recent Alerts */}
                    <Card className="glass-card">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">Live Alerts</CardTitle>
                                <Link to="/alerts" className="text-xs text-primary flex items-center gap-1 hover:underline">
                                    All <ArrowUpRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {alerts.filter(a => !a.acknowledged).slice(0, 4).map(alert => (
                                <div key={alert.id} className="flex items-start gap-3 p-2.5 rounded-lg border border-border/50 hover:bg-secondary/30 transition-colors">
                                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${alert.severity === "critical" ? "bg-red-500 animate-pulse" :
                                            alert.severity === "high" ? "bg-orange-500" : "bg-amber-500"
                                        }`} />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium truncate">{alert.region}</span>
                                            <Badge variant="outline" className={`text-[9px] ${getRiskBadgeClasses(alert.severity)}`}>
                                                {alert.severity}
                                            </Badge>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{alert.message}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Risk Sparkline */}
                    <Card className="glass-card">
                        <CardHeader className="pb-1">
                            <CardTitle className="text-base">Risk Trend</CardTitle>
                            <CardDescription>24h aggregated risk score</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={100}>
                                <AreaChart data={sparkData}>
                                    <defs>
                                        <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(210, 100%, 55%)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(210, 100%, 55%)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="risk" stroke="hsl(210, 100%, 55%)" fill="url(#riskGrad)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Sensor Status */}
                    <Card className="glass-card">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">Ground Sensors</CardTitle>
                                <Link to="/hardware" className="text-xs text-primary flex items-center gap-1 hover:underline">
                                    Details <ArrowUpRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {sensorDevices.map(s => (
                                <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg border border-border/50 hover:bg-secondary/30 transition-colors">
                                    <div className={`w-2 h-2 rounded-full ${getSensorStatusColor(s.status)}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate">{s.name}</p>
                                        <p className="text-[10px] text-muted-foreground font-mono">{s.id}</p>
                                    </div>
                                    <Badge variant="outline" className="text-[9px] capitalize">{s.status}</Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Region Risk Table */}
            <motion.div variants={item}>
                <Card className="glass-card">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Region Risk Assessment</CardTitle>
                        <CardDescription>AI-computed flood susceptibility scores per monitored region</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border text-left">
                                        <th className="pb-3 font-medium text-muted-foreground">Region</th>
                                        <th className="pb-3 font-medium text-muted-foreground">Risk Score</th>
                                        <th className="pb-3 font-medium text-muted-foreground">Level</th>
                                        <th className="pb-3 font-medium text-muted-foreground text-right">Population</th>
                                        <th className="pb-3 font-medium text-muted-foreground text-right">Area (km²)</th>
                                        <th className="pb-3 font-medium text-muted-foreground text-right">Trend</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {regionRisks.map(r => (
                                        <tr key={r.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors">
                                            <td className="py-3 font-medium">{r.name}</td>
                                            <td className="py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                                                        <div className="h-full rounded-full transition-all" style={{ width: `${r.riskScore * 100}%`, background: getRiskColor(r.riskLevel) }} />
                                                    </div>
                                                    <span className="font-mono text-xs">{r.riskScore.toFixed(2)}</span>
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <Badge variant="outline" className={`text-[10px] ${getRiskBadgeClasses(r.riskLevel)}`}>{r.riskLevel}</Badge>
                                            </td>
                                            <td className="py-3 text-right font-mono text-xs">{r.population.toLocaleString()}</td>
                                            <td className="py-3 text-right font-mono text-xs">{r.area.toLocaleString()}</td>
                                            <td className="py-3 text-right">
                                                <div className="inline-flex items-center gap-1 text-xs">
                                                    {r.riskScore > 0.7 ? (
                                                        <><TrendingUp className="w-3 h-3 text-red-400" /><span className="text-red-400">↑</span></>
                                                    ) : (
                                                        <span className="text-muted-foreground">—</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
