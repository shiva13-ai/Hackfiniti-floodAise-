import type { Express } from "express";
import { sensorReadingSchema, analysisSchema, deviceRegistrationSchema, type Analysis } from "../shared/schema.js";

// ---- In-memory storage ----
interface SensorData {
    sensorId: string;
    readings: { rainIntensity: number; waterLevel: number; timestamp: string }[];
    rejectedCount: number;
    totalCount: number;
}

interface RegisteredDevice {
    id: string;
    name: string;
    sensorId: string;
    lat: number;
    lng: number;
    apiKey: string;
    isExternal: boolean;
    createdAt: string;
}

// Region centroids for spatial matching (haversine nearest-match)
const regionCentroids = [
    { id: "r1", name: "Dhaka Division", lat: 23.8103, lng: 90.4125, riskScore: 0.94 },
    { id: "r2", name: "Sylhet Basin", lat: 24.8949, lng: 91.8687, riskScore: 0.78 },
    { id: "r3", name: "Chittagong Hills", lat: 22.3569, lng: 91.7832, riskScore: 0.55 },
    { id: "r4", name: "Rajshahi Floodplain", lat: 24.3745, lng: 88.6042, riskScore: 0.82 },
    { id: "r5", name: "Khulna Coast", lat: 22.8456, lng: 89.5403, riskScore: 0.25 },
    { id: "r6", name: "Barisal Lowlands", lat: 22.7010, lng: 90.3535, riskScore: 0.61 },
    { id: "r7", name: "Rangpur Valley", lat: 25.7439, lng: 89.2752, riskScore: 0.85 },
];

const sensors: Map<string, SensorData> = new Map();
const analyses: Map<string, Analysis> = new Map();
const devices: Map<string, RegisteredDevice> = new Map();
let analysisCounter = 0;
let deviceCounter = 0;

// ---- Haversine distance (km) ----
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ---- Spatial matching: device → nearest region ----
function findNearestRegion(lat: number, lng: number) {
    let nearest = regionCentroids[0];
    let minDist = Infinity;
    for (const r of regionCentroids) {
        const d = haversine(lat, lng, r.lat, r.lng);
        if (d < minDist) { minDist = d; nearest = r; }
    }
    return { ...nearest, distance: minDist };
}

// ---- Risk Adjustment Engine ----
const CRITICAL_WATER_THRESHOLD = 200;  // cm
const MODERATE_WATER_THRESHOLD = 120;  // cm
const ALPHA = 0.12;                     // risk boost factor

function computeAdjustedRisk(satelliteRisk: number, latestWaterLevel: number | null) {
    if (latestWaterLevel === null) return { adjustedRisk: satelliteRisk, delta: 0, confidence: "satellite-only" as const };
    if (latestWaterLevel > CRITICAL_WATER_THRESHOLD) {
        const adjusted = Math.min(1, Math.max(satelliteRisk, 0.85));
        return { adjustedRisk: adjusted, delta: +(adjusted - satelliteRisk).toFixed(3), confidence: "iot-validated-critical" as const };
    }
    if (latestWaterLevel > MODERATE_WATER_THRESHOLD) {
        const adjusted = Math.min(1, satelliteRisk + ALPHA);
        return { adjustedRisk: adjusted, delta: +(adjusted - satelliteRisk).toFixed(3), confidence: "iot-validated" as const };
    }
    return { adjustedRisk: satelliteRisk, delta: 0, confidence: "iot-confirmed-stable" as const };
}

// ---- Sensor Reliability Score ----
function computeReliability(sensorId: string): number {
    const data = sensors.get(sensorId);
    if (!data || data.totalCount === 0) return 0;
    const rejectionRate = 1 - (data.rejectedCount / data.totalCount);
    // Expected: 1 reading per 10s over last hour = 360 readings
    const expectedReadings = 360;
    const uptimeFactor = Math.min(1, data.readings.length / expectedReadings);
    return +(rejectionRate * uptimeFactor).toFixed(3);
}

