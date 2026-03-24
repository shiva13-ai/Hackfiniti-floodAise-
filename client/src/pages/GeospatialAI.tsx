import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { modelMetrics, getRiskBadgeClasses } from "@/data/mockData";
import { Satellite, BrainCircuit, Mountain, Droplets, Navigation, Loader2, CheckCircle, Play, Waves, BarChart3 } from "lucide-react";
import { BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, XAxis, YAxis, Tooltip as ReTooltip, CartesianGrid, Legend } from "recharts";
import { motion } from "framer-motion";

interface PipelineStep {
    name: string;
    icon: React.ElementType;
    description: string;
    status: "idle" | "running" | "done";
    result?: string;
}

const radarData = modelMetrics.map(m => ({
    model: m.name, accuracy: m.accuracy * 100, f1: m.f1Score * 100,
    precision: m.precision * 100, recall: m.recall * 100, auc: m.auc * 100,
}));

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function GeospatialAI() {
    const [running, setRunning] = useState(false);
    const [currentStep, setCurrentStep] = useState(-1);
    const [pipeline, setPipeline] = useState<PipelineStep[]>([
        { name: "NDWI Computation", icon: Waves, description: "Computing (Green-NIR)/(Green+NIR) from Sentinel-2 bands", status: "idle" },
        { name: "DEM Slope Analysis", icon: Mountain, description: "Extracting elevation gradient from SRTM DEM raster", status: "idle" },
        { name: "River Proximity", icon: Navigation, description: "Computing distance to nearest river in UTM projected space", status: "idle" },
        { name: "Rainfall Integration", icon: Droplets, description: "Overlaying spatial rainfall dataset on feature grid", status: "idle" },
        { name: "Feature Engineering", icon: BarChart3, description: "Building aligned feature matrix [NDWI, elev, slope, dist, rain]", status: "idle" },
        { name: "ML Prediction", icon: BrainCircuit, description: "Running Random Forest classifier on feature vectors", status: "idle" },
        { name: "Flood Segmentation", icon: Satellite, description: "U-Net CNN generating pixel-level flood mask", status: "idle" },
    ]);

    const runPipeline = async () => {
        setRunning(true);
        setCurrentStep(0);
        const steps = [...pipeline];
        const results = [
            "Water mask generated: 34.2% coverage, 12,480 water pixels detected",
            "Slope computed: range 0.2°–28.5°, mean 4.7° | Flat terrain: 58.3%",
            "Distance range: 120m–5,600m | 42% of cells within 1km of river",
            "Rainfall integrated: range 90–380mm | High intensity zones: 23.8%",
            "Feature matrix built: 5 features × 8,640 samples, aligned to UTM Zone 45N at 30m",
            "RF Accuracy: 91.2% | F1: 0.89 | AUC: 0.95 | Flood-prone cells: 38.7%",
            "U-Net IoU: 0.82 | Flood mask: 2,847 polygons | Augmented with flip+rotate+jitter",
        ];

        for (let i = 0; i < steps.length; i++) {
            steps[i].status = "running";
            setPipeline([...steps]);
            setCurrentStep(i);
            await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
            steps[i].status = "done";
            steps[i].result = results[i];
            setPipeline([...steps]);
        }
        setRunning(false);
    };

    const reset = () => {
        setPipeline(p => p.map(s => ({ ...s, status: "idle", result: undefined })));
        setCurrentStep(-1);
    };

    const allDone = pipeline.every(s => s.status === "done");

    return (
        <motion.div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8" variants={container} initial="hidden" animate="show">
            <motion.div variants={item}>
                <h1 className="text-3xl font-bold tracking-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400">
                        Geospatial AI Engine
                    </span>
                </h1>
                <p className="text-muted-foreground mt-1">Remote sensing processing, feature engineering, ML prediction, and flood segmentation pipeline</p>
            </motion.div>

            <Tabs defaultValue="pipeline">
                <TabsList className="mb-6">
                    <TabsTrigger value="pipeline">Processing Pipeline</TabsTrigger>
                    <TabsTrigger value="models">Model Evaluation</TabsTrigger>
                    <TabsTrigger value="features">Feature Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="pipeline" className="space-y-6">
                    {/* Pipeline Control */}
                    <motion.div variants={item}>
                        <Card className="glass-card">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Geospatial Processing Pipeline</CardTitle>
                                        <CardDescription>NDWI → DEM → River Proximity → Rainfall → Features → ML → Segmentation</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        {allDone && <Button variant="outline" size="sm" onClick={reset}>Reset</Button>}
                                        <Button onClick={runPipeline} disabled={running} className="gap-2">
                                            {running ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><Play className="w-4 h-4" /> Run Full Pipeline</>}
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {pipeline.map((step, i) => (
                                        <div key={step.name} className={`flex items-start gap-4 p-4 rounded-lg border transition-all duration-300 ${step.status === "done" ? "border-emerald-500/30 bg-emerald-500/5" :
                                                step.status === "running" ? "border-primary/40 bg-primary/5 shadow-lg shadow-primary/10" :
                                                    "border-border/50"
                                            }`}>
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${step.status === "done" ? "bg-emerald-500/20" :
                                                    step.status === "running" ? "bg-primary/20 animate-pulse" :
                                                        "bg-muted"
                                                }`}>
                                                {step.status === "done" ? <CheckCircle className="w-5 h-5 text-emerald-400" /> :
                                                    step.status === "running" ? <Loader2 className="w-5 h-5 text-primary animate-spin" /> :
                                                        <step.icon className="w-5 h-5 text-muted-foreground" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-sm">{step.name}</span>
                                                    <Badge variant="outline" className={`text-[9px] ${step.status === "done" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" :
                                                            step.status === "running" ? "bg-primary/15 text-primary border-primary/30" :
                                                                ""
                                                        }`}>
                                                        {step.status === "idle" ? "pending" : step.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                                                {step.result && (
                                                    <div className="mt-2 p-2 rounded bg-card/80 border border-border/50">
                                                        <p className="text-xs font-mono text-emerald-400">{step.result}</p>
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground font-mono w-8 text-right">{i + 1}/7</span>
                                        </div>
                                    ))}
                                </div>
                                {running && (
                                    <div className="mt-4">
                                        <Progress value={((currentStep + 1) / pipeline.length) * 100} className="h-2" />
                                        <p className="text-xs text-center text-muted-foreground mt-1 font-mono">
                                            Step {currentStep + 1} of {pipeline.length}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Results Summary */}
                    {allDone && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                            <Card className="glass-card border-emerald-500/20">
                                <CardHeader>
                                    <CardTitle className="text-emerald-400">Pipeline Complete — Results Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { label: "Water Coverage", value: "34.2%", sub: "NDWI > 0.3" },
                                            { label: "Flood-Prone Cells", value: "38.7%", sub: "RF probability > 0.5" },
                                            { label: "Model Accuracy", value: "91.2%", sub: "Random Forest" },
                                            { label: "U-Net IoU", value: "0.82", sub: "Flood mask quality" },
                                        ].map(r => (
                                            <div key={r.label} className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-center">
                                                <p className="text-2xl font-bold font-mono text-emerald-400">{r.value}</p>
                                                <p className="text-xs font-medium mt-1">{r.label}</p>
                                                <p className="text-[10px] text-muted-foreground">{r.sub}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </TabsContent>

                <TabsContent value="models" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <motion.div variants={item}>
                            <Card className="glass-card">
                                <CardHeader><CardTitle className="text-base">Model Comparison</CardTitle></CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={modelMetrics.map(m => ({ name: m.name, accuracy: +(m.accuracy * 100).toFixed(1), f1: +(m.f1Score * 100).toFixed(1), auc: +(m.auc * 100).toFixed(1) }))}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(224 15% 18%)" />
                                            <XAxis dataKey="name" stroke="hsl(215 15% 55%)" fontSize={11} />
                                            <YAxis domain={[70, 100]} stroke="hsl(215 15% 55%)" fontSize={11} />
                                            <ReTooltip contentStyle={{ background: "hsl(224 25% 12%)", border: "1px solid hsl(224 15% 18%)", borderRadius: 8 }} />
                                            <Bar dataKey="accuracy" fill="hsl(210, 100%, 55%)" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="f1" fill="hsl(145, 63%, 49%)" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="auc" fill="hsl(38, 92%, 55%)" radius={[4, 4, 0, 0]} />
                                            <Legend />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div variants={item}>
                            <Card className="glass-card">
                                <CardHeader><CardTitle className="text-base">Model Radar</CardTitle></CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <RadarChart data={radarData}>
                                            <PolarGrid stroke="hsl(224 15% 18%)" />
                                            <PolarAngleAxis dataKey="model" stroke="hsl(215 15% 55%)" fontSize={11} />
                                            <PolarRadiusAxis domain={[70, 100]} stroke="hsl(215 15% 55%)" fontSize={9} />
                                            <Radar name="Accuracy" dataKey="accuracy" stroke="hsl(210, 100%, 55%)" fill="hsl(210, 100%, 55%)" fillOpacity={0.15} />
                                            <Radar name="F1" dataKey="f1" stroke="hsl(145, 63%, 49%)" fill="hsl(145, 63%, 49%)" fillOpacity={0.1} />
                                            <Legend />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Model Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {modelMetrics.map(m => (
                            <Card key={m.name} className="glass-card hover-lift">
                                <CardContent className="p-5 space-y-3">
                                    <h3 className="text-sm font-bold">{m.name}</h3>
                                    {(["accuracy", "f1Score", "auc", "precision", "recall"] as const).map(key => (
                                        <div key={key} className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground capitalize">{key === "f1Score" ? "F1 Score" : key}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary rounded-full" style={{ width: `${m[key] * 100}%` }} />
                                                </div>
                                                <span className="font-mono text-xs font-medium">{(m[key] * 100).toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="features" className="space-y-6">
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle>Feature Engineering Summary</CardTitle>
                            <CardDescription>Input features for the Random Forest flood susceptibility model</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border text-left">
                                            <th className="pb-3 font-medium text-muted-foreground">Feature</th>
                                            <th className="pb-3 font-medium text-muted-foreground">Source</th>
                                            <th className="pb-3 font-medium text-muted-foreground">Processing</th>
                                            <th className="pb-3 font-medium text-muted-foreground">CRS</th>
                                            <th className="pb-3 font-medium text-muted-foreground text-right">Range</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { feat: "NDWI", src: "Sentinel-2 B3/B8", proc: "(Green-NIR)/(Green+NIR)", crs: "UTM Zone 45N", range: "-1.0 to 1.0" },
                                            { feat: "Elevation", src: "SRTM DEM (30m)", proc: "Raster extraction", crs: "UTM Zone 45N", range: "0–120 m" },
                                            { feat: "Slope", src: "DEM gradient", proc: "numpy.gradient → degrees", crs: "UTM Zone 45N", range: "0°–28.5°" },
                                            { feat: "River Distance", src: "GeoJSON river network", proc: "Euclidean dist in UTM", crs: "UTM Zone 45N", range: "120–5,600 m" },
                                            { feat: "Rainfall", src: "NASA/Kaggle CSV", proc: "Spatial interpolation", crs: "UTM Zone 45N", range: "90–380 mm" },
                                        ].map(f => (
                                            <tr key={f.feat} className="border-b border-border/50 last:border-0">
                                                <td className="py-3 font-medium">{f.feat}</td>
                                                <td className="py-3 text-xs text-muted-foreground">{f.src}</td>
                                                <td className="py-3"><code className="text-xs bg-secondary px-1.5 py-0.5 rounded">{f.proc}</code></td>
                                                <td className="py-3 text-xs font-mono">{f.crs}</td>
                                                <td className="py-3 text-right text-xs font-mono">{f.range}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                                <p className="text-xs text-blue-400">
                                    <strong>Spatial Alignment:</strong> All rasters processed in UTM Zone 45N (EPSG:32645) at 30m resolution.
                                    Feature matrix builder enforces dimensional consistency. Output reprojected to WGS84 for map display.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
}
