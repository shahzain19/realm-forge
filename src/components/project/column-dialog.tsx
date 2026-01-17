import { useState } from "react"
import type { TaskColumn } from "../../lib/task-store"
import { useTaskStore } from "../../lib/task-store"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { ArrowUp, ArrowDown, Trash2, Plus, Edit2, Check, X } from "lucide-react"

interface ColumnDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    projectId: string
}

export function ColumnDialog({ open, onOpenChange, projectId }: ColumnDialogProps) {
    const { columns, addColumn, updateColumn, deleteColumn, reorderColumn } = useTaskStore()
    const [newColumnName, setNewColumnName] = useState("")
    const [editingColumnId, setEditingColumnId] = useState<string | null>(null)
    const [editName, setEditName] = useState("")

    const handleAddColumn = async () => {
        if (!newColumnName.trim()) return
        await addColumn(projectId, newColumnName)
        setNewColumnName("")
    }

    const handleStartEdit = (column: TaskColumn) => {
        setEditingColumnId(column.id)
        setEditName(column.name)
    }

    const handleSaveEdit = async (columnId: string) => {
        if (!editName.trim()) return
        await updateColumn(columnId, { name: editName })
        setEditingColumnId(null)
    }

    const sortedColumns = [...columns].sort((a, b) => a.order_index - b.order_index)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Customize Board Columns</DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="New column name..."
                            value={newColumnName}
                            onChange={(e) => setNewColumnName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
                        />
                        <Button size="sm" onClick={handleAddColumn}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-200">
                        {sortedColumns.map((column, index) => (
                            <div key={column.id} className="flex items-center justify-between p-3 bg-white hover:bg-zinc-50 transition-colors">
                                {editingColumnId === column.id ? (
                                    <div className="flex-1 flex gap-2 mr-2">
                                        <Input
                                            size={1}
                                            className="h-8 py-0"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            autoFocus
                                        />
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => handleSaveEdit(column.id)}>
                                            <Check className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-600" onClick={() => setEditingColumnId(null)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: column.color }} />
                                        <span className="text-sm font-medium">{column.name}</span>
                                    </div>
                                )}

                                <div className="flex items-center gap-1">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7"
                                        disabled={index === 0}
                                        onClick={() => reorderColumn(column.id, index - 1)}
                                    >
                                        <ArrowUp className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7"
                                        disabled={index === sortedColumns.length - 1}
                                        onClick={() => reorderColumn(column.id, index + 1)}
                                    >
                                        <ArrowDown className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                        onClick={() => handleStartEdit(column)}
                                    >
                                        <Edit2 className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                        onClick={() => deleteColumn(column.id)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
