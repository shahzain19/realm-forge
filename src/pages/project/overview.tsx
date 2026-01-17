import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { supabase } from "../../lib/supabase"
import {
    FileText,
    Map as MapIcon,
    Zap,
    Plus,
    ArrowRight,
    Clock,
    BarChart3,
    Users
} from "lucide-react"

interface Stats {
    nodes: number
    connections: number
    systems: number
    gddWords: number
    members: number
}

interface Activity {
    id: string
    type: 'node' | 'connection' | 'system' | 'gdd'
    action: 'created' | 'updated'
    label: string
    timestamp: string
}

export function ProjectOverview() {
    const { projectId } = useParams()
    const [stats, setStats] = useState<Stats>({ nodes: 0, connections: 0, systems: 0, gddWords: 0, members: 0 })
    const [activities, setActivities] = useState<Activity[]>([])
    const [, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            if (!projectId) return

            const [nodes, connections, systems, docs, members] = await Promise.all([
                supabase.from('world_nodes').select('id', { count: 'exact' }).eq('project_id', projectId),
                supabase.from('world_connections').select('id', { count: 'exact' }).eq('project_id', projectId),
                supabase.from('systems').select('id', { count: 'exact' }).eq('project_id', projectId),
                supabase.from('project_documents').select('content').eq('project_id', projectId),
                supabase.from('projects').select('workspace_id').eq('id', projectId).single()
            ])

            // Calculate total words across all documents
            let totalWords = 0
            if (docs.data) {
                docs.data.forEach(doc => {
                    if (doc.content) {
                        const text = JSON.stringify(doc.content)
                        totalWords += Math.ceil(text.length / 6)
                    }
                })
            }

            // Fetch members count
            let membersCount = 1
            if (members.data?.workspace_id) {
                const { count } = await supabase
                    .from('workspace_members')
                    .select('id', { count: 'exact' })
                    .eq('workspace_id', members.data.workspace_id)
                membersCount = count || 1
            }

            setStats({
                nodes: nodes.count || 0,
                connections: connections.count || 0,
                systems: systems.count || 0,
                gddWords: totalWords,
                members: membersCount
            })

            // Mock activity from recent records
            // In a real app, we'd have an activity_log table
            const recentNodes = await supabase.from('world_nodes').select('id, label, created_at').eq('project_id', projectId).order('created_at', { ascending: false }).limit(3)
            const recentStats: Activity[] = (recentNodes.data || []).map(n => ({
                id: n.id,
                type: 'node',
                action: 'created',
                label: n.label,
                timestamp: n.created_at
            }))

            setActivities(recentStats)
            setLoading(false)
        }

        fetchStats()
    }, [projectId])

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        Project Studio
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl">
                        Monitor your world-building progress and manage core systems from one central hub.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link to={`/project/${projectId}/world`}>
                        <Button className="shadow-lg shadow-primary/20">
                            Resume Building <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="World Nodes"
                    value={stats.nodes}
                    icon={MapIcon}
                    description="Locations & Events"
                    color="text-blue-500"
                    bg="bg-blue-500/10"
                />
                <StatCard
                    title="Design Specs"
                    value={`${stats.gddWords} words`}
                    icon={FileText}
                    description="Documentation progress"
                    color="text-emerald-500"
                    bg="bg-emerald-500/10"
                />
                <StatCard
                    title="Active Systems"
                    value={stats.systems}
                    icon={Zap}
                    description="Mechanics defined"
                    color="text-amber-500"
                    bg="bg-amber-500/10"
                />
                <StatCard
                    title="Team Size"
                    value={stats.members}
                    icon={Users}
                    description="Collaborators"
                    color="text-purple-500"
                    bg="bg-purple-500/10"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-7">
                {/* Recent Activity */}
                <Card className="md:col-span-4 border-none bg-card/50 backdrop-blur shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">Recent Activity</CardTitle>
                            <CardDescription>Latest changes in the project</CardDescription>
                        </div>
                        <Clock className="text-muted-foreground h-5 w-5" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {activities.length > 0 ? activities.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-4">
                                    <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            New {activity.type} created: <span className="text-primary font-semibold">{activity.label}</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(activity.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-10 space-y-3">
                                    <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                                        <Clock className="text-muted-foreground" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">No recent activity detected.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions & Insights */}
                <div className="md:col-span-3 space-y-6">
                    <Card className="border-none bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            <Link to={`/project/${projectId}/world`}>
                                <Button variant="outline" className="w-full justify-start bg-background/50 border-none hover:bg-background">
                                    <Plus className="mr-2 h-4 w-4" /> Add New Location
                                </Button>
                            </Link>
                            <Link to={`/project/${projectId}/docs`}>
                                <Button variant="outline" className="w-full justify-start bg-background/50 border-none hover:bg-background">
                                    <FileText className="mr-2 h-4 w-4" /> Manage Documents
                                </Button>
                            </Link>
                            <Link to={`/project/${projectId}/settings`}>
                                <Button variant="outline" className="w-full justify-start bg-background/50 border-none hover:bg-background">
                                    <Users className="mr-2 h-4 w-4" /> Invite Team Member
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-card/50 backdrop-blur shadow-xl">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Project Growth</CardTitle>
                            <BarChart3 className="text-muted-foreground h-5 w-5" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-[120px] flex items-end justify-between gap-2 px-2">
                                {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                                    <div
                                        key={i}
                                        className="w-full bg-primary/20 rounded-t-sm hover:bg-primary/40 transition-colors"
                                        style={{ height: `${h}%` }}
                                    />
                                ))}
                            </div>
                            <div className="mt-4 flex justify-between text-[10px] text-muted-foreground font-medium">
                                <span>MON</span>
                                <span>TUE</span>
                                <span>WED</span>
                                <span>THU</span>
                                <span>FRI</span>
                                <span>SAT</span>
                                <span>SUN</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    description: string;
    color: string;
    bg: string;
}

function StatCard({ title, value, icon: Icon, description, color, bg }: StatCardProps) {
    return (
        <Card className="border-none shadow-lg bg-card/50 backdrop-blur hover:scale-[1.02] transition-transform duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">{title}</CardTitle>
                <div className={`${bg} p-2 rounded-lg`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold tracking-tight">{value}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    {description}
                </p>
            </CardContent>
        </Card>
    )
}
