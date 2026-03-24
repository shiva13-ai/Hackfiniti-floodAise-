import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { alerts } from "@/data/mockData";
import {
    LayoutDashboard,
    Map,
    BrainCircuit,
    Cpu,
    BarChart3,
    Bell,
    Settings,
    Satellite,
    ChevronLeft,
    ChevronRight,
    Moon,
    Sun,
    Waves,
    Menu,
} from "lucide-react";

const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/map", label: "Flood Map", icon: Map },
    { path: "/geospatial", label: "Geospatial AI", icon: Satellite },
    { path: "/hardware", label: "Ground Sensors", icon: Cpu },
    { path: "/predictions", label: "AI Predictions", icon: BrainCircuit },
    { path: "/analysis", label: "Analysis", icon: BarChart3 },
    { path: "/alerts", label: "Alerts", icon: Bell },
    { path: "/settings", label: "Settings", icon: Settings },
];

const unacknowledged = alerts.filter((a) => !a.acknowledged).length;

export function AppLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { theme, setTheme } = useTheme();

    return (
        <TooltipProvider delayDuration={0}>
            <div className="min-h-screen flex w-full overflow-hidden">
                {/* Mobile overlay */}
                {mobileOpen && (
                    <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
                )}

                {/* Sidebar */}
                <aside
                    className={`
            fixed lg:relative z-50 h-screen flex flex-col
            bg-sidebar border-r border-sidebar-border
            transition-all duration-300 ease-in-out
            ${collapsed ? "w-[68px]" : "w-[260px]"}
            ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
                >
                    {/* Logo */}
                    <div className={`flex items-center h-16 px-4 border-b border-sidebar-border ${collapsed ? "justify-center" : "gap-3"}`}>
                        <div className="relative flex-shrink-0">
                            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shadow-lg shadow-primary/25">
                                <Waves className="w-5 h-5 text-white" />
                            </div>
                            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-sidebar animate-pulse" />
                        </div>
                        {!collapsed && (
                            <div className="overflow-hidden">
                                <h1 className="text-sm font-bold tracking-tight text-sidebar-foreground truncate">FloodGuard AI</h1>
                                <p className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase">Geo Intelligence</p>
                            </div>
                        )}
                    </div>

                    {/* Demo mode badge */}
                    {!collapsed && (
                        <div className="px-4 pt-3">
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span className="text-[10px] font-mono text-amber-400">DEMO MODE — Synthetic Data</span>
                            </div>
                        </div>
                    )}

                    {/* Nav */}
                    <ScrollArea className="flex-1 py-4">
                        <nav className="space-y-1 px-3">
                            {navItems.map(({ path, label, icon: Icon }) => (
                                <Tooltip key={path}>
                                    <TooltipTrigger asChild>
                                        <NavLink
                                            to={path}
                                            end={path === "/"}
                                            onClick={() => setMobileOpen(false)}
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                        ${collapsed ? "justify-center" : ""}
                        ${isActive
                                                    ? "bg-sidebar-primary/10 text-sidebar-primary shadow-sm border border-sidebar-primary/20"
                                                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                                                }`
                                            }
                                        >
                                            <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                                            {!collapsed && <span className="truncate">{label}</span>}
                                            {!collapsed && label === "Alerts" && unacknowledged > 0 && (
                                                <Badge variant="destructive" className="ml-auto text-[10px] h-5 px-1.5 rounded-full">
                                                    {unacknowledged}
                                                </Badge>
                                            )}
                                        </NavLink>
                                    </TooltipTrigger>
                                    {collapsed && (
                                        <TooltipContent side="right" className="font-medium">
                                            {label}
                                            {label === "Alerts" && unacknowledged > 0 && ` (${unacknowledged})`}
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            ))}
                        </nav>
                    </ScrollArea>

                    {/* Sidebar footer */}
                    <div className={`border-t border-sidebar-border p-3 ${collapsed ? "flex flex-col items-center gap-2" : "flex items-center justify-between"}`}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        >
                            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hidden lg:flex"
                            onClick={() => setCollapsed(!collapsed)}
                        >
                            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                        </Button>
                    </div>
                </aside>

                {/* Main content */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Top bar */}
                    <header className="h-14 flex items-center justify-between border-b border-border bg-card/60 backdrop-blur-sm px-4 lg:px-6 sticky top-0 z-30">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="lg:hidden h-9 w-9"
                                onClick={() => setMobileOpen(true)}
                            >
                                <Menu className="w-5 h-5" />
                            </Button>
                            <div className="hidden md:flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                                    Operational Console
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {unacknowledged > 0 && (
                                <div className="flex items-center gap-1.5">
                                    <Bell className="h-4 w-4 text-red-400 animate-pulse" />
                                    <Badge variant="destructive" className="text-[10px] h-5 px-1.5 rounded-full">
                                        {unacknowledged}
                                    </Badge>
                                </div>
                            )}
                            <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center ring-2 ring-primary/20">
                                <span className="text-xs font-bold text-white">AI</span>
                            </div>
                        </div>
                    </header>

                    {/* Page content */}
                    <main className="flex-1 overflow-auto">
                        <Outlet />
                    </main>
                </div>
            </div>
        </TooltipProvider>
    );
}
