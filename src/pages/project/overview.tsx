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
    Users,
    CheckCircle2,
    Activity as ActivityIcon,
    Sparkles
} from "lucide-react"

interface Stats {
    nodes: number
    connections: number
    systems: number
    gddWords: number
    members: number
    tasksDone: number
    tasksTotal: number
    systemConnectivity: number
}

interface Activity {
    id: string
    type: 'node' | 'connection' | 'system' | 'task' | 'document'
    action: 'created' | 'updated' | 'completed'
    label: string
    timestamp: string
}

export function ProjectOverview() {
    const { projectId } = useParams()
    const [stats, setStats] = useState<Stats>({
        nodes: 0,
        connections: 0,
        systems: 0,
        gddWords: 0,
        members: 0,
        tasksDone: 0,
        tasksTotal: 0,
        systemConnectivity: 0
    })
    const [activities, setActivities] = useState<Activity[]>([])
    const [, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            if (!projectId) return
            setLoading(true)

            try {
                const [nodes, connections, systems, docs, members, allTasks, taskCols] = await Promise.all([
                    supabase.from('world_nodes').select('id, label, created_at').eq('project_id', projectId),
                    supabase.from('world_connections').select('id', { count: 'exact' }).eq('project_id', projectId),
                    supabase.from('systems').select('id, name, inputs, outputs, updated_at').eq('project_id', projectId),
                    supabase.from('project_documents').select('id, title, content, updated_at').eq('project_id', projectId),
                    supabase.from('projects').select('workspace_id').eq('id', projectId).single(),
                    supabase.from('tasks').select('id, title, column_id, updated_at, created_at').eq('project_id', projectId),
                    supabase.from('task_columns').select('id, name').eq('project_id', projectId)
                ])

                // Calculate total words
                let totalWords = 0
                docs.data?.forEach(doc => {
                    const content = typeof doc.content === 'string' ? doc.content : JSON.stringify(doc.content)
                    totalWords += content.split(/\s+/).length
                })

                // System Connectivity (Inputs + Outputs)
                const totalIO = systems.data?.reduce((acc, s) => acc + (s.inputs?.length || 0) + (s.outputs?.length || 0), 0) || 0

                // Task Progress
                const doneColIds = taskCols.data?.filter(c => ['done', 'completed', 'finished'].includes(c.name.toLowerCase())).map(c => c.id) || []
                const tasksDone = allTasks.data?.filter(t => doneColIds.includes(t.column_id)).length || 0

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
                    nodes: nodes.data?.length || 0,
                    connections: connections.count || 0,
                    systems: systems.data?.length || 0,
                    gddWords: totalWords,
                    members: membersCount,
                    tasksDone,
                    tasksTotal: allTasks.data?.length || 0,
                    systemConnectivity: totalIO
                })

                // Compile real activity feed
                const feed: Activity[] = []

                // Add Nodes
                nodes.data?.forEach((n: any) => feed.push({ id: n.id, type: 'node', action: 'created', label: n.label || 'Node', timestamp: n.created_at }))

                // Add Tasks
                allTasks.data?.forEach(t => feed.push({
                    id: t.id,
                    type: 'task',
                    action: doneColIds.includes(t.column_id) ? 'completed' : 'updated',
                    label: t.title,
                    timestamp: t.updated_at || t.created_at
                }))

                // Add Systems
                systems.data?.forEach(s => feed.push({ id: s.id, type: 'system', action: 'updated', label: s.name, timestamp: s.updated_at }))

                // Add Docs
                docs.data?.forEach(d => feed.push({ id: d.id, type: 'document', action: 'updated', label: d.title, timestamp: d.updated_at }))

                setActivities(feed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8))
            } catch (err) {
                console.error("Fetch stats error:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [projectId])

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary uppercase tracking-tight">
                        <Sparkles className="h-3 w-3" />
                        Live Workspace
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tight text-zinc-900">
                            Project Command
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl">
                            Realtime intelligence and progress tracking for your game world.
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link to={`/project/${projectId}/world`}>
                        <Button className="shadow-lg shadow-primary/20 h-11 px-6 font-bold">
                            Resume Construction <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Task Progress"
                    value={stats.tasksTotal > 0 ? `${Math.round((stats.tasksDone / stats.tasksTotal) * 100)}%` : '0%'}
                    icon={CheckCircle2}
                    description={`${stats.tasksDone} of ${stats.tasksTotal} completed`}
                    color="text-blue-500"
                    bg="bg-blue-500/10"
                />
                <StatCard
                    title="World Expansion"
                    value={stats.nodes}
                    icon={MapIcon}
                    description={`${stats.connections} established paths`}
                    color="text-emerald-500"
                    bg="bg-emerald-500/10"
                />
                <StatCard
                    title="Design Volume"
                    value={`${(stats.gddWords / 1000).toFixed(1)}k`}
                    icon={FileText}
                    description="Words across documentation"
                    color="text-amber-500"
                    bg="bg-amber-500/10"
                />
                <StatCard
                    title="System Nodes"
                    value={stats.systemConnectivity}
                    icon={Zap}
                    description={`${stats.systems} active mechanics`}
                    color="text-purple-500"
                    bg="bg-purple-500/10"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-7 pb-10">
                {/* Recent Activity */}
                <Card className="md:col-span-4 border-none bg-white shadow-2xl shadow-zinc-200/50 overflow-hidden ring-1 ring-zinc-100 italic-gradient">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-50 pb-6">
                        <div>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <ActivityIcon className="h-5 w-5 text-primary" />
                                Project Pulse
                            </CardTitle>
                            <CardDescription className="font-medium">Live chronology of your creative process</CardDescription>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-zinc-100 px-2 py-1 rounded">
                            <Clock className="h-3 w-3" />
                            Realtime
                        </div>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-[5px] before:w-0.5 before:bg-zinc-100">
                            {activities.length > 0 ? activities.map((activity, idx) => (
                                <div key={activity.id + idx} className="relative flex items-start gap-6 pl-8 group">
                                    <div className="absolute left-0 mt-1 h-3 w-3 rounded-full border-2 border-primary bg-white z-10 transition-transform group-hover:scale-125 shadow-sm" />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-bold leading-none text-zinc-900">
                                                {activity.action === 'created' ? 'Created' : activity.action === 'completed' ? 'Finished' : 'Modified'}{' '}
                                                <span className="text-zinc-400 font-medium">project {activity.type}</span>
                                            </p>
                                            <span className="text-[10px] font-bold text-muted-foreground tabular-nums">
                                                {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-zinc-600 bg-zinc-50/50 p-2 rounded-lg border border-zinc-100/50 font-medium">
                                            {activity.label}
                                        </p>
                                    </div>
                                    <div className="p-2 rounded-xl bg-zinc-50 group-hover:bg-primary/5 transition-colors border border-transparent group-hover:border-primary/10">
                                        {activity.type === 'node' && <MapIcon className="h-4 w-4 text-blue-500" />}
                                        {activity.type === 'task' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                                        {activity.type === 'system' && <Zap className="h-4 w-4 text-amber-500" />}
                                        {activity.type === 'document' && <FileText className="h-4 w-4 text-purple-500" />}
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-16 space-y-3">
                                    <div className="h-16 w-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-zinc-50/50">
                                        <ActivityIcon className="text-zinc-300" />
                                    </div>
                                    <p className="text-sm text-zinc-400 font-bold uppercase tracking-widest">Awaiting project pulse...</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions & Velocity */}
                <div className="md:col-span-3 space-y-6">
                    <Card className="border-none bg-gradient-to-br from-zinc-900 to-zinc-800 text-white shadow-2xl">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Quick Vectors</CardTitle>
                            <CardDescription className="text-zinc-400">Jump back into your workflow</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3 p-6 pt-0">
                            {[
                                { label: 'Expand Territory', icon: Plus, href: `/project/${projectId}/world`, color: 'bg-blue-500' },
                                { label: 'Author Lore', icon: FileText, href: `/project/${projectId}/docs`, color: 'bg-purple-500' },
                                { label: 'Assign Objectives', icon: Users, href: `/project/${projectId}/tasks`, color: 'bg-emerald-500' },
                            ].map((action) => (
                                <Link key={action.label} to={action.href}>
                                    <Button variant="outline" className="w-full justify-between bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white group">
                                        <span className="flex items-center">
                                            <div className={`mr-3 h-2 w-2 rounded-full ${action.color}`} />
                                            {action.label}
                                        </span>
                                        <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-white transition-colors" />
                                    </Button>
                                </Link>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-white shadow-xl ring-1 ring-zinc-100">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-bold">Development Velocity</CardTitle>
                            <BarChart3 className="text-primary h-5 w-5" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-[140px] flex items-end justify-between gap-1.5 px-1">
                                {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                                    <div
                                        key={i}
                                        className="w-full bg-primary/5 rounded-t-sm hover:bg-primary transition-all duration-500 cursor-pointer group relative"
                                        style={{ height: `${h}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-[10px] text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                            {h}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 flex justify-between text-[10px] text-muted-foreground font-black uppercase tracking-tighter">
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
