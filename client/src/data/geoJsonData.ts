import type { FeatureCollection } from "geojson";

export const floodRiskRegions: FeatureCollection = {
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            properties: { name: "Dhaka Division", riskScore: 0.94, riskLevel: "critical", population: 21000000, ndwi: 0.51, elevation: 12, slope: 1.8 },
            geometry: { type: "Polygon", coordinates: [[[90.2, 23.6], [90.6, 23.6], [90.6, 24.0], [90.2, 24.0], [90.2, 23.6]]] }
        },
        {
            type: "Feature",
            properties: { name: "Sylhet Basin", riskScore: 0.78, riskLevel: "high", population: 3600000, ndwi: 0.43, elevation: 22, slope: 3.2 },
            geometry: { type: "Polygon", coordinates: [[[91.6, 24.7], [92.1, 24.7], [92.1, 25.1], [91.6, 25.1], [91.6, 24.7]]] }
        },
        {
            type: "Feature",
            properties: { name: "Chittagong Hills", riskScore: 0.55, riskLevel: "medium", population: 7600000, ndwi: 0.28, elevation: 85, slope: 18.5 },
            geometry: { type: "Polygon", coordinates: [[[91.5, 22.1], [92.0, 22.1], [92.0, 22.6], [91.5, 22.6], [91.5, 22.1]]] }
        },
        {
            type: "Feature",
            properties: { name: "Rajshahi Floodplain", riskScore: 0.82, riskLevel: "high", population: 18500000, ndwi: 0.39, elevation: 18, slope: 2.1 },
            geometry: { type: "Polygon", coordinates: [[[88.3, 24.1], [88.8, 24.1], [88.8, 24.6], [88.3, 24.6], [88.3, 24.1]]] }
        },
        {
            type: "Feature",
            properties: { name: "Khulna Coast", riskScore: 0.25, riskLevel: "low", population: 15700000, ndwi: 0.12, elevation: 5, slope: 0.5 },
            geometry: { type: "Polygon", coordinates: [[[89.3, 22.6], [89.8, 22.6], [89.8, 23.0], [89.3, 23.0], [89.3, 22.6]]] }
        },
        {
            type: "Feature",
            properties: { name: "Barisal Lowlands", riskScore: 0.61, riskLevel: "medium", population: 8300000, ndwi: 0.31, elevation: 8, slope: 1.2 },
            geometry: { type: "Polygon", coordinates: [[[90.1, 22.5], [90.6, 22.5], [90.6, 22.9], [90.1, 22.9], [90.1, 22.5]]] }
        },
        {
            type: "Feature",
            properties: { name: "Rangpur Valley", riskScore: 0.85, riskLevel: "high", population: 5100000, ndwi: 0.46, elevation: 35, slope: 4.5 },
            geometry: { type: "Polygon", coordinates: [[[89.0, 25.5], [89.5, 25.5], [89.5, 25.9], [89.0, 25.9], [89.0, 25.5]]] }
        },
    ]
};

export const rainfallPoints = [
    { lat: 23.81, lng: 90.41, intensity: 320 },
    { lat: 24.89, lng: 91.87, intensity: 280 },
    { lat: 22.36, lng: 91.78, intensity: 180 },
    { lat: 24.37, lng: 88.60, intensity: 250 },
    { lat: 22.85, lng: 89.54, intensity: 120 },
    { lat: 22.70, lng: 90.35, intensity: 210 },
    { lat: 23.50, lng: 90.20, intensity: 350 },
    { lat: 24.00, lng: 90.80, intensity: 290 },
    { lat: 23.20, lng: 89.90, intensity: 160 },
    { lat: 24.50, lng: 91.20, intensity: 310 },
    { lat: 25.74, lng: 89.28, intensity: 340 },
    { lat: 25.20, lng: 89.90, intensity: 275 },
];

export const elevationPoints = [
    { lat: 23.81, lng: 90.41, elevation: 12 },
    { lat: 24.89, lng: 91.87, elevation: 35 },
    { lat: 22.36, lng: 91.78, elevation: 85 },
    { lat: 24.37, lng: 88.60, elevation: 18 },
    { lat: 22.85, lng: 89.54, elevation: 5 },
    { lat: 22.70, lng: 90.35, elevation: 8 },
    { lat: 23.50, lng: 90.20, elevation: 15 },
    { lat: 24.00, lng: 90.80, elevation: 22 },
    { lat: 23.20, lng: 89.90, elevation: 10 },
    { lat: 24.50, lng: 91.20, elevation: 45 },
    { lat: 25.74, lng: 89.28, elevation: 35 },
    { lat: 25.20, lng: 89.90, elevation: 28 },
];

// River network for proximity analysis
export const riverNetwork: FeatureCollection = {
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            properties: { name: "Brahmaputra River", type: "major" },
            geometry: { type: "LineString", coordinates: [[89.5, 25.9], [89.8, 25.5], [90.2, 24.8], [90.4, 24.2], [90.5, 23.8], [90.6, 23.5]] }
        },
        {
            type: "Feature",
            properties: { name: "Ganges-Padma River", type: "major" },
            geometry: { type: "LineString", coordinates: [[88.3, 24.5], [88.8, 24.3], [89.5, 23.9], [90.0, 23.6], [90.5, 23.4]] }
        },
        {
            type: "Feature",
            properties: { name: "Meghna River", type: "major" },
            geometry: { type: "LineString", coordinates: [[91.2, 25.0], [91.0, 24.5], [90.8, 24.0], [90.7, 23.5], [90.8, 23.0]] }
        },
        {
            type: "Feature",
            properties: { name: "Surma River", type: "tributary" },
            geometry: { type: "LineString", coordinates: [[92.0, 24.9], [91.8, 24.8], [91.5, 24.6], [91.2, 24.5]] }
        },
    ]
};
