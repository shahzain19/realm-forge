import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useMilestoneStore, type Milestone } from '../../lib/milestone-store';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Loader2, Plus, Sparkles, Calendar, CalendarDays, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { generateMilestonesFromContext } from '../../lib/gemini';
import { cn } from '../../lib/utils'; // Assuming you have a utility for class names

export default function MilestonesPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const { milestones, loading, fetchMilestones, addMilestone, updateMilestone, deleteMilestone, subscribeToMilestones } = useMilestoneStore();

    // State for creating/editing
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [newMilestone, setNewMilestone] = useState<Partial<Milestone>>({
        title: "",
        description: "",
        due_date: null,
        status: 'pending'
    });

    useEffect(() => {
        if (projectId) {
            fetchMilestones(projectId);
            const unsubscribe = subscribeToMilestones(projectId);
            return () => unsubscribe();
        }
    }, [projectId]);

    const handleCreate = async () => {
        if (!newMilestone.title) return;
        await addMilestone({ ...newMilestone, project_id: projectId });
        setIsDialogOpen(false);
        setNewMilestone({ title: "", description: "", due_date: null, status: 'pending' });
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            // Gather context
            // In a real app, you'd fetch tasks, docs etc. here. 
            // For now, simpler context fetching or just passing what we know.
            const { data: tasks } = await supabase.from('tasks').select('title, description, status').eq('project_id', projectId);
            const { data: docs } = await supabase.from('project_documents').select('title, content').eq('project_id', projectId);
            const { data: systems } = await supabase.from('systems').select('name, description').eq('project_id', projectId);

            const context = `
                TASKS: ${JSON.stringify(tasks?.map(t => `${t.title} (${t.status})`).join('; '))}
                DOCUMENTS: ${JSON.stringify(docs?.map(d => d.title).join('; '))}
                SYSTEMS: ${JSON.stringify(systems?.map(s => s.name).join('; '))}
            `;

            const suggested = await generateMilestonesFromContext(prompt || "Generate a standard roadmap for this project.", context);

            for (const m of suggested) {
                await addMilestone({ ...m, project_id: projectId });
            }
            setIsDialogOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    const StatusIcon = ({ status }: { status: string }) => {
        switch (status) {
            case 'completed': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case 'in_progress': return <Clock className="h-5 w-5 text-blue-500" />;
            case 'blocked': return <AlertCircle className="h-5 w-5 text-red-500" />;
            default: return <Calendar className="h-5 w-5 text-muted-foreground" />;
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-5xl h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Milestones</h1>
                    <p className="text-muted-foreground mt-1">Roadmap and key objectives.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate with AI
                    </Button>
                    <Button onClick={() => setIsDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Milestone
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
            ) : milestones.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/10">
                    <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No milestones yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">Create a roadmap to track your progress and hit your goals.</p>
                    <Button onClick={() => setIsDialogOpen(true)}>Create Milestone</Button>
                </div>
            ) : (
                <div className="space-y-6 relative border-l-2 border-muted ml-4 pl-8 py-2">
                    {milestones
                        .sort((a, b) => new Date(a.due_date || '9999').getTime() - new Date(b.due_date || '9999').getTime())
                        .map((milestone) => (
                            <div key={milestone.id} className="relative group">
                                {/* Timeline Node */}
                                <div className={cn(
                                    "absolute -left-[41px] top-6 h-5 w-5 rounded-full border-4 border-background",
                                    milestone.status === 'completed' ? "bg-green-500" :
                                        milestone.status === 'in_progress' ? "bg-blue-500" : "bg-muted-foreground"
                                )} />

                                <Card className="mb-4 hover:shadow-md transition-all">
                                    <CardHeader className="flex flex-row justify-between items-start pb-2">
                                        <div className="space-y-1">
                                            <CardTitle className="text-xl">{milestone.title}</CardTitle>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <StatusIcon status={milestone.status} />
                                                <span className="capitalize">{milestone.status.replace('_', ' ')}</span>
                                                {milestone.due_date && (
                                                    <>
                                                        <span>•</span>
                                                        <span>Due {new Date(milestone.due_date).toLocaleDateString()}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="sm" onClick={() => updateMilestone(milestone.id, {
                                                status: milestone.status === 'completed' ? 'pending' : 'completed'
                                            })}>
                                                {milestone.status === 'completed' ? 'Reopen' : 'Complete'}
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteMilestone(milestone.id)}>
                                                <XIcon className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{milestone.description}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Milestone</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Generate from Context</label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="E.g., 'Plan for Alpha Release including core combat...'"
                                    value={prompt}
                                    onChange={e => setPrompt(e.target.value)}
                                />
                                <Button onClick={handleGenerate} disabled={isGenerating}>
                                    {isGenerating ? <Loader2 className="animate-spin h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">Leave empty to generate based on generic project state.</p>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or Create Manually</span>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Title</label>
                            <Input
                                value={newMilestone.title}
                                onChange={e => setNewMilestone({ ...newMilestone, title: e.target.value })}
                                placeholder="Milestone Title"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Target Date</label>
                            <Input
                                type="date"
                                value={newMilestone.due_date ? newMilestone.due_date.split('T')[0] : ''}
                                onChange={e => setNewMilestone({ ...newMilestone, due_date: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                value={newMilestone.description}
                                onChange={e => setNewMilestone({ ...newMilestone, description: e.target.value })}
                                placeholder="Describe the goals..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={!newMilestone.title || isGenerating}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Minimal X icon component to avoid imports if not available in lucide-react (though it is)
function XIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    )
}
