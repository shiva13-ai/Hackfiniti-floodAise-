import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { alerts as initialAlerts, getRiskBadgeClasses, type FloodAlert } from "@/data/mockData";
import { Bell, Check, Mail, MessageSquare, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Alerts() {
    const [alertList, setAlertList] = useState<FloodAlert[]>(initialAlerts);
    const [threshold, setThreshold] = useState([0.6]);
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [smsEnabled, setSmsEnabled] = useState(false);

    const acknowledge = (id: string) => setAlertList(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
    const activeAlerts = alertList.filter(a => !a.acknowledged);
    const resolvedAlerts = alertList.filter(a => a.acknowledged);

    return (
        <motion.div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8" variants={container} initial="hidden" animate="show">
            <motion.div variants={item} className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-orange-400 to-amber-400">Alert Management</span>
                    </h1>
                    <p className="text-muted-foreground mt-1">Flood risk alert configuration and notifications</p>
                </div>
                <Badge variant="outline" className="text-sm gap-1.5 py-1 px-3 text-red-400 border-red-500/30 bg-red-500/10">
                    <Bell className="w-3 h-3" /> {activeAlerts.length} active
                </Badge>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div variants={item}>
                    <Card className="glass-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Configuration</CardTitle>
                            <CardDescription>Alert thresholds and notification channels</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <Label>Risk Threshold</Label>
                                <Slider value={threshold} onValueChange={setThreshold} min={0} max={1} step={0.05} />
                                <p className="text-xs text-muted-foreground">
                                    Alerts trigger above <span className="font-mono font-medium text-foreground">{threshold[0].toFixed(2)}</span> risk score
                                </p>
                            </div>
                            <div className="space-y-3">
                                <Label>Notification Channels</Label>
                                <div className="flex items-center justify-between p-3 border border-border/50 rounded-lg">
                                    <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Email</span></div>
                                    <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
                                </div>
                                <div className="flex items-center justify-between p-3 border border-border/50 rounded-lg">
                                    <div className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-muted-foreground" /><span className="text-sm">SMS</span></div>
                                    <Switch checked={smsEnabled} onCheckedChange={setSmsEnabled} />
                                </div>
                            </div>
                            <div className="space-y-2"><Label>Alert Email</Label><Input placeholder="alerts@floodguard.ai" /></div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="gap-1.5" disabled={!emailEnabled}><Mail className="h-3.5 w-3.5" /> Test Email</Button>
                                <Button size="sm" variant="outline" className="gap-1.5" disabled={!smsEnabled}><MessageSquare className="h-3.5 w-3.5" /> Test SMS</Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={item} className="lg:col-span-2">
                    <Card className="glass-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4 text-red-400 animate-pulse" /> Active Alerts</CardTitle>
                            <CardDescription>{activeAlerts.length} unresolved</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {activeAlerts.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No active alerts</p>}
                            {activeAlerts.map(alert => (
                                <div key={alert.id} className="p-4 border border-border/50 rounded-xl space-y-2 hover:bg-secondary/20 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${alert.severity === "critical" ? "bg-red-500 animate-pulse" : alert.severity === "high" ? "bg-orange-500" : "bg-amber-500"}`} />
                                            <span className="text-sm font-semibold">{alert.region}</span>
                                            <Badge variant="outline" className={`text-[10px] ${getRiskBadgeClasses(alert.severity)}`}>{alert.severity}</Badge>
                                        </div>
                                        <Button size="sm" variant="ghost" onClick={() => acknowledge(alert.id)} className="gap-1.5 text-xs">
                                            <Check className="h-3.5 w-3.5" /> Resolve
                                        </Button>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(alert.timestamp).toLocaleString()}</span>
                                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {alert.coordinates[0].toFixed(2)}, {alert.coordinates[1].toFixed(2)}</span>
                                        <span className="font-mono">Risk: {alert.riskScore.toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {resolvedAlerts.length > 0 && (
                <motion.div variants={item}>
                    <Card className="glass-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Resolved Alerts</CardTitle>
                            <CardDescription>{resolvedAlerts.length} resolved</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {resolvedAlerts.map(alert => (
                                <div key={alert.id} className="flex items-center justify-between p-3 border border-border/30 rounded-lg opacity-60">
                                    <div className="flex items-center gap-2">
                                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                                        <span className="text-sm">{alert.region}</span>
                                        <Badge variant="outline" className="text-[10px]">{alert.severity}</Badge>
                                    </div>
                                    <span className="text-xs text-muted-foreground font-mono">{alert.riskScore.toFixed(2)}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </motion.div>
    );
}
