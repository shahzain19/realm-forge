import { useState, useEffect, useCallback } from "react"
import { useParams } from "react-router-dom"
import { supabase } from "../../lib/supabase"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Plus, Trash2, ArrowRight, Loader2, X, FileJson, FileSpreadsheet } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Input } from "../ui/input"
import { exportToJson, exportToCsv } from "../../lib/export-utils"

interface System {
    id: string
    name: string
    description: string | null
    inputs: string[] | null
    outputs: string[] | null
}

export function SystemsDesigner() {
    const { projectId } = useParams()
    const [systems, setSystems] = useState<System[]>([])
    const [loading, setLoading] = useState(true)
    const [editingSystem, setEditingSystem] = useState<System | null>(null)

    const fetchSystems = useCallback(async () => {
        if (!projectId) return
        // setLoading(true) // Already true by default
        const { data, error } = await supabase
            .from('systems')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: true })

        if (!error && data) {
            setSystems(data)
        }
        setLoading(false)
    }, [projectId])

    useEffect(() => {
        const timer = setTimeout(() => {
            void fetchSystems()
        }, 0)
        return () => clearTimeout(timer)
    }, [fetchSystems])

    const addSystem = async () => {
        if (!projectId) return
        const newSystem = {
            project_id: projectId,
            name: 'New System',
            description: 'Describe mechanics...',
            inputs: [],
            outputs: []
        }

        const { data, error } = await supabase
            .from('systems')
            .insert([newSystem])
            .select()

        if (!error && data) {
            setSystems([...systems, data[0]])
        }
    }

    const deleteSystem = async (id: string) => {
        const { error } = await supabase
            .from('systems')
            .delete()
            .eq('id', id)

        if (!error) {
            setSystems(systems.filter(s => s.id !== id))
        }
    }

    const saveSystem = async () => {
        if (!editingSystem) return

        const { error } = await supabase
            .from('systems')
            .update({
                name: editingSystem.name,
                description: editingSystem.description,
                inputs: editingSystem.inputs,
                outputs: editingSystem.outputs
            })
            .eq('id', editingSystem.id)

        if (!error) {
            setSystems(systems.map(s => s.id === editingSystem.id ? editingSystem : s))
            setEditingSystem(null)
        }
    }

    const exportSystems = (format: 'json' | 'csv') => {
        const data = systems.map(({ name, description, inputs, outputs }) => ({
            name,
            description,
            inputs: inputs?.join('; '),
            outputs: outputs?.join('; ')
        }))

        if (format === 'json') {
            exportToJson(data, `systems-${projectId}.json`)
        } else {
            exportToCsv(data, `systems-${projectId}.csv`)
        }
    }

    const updateEditingSystem = (field: keyof System, value: unknown) => {
        if (!editingSystem) return
        setEditingSystem({ ...editingSystem, [field]: value })
    }

    const addIO = (type: 'inputs' | 'outputs') => {
        if (!editingSystem) return
        const current = editingSystem[type] || []
        updateEditingSystem(type, [...current, 'New ' + type.slice(0, -1)])
    }

    const removeIO = (type: 'inputs' | 'outputs', index: number) => {
        if (!editingSystem) return
        const current = editingSystem[type] || []
        updateEditingSystem(type, current.filter((_, i) => i !== index))
    }

    const updateIO = (type: 'inputs' | 'outputs', index: number, value: string) => {
        if (!editingSystem) return
        const current = editingSystem[type] || []
        const newArray = [...current]
        newArray[index] = value
        updateEditingSystem(type, newArray)
    }

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Systems Designer</h1>
                    <p className="text-muted-foreground">Define and connect your game's core mechanics.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => exportSystems('json')}>
                        <FileJson className="mr-2 h-4 w-4" />
                        JSON
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => exportSystems('csv')}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        CSV
                    </Button>
                    <Button onClick={addSystem}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add System
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {systems.map(system => (
                    <Card key={system.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <CardTitle className="leading-6">{system.name}</CardTitle>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={() => deleteSystem(system.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <CardDescription className="line-clamp-2">
                                {system.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 flex-1">
                            <div>
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Inputs</h4>
                                <div className="space-y-1">
                                    {system.inputs && system.inputs.length > 0 ? (
                                        system.inputs.map((inpt, i) => (
                                            <div key={i} className="bg-secondary/50 px-2 py-1 rounded text-sm flex items-center">
                                                <ArrowRight className="mr-2 h-3 w-3 text-muted-foreground" />
                                                {inpt}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-muted-foreground italic">No inputs defined</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Outputs</h4>
                                <div className="space-y-1">
                                    {system.outputs && system.outputs.length > 0 ? (
                                        system.outputs.map((outpt, i) => (
                                            <div key={i} className="bg-primary/10 px-2 py-1 rounded text-sm flex items-center">
                                                <ArrowRight className="mr-2 h-3 w-3 text-primary" />
                                                {outpt}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-muted-foreground italic">No outputs defined</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full" onClick={() => setEditingSystem(system)}>Edit Logic</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>


            <Dialog open={!!editingSystem} onOpenChange={(open) => !open && setEditingSystem(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit System: {editingSystem?.name}</DialogTitle>
                        <DialogDescription>
                            Configure the inputs, outputs, and logic for this game system.
                        </DialogDescription>
                    </DialogHeader>

                    {editingSystem && (
                        <div className="grid gap-4 py-4">
                            <div className="grid w-full gap-2">
                                <label className="text-sm font-medium">System Name</label>
                                <Input
                                    value={editingSystem.name}
                                    onChange={(e) => updateEditingSystem('name', e.target.value)}
                                />
                            </div>
                            <div className="grid w-full gap-2">
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={editingSystem.description || ''}
                                    onChange={(e) => updateEditingSystem('description', e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Inputs Config */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium">Inputs</label>
                                        <Button size="sm" variant="ghost" onClick={() => addIO('inputs')}><Plus className="h-3 w-3" /></Button>
                                    </div>
                                    <div className="space-y-2 max-h-[150px] overflow-auto border rounded p-2">
                                        {editingSystem.inputs?.map((input, i) => (
                                            <div key={i} className="flex gap-2">
                                                <Input
                                                    value={input}
                                                    onChange={(e) => updateIO('inputs', i, e.target.value)}
                                                    className="h-8"
                                                />
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => removeIO('inputs', i)}>
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Outputs Config */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium">Outputs</label>
                                        <Button size="sm" variant="ghost" onClick={() => addIO('outputs')}><Plus className="h-3 w-3" /></Button>
                                    </div>
                                    <div className="space-y-2 max-h-[150px] overflow-auto border rounded p-2">
                                        {editingSystem.outputs?.map((output, i) => (
                                            <div key={i} className="flex gap-2">
                                                <Input
                                                    value={output}
                                                    onChange={(e) => updateIO('outputs', i, e.target.value)}
                                                    className="h-8"
                                                />
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => removeIO('outputs', i)}>
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingSystem(null)}>Cancel</Button>
                        <Button onClick={saveSystem}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
