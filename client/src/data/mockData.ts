// ============================================================
// FloodGuard AI — Mock Data (Kaggle-aligned structures)
// ============================================================

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface FloodAlert {
    id: string;
    region: string;
    severity: RiskLevel;
    message: string;
    timestamp: string;
    riskScore: number;
    coordinates: [number, number];
    acknowledged: boolean;
}

export interface PredictionResult {
    id: string;
    region: string;
    floodProbability: number;
    riskLevel: RiskLevel;
    ndwi: number;
    elevation: number;
    slope: number;
    distanceToRiver: number;
    rainfall: number;
    timestamp: string;
}

export interface HistoricalEvent {
    year: number;
    month: string;
    floodEvents: number;
    affectedArea: number;
    rainfall: number;
    severity: number;
}

export interface RegionRisk {
    id: string;
    name: string;
    riskScore: number;
    riskLevel: RiskLevel;
    population: number;
    area: number;
    lastUpdated: string;
}

export interface ModelMetrics {
    name: string;
    accuracy: number;
    f1Score: number;
    auc: number;
    precision: number;
    recall: number;
}

export interface SensorDevice {
    id: string;
    name: string;
    lat: number;
    lng: number;
    status: "online" | "offline" | "warning";
    lastReading: string;
    batteryLevel: number;
}

export interface SensorReading {
    timestamp: string;
    rainIntensity: number;
    waterLevel: number;
}

// ---- Alerts ----
export const alerts: FloodAlert[] = [
    { id: "a1", region: "Dhaka Division", severity: "critical", message: "Severe flooding detected via NDWI analysis. Immediate evacuation recommended.", timestamp: "2026-03-02T08:30:00Z", riskScore: 0.94, coordinates: [23.8103, 90.4125], acknowledged: false },
    { id: "a2", region: "Sylhet Basin", severity: "high", message: "Rising water levels detected from Sentinel-2 imagery. U-Net segmentation confirms 78% flood coverage.", timestamp: "2026-03-02T06:15:00Z", riskScore: 0.78, coordinates: [24.8949, 91.8687], acknowledged: false },
    { id: "a3", region: "Chittagong Hills", severity: "medium", message: "DEM slope analysis indicates moderate runoff risk. Rainfall exceeding threshold.", timestamp: "2026-03-01T22:00:00Z", riskScore: 0.55, coordinates: [22.3569, 91.7832], acknowledged: true },
    { id: "a4", region: "Rajshahi Floodplain", severity: "high", message: "River proximity alert — water body expansion detected within 2km buffer zone.", timestamp: "2026-03-01T18:45:00Z", riskScore: 0.82, coordinates: [24.3745, 88.6042], acknowledged: false },
    { id: "a5", region: "Khulna Coast", severity: "low", message: "Tidal surge monitoring active. NDWI stable at 0.12. No immediate risk.", timestamp: "2026-03-01T14:20:00Z", riskScore: 0.25, coordinates: [22.8456, 89.5403], acknowledged: true },
    { id: "a6", region: "Barisal Lowlands", severity: "medium", message: "Soil saturation levels high from rainfall data overlay. Flash flood possible.", timestamp: "2026-03-01T10:00:00Z", riskScore: 0.61, coordinates: [22.7010, 90.3535], acknowledged: true },
    { id: "a7", region: "Rangpur Valley", severity: "high", message: "ESP32 sensor S-003 reporting water level at 2.8m — above critical threshold.", timestamp: "2026-03-02T09:15:00Z", riskScore: 0.85, coordinates: [25.7439, 89.2752], acknowledged: false },
];

// ---- Region Risks ----
export const regionRisks: RegionRisk[] = [
    { id: "r1", name: "Dhaka Division", riskScore: 0.94, riskLevel: "critical", population: 21000000, area: 1463, lastUpdated: "2026-03-02T08:30:00Z" },
    { id: "r2", name: "Sylhet Basin", riskScore: 0.78, riskLevel: "high", population: 3600000, area: 2723, lastUpdated: "2026-03-02T06:15:00Z" },
    { id: "r3", name: "Chittagong Hills", riskScore: 0.55, riskLevel: "medium", population: 7600000, area: 5283, lastUpdated: "2026-03-01T22:00:00Z" },
    { id: "r4", name: "Rajshahi Floodplain", riskScore: 0.82, riskLevel: "high", population: 18500000, area: 9654, lastUpdated: "2026-03-01T18:45:00Z" },
    { id: "r5", name: "Khulna Coast", riskScore: 0.25, riskLevel: "low", population: 15700000, area: 4395, lastUpdated: "2026-03-01T14:20:00Z" },
    { id: "r6", name: "Barisal Lowlands", riskScore: 0.61, riskLevel: "medium", population: 8300000, area: 3265, lastUpdated: "2026-03-01T10:00:00Z" },
    { id: "r7", name: "Rangpur Valley", riskScore: 0.85, riskLevel: "high", population: 5100000, area: 3840, lastUpdated: "2026-03-02T09:15:00Z" },
];

