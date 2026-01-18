import { Link, Outlet, useParams, useLocation } from "react-router-dom"
import { LayoutGrid, FileText, Map as MapIcon, Database, Settings, ArrowLeft, BookOpen, CheckSquare, ChevronLeft, ChevronRight, Search, Flag } from "lucide-react"
import { Button } from "../../components/ui/button"
import { cn } from "../../lib/utils"
import { useState } from "react"
import { CommandPalette } from "../layout/command-palette"

export function ProjectLayout() {
    const { projectId } = useParams()
    const location = useLocation()
    const [isCollapsed, setIsCollapsed] = useState(false)

    const navItems = [
        { name: "Overview", icon: LayoutGrid, href: `/project/${projectId}` },
        { name: "Tasks", icon: CheckSquare, href: `/project/${projectId}/tasks` },
        { name: "Milestones", icon: Flag, href: `/project/${projectId}/milestones` },
        { name: "Game Design Doc", icon: BookOpen, href: `/project/${projectId}/gdd` },
        { name: "Project Docs", icon: FileText, href: `/project/${projectId}/docs` },
        { name: "World Map", icon: MapIcon, href: `/project/${projectId}/world` },
        { name: "Systems", icon: Database, href: `/project/${projectId}/systems` },
    ]

    return (
        <div className="flex h-screen w-full bg-background text-foreground">
            <CommandPalette />
            {/* Sidebar */}
            <aside className={cn(
                "border-r border-border bg-card flex flex-col transition-all duration-300 relative",
                isCollapsed ? "w-16" : "w-64"
            )}>
                <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-card p-0 shadow-md z-20 hover:bg-accent"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
                </Button>

                <div className={cn("p-4 border-b border-border min-h-[113px]", isCollapsed && "px-2 text-center")}>
                    {!isCollapsed ? (
                        <>
                            <Link to="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Dashboard
                            </Link>
                            <h1 className="text-lg font-bold tracking-tight">
                                Project Workspace
                            </h1>
                        </>
                    ) : (
                        <Link to="/" title="Back to Dashboard">
                            <Button variant="ghost" size="icon" className="h-8 w-8 mb-4">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                    )}
                </div>

                <nav className={cn("flex-1 px-4 py-4 space-y-1", isCollapsed && "px-2")}>
                    <div className="mb-4">
                        <Button
                            variant="outline"
                            className={cn("w-full justify-start text-xs text-muted-foreground h-8", isCollapsed ? "px-2" : "px-3")}
                            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
                        >
                            <Search className={cn("h-3.5 w-3.5", !isCollapsed && "mr-2")} />
                            {!isCollapsed && <span className="flex-1 text-left">Search...</span>}
                            {!isCollapsed && <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                <span className="text-xs">⌘</span>K
                            </kbd>}
                        </Button>
                    </div>

                    {navItems.map((item) => {
                        const isActive = location.pathname === item.href
                        return (
                            <Link key={item.href} to={item.href} title={isCollapsed ? item.name : ""}>
                                <Button variant={isActive ? "secondary" : "ghost"} className={cn("w-full", isCollapsed ? "justify-center p-0 h-10" : "justify-start", isActive && "bg-secondary/50")}>
                                    <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                                    {!isCollapsed && item.name}
                                </Button>
                            </Link>
                        )
                    })}
                </nav>

                <div className={cn("p-4 border-t border-border", isCollapsed && "px-2")}>
                    <Link to={`/project/${projectId}/settings`} title={isCollapsed ? "Settings" : ""}>
                        <Button variant={location.pathname.endsWith('/settings') ? "secondary" : "ghost"} className={cn("w-full", isCollapsed ? "justify-center p-0 h-10" : "justify-start")}>
                            <Settings className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                            {!isCollapsed && "Project Settings"}
                        </Button>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-background/50 relative">
                <Outlet />
            </main>
        </div>
    )
}
