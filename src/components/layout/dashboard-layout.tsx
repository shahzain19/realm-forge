import { LayoutGrid, Plus, Settings, LogOut } from "lucide-react"
import { Button } from "../ui/button"
import { NotificationBell } from "./notification-bell"

interface DashboardLayoutProps {
    children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="flex h-screen w-full bg-background text-foreground">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border bg-card flex flex-col">
                <div className="p-6">
                    <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                        <span className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                            R
                        </span>
                        RealmForge
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2 text-sm font-medium">
                    <Button variant="ghost" className="w-full justify-start">
                        <LayoutGrid className="mr-2 h-4 w-4" />
                        Projects
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </Button>
                </nav>

                <div className="p-4 border-t border-border">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            ?
                        </div>
                        <div className="text-xs">
                            <p className="font-medium">User</p>
                            <p className="text-muted-foreground">user@example.com</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-background relative">
                <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
                    <h2 className="text-lg font-semibold">Dashboard</h2>
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Project
                        </Button>
                    </div>
                </header>
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
