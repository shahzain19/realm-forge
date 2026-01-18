import { useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import { DashboardLayout } from "../components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { useProjectStore } from "../lib/project-store"
import { CreateProjectDialog } from "../components/dashboard/create-project-dialog"
import {
    Loader2,
    Layout,
    Clock,
    TrendingUp,
    ArrowRight,
    Globe,
    Plus
} from "lucide-react"

export function Dashboard() {
    const { projects, loading, fetchProjects } = useProjectStore()

    useEffect(() => {
        fetchProjects()
    }, [fetchProjects])

    const stats = useMemo(() => {
        return {
            totalProjects: projects.length,
            recentUpdates: projects.filter(p => {
                const updated = new Date(p.updated_at).getTime()
                const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
                return updated > weekAgo
            }).length,
        }
    }, [projects])

    return (
        <DashboardLayout>
            <div className="space-y-10 pb-20">
                {/* Global Stats Headline */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tight text-zinc-900 italic">COMMAND_CENTER</h1>
                        <p className="text-muted-foreground font-medium">Select a project to resume construction.</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-white px-5 py-3 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Layout className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <div className="text-xl font-black tabular-nums leading-none">{stats.totalProjects}</div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Drafts</div>
                            </div>
                        </div>
                        <div className="bg-white px-5 py-3 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                                <div className="text-xl font-black tabular-nums leading-none">{stats.recentUpdates}</div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Weekly Pulses</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading && projects.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-32 space-y-4">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="text-sm font-bold text-zinc-400 uppercase tracking-[0.2em]">Synchronizing Realm Data...</p>
                        </div>
                    ) : (
                        <>
                            {projects.map((project) => (
                                <Link key={project.id} to={`/project/${project.id}`} className="group h-full">
                                    <Card className="h-full border-zinc-100 shadow-xl shadow-zinc-200/50 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 rounded-[2rem] overflow-hidden group border-none bg-white p-2">
                                        <div className="aspect-[16/10] bg-zinc-50 rounded-[1.5rem] mb-4 overflow-hidden relative">
                                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Globe className="w-12 h-12 text-zinc-200 group-hover:text-primary/30 transition-colors" />
                                            </div>
                                            {/* Top badge */}
                                            <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/50">
                                                <TrendingUp className="w-3 h-3 text-primary" />
                                                Active
                                            </div>
                                        </div>

                                        <CardHeader className="px-6 pb-2">
                                            <CardTitle className="text-2xl font-black tracking-tight text-zinc-900 group-hover:text-primary transition-colors italic">
                                                {project.name.toUpperCase()}
                                            </CardTitle>
                                            <CardDescription className="font-medium text-xs text-zinc-400">
                                                MODIFIED {new Date(project.updated_at).toLocaleDateString().toUpperCase()}
                                            </CardDescription>
                                        </CardHeader>

                                        <CardContent className="px-6 py-4">
                                            <p className="text-sm text-zinc-500 font-medium line-clamp-2 leading-relaxed h-[40px]">
                                                {project.description || "The blueprint for a new universe awaits documentation."}
                                            </p>
                                        </CardContent>

                                        <CardFooter className="px-6 pb-8 pt-2">
                                            <div className="w-full flex items-center justify-between">
                                                <div className="flex -space-x-2">
                                                    {[1, 2, 3].map(i => (
                                                        <div key={i} className="w-8 h-8 rounded-full bg-zinc-100 border-2 border-white ring-1 ring-zinc-50" />
                                                    ))}
                                                </div>
                                                <div className="flex items-center gap-2 font-bold text-xs text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                    ENTER STUDIO <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                </Link>
                            ))}

                            {/* Create Project Card */}
                            <div className="h-full">
                                <Card className="h-full border-2 border-dashed border-zinc-100 bg-zinc-50/50 hover:bg-white hover:border-primary/40 transition-all duration-500 rounded-[2rem] flex flex-col items-center justify-center p-12 min-h-[350px] group">
                                    <div className="text-center space-y-6">
                                        <div className="w-20 h-20 rounded-3xl bg-white border border-dashed border-zinc-200 flex items-center justify-center mx-auto group-hover:scale-110 group-hover:bg-primary transition-all shadow-sm group-hover:shadow-xl group-hover:shadow-primary/20">
                                            <Plus className="w-10 h-10 text-zinc-300 group-hover:text-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="font-black tracking-tighter text-zinc-400 group-hover:text-zinc-900">NEW_UNIVERSE</h3>
                                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Establish Blueprint</p>
                                        </div>
                                        <CreateProjectDialog />
                                    </div>
                                </Card>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </DashboardLayout >
    )
}
