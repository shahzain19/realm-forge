import type { Task, TaskColumn } from "../../lib/task-store"
import { MoreHorizontal, Calendar } from "lucide-react"
import { Badge } from "../ui/badge"
import { cn } from "../../lib/utils"

interface TaskListViewProps {
    tasks: Task[]
    columns: TaskColumn[]
    onEditTask: (task: Task) => void
}

const priorityColors = {
    low: "bg-blue-100 text-blue-700 border-blue-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    high: "bg-orange-100 text-orange-700 border-orange-200",
    urgent: "bg-rose-100 text-rose-700 border-rose-200",
}

export function TaskListView({ tasks, columns, onEditTask }: TaskListViewProps) {
    return (
        <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-zinc-50/50 border-b border-subtle">
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Title</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Priority</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Due Date</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-subtle">
                    {tasks.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                                No tasks found. Start by adding one!
                            </td>
                        </tr>
                    ) : (
                        tasks.map((task) => {
                            const column = columns.find(c => c.id === task.column_id)
                            return (
                                <tr
                                    key={task.id}
                                    className="hover:bg-zinc-50/50 transition-colors cursor-pointer group"
                                    onClick={() => onEditTask(task)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-sm">{task.title}</div>
                                        {task.description && (
                                            <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                                {task.description}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {column ? (
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: column.color }}
                                                />
                                                <span className="text-sm capitalize">{column.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">Unassigned</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="outline" className={cn("text-[10px] uppercase font-bold px-1.5 py-0", priorityColors[task.priority])}>
                                            {task.priority}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No date"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })
                    )}
                </tbody>
            </table>
        </div>
    )
}