// ---- Historical Data (Kaggle-aligned) ----
export const historicalData: HistoricalEvent[] = [
    { year: 2020, month: "Jun", floodEvents: 12, affectedArea: 3400, rainfall: 320, severity: 0.65 },
    { year: 2020, month: "Jul", floodEvents: 28, affectedArea: 8200, rainfall: 480, severity: 0.82 },
    { year: 2020, month: "Aug", floodEvents: 35, affectedArea: 12500, rainfall: 520, severity: 0.91 },
    { year: 2020, month: "Sep", floodEvents: 18, affectedArea: 5600, rainfall: 380, severity: 0.72 },
    { year: 2021, month: "Jun", floodEvents: 8, affectedArea: 2100, rainfall: 280, severity: 0.52 },
    { year: 2021, month: "Jul", floodEvents: 22, affectedArea: 6800, rainfall: 420, severity: 0.76 },
    { year: 2021, month: "Aug", floodEvents: 31, affectedArea: 11200, rainfall: 500, severity: 0.88 },
    { year: 2021, month: "Sep", floodEvents: 15, affectedArea: 4300, rainfall: 340, severity: 0.68 },
    { year: 2022, month: "Jun", floodEvents: 14, affectedArea: 3800, rainfall: 350, severity: 0.70 },
    { year: 2022, month: "Jul", floodEvents: 32, affectedArea: 9500, rainfall: 510, severity: 0.85 },
    { year: 2022, month: "Aug", floodEvents: 41, affectedArea: 15200, rainfall: 580, severity: 0.95 },
    { year: 2022, month: "Sep", floodEvents: 20, affectedArea: 6200, rainfall: 400, severity: 0.74 },
    { year: 2023, month: "Jun", floodEvents: 10, affectedArea: 2800, rainfall: 300, severity: 0.58 },
    { year: 2023, month: "Jul", floodEvents: 25, affectedArea: 7500, rainfall: 450, severity: 0.79 },
    { year: 2023, month: "Aug", floodEvents: 38, affectedArea: 13800, rainfall: 550, severity: 0.93 },
    { year: 2023, month: "Sep", floodEvents: 16, affectedArea: 4800, rainfall: 360, severity: 0.69 },
];

// ---- Model Metrics ----
export const modelMetrics: ModelMetrics[] = [
    { name: "Random Forest", accuracy: 0.89, f1Score: 0.87, auc: 0.93, precision: 0.88, recall: 0.86 },
    { name: "XGBoost", accuracy: 0.92, f1Score: 0.90, auc: 0.95, precision: 0.91, recall: 0.89 },
    { name: "CNN", accuracy: 0.88, f1Score: 0.85, auc: 0.91, precision: 0.87, recall: 0.84 },
    { name: "U-Net", accuracy: 0.94, f1Score: 0.93, auc: 0.97, precision: 0.93, recall: 0.92 },
];

