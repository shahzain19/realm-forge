import { useEffect, useState } from "react"
import type { Task } from "../../lib/task-store"
import { useTaskStore } from "../../lib/task-store"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Select, SelectItem } from "../ui/select"
import { Badge } from "../ui/badge"
import { Plus, X, CheckCircle2, Circle } from "lucide-react"
import { useProjectStore } from "../../lib/project-store"
import { ScrollArea } from "../ui/scroll-area"
import { cn } from "../../lib/utils"
import { suggestSubtasks } from "../../lib/gemini"
import { supabase } from "../../lib/supabase"
import { Sparkles, Loader2 } from "lucide-react"

interface TaskDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    task: Partial<Task> | null
    projectId: string
    columnId?: string
}

export function TaskDialog({ open, onOpenChange, task, projectId, columnId }: TaskDialogProps) {
    const { addTask, updateTask, deleteTask } = useTaskStore()
    const { members } = useProjectStore()
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [priority, setPriority] = useState<Task['priority']>("medium")
    const [labels, setLabels] = useState<string[]>([])
    const [subtasks, setSubtasks] = useState<Task['subtasks']>([])
    const [assigneeId, setAssigneeId] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'general' | 'checklist'>('general')
    const [newSubtask, setNewSubtask] = useState("")
    const [newLabel, setNewLabel] = useState("")
    const [isSuggesting, setIsSuggesting] = useState(false)

    useEffect(() => {
        if (task) {
            setTitle(task.title || "")
            setDescription(task.description || "")
            setPriority(task.priority || "medium")
            setLabels(task.labels || [])
            setSubtasks(task.subtasks || [])
            setAssigneeId(task.assignee_id || null)
        } else {
            setTitle("")
            setDescription("")
            setPriority("medium")
            setLabels([])
            setSubtasks([])
            setAssigneeId(null)
        }
    }, [task, open])

    const handleSave = async () => {
        const taskData: Partial<Task> = {
            title,
            description,
            priority,
            labels,
            subtasks,
            assignee_id: assigneeId,
        }

        if (task?.id) {
            await updateTask(task.id, taskData)
        } else {
            taskData.project_id = projectId
            taskData.order_index = 0
            if (columnId) taskData.column_id = columnId
            await addTask(taskData)
        }
        onOpenChange(false)
    }

    const addSubtask = () => {
        if (!newSubtask.trim()) return
        setSubtasks([...subtasks, { id: crypto.randomUUID(), text: newSubtask.trim(), completed: false }])
        setNewSubtask("")
    }

    const toggleSubtaskLocal = (id: string) => {
        setSubtasks(subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s))
    }

    const removeSubtask = (id: string) => {
        setSubtasks(subtasks.filter(s => s.id !== id))
    }

    const addLabel = () => {
        if (!newLabel.trim() || labels.includes(newLabel.trim())) return
        setLabels([...labels, newLabel.trim()])
        setNewLabel("")
    }

    const removeLabel = (label: string) => {
        setLabels(labels.filter(l => l !== label))
    }

    const handleDelete = async () => {
        if (task?.id) {
            await deleteTask(task.id)
            onOpenChange(false)
        }
    }

    const handleSuggestSubtasks = async () => {
        if (!title) return
        setIsSuggesting(true)
        try {
            // Fetch some context
            const { data: docs } = await supabase
                .from('project_documents')
                .select('content, title')
                .eq('project_id', projectId)
                .eq('is_main_gdd', true)

            const context = docs?.map(d => `Document: ${d.title}\nContent: ${JSON.stringify(d.content)}`).join("\n") || ""
            const suggestions = await suggestSubtasks(title, description, context)

            const newSubtasks = suggestions.map(text => ({
                id: crypto.randomUUID(),
                text: text,
                completed: false
            }))

            setSubtasks([...subtasks, ...newSubtasks])
        } catch (error) {
            console.error("Suggestion failed:", error)
        } finally {
            setIsSuggesting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{task?.id ? "Edit Task" : "New Task"}</DialogTitle>
                </DialogHeader>

                <div className="flex border-b border-gray-200 mb-4">
                    <button
                        className={cn("px-4 py-2 text-sm font-medium border-b-2 transition-colors", activeTab === 'general' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
                        onClick={() => setActiveTab('general')}
                    >
                        General
                    </button>
                    <button
                        className={cn("px-4 py-2 text-sm font-medium border-b-2 transition-colors", activeTab === 'checklist' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
                        onClick={() => setActiveTab('checklist')}
                    >
                        Checklist ({subtasks.filter(s => s.completed).length}/{subtasks.length})
                    </button>
                </div>

                <ScrollArea className="max-h-[60vh]">
                    {activeTab === 'general' ? (
                        <div className="grid gap-4 py-4 pr-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Title</label>
                                <Input
                                    placeholder="What needs to be done?"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    placeholder="Add details..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Priority</label>
                                    <Select
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value as any)}
                                    >
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Assignee</label>
                                    <Select
                                        value={assigneeId || "unassigned"}
                                        onChange={(e) => setAssigneeId(e.target.value === "unassigned" ? null : e.target.value)}
                                    >
                                        <SelectItem value="unassigned">Unassigned</SelectItem>
                                        {members.map(m => (
                                            <SelectItem key={m.id} value={m.user_id}>{m.user_id.substring(0, 8)}...</SelectItem>
                                        ))}
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Labels</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {labels.map(l => (
                                        <Badge key={l} variant="secondary" className="gap-1 pl-2 pr-1 py-1">
                                            {l}
                                            <button onClick={() => removeLabel(l)} className="hover:text-destructive">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add label..."
                                        value={newLabel}
                                        onChange={(e) => setNewLabel(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addLabel()}
                                    />
                                    <Button size="icon" variant="outline" onClick={addLabel}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-4 py-4 pr-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add subtask..."
                                    value={newSubtask}
                                    onChange={(e) => setNewSubtask(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
                                />
                                <Button size="icon" onClick={addSubtask}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="gap-2 text-primary border-primary/20 hover:bg-primary/5"
                                    onClick={handleSuggestSubtasks}
                                    disabled={isSuggesting || !title}
                                >
                                    {isSuggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                    AI Suggest
                                </Button>
                            </div>

                            <div className="space-y-2">
                                {subtasks.length === 0 && (
                                    <p className="text-sm text-center text-muted-foreground py-8">No subtasks yet.</p>
                                )}
                                {subtasks.map(s => (
                                    <div key={s.id} className="flex items-center gap-2 group">
                                        <button
                                            onClick={() => toggleSubtaskLocal(s.id)}
                                            className={cn("transition-colors", s.completed ? "text-green-500" : "text-muted-foreground")}
                                        >
                                            {s.completed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                                        </button>
                                        <span className={cn("flex-1 text-sm", s.completed && "line-through text-muted-foreground")}>
                                            {s.text}
                                        </span>
                                        <button
                                            onClick={() => removeSubtask(s.id)}
                                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </ScrollArea>

                <DialogFooter className="sm:justify-between">
                    {task?.id ? (
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    ) : <div />}
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
