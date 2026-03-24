import express from "express";
import { registerRoutes } from "./routes.js";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
// API routes
registerRoutes(app);
// In production, serve the built client
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client")));
    app.get("*", (_req, res) => {
        res.sendFile(path.join(__dirname, "../client/index.html"));
    });
}
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`⚡ FloodGuard API running on port ${PORT}`);
    console.log(`   Data mode: ${process.env.DATA_MODE || "demo"}`);
});