// ---- Prediction Results ----
export const predictionResults: PredictionResult[] = [
    { id: "p1", region: "Zone A — River Delta", floodProbability: 0.87, riskLevel: "high", ndwi: 0.42, elevation: 12, slope: 2.1, distanceToRiver: 450, rainfall: 280, timestamp: "2026-03-02T08:00:00Z" },
    { id: "p2", region: "Zone B — Urban Center", floodProbability: 0.34, riskLevel: "low", ndwi: 0.15, elevation: 45, slope: 8.5, distanceToRiver: 3200, rainfall: 120, timestamp: "2026-03-02T08:00:00Z" },
    { id: "p3", region: "Zone C — Coastal Plain", floodProbability: 0.72, riskLevel: "high", ndwi: 0.38, elevation: 8, slope: 1.2, distanceToRiver: 800, rainfall: 310, timestamp: "2026-03-02T08:00:00Z" },
    { id: "p4", region: "Zone D — Highland", floodProbability: 0.18, riskLevel: "low", ndwi: 0.08, elevation: 120, slope: 22.0, distanceToRiver: 5600, rainfall: 90, timestamp: "2026-03-02T08:00:00Z" },
    { id: "p5", region: "Zone E — Wetlands", floodProbability: 0.93, riskLevel: "critical", ndwi: 0.56, elevation: 5, slope: 0.8, distanceToRiver: 120, rainfall: 380, timestamp: "2026-03-02T08:00:00Z" },
    { id: "p6", region: "Zone F — Agricultural", floodProbability: 0.58, riskLevel: "medium", ndwi: 0.28, elevation: 22, slope: 4.3, distanceToRiver: 1800, rainfall: 200, timestamp: "2026-03-02T08:00:00Z" },
];

// ---- Sensor Devices (ESP32) ----
export const sensorDevices: SensorDevice[] = [
    { id: "S-001", name: "Dhaka River Gate", lat: 23.7925, lng: 90.4078, status: "online", lastReading: "2026-03-02T09:28:00Z", batteryLevel: 87 },
    { id: "S-002", name: "Sylhet Basin Monitor", lat: 24.8949, lng: 91.8687, status: "online", lastReading: "2026-03-02T09:25:00Z", batteryLevel: 72 },
    { id: "S-003", name: "Rangpur Flood Gauge", lat: 25.7439, lng: 89.2752, status: "warning", lastReading: "2026-03-02T09:15:00Z", batteryLevel: 34 },
    { id: "S-004", name: "Chittagong Coastal", lat: 22.3569, lng: 91.7832, status: "online", lastReading: "2026-03-02T09:20:00Z", batteryLevel: 91 },
    { id: "S-005", name: "Khulna Tidal Station", lat: 22.8456, lng: 89.5403, status: "offline", lastReading: "2026-03-02T04:45:00Z", batteryLevel: 12 },
];

// Generate time-series readings for sensors
function generateReadings(sensorId: string, hoursBack: number = 24): SensorReading[] {
    const readings: SensorReading[] = [];
    const now = new Date("2026-03-02T09:30:00Z");
    const baseRain = sensorId === "S-003" ? 45 : sensorId === "S-001" ? 28 : 15;
    const baseWater = sensorId === "S-003" ? 240 : sensorId === "S-001" ? 180 : 90;

    for (let i = hoursBack; i >= 0; i--) {
        const t = new Date(now.getTime() - i * 3600000);
        const hourFactor = Math.sin((24 - i) * 0.3) * 0.5 + 0.5;
        const noise = () => (Math.random() - 0.5) * 8;
        readings.push({
            timestamp: t.toISOString(),
            rainIntensity: Math.max(0, baseRain * hourFactor + noise()),
            waterLevel: Math.max(0, baseWater + (baseWater * 0.3 * hourFactor) + noise() * 5),
        });
    }
    return readings;
}

export const sensorReadings: Record<string, SensorReading[]> = {
    "S-001": generateReadings("S-001"),
    "S-002": generateReadings("S-002"),
    "S-003": generateReadings("S-003"),
    "S-004": generateReadings("S-004"),
    "S-005": generateReadings("S-005", 8),
};

// ---- Utility Functions ----
export function getRiskColor(level: string): string {
    switch (level) {
        case "critical": return "hsl(0, 72%, 51%)";
        case "high": return "hsl(25, 95%, 53%)";
        case "medium": return "hsl(38, 92%, 50%)";
        case "low": return "hsl(145, 63%, 42%)";
        default: return "hsl(220, 10%, 46%)";
    }
}

export function getRiskBadgeClasses(level: string): string {
    switch (level) {
        case "critical": return "bg-red-500/15 text-red-400 border-red-500/30";
        case "high": return "bg-orange-500/15 text-orange-400 border-orange-500/30";
        case "medium": return "bg-amber-500/15 text-amber-400 border-amber-500/30";
        case "low": return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
        default: return "bg-muted text-muted-foreground border-border";
    }
}

export function getSensorStatusColor(status: string): string {
    switch (status) {
        case "online": return "bg-emerald-500";
        case "warning": return "bg-amber-500";
        case "offline": return "bg-red-500";
        default: return "bg-gray-500";
    }
}
