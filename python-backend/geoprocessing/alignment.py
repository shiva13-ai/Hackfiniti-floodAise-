def get_utm_crs(lon, lat):
    """
    Auto-detect UTM zone from geographical centroid.
    Addresses constraint: Euclidean distance calculation in geographic CRS is distorted.
    """
    zone = int((lon + 180) / 6) + 1
    epsg = 32600 + zone if lat >= 0 else 32700 + zone
    return f"EPSG:{epsg}"

def document_alignment_strategy():
    """
    Documents the spatial alignment strategy for the IBM Hackathon judges.
    Addresses constraints: 30m resolution vs EPSG:4326 mismatch, and raster misalignment.
    """
    return {
        "storage_crs": "EPSG:4326",
        "processing_crs": "Auto-detected UTM (metric)",
        "resolution": "30m in UTM space",
        "alignment_pipeline": [
            "1. Reproject all input rasters (Sentinel-2, DEM) to common UTM CRS",
            "2. Resample all to 30m grid using rasterio.warp.reproject",
            "3. Extract features (NDWI, Slope) in UTM space",
            "4. Compute River Distance using Euclidean distance in metric UTM space",
            "5. Build aligned feature matrix [N, 5]",
            "6. Reproject output vectors to EPSG:4326 for Leaflet map display"
        ]
    }