// Seed data
const seedAnalyses: Omit<Analysis, "id" | "createdAt">[] = [
    { title: "Dhaka Division Risk Assessment", description: "High flood risk detected via NDWI + DEM analysis", region: "Dhaka Division", riskLevel: "critical", riskScore: 0.94 },
    { title: "Sylhet Basin Monitoring", description: "Rising water levels confirmed by U-Net segmentation", region: "Sylhet Basin", riskLevel: "high", riskScore: 0.78 },
    { title: "Chittagong Slope Assessment", description: "DEM slope analysis shows moderate runoff potential", region: "Chittagong Hills", riskLevel: "medium", riskScore: 0.55 },
    { title: "Rajshahi River Proximity Alert", description: "Water expansion within 2km buffer of Padma River", region: "Rajshahi Floodplain", riskLevel: "high", riskScore: 0.82 },
    { title: "Khulna Coastal Monitoring", description: "Tidal patterns normal, NDWI stable", region: "Khulna Coast", riskLevel: "low", riskScore: 0.25 },
];

seedAnalyses.forEach(a => {
    const id = `seed-${++analysisCounter}`;
    analyses.set(id, { ...a, id, createdAt: new Date().toISOString() });
});

function generateSeedSensorData() {
    const sensorIds = ["S-001", "S-002", "S-003", "S-004", "S-005"];
    sensorIds.forEach(sensorId => {
        const readings = [];
        const now = Date.now();
        for (let i = 24; i >= 0; i--) {
            const baseRain = sensorId === "S-003" ? 45 : sensorId === "S-001" ? 28 : 15;
            const baseWater = sensorId === "S-003" ? 240 : sensorId === "S-001" ? 180 : 90;
            const factor = Math.sin((24 - i) * 0.3) * 0.5 + 0.5;
            readings.push({
                rainIntensity: Math.max(0, baseRain * factor + (Math.random() - 0.5) * 8),
                waterLevel: Math.max(0, baseWater + baseWater * 0.3 * factor + (Math.random() - 0.5) * 10),
                timestamp: new Date(now - i * 3600000).toISOString(),
            });
        }
        sensors.set(sensorId, { sensorId, readings, rejectedCount: 0, totalCount: readings.length });
    });
}
generateSeedSensorData();

// Seed built-in devices
const builtInDevices: Omit<RegisteredDevice, "id" | "apiKey" | "createdAt">[] = [
    { name: "Dhaka River Gate", sensorId: "S-001", lat: 23.7925, lng: 90.4078, isExternal: false },
    { name: "Sylhet Basin Monitor", sensorId: "S-002", lat: 24.8949, lng: 91.8687, isExternal: false },
    { name: "Rangpur Flood Gauge", sensorId: "S-003", lat: 25.7439, lng: 89.2752, isExternal: false },
    { name: "Chittagong Coastal", sensorId: "S-004", lat: 22.3569, lng: 91.7832, isExternal: false },
    { name: "Khulna Tidal Station", sensorId: "S-005", lat: 22.8456, lng: 89.5403, isExternal: false },
];
builtInDevices.forEach(d => {
    const id = `dev-${++deviceCounter}`;
    devices.set(id, { ...d, id, apiKey: "built-in", createdAt: new Date().toISOString() });
});

// Generate random API key
function generateApiKey(): string {
    return "fgk_" + Array.from({ length: 32 }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]).join("");
}

