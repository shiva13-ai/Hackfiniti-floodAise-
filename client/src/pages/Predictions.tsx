import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { predictionResults, modelMetrics, getRiskBadgeClasses } from "@/data/mockData";
import { Upload, BrainCircuit, Loader2, FileImage, Zap, BarChart3, Satellite, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Predictions() {
    const [file, setFile] = useState<File | null>(null);
    const [running, setRunning] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) { setFile(f); setShowResults(false); }
    };

    const runPrediction = () => {
        setRunning(true); setProgress(0);
        const interval = setInterval(() => {
            setProgress(p => {
                if (p >= 100) { clearInterval(interval); setRunning(false); setShowResults(true); return 100; }
                return p + 4;
            });
        }, 100);
    };

    return (
        <motion.div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8" variants={container} initial="hidden" animate="show">
            <motion.div variants={item}>
                <h1 className="text-3xl font-bold tracking-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-red-400">AI Predictions</span>
                </h1>
                <p className="text-muted-foreground mt-1">Upload satellite imagery and run flood risk prediction pipeline</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div variants={item}>
                    <Card className="glass-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Upload Satellite Data</CardTitle>
                            <CardDescription>GeoTIFF, PNG, or JPEG imagery</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <label className="flex flex-col items-center justify-center h-44 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-secondary/30 hover:border-primary/40 transition-all group">
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Upload className="h-6 w-6 text-primary" />
                                </div>
                                <span className="text-sm text-muted-foreground">{file ? file.name : "Click to upload imagery"}</span>
                                {file && <span className="text-xs text-muted-foreground mt-1">{(file.size / 1024).toFixed(1)} KB</span>}
                                <input type="file" className="hidden" accept="image/*,.tif,.tiff" onChange={handleUpload} />
                            </label>
                            <Button className="w-full gap-2" onClick={runPrediction} disabled={!file || running}>
                                {running ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : <><BrainCircuit className="h-4 w-4" /> Run Prediction</>}
                            </Button>
                            {running && (
                                <div className="space-y-1">
                                    <Progress value={progress} className="h-2" />
                                    <p className="text-xs text-muted-foreground text-center font-mono">{progress}%</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="glass-card">
                        <CardHeader className="pb-2"><CardTitle className="text-base">Model Performance</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            {modelMetrics.map(m => (
                                <div key={m.name} className="p-3 border border-border/50 rounded-lg space-y-2 hover:bg-secondary/20 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{m.name}</span>
                                        <Badge variant="outline" className="text-[10px] font-mono">AUC {m.auc.toFixed(2)}</Badge>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                                        <div><span className="block font-mono text-foreground">{(m.accuracy * 100).toFixed(0)}%</span>Accuracy</div>
                                        <div><span className="block font-mono text-foreground">{(m.f1Score * 100).toFixed(0)}%</span>F1 Score</div>
                                        <div><span className="block font-mono text-foreground">{(m.precision * 100).toFixed(0)}%</span>Precision</div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="glass-card">
                        <CardHeader className="pb-2"><CardTitle className="text-base">Pipeline Status</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            {[
                                { stage: "Satellite Ingestion", icon: FileImage, done: showResults || running },
                                { stage: "GIS Preprocessing", icon: Satellite, done: showResults || (running && progress > 25) },
                                { stage: "Feature Engineering", icon: BarChart3, done: showResults || (running && progress > 50) },
                                { stage: "Model Inference", icon: BrainCircuit, done: showResults || (running && progress > 75) },
                                { stage: "Risk Map Generation", icon: Zap, done: showResults },
                            ].map(({ stage, icon: Icon, done }) => (
                                <div key={stage} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${done ? "border-emerald-500/30 bg-emerald-500/5" : "border-border/50"}`}>
                                    {done ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Icon className="w-4 h-4 text-muted-foreground" />}
                                    <span className={`text-sm ${done ? "font-medium text-emerald-400" : "text-muted-foreground"}`}>{stage}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {showResults && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="glass-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Prediction Results</CardTitle>
                            <CardDescription>Flood probability scores by zone — features: NDWI, elevation, slope, river distance, rainfall</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {predictionResults.map(p => (
                                    <div key={p.id} className="p-4 border border-border/50 rounded-xl space-y-3 hover-lift glass-card">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold">{p.region}</span>
                                            <Badge variant="outline" className={`text-[10px] ${getRiskBadgeClasses(p.riskLevel)}`}>{p.riskLevel}</Badge>
                                        </div>
                                        <div className="text-3xl font-bold font-mono">{(p.floodProbability * 100).toFixed(0)}%</div>
                                        <Progress value={p.floodProbability * 100} className="h-1.5" />
                                        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                                            <div><span className="block font-mono text-foreground">{p.ndwi.toFixed(2)}</span>NDWI</div>
                                            <div><span className="block font-mono text-foreground">{p.elevation}m</span>Elevation</div>
                                            <div><span className="block font-mono text-foreground">{p.slope}°</span>Slope</div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                            <div><span className="block font-mono text-foreground">{p.distanceToRiver}m</span>River Dist</div>
                                            <div><span className="block font-mono text-foreground">{p.rainfall}mm</span>Rainfall</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </motion.div>
    );
}
