import { Link, Outlet, useParams, useLocation } from "react-router-dom"
import { LayoutGrid, FileText, Map as MapIcon, Database, Settings, ArrowLeft, BookOpen, CheckSquare } from "lucide-react"
import { Button } from "../../components/ui/button"
import { cn } from "../../lib/utils"

export function ProjectLayout() {
    const { projectId } = useParams()
    const location = useLocation()

    const navItems = [
        { name: "Overview", icon: LayoutGrid, href: `/project/${projectId}` },
        { name: "Tasks", icon: CheckSquare, href: `/project/${projectId}/tasks` },
        { name: "Game Design Doc", icon: BookOpen, href: `/project/${projectId}/gdd` },
        { name: "Project Docs", icon: FileText, href: `/project/${projectId}/docs` },
        { name: "World Map", icon: MapIcon, href: `/project/${projectId}/world` },
        { name: "Systems", icon: Database, href: `/project/${projectId}/systems` },
    ]

    return (
        <div className="flex h-screen w-full bg-background text-foreground">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border bg-card flex flex-col">
                <div className="p-4 border-b border-border">
                    <Link to="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-lg font-bold tracking-tight">
                        Project Workspace
                    </h1>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.href
                        return (
                            <Link key={item.href} to={item.href}>
                                <Button variant={isActive ? "secondary" : "ghost"} className={cn("w-full justify-start", isActive && "bg-secondary/50")}>
                                    <item.icon className="mr-2 h-4 w-4" />
                                    {item.name}
                                </Button>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-border">
                    <Link to={`/project/${projectId}/settings`}>
                        <Button variant={location.pathname.endsWith('/settings') ? "secondary" : "ghost"} className="w-full justify-start">
                            <Settings className="mr-2 h-4 w-4" />
                            Project Settings
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
