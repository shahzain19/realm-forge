import { useTaskStore } from "../../lib/task-store"
import type { Task } from "../../lib/task-store"
import { MoreHorizontal, Calendar, CheckSquare, Trash2, ArrowRightLeft, Edit2 } from "lucide-react"
import { Badge } from "../ui/badge"
import { Card } from "../ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent
} from "../ui/dropdown-menu"
import { cn } from "../../lib/utils"

interface KanbanCardProps {
    task: Task
    onClick: () => void
}

const priorityColors = {
    low: "bg-blue-100 text-blue-700 border-blue-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    high: "bg-orange-100 text-orange-700 border-orange-200",
    urgent: "bg-rose-100 text-rose-700 border-rose-200",
}

export function KanbanCard({ task, onClick }: KanbanCardProps) {
    const { columns, moveTask, deleteTask } = useTaskStore()

    return (
        <Card
            className="p-4 mb-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group border-gray-200"
        >
            <div className="flex items-start justify-between mb-2">
                <Badge variant="outline" className={cn("text-[10px] uppercase font-bold px-1.5 py-0", priorityColors[task.priority])} onClick={onClick}>
                    {task.priority}
                </Badge>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={onClick}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Edit details
                        </DropdownMenuItem>

                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <ArrowRightLeft className="mr-2 h-4 w-4" />
                                Move to...
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                {columns.filter(c => c.id !== task.column_id).map(col => (
                                    <DropdownMenuItem key={col.id} onClick={() => moveTask(task.id, col.id, 0)}>
                                        <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: col.color }} />
                                        {col.name}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>

                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-rose-600 focus:text-rose-600" onClick={() => deleteTask(task.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <h4 className="font-medium text-sm mb-2 line-clamp-2 cursor-pointer" onClick={onClick}>{task.title}</h4>

            {task.labels && task.labels.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                    {task.labels.map(label => (
                        <span key={label} className="text-[9px] px-1.5 py-0.5 rounded-sm bg-gray-100 text-gray-600 border border-gray-200 font-medium">
                            {label}
                        </span>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-3 text-[11px] text-muted-foreground cursor-pointer" onClick={onClick}>
                {task.due_date && (
                    <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(task.due_date).toLocaleDateString()}
                    </div>
                )}
                {task.subtasks && task.subtasks.length > 0 && (
                    <div className="flex items-center gap-1">
                        <CheckSquare className="h-3 w-3" />
                        {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                    </div>
                )}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200 flex justify-end">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20" title={task.assignee_id || "Unassigned"}>
                    {task.assignee_id ? task.assignee_id.substring(0, 2).toUpperCase() : "?"}
                </div>
            </div>
        </Card>
    )
}
