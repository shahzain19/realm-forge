import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Loader2, Globe, Calendar, FileText, Layout, Users, Sparkles } from 'lucide-react';
import type { Project } from '../../lib/project-store';
import { GddViewer } from '../../components/project/gdd-viewer';

interface PublicProject extends Project {
    milestones?: any[];
    main_gdd?: any;
    team_count?: number;
}

export default function ProjectShowcasePage() {
    const { projectId } = useParams<{ projectId: string }>();
    const [project, setProject] = useState<PublicProject | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadPublicProject() {
            if (!projectId) return;
            setLoading(true);

            // 1. Fetch Project
            const { data: proj, error: projError } = await supabase
                .from('projects')
                .select('*')
                .eq('id', projectId)
                .single();

            if (projError || !proj) {
                setError("Project not found or is private.");
                setLoading(false);
                return;
            }

            if (!proj.is_public) {
                // If not public, we shouldn't see it unless we are members (RLS handles this but good to have safeguard)
                // Actually, RLS handles it. If we got data, we can see it.
                // But let's check flag for UI messaging.
            }

            // 2. Fetch Milestones if enabled
            let milestones = [];
            if (proj.public_settings?.show_milestones) {
                const { data: m } = await supabase
                    .from('milestones')
                    .select('*')
                    .eq('project_id', projectId)
                    .order('due_date', { ascending: true });
                milestones = m || [];
            }

            // 3. Fetch Main GDD if enabled
            let main_gdd = null;
            if (proj.public_settings?.show_overview) { // Assuming overview includes GDD for now
                const { data: d } = await supabase
                    .from('project_documents')
                    .select('title, content')
                    .eq('project_id', projectId)
                    .eq('is_main_gdd', true)
                    .single();
                main_gdd = d;
            }

            setProject({ ...proj, milestones, main_gdd });
            setLoading(false);
        }

        loadPublicProject();
    }, [projectId]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-zinc-50"><Loader2 className="animate-spin h-8 w-8 text-zinc-400" /></div>;
    if (error || !project) return <div className="min-h-screen flex items-center justify-center bg-zinc-50 text-zinc-500 font-medium">{error || "Project unavailable"}</div>;


    return (
        <div className="min-h-screen bg-zinc-50 selection:bg-indigo-100 selection:text-indigo-900 font-sans">
            {/* Header */}
            <div className="bg-white border-b border-zinc-200 sticky top-0 z-10 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-zinc-900">
                        <div className={`w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white`}>
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <span>RealmForge Showcase</span>
                    </div>
                </div>
            </div>

            {/* Hero */}
            <div className="bg-white border-b border-zinc-200 pb-16 pt-12">
                <div className="container mx-auto px-4 max-w-5xl">
                    <Badge variant="outline" className="mb-4 bg-emerald-50 text-emerald-700 border-emerald-200">
                        <Globe className="w-3 h-3 mr-1" /> Public Preview
                    </Badge>
                    <h1 className="text-5xl font-black text-zinc-900 tracking-tight mb-4">{project.name}</h1>
                    <p className="text-xl text-zinc-500 max-w-2xl leading-relaxed">{project.description || "A new world being forged."}</p>

                    <div className="mt-8 flex gap-4 text-sm font-medium text-zinc-500">
                        <div className="flex items-center gap-1"><Users className="w-4 h-4" /> Team Active</div>
                        <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Updated {new Date(project.updated_at).toLocaleDateString()}</div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="container mx-auto px-4 max-w-5xl py-12">
                <Tabs defaultValue="wiki">
                    <TabsList className="mb-8">
                        <TabsTrigger value="wiki" className="gap-2"><FileText className="w-4 h-4" /> Design Wiki</TabsTrigger>
                        <TabsTrigger value="roadmap" className="gap-2"><Layout className="w-4 h-4" /> Roadmap</TabsTrigger>
                    </TabsList>

                    <TabsContent value="wiki" className="space-y-8">
                        {project.main_gdd ? (
                            <div className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm">
                                <h1 className="text-4xl font-black tracking-tight mb-8 text-zinc-900">{project.main_gdd.title}</h1>
                                <GddViewer content={project.main_gdd.content} />
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-zinc-200">
                                <FileText className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                                <p className="text-zinc-500">No public content available yet.</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="roadmap">
                        <div className="grid gap-6">
                            {project.milestones && project.milestones.length > 0 ? (
                                project.milestones.map((milestone) => (
                                    <div key={milestone.id} className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex gap-4">
                                        <div className={`mt-1 w-4 h-4 rounded-full flex-shrink-0 ${milestone.status === 'completed' ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
                                        <div>
                                            <h3 className="font-bold text-lg text-zinc-900">{milestone.title}</h3>
                                            <p className="text-zinc-500 mt-1">{milestone.description}</p>
                                            {milestone.due_date && (
                                                <div className="mt-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                                                    Target: {new Date(milestone.due_date).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-zinc-200">
                                    <Layout className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                                    <p className="text-zinc-500">No public roadmap milestones.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
