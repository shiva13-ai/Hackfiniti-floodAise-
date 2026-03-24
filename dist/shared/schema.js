import { z } from "zod";
// ======================================
// Shared Schemas — Zod validators
// ======================================
export const sensorReadingSchema = z.object({
    sensorId: z.string(),
    rainIntensity: z.number().min(0).max(500), // mm/hr physical limit
    waterLevel: z.number().min(0).max(2000), // cm physical limit
    timestamp: z.string().datetime().optional(),
});
export const deviceRegistrationSchema = z.object({
    name: z.string().min(1).max(100),
    sensorId: z.string().min(1).max(20),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
});
export const analysisSchema = z.object({
    title: z.string().min(1),
    description: z.string(),
    region: z.string(),
    riskLevel: z.enum(["low", "medium", "high", "critical"]),
    riskScore: z.number().min(0).max(1),
});
