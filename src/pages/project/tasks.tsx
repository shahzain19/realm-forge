import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import type { Task } from "../../lib/task-store"
import { useTaskStore } from "../../lib/task-store"
import { useProjectStore } from "../../lib/project-store"
import { KanbanColumn } from "../../components/project/kanban-column"
import { TaskListView } from "../../components/project/task-list-view"
import { TaskDialog } from "../../components/project/task-dialog"
import { ColumnDialog } from "../../components/project/column-dialog"
import { Button } from "../../components/ui/button"
import { Plus, Settings2, Loader2, LayoutGrid, List, Sparkles } from "lucide-react"
import { cn } from "../../lib/utils"
import { generateTasksFromPrompt } from "../../lib/gemini"
import { supabase } from "../../lib/supabase"

export function TasksPage() {
    const { projectId } = useParams()
    const { tasks, columns, loading: tasksLoading, fetchBoard, addColumn } = useTaskStore()
    const { fetchProject } = useProjectStore()
    const [project, setProject] = useState<any>(null)
    const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false)
    const [editingTask, setEditingTask] = useState<Task | null>(null)
    const [selectedColumn, setSelectedColumn] = useState<string | undefined>()
    const [isAIGenerating, setIsAIGenerating] = useState(false)

    useEffect(() => {
        if (projectId) {
            fetchBoard(projectId)
            fetchProject(projectId).then(setProject)

            const unsubscribe = useTaskStore.getState().subscribeToProject(projectId)
            return () => unsubscribe()
        }
    }, [projectId, fetchBoard, fetchProject])

    const handleAddTask = (columnId: string) => {
        setEditingTask(null)
        setSelectedColumn(columnId)
        setIsDialogOpen(true)
    }

    const handleEditTask = (task: Task) => {
        setEditingTask(task)
        setSelectedColumn(task.column_id)
        setIsDialogOpen(true)
    }

    const createInitialColumns = async () => {
        if (!projectId) return
        await addColumn(projectId, "Todo")
        await addColumn(projectId, "In Progress")
        await addColumn(projectId, "Done")
    }

    const handleAIGenerate = async () => {
        const prompt = window.prompt("What goals should I create tasks for? (e.g., 'Implement player inventory based on GDD')")
        if (!prompt || !projectId) return

        setIsAIGenerating(true)
        try {
            // Fetch main GDD for context
            const { data: docs } = await supabase
                .from('project_documents')
                .select('content, title')
                .eq('project_id', projectId)
                .eq('is_main_gdd', true)

            const context = docs?.map(d => `Document: ${d.title}\nContent: ${JSON.stringify(d.content)}`).join("\n") || ""
            const existingTaskTitles = tasks.map(t => t.title)

            const aiTasks = await generateTasksFromPrompt(prompt, context, existingTaskTitles)

            const todoColumn = columns.find(c => c.name.toLowerCase() === 'todo')
            const targetColumnId = todoColumn?.id || columns[0]?.id

            if (!targetColumnId) return

            for (const taskData of aiTasks) {
                await useTaskStore.getState().addTask({
                    ...taskData,
                    project_id: projectId,
                    column_id: targetColumnId,
                    order_index: 0,
                    subtasks: taskData.subtasks.map(st => ({
                        ...st,
                        id: st.id || crypto.randomUUID(),
                        completed: st.completed
                    }))
                })
            }
            alert(`Generated ${aiTasks.length} tasks!`)
        } catch (error) {
            console.error("AI Generation failed:", error)
            alert("AI task generation failed.")
        } finally {
            setIsAIGenerating(false)
        }
    }

    if (tasksLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-white">
            <header className="h-20 shrink-0 border-b border-gray-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">{project?.name || "Project"}</span>
                        <div className="w-1 h-1 rounded-full bg-gray-300" />
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em]">Management</span>
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-zinc-900">Task Workspace</h2>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-zinc-100 rounded-lg p-1 mr-4 border border-subtle">
                        <Button
                            variant={viewMode === "kanban" ? "secondary" : "ghost"}
                            size="sm"
                            className={cn("h-7 px-2", viewMode === "kanban" && "bg-white shadow-sm")}
                            onClick={() => setViewMode("kanban")}
                        >
                            <LayoutGrid className="h-3.5 w-3.5 mr-1.5" />
                            Board
                        </Button>
                        <Button
                            variant={viewMode === "list" ? "secondary" : "ghost"}
                            size="sm"
                            className={cn("h-7 px-2", viewMode === "list" && "bg-white shadow-sm")}
                            onClick={() => setViewMode("list")}
                        >
                            <List className="h-3.5 w-3.5 mr-1.5" />
                            List
                        </Button>
                    </div>
                    <Button variant="outline" size="sm" className="glass" onClick={() => setIsColumnDialogOpen(true)}>
                        <Settings2 className="mr-2 h-4 w-4" />
                        Customize
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary hover:bg-primary/10 transition-all border border-primary/20"
                        onClick={handleAIGenerate}
                        disabled={isAIGenerating}
                    >
                        {isAIGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        {isAIGenerating ? "Generating..." : "AI Generate"}
                    </Button>
                    <Button size="sm" onClick={() => handleAddTask(columns[0]?.id)}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Task
                    </Button>
                </div>
            </header>

            <main className="flex-1 overflow-x-auto p-8 flex gap-6 items-start">
                {columns.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <Plus className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Initialize your board</h3>
                        <p className="text-muted-foreground mb-6 max-w-sm">
                            Get started by adding standard columns to organize your project workflow.
                        </p>
                        <Button onClick={createInitialColumns}>
                            Create Default Columns
                        </Button>
                    </div>
                ) : viewMode === "kanban" ? (
                    <>
                        {columns.map((column) => (
                            <KanbanColumn
                                key={column.id}
                                column={column}
                                tasks={tasks.filter((t) => t.column_id === column.id)}
                                onAddTask={handleAddTask}
                                onEditTask={handleEditTask}
                            />
                        ))}

                        <Button
                            variant="ghost"
                            className="w-80 shrink-0 h-[500px] border-2 border-dashed border-zinc-200 bg-zinc-50/20 text-muted-foreground hover:bg-zinc-50 hover:text-foreground transition-all rounded-xl"
                            onClick={() => addColumn(projectId!, "New Column")}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Column
                        </Button>
                    </>
                ) : (
                    <TaskListView
                        tasks={tasks}
                        columns={columns}
                        onEditTask={handleEditTask}
                    />
                )}
            </main>

            <TaskDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                task={editingTask}
                projectId={projectId!}
                columnId={selectedColumn}
            />
            <ColumnDialog
                open={isColumnDialogOpen}
                onOpenChange={setIsColumnDialogOpen}
                projectId={projectId!}
            />
        </div>
    )
}
