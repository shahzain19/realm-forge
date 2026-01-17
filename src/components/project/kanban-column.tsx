import type { Task, TaskColumn } from "../../lib/task-store"
import { KanbanCard } from "./kanban-card"
import { Plus, MoreVertical } from "lucide-react"
import { Button } from "../ui/button"

interface KanbanColumnProps {
    column: TaskColumn
    tasks: Task[]
    onAddTask: (columnId: string) => void
    onEditTask: (task: Task) => void
}

export function KanbanColumn({ column, tasks, onAddTask, onEditTask }: KanbanColumnProps) {
    return (
        <div className="flex flex-col w-80 shrink-0 bg-white rounded-xl border border-gray-200 p-4 h-full">
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: column.color }}
                    />
                    <h3 className="font-bold text-sm tracking-tight capitalize">{column.name}</h3>
                    <span className="bg-muted text-muted-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {tasks.length}
                    </span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-[100px] mb-4 scrollbar-hide">
                {tasks.map((task) => (
                    <KanbanCard
                        key={task.id}
                        task={task}
                        onClick={() => onEditTask(task)}
                    />
                ))}
            </div>

            <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-white"
                onClick={() => onAddTask(column.id)}
            >
                <Plus className="mr-2 h-4 w-4" />
                Add task
            </Button>
        </div>
    )
}
