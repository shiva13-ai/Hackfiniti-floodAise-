import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/ThemeProvider";
import { User, Moon, Sun, Monitor, Globe, Database, Server } from "lucide-react";
import { motion } from "framer-motion";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();

    return (
        <motion.div className="p-6 lg:p-8 max-w-[1000px] mx-auto space-y-8" variants={container} initial="hidden" animate="show">
            <motion.div variants={item}>
                <h1 className="text-3xl font-bold tracking-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-300 to-slate-100">Settings</span>
                </h1>
                <p className="text-muted-foreground mt-1">System configuration and preferences</p>
            </motion.div>

            <motion.div variants={item}>
                <Card className="glass-card">
                    <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
                                <User className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <p className="font-semibold">Dhamarukanath Jagarlamudi</p>
                                <p className="text-sm text-muted-foreground">dhamarukanath@gmail.com</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Name</Label><Input defaultValue="Dhamarukanath Jagarlamudi" /></div>
                            <div className="space-y-2"><Label>Email</Label><Input defaultValue="dhamarukanath@gmail.com" /></div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={item}>
                <Card className="glass-card">
                    <CardHeader><CardTitle className="text-base">Appearance</CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-3">
                            {([
                                { value: "dark", icon: Moon, label: "Dark" },
                                { value: "light", icon: Sun, label: "Light" },
                                { value: "system", icon: Monitor, label: "System" },
                            ] as const).map(t => (
                                <button key={t.value} onClick={() => setTheme(t.value)}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === t.value ? "border-primary bg-primary/10" : "border-border hover:border-border/80"
                                        }`}>
                                    <t.icon className={`w-5 h-5 ${theme === t.value ? "text-primary" : "text-muted-foreground"}`} />
                                    <span className="text-xs font-medium">{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={item}>
                <Card className="glass-card">
                    <CardHeader><CardTitle className="text-base">System Information</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[
                                { label: "Data Mode", value: "Demo — Synthetic Data", icon: Database, badge: true },
                                { label: "Processing CRS", value: "UTM Zone 45N (EPSG:32645)", icon: Globe },
                                { label: "Grid Resolution", value: "30m", icon: Globe },
                                { label: "ML Model", value: "Random Forest + U-Net", icon: Server },
                                { label: "Backend", value: "Python FastAPI + Node.js Express", icon: Server },
                                { label: "Version", value: "1.0.0-hackathon", icon: Server },
                            ].map(info => (
                                <div key={info.label} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                                    <div className="flex items-center gap-2">
                                        <info.icon className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm">{info.label}</span>
                                    </div>
                                    {info.badge ? (
                                        <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30 bg-amber-500/10">{info.value}</Badge>
                                    ) : (
                                        <span className="text-sm font-mono text-muted-foreground">{info.value}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