export function registerRoutes(app: Express) {
    // ---- Analysis CRUD ----
    app.get("/api/analyses", (_req, res) => {
        res.json([...analyses.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    });

    app.get("/api/analyses/:id", (req, res) => {
        const a = analyses.get(req.params.id);
        if (!a) return res.status(404).json({ error: "Not found" });
        res.json(a);
    });

    app.post("/api/analyses", (req, res) => {
        const result = analysisSchema.safeParse(req.body);
        if (!result.success) return res.status(400).json({ error: result.error.flatten() });
        const id = `a-${++analysisCounter}`;
        const analysis: Analysis = { ...result.data, id, createdAt: new Date().toISOString() };
        analyses.set(id, analysis);
        res.status(201).json(analysis);
    });

    app.delete("/api/analyses/:id", (req, res) => {
        if (!analyses.delete(req.params.id)) return res.status(404).json({ error: "Not found" });
        res.status(204).send();
    });

    // ---- Device Registration ----
    app.get("/api/devices", (_req, res) => {
        const list = [...devices.values()].map(d => {
            const sensorData = sensors.get(d.sensorId);
            const latestReading = sensorData?.readings[sensorData.readings.length - 1];
            const region = findNearestRegion(d.lat, d.lng);
            return {
                ...d,
                apiKey: d.isExternal ? d.apiKey : undefined,  // Only show API key for external devices
                status: sensorData && sensorData.readings.length > 0 ? "online" : "offline",
                batteryLevel: d.isExternal ? 100 : [87, 72, 34, 91, 12][builtInDevices.findIndex(b => b.sensorId === d.sensorId)] || 50,
                lastReading: latestReading?.timestamp || null,
                reliability: computeReliability(d.sensorId),
                nearestRegion: region.name,
                regionDistance: +region.distance.toFixed(1),
            };
        });
        res.json(list);
    });

    app.post("/api/devices", (req, res) => {
        const result = deviceRegistrationSchema.safeParse(req.body);
        if (!result.success) return res.status(400).json({ error: result.error.flatten() });

        // Check for duplicate sensorId
        const existing = [...devices.values()].find(d => d.sensorId === result.data.sensorId);
        if (existing) return res.status(409).json({ error: "Sensor ID already registered" });

        const id = `dev-${++deviceCounter}`;
        const apiKey = generateApiKey();
        const device: RegisteredDevice = {
            ...result.data, id, apiKey, isExternal: true,
            createdAt: new Date().toISOString(),
        };
        devices.set(id, device);

        // Initialize sensor data store
        sensors.set(result.data.sensorId, { sensorId: result.data.sensorId, readings: [], rejectedCount: 0, totalCount: 0 });

        const region = findNearestRegion(device.lat, device.lng);
        res.status(201).json({
            ...device,
            nearestRegion: region.name,
            regionDistance: +region.distance.toFixed(1),
            message: `Device registered. Use API key in x-api-key header when posting sensor data.`,
        });
    });

    app.delete("/api/devices/:id", (req, res) => {
        const device = devices.get(req.params.id);
        if (!device) return res.status(404).json({ error: "Device not found" });
        if (!device.isExternal) return res.status(403).json({ error: "Cannot delete built-in devices" });
        devices.delete(req.params.id);
        sensors.delete(device.sensorId);
        res.status(204).send();
    });

    // ---- Sensor Data ----
    app.get("/api/sensors", (_req, res) => {
        const list = [...sensors.values()].map(s => ({
            sensorId: s.sensorId,
            readingCount: s.readings.length,
            lastReading: s.readings[s.readings.length - 1],
            reliability: computeReliability(s.sensorId),
        }));
        res.json(list);
    });

    app.get("/api/sensors/:id/readings", (req, res) => {
        const data = sensors.get(req.params.id);
        if (!data) return res.status(404).json({ error: "Sensor not found" });
        res.json(data.readings);
    });

    app.post("/api/sensors/data", (req, res) => {
        const result = sensorReadingSchema.safeParse(req.body);
        if (!result.success) {
            // Track rejected readings
            const sensorId = req.body?.sensorId;
            if (sensorId && sensors.has(sensorId)) {
                sensors.get(sensorId)!.rejectedCount++;
                sensors.get(sensorId)!.totalCount++;
            }
            return res.status(400).json({ error: result.error.flatten(), rejected: true });
        }

        const { sensorId, rainIntensity, waterLevel } = result.data;

        // API key validation for external devices
        const device = [...devices.values()].find(d => d.sensorId === sensorId);
        if (device?.isExternal) {
            const apiKey = req.headers["x-api-key"];
            if (apiKey !== device.apiKey) {
                return res.status(401).json({ error: "Invalid API key" });
            }
        }

        if (!sensors.has(sensorId)) sensors.set(sensorId, { sensorId, readings: [], rejectedCount: 0, totalCount: 0 });
        const reading = {
            rainIntensity, waterLevel,
            timestamp: result.data.timestamp || new Date().toISOString(),
        };
        const s = sensors.get(sensorId)!;
        s.readings.push(reading);
        s.totalCount++;
        // Keep last 1000 readings per sensor
        if (s.readings.length > 1000) s.readings = s.readings.slice(-1000);
        res.status(201).json({ ok: true, reading });
    });

    // ---- Risk Adjustment Engine ----
    app.get("/api/risk-adjustment", (_req, res) => {
        const results = regionCentroids.map(region => {
            // Find IoT devices mapped to this region
            const mappedDevices = [...devices.values()].filter(d => {
                const nearest = findNearestRegion(d.lat, d.lng);
                return nearest.id === region.id;
            });

            // Get latest water level from any sensor in this region
            let latestWaterLevel: number | null = null;
            let validatingSensorId: string | null = null;
            for (const d of mappedDevices) {
                const data = sensors.get(d.sensorId);
                if (data && data.readings.length > 0) {
                    const latest = data.readings[data.readings.length - 1];
                    if (latestWaterLevel === null || latest.waterLevel > latestWaterLevel) {
                        latestWaterLevel = latest.waterLevel;
                        validatingSensorId = d.sensorId;
                    }
                }
            }

            const adjustment = computeAdjustedRisk(region.riskScore, latestWaterLevel);

            return {
                regionId: region.id,
                regionName: region.name,
                satelliteRisk: region.riskScore,
                iotWaterLevel: latestWaterLevel,
                ...adjustment,
                validatingSensor: validatingSensorId,
                sensorReliability: validatingSensorId ? computeReliability(validatingSensorId) : null,
                mappedDeviceCount: mappedDevices.length,
            };
        });
        res.json(results);
    });

    app.get("/api/risk-adjustment/:regionId", (req, res) => {
        const region = regionCentroids.find(r => r.id === req.params.regionId);
        if (!region) return res.status(404).json({ error: "Region not found" });

        const mappedDevices = [...devices.values()].filter(d => {
            const nearest = findNearestRegion(d.lat, d.lng);
            return nearest.id === region.id;
        });

        let latestWaterLevel: number | null = null;
        let validatingSensorId: string | null = null;
        for (const d of mappedDevices) {
            const data = sensors.get(d.sensorId);
            if (data && data.readings.length > 0) {
                const latest = data.readings[data.readings.length - 1];
                if (latestWaterLevel === null || latest.waterLevel > latestWaterLevel) {
                    latestWaterLevel = latest.waterLevel;
                    validatingSensorId = d.sensorId;
                }
            }
        }

        const adjustment = computeAdjustedRisk(region.riskScore, latestWaterLevel);
        res.json({
            regionId: region.id,
            regionName: region.name,
            satelliteRisk: region.riskScore,
            iotWaterLevel: latestWaterLevel,
            ...adjustment,
            validatingSensor: validatingSensorId,
            sensorReliability: validatingSensorId ? computeReliability(validatingSensorId) : null,
            mappedDeviceCount: mappedDevices.length,
        });
    });

    // ---- Proxy placeholder for Python backend ----
    app.all("/api/geo/*", (_req, res) => {
        res.json({
            message: "Python FastAPI backend not connected. Start it with: cd python-backend && uvicorn main:app --port 8000",
            data_mode: process.env.DATA_MODE || "demo",
            available_endpoints: [
                "POST /api/geo/ndwi",
                "POST /api/geo/dem",
                "POST /api/geo/predict",
                "POST /api/geo/segment",
                "POST /api/geo/train",
                "GET /api/geo/model-metrics",
            ],
        });
    });

    // ---- Status ----
    app.get("/api/status", (_req, res) => {
        res.json({
            status: "operational",
            data_mode: process.env.DATA_MODE || "demo",
            sensors: sensors.size,
            devices: devices.size,
            externalDevices: [...devices.values()].filter(d => d.isExternal).length,
            analyses: analyses.size,
            uptime: process.uptime(),
        });
    });
}
