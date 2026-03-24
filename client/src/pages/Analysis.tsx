import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { historicalData, modelMetrics } from "@/data/mockData";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, Legend } from "recharts";
import { motion } from "framer-motion";

const timelineData = historicalData.map(d => ({ period: `${d.month} ${d.year}`, ...d }));
const barMetrics = modelMetrics.map(m => ({ name: m.name, accuracy: +(m.accuracy * 100).toFixed(1), f1Score: +(m.f1Score * 100).toFixed(1), auc: +(m.auc * 100).toFixed(1) }));

const chartStyle = { background: "hsl(224 25% 12%)", border: "1px solid hsl(224 15% 18%)", borderRadius: 8, fontSize: 12 };
const gridColor = "hsl(224 15% 18%)";
const axisColor = "hsl(215 15% 55%)";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Analysis() {
    return (
        <motion.div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8" variants={container} initial="hidden" animate="show">
            <motion.div variants={item}>
                <h1 className="text-3xl font-bold tracking-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-400 to-red-400">Analysis & Insights</span>
                </h1>
                <p className="text-muted-foreground mt-1">Historical flood data trends and model evaluation metrics</p>
            </motion.div>

            <Tabs defaultValue="historical">
                <TabsList className="mb-6">
                    <TabsTrigger value="historical">Historical Data</TabsTrigger>
                    <TabsTrigger value="models">Model Evaluation</TabsTrigger>
                </TabsList>

                <TabsContent value="historical" className="space-y-6">
                    <motion.div variants={item}>
                        <Card className="glass-card">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Flood Events & Rainfall Correlation</CardTitle>
                                <CardDescription>Monthly analysis (2020–2023)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={timelineData}>
                                        <defs>
                                            <linearGradient id="floodGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(210, 100%, 55%)" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="hsl(210, 100%, 55%)" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="rainGrad2" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(38, 92%, 55%)" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="hsl(38, 92%, 55%)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                        <XAxis dataKey="period" tick={{ fontSize: 10 }} interval={1} stroke={axisColor} />
                                        <YAxis stroke={axisColor} fontSize={10} />
                                        <ReTooltip contentStyle={chartStyle} />
                                        <Area type="monotone" dataKey="floodEvents" stroke="hsl(210, 100%, 55%)" fill="url(#floodGrad)" strokeWidth={2} name="Flood Events" />
                                        <Area type="monotone" dataKey="rainfall" stroke="hsl(38, 92%, 55%)" fill="url(#rainGrad2)" strokeWidth={2} name="Rainfall (mm)" />
                                        <Legend />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <motion.div variants={item}>
                            <Card className="glass-card">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Severity Index</CardTitle>
                                    <CardDescription>Flood severity over time</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <LineChart data={timelineData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                            <XAxis dataKey="period" tick={{ fontSize: 10 }} interval={1} stroke={axisColor} />
                                            <YAxis domain={[0, 1]} stroke={axisColor} fontSize={10} />
                                            <ReTooltip contentStyle={chartStyle} />
                                            <Line type="monotone" dataKey="severity" stroke="hsl(0 72% 58%)" strokeWidth={2} dot={{ r: 3, fill: "hsl(0 72% 58%)" }} name="Severity" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div variants={item}>
                            <Card className="glass-card">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Affected Area (km²)</CardTitle>
                                    <CardDescription>Total area impacted by flooding</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={timelineData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                            <XAxis dataKey="period" tick={{ fontSize: 10 }} interval={1} stroke={axisColor} />
                                            <YAxis stroke={axisColor} fontSize={10} />
                                            <ReTooltip contentStyle={chartStyle} />
                                            <Bar dataKey="affectedArea" fill="hsl(210, 100%, 55%)" radius={[4, 4, 0, 0]} name="Area (km²)" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </TabsContent>

                <TabsContent value="models" className="space-y-6">
                    <motion.div variants={item}>
                        <Card className="glass-card">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Model Comparison</CardTitle>
                                <CardDescription>Accuracy, F1, and AUC across ML models</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={barMetrics}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                        <XAxis dataKey="name" stroke={axisColor} />
                                        <YAxis domain={[70, 100]} stroke={axisColor} fontSize={10} />
                                        <ReTooltip contentStyle={chartStyle} />
                                        <Bar dataKey="accuracy" fill="hsl(210, 100%, 55%)" radius={[4, 4, 0, 0]} name="Accuracy" />
                                        <Bar dataKey="f1Score" fill="hsl(145, 63%, 49%)" radius={[4, 4, 0, 0]} name="F1 Score" />
                                        <Bar dataKey="auc" fill="hsl(38, 92%, 55%)" radius={[4, 4, 0, 0]} name="AUC" />
                                        <Legend />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {modelMetrics.map(m => (
                            <motion.div key={m.name} variants={item}>
                                <Card className="glass-card hover-lift">
                                    <CardContent className="p-5 space-y-3">
                                        <h3 className="text-sm font-bold">{m.name}</h3>
                                        {(["accuracy", "f1Score", "auc", "precision", "recall"] as const).map(key => (
                                            <div key={key} className="flex items-center justify-between">
                                                <span className="text-xs text-muted-foreground capitalize">{key === "f1Score" ? "F1 Score" : key}</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary rounded-full" style={{ width: `${m[key] * 100}%` }} />
                                                    </div>
                                                    <span className="font-mono text-xs">{(m[key] * 100).toFixed(1)}%</span>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
}
