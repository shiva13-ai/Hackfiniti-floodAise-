import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import FloodMap from "@/pages/FloodMap";
import GeospatialAI from "@/pages/GeospatialAI";
import HardwareMonitoring from "@/pages/HardwareMonitoring";
import Predictions from "@/pages/Predictions";
import Analysis from "@/pages/Analysis";
import Alerts from "@/pages/Alerts";
import SettingsPage from "@/pages/Settings";

export default function App() {
    return (
        <ThemeProvider defaultTheme="dark">
            <TooltipProvider>
                <BrowserRouter>
                    <Routes>
                        <Route element={<AppLayout />}>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/map" element={<FloodMap />} />
                            <Route path="/geospatial" element={<GeospatialAI />} />
                            <Route path="/hardware" element={<HardwareMonitoring />} />
                            <Route path="/predictions" element={<Predictions />} />
                            <Route path="/analysis" element={<Analysis />} />
                            <Route path="/alerts" element={<Alerts />} />
                            <Route path="/settings" element={<SettingsPage />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </TooltipProvider>
        </ThemeProvider>
    );
}
