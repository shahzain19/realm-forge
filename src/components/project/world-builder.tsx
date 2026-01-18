import { useState, useEffect, useCallback, useRef, useLayoutEffect, memo } from 'react';
import { useParams } from 'react-router-dom';
import { Stage, Layer, Rect, Text, Group, Line, Circle } from 'react-konva';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/button';
import { Plus, Loader2, Trash2, Search, Download, X, Upload, FileJson, CheckCircle2, Circle as CircleIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Select, SelectItem } from "../ui/select"
import Konva from 'konva';
import { exportToJson } from '../../lib/export-utils';
import { suggestWorldConnections } from '../../lib/gemini';
import { Sparkles } from 'lucide-react';

interface Node {
    id: string;
    x: number;
    y: number;
    label: string;
    color: string;
    node_type: 'location' | 'event' | 'resource';
    description?: string;
    image_url?: string;
    gameplay_notes?: string;
    lore?: string;
    tags?: string[];
    linked_tasks?: string[];
    metadata?: Record<string, unknown>;
}

interface Connection {
    id: string;
    from_node_id: string;
    to_node_id: string;
    connection_type: 'path' | 'unlock' | 'story' | 'teleport' | 'gated';
    requirements?: string;
    notes?: string;
}

const MemoizedNode = memo(({ node, isConnecting, onDragMove, onDragEnd, onDblClick, onClick, onConnectPort }: {
    node: Node,
    isConnecting: boolean,
    onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => void,
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void,
    onDblClick: () => void,
    onClick: () => void,
    onConnectPort: (e: Konva.KonvaEventObject<MouseEvent>) => void
}) => {
    return (
        <Group
            x={node.x}
            y={node.y}
            draggable
            onDragMove={onDragMove}
            onDragEnd={onDragEnd}
            onDblClick={onDblClick}
            onClick={onClick}
        >
            <Rect
                width={220}
                height={140}
                fill="#ffffff"
                cornerRadius={12}
                shadowColor="black"
                shadowBlur={25}
                shadowOpacity={0.08}
                shadowOffsetY={8}
                stroke={isConnecting ? '#3b82f6' : 'transparent'}
                strokeWidth={2}
            />
            <Rect
                width={220}
                height={8}
                fill={node.color || (node.node_type === 'event' ? '#ef4444' : node.node_type === 'resource' ? '#f59e0b' : '#3b82f6')}
                cornerRadius={[12, 12, 0, 0]}
            />
            <Group x={15} y={25}>
                <Rect width={24} height={24} fill="#f1f5f9" cornerRadius={4} />
                <Text
                    text={node.node_type === 'event' ? '🎯' : node.node_type === 'resource' ? '🎁' : '🏞️'}
                    x={4} y={4} fontSize={14}
                />
            </Group>
            <Text
                text={node.label}
                x={45} y={28}
                fontSize={15}
                fontFamily="Inter"
                fontStyle="bold"
                fill="#0f172a"
                width={160}
                ellipsis
            />
            <Text
                text={node.description || "No description provided."}
                x={15} y={60}
                fontSize={12}
                fontFamily="Inter"
                lineHeight={1.4}
                fill="#64748b"
                width={190}
                height={50}
            />
            {node.tags && node.tags.length > 0 && (
                <Text
                    text={node.tags[0]}
                    x={15} y={115}
                    fontSize={10}
                    fontFamily="Inter"
                    fill="#3b82f6"
                    fontStyle="bold"
                />
            )}
            <Circle
                x={0} y={70} radius={6}
                fill="#cbd5e1"
                stroke="#fff" strokeWidth={2}
                onClick={onConnectPort}
            />
            <Circle
                x={220} y={70} radius={6}
                fill="#cbd5e1"
                stroke="#fff" strokeWidth={2}
                onClick={onConnectPort}
            />
        </Group>
    );
});

const MemoizedConnection = memo(({ connection, fromNode, toNode, onClick }: {
    connection: Connection,
    fromNode: Node,
    toNode: Node,
    onClick: () => void
}) => {
    // Determine which sides to connect
    const fromX = fromNode.x + (toNode.x > fromNode.x ? 220 : 0);
    const fromY = fromNode.y + 70;
    const toX = toNode.x + (fromNode.x > toNode.x ? 220 : 0);
    const toY = toNode.y + 70;

    // Control point offset for Bezier curve
    const dx = Math.abs(toX - fromX) * 0.5;
    const cp1x = fromX + (toNode.x > fromNode.x ? dx : -dx);
    const cp2x = toX + (fromNode.x > toNode.x ? dx : -dx);

    return (
        <Group onClick={onClick} cursor="pointer">
            {/* Outline/Shadow for visibility */}
            <Line
                points={[fromX, fromY, cp1x, fromY, cp2x, toY, toX, toY]}
                stroke="#000"
                strokeWidth={5}
                opacity={0.05}
                tension={0.5}
                bezier
            />
            {/* The actual line */}
            <Line
                points={[fromX, fromY, cp1x, fromY, cp2x, toY, toX, toY]}
                stroke={connection.connection_type === 'gated' ? '#ef4444' : connection.connection_type === 'unlock' ? '#f59e0b' : '#94a3b8'}
                strokeWidth={connection.connection_type === 'path' || !connection.connection_type ? 2.5 : 3.5}
                dash={connection.connection_type === 'teleport' ? [10, 5] : undefined}
                tension={0.5}
                bezier
                hitStrokeWidth={15}
            />
            {/* Glow effect on hover/selection could be added here */}
        </Group>
    );
});


export function WorldBuilder() {
    const { projectId } = useParams()
    const [nodes, setNodes] = useState<Node[]>([])
    const [connections, setConnections] = useState<Connection[]>([])
    const [loading, setLoading] = useState(true)
    const [stagePos, setStagePos] = useState({ x: 0, y: 0 })
    const [stageScale, setStageScale] = useState(1)
    const [editingNode, setEditingNode] = useState<Node | null>(null)
    const [editingConnection, setEditingConnection] = useState<Connection | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [connectingFrom, setConnectingFrom] = useState<string | null>(null)
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
    const [isSuggestingConnections, setIsSuggestingConnections] = useState(false)
    // Task Linking State
    const [availableTasks, setAvailableTasks] = useState<{ id: string, title: string }[]>([])
    const [taskSearch, setTaskSearch] = useState("")
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

    const stageRef = useRef<Konva.Stage>(null)

    useLayoutEffect(() => {
        function updateSize() {
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
        }
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const fetchData = useCallback(async () => {
        if (!projectId) return

        setLoading(true);

        // Fetch tasks for linking
        const { data: tasksData } = await supabase.from('tasks').select('id, title').eq('project_id', projectId)
        if (tasksData) setAvailableTasks(tasksData)

        const { data: nodesData } = await supabase.from('world_nodes').select('*').eq('project_id', projectId)
        const { data: connData } = await supabase.from('world_connections').select('*').eq('project_id', projectId)

        if (nodesData) setNodes(nodesData)
        if (connData) setConnections(connData)
        setLoading(false)
    }, [projectId])

    useEffect(() => {
        if (!projectId) return;

        void fetchData();

        // Subscribe to realtime changes
        const nodeChannel = supabase
            .channel(`world_nodes_${projectId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'world_nodes',
                filter: `project_id=eq.${projectId}`
            }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setNodes(prev => [...prev, payload.new as Node]);
                } else if (payload.eventType === 'UPDATE') {
                    setNodes(prev => prev.map(n => n.id === payload.new.id ? { ...n, ...payload.new } : n));
                } else if (payload.eventType === 'DELETE') {
                    setNodes(prev => prev.filter(n => n.id === payload.old.id));
                }
            })
            .subscribe();

        const connChannel = supabase
            .channel(`world_connections_${projectId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'world_connections',
                filter: `project_id=eq.${projectId}`
            }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setConnections(prev => [...prev, payload.new as Connection]);
                } else if (payload.eventType === 'UPDATE') {
                    setConnections(prev => prev.map(c => c.id === payload.new.id ? { ...c, ...payload.new } : c));
                } else if (payload.eventType === 'DELETE') {
                    setConnections(prev => prev.filter(c => c.id === payload.old.id));
                }
            })
            .subscribe();

        return () => {
            void supabase.removeChannel(nodeChannel);
            void supabase.removeChannel(connChannel);
        };
    }, [projectId, fetchData]);

    const addNode = async () => {
        if (!projectId) return
        // Add to center of current view
        const newNode = {
            project_id: projectId,
            x: (-stagePos.x + window.innerWidth / 2) / stageScale,
            y: (-stagePos.y + window.innerHeight / 2) / stageScale,
            label: 'New Location',
            node_type: 'location',
            color: '#3b82f6',
            metadata: {}
        }

        const { data, error } = await supabase.from('world_nodes').insert([newNode]).select()
        if (data && !error) {
            setNodes([...nodes, data[0]])
        } else if (error) {
            console.error("Error adding node:", error)
            alert(`Error adding location: ${error.message}`)
        }
    };

    const createConnection = async (toNodeId: string) => {
        if (!projectId || !connectingFrom || connectingFrom === toNodeId) {
            setConnectingFrom(null)
            return
        }

        // Check if connection already exists
        const exists = connections.some(c =>
            (c.from_node_id === connectingFrom && c.to_node_id === toNodeId) ||
            (c.from_node_id === toNodeId && c.to_node_id === connectingFrom)
        )

        if (exists) {
            setConnectingFrom(null)
            return
        }

        const newConn = {
            project_id: projectId,
            from_node_id: connectingFrom,
            to_node_id: toNodeId,
            connection_type: 'path'
        }

        const { data, error } = await supabase.from('world_connections').insert([newConn]).select()
        if (data && !error) {
            setConnections([...connections, data[0]])
        }
        setConnectingFrom(null)
    }

    const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>, id: string) => {
        setNodes(prev => prev.map((n) => {
            if (n.id === id) {
                return { ...n, x: e.target.x(), y: e.target.y() }
            }
            return n
        }))
    }

    const handleDragEnd = async (e: Konva.KonvaEventObject<DragEvent>, id: string) => {
        const x = e.target.x()
        const y = e.target.y()

        setNodes(prev => prev.map((n) => {
            if (n.id === id) {
                return { ...n, x, y }
            }
            return n
        }))

        await supabase.from('world_nodes').update({ x, y }).eq('id', id)
    }

    const saveNode = async () => {
        if (!editingNode) return

        const { error } = await supabase
            .from('world_nodes')
            .update({
                label: editingNode.label,
                color: editingNode.color,
                node_type: editingNode.node_type,
                description: editingNode.description,
                gameplay_notes: editingNode.gameplay_notes,
                lore: editingNode.lore,
                tags: editingNode.tags,
                image_url: editingNode.image_url
            })
            .eq('id', editingNode.id)

        if (!error) {
            setNodes(nodes.map(n => n.id === editingNode.id ? editingNode : n))
            setEditingNode(null)
        }
    }

    const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !editingNode) return

        const fileExt = file.name.split('.').pop()
        const fileName = `${editingNode.id}-${Math.random()}.${fileExt}`
        const filePath = `${projectId}/${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('world-assets')
            .upload(filePath, file)

        if (uploadError) {
            console.error("Upload error:", uploadError)
            return
        }

        const { data: { publicUrl } } = supabase.storage
            .from('world-assets')
            .getPublicUrl(filePath)

        setEditingNode({ ...editingNode, image_url: publicUrl })
    }

    const deleteNode = async () => {
        if (!editingNode) return

        const { error } = await supabase
            .from('world_nodes')
            .delete()
            .eq('id', editingNode.id)

        if (!error) {
            setNodes(nodes.filter(n => n.id !== editingNode.id))
            setConnections(connections.filter(c => c.from_node_id !== editingNode.id && c.to_node_id !== editingNode.id))
            setEditingNode(null)
        }
    }

    const saveConnection = async () => {
        if (!editingConnection) return

        const { error } = await supabase
            .from('world_connections')
            .update({
                connection_type: editingConnection.connection_type,
                requirements: editingConnection.requirements,
                notes: editingConnection.notes
            })
            .eq('id', editingConnection.id)

        if (!error) {
            setConnections(connections.map(c => c.id === editingConnection.id ? editingConnection : c))
            setEditingConnection(null)
        }
    }

    const deleteConnection = async () => {
        if (!editingConnection) return

        const { error } = await supabase
            .from('world_connections')
            .delete()
            .eq('id', editingConnection.id)

        if (!error) {
            setConnections(connections.filter(c => c.id !== editingConnection.id))
            setEditingConnection(null)
        }
    }

    const handleAISuggestConnections = async () => {
        if (!projectId || nodes.length < 2) return
        setIsSuggestingConnections(true)
        try {
            // Fetch GDD for context
            const { data: docs } = await supabase
                .from('project_documents')
                .select('content, title')
                .eq('project_id', projectId)
                .eq('is_main_gdd', true)

            const context = docs?.map(d => `Document: ${d.title}\nContent: ${JSON.stringify(d.content)}`).join("\n") || ""

            const suggestions = await suggestWorldConnections(nodes, context)

            for (const suggestion of suggestions) {
                // Check if connection already exists
                const exists = connections.some(c =>
                    (c.from_node_id === suggestion.from_node_id && c.to_node_id === suggestion.to_node_id) ||
                    (c.from_node_id === suggestion.to_node_id && c.to_node_id === suggestion.from_node_id)
                )

                if (!exists) {
                    const { data, error } = await supabase
                        .from('world_connections')
                        .insert([{
                            project_id: projectId,
                            ...suggestion
                        }])
                        .select()

                    if (data && !error) {
                        setConnections(prev => [...prev, data[0]])
                    }
                }
            }
        } catch (error) {
            console.error("AI Suggestion failed:", error)
        } finally {
            setIsSuggestingConnections(false)
        }
    }

    const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!connectingFrom) return
        const stage = e.target.getStage()
        if (!stage) return
        const pointer = stage.getPointerPosition()
        if (!pointer) return

        // Convert screen coordinates to stage coordinates
        setMousePos({
            x: (pointer.x - stage.x()) / stage.scaleX(),
            y: (pointer.y - stage.y()) / stage.scaleY()
        })
    }

    const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
        e.evt.preventDefault();
        const scaleBy = 1.1;
        const stage = e.target.getStage();
        if (!stage) return;
        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const oldScale = stage.scaleX();
        const mousePointTo = {
            x: pointer.x / oldScale - stage.x() / oldScale,
            y: pointer.y / oldScale - stage.y() / oldScale,
        };

        const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
        setStageScale(newScale);
        setStagePos({
            x: -(mousePointTo.x - pointer.x / newScale) * newScale,
            y: -(mousePointTo.y - pointer.y / newScale) * newScale,
        });
    };

    const exportMap = () => {
        if (!stageRef.current) return
        const uri = stageRef.current.toDataURL()
        const link = document.createElement('a')
        link.download = `world-map-${projectId}.png`
        link.href = uri
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const exportData = () => {
        exportToJson({ nodes, connections }, `world-data-${projectId}.json`)
    }

    const toggleTaskLink = (taskId: string) => {
        if (!editingNode) return
        const currentLinks = editingNode.linked_tasks || []
        const newLinks = currentLinks.includes(taskId)
            ? currentLinks.filter(id => id !== taskId)
            : [...currentLinks, taskId]

        setEditingNode({ ...editingNode, linked_tasks: newLinks })
    }

    const filteredNodes = nodes.filter(n =>
        (n.label?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (n.node_type?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    )

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>

    return (
        <div className="flex h-full flex-col bg-zinc-100 relative overflow-hidden">
            <div className="absolute top-4 left-4 z-10 flex gap-2">
                <Button onClick={addNode} className="shadow-lg">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Location
                </Button>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search world..."
                        className="pl-8 w-64 bg-white/80 backdrop-blur"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="shadow-lg bg-background" onClick={() => setStageScale(1)}>
                    Reset Zoom
                </Button>
                <Button variant="outline" className="shadow-lg bg-background" onClick={exportMap}>
                    <Download className="mr-2 h-4 w-4" />
                    PNG
                </Button>
                <Button variant="outline" className="shadow-lg bg-background" onClick={exportData}>
                    <FileJson className="mr-2 h-4 w-4" />
                    JSON
                </Button>
                <Button
                    variant="outline"
                    className="shadow-lg bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
                    onClick={handleAISuggestConnections}
                    disabled={isSuggestingConnections || nodes.length < 2}
                >
                    {isSuggestingConnections ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    AI Suggest Links
                </Button>
            </div>

            <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2">
                {connectingFrom && (
                    <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-pulse">
                        Click another node to connect...
                        <Button variant="ghost" size="sm" className="ml-2 h-6 w-6 p-0 hover:bg-primary-foreground/20" onClick={() => setConnectingFrom(null)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
                <div className="bg-white/50 backdrop-blur p-2 rounded text-xs flex gap-4 border border-zinc-200">
                    <span>Scroll to Zoom</span>
                    <span>•</span>
                    <span>Drag to Pan</span>
                    <span>•</span>
                    <span>Double Click to Edit</span>
                </div>
            </div>

            <Stage
                width={dimensions.width}
                height={dimensions.height}
                draggable
                onWheel={handleWheel}
                scaleX={stageScale}
                scaleY={stageScale}
                x={stagePos.x}
                y={stagePos.y}
                onMouseMove={handleMouseMove}
                onDragEnd={(e) => {
                    // Update stage pos state if dragged stage (not node)
                    if (e.target === e.target.getStage()) {
                        setStagePos({ x: e.target.x(), y: e.target.y() })
                    }
                }}
                ref={stageRef}
            >
                <Layer>
                    {/* Grid Background */}
                    <Rect
                        x={-5000}
                        y={-5000}
                        width={10000}
                        height={10000}
                        fill="#ffffff"
                        listening={false}
                    />
                    {[...Array(100)].map((_, i) => (
                        <Line
                            key={`v-${i}`}
                            points={[(i - 50) * 100, -5000, (i - 50) * 100, 5000]}
                            stroke="#f1f5f9"
                            strokeWidth={1}
                        />
                    ))}
                    {[...Array(100)].map((_, i) => (
                        <Line
                            key={`h-${i}`}
                            points={[-5000, (i - 50) * 100, 5000, (i - 50) * 100]}
                            stroke="#f1f5f9"
                            strokeWidth={1}
                        />
                    ))}

                    {/* Draw connections */}
                    {connections.map(conn => {
                        const fromNode = nodes.find(n => n.id === conn.from_node_id)
                        const toNode = nodes.find(n => n.id === conn.to_node_id)
                        if (!fromNode || !toNode) return null

                        return (
                            <MemoizedConnection
                                key={conn.id}
                                connection={conn}
                                fromNode={fromNode}
                                toNode={toNode}
                                onClick={() => setEditingConnection(conn)}
                            />
                        )
                    })}

                    {/* Draw ghost connection while linking */}
                    {connectingFrom && (() => {
                        const fromNode = nodes.find(n => n.id === connectingFrom);
                        if (!fromNode) return null;
                        const fromX = fromNode.x + (mousePos.x > fromNode.x + 110 ? 220 : 0);
                        const fromY = fromNode.y + 70;
                        return (
                            <Line
                                points={[fromX, fromY, mousePos.x, mousePos.y]}
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dash={[5, 5]}
                            />
                        );
                    })()}

                    {/* Draw Nodes */}
                    {filteredNodes.map((node) => (
                        <MemoizedNode
                            key={node.id}
                            node={node}
                            isConnecting={connectingFrom === node.id}
                            onDragMove={(e) => handleDragMove(e, node.id)}
                            onDragEnd={(e) => handleDragEnd(e, node.id)}
                            onDblClick={() => setEditingNode(node)}
                            onClick={() => connectingFrom && createConnection(node.id)}
                            onConnectPort={(e) => {
                                e.cancelBubble = true;
                                setConnectingFrom(node.id);
                            }}
                        />
                    ))}
                </Layer>
            </Stage>

            <Dialog open={!!editingNode} onOpenChange={(open) => !open && setEditingNode(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Location</DialogTitle>
                        <DialogDescription>
                            Configure the details for this map node.
                        </DialogDescription>
                    </DialogHeader>

                    {editingNode && (
                        <div className="grid gap-6 py-4 max-h-[60vh] overflow-y-auto pr-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid w-full gap-2">
                                    <label className="text-xs font-semibold uppercase text-muted-foreground">Name</label>
                                    <Input
                                        value={editingNode.label}
                                        onChange={(e) => setEditingNode({ ...editingNode, label: e.target.value })}
                                    />
                                </div>
                                <div className="grid w-full gap-2">
                                    <label className="text-xs font-semibold uppercase text-muted-foreground">Type</label>
                                    <Select
                                        value={editingNode.node_type}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditingNode({ ...editingNode, node_type: e.target.value as 'location' | 'event' | 'resource' })}
                                    >
                                        <SelectItem value="location">Location 🏞️</SelectItem>
                                        <SelectItem value="event">Event 🎯</SelectItem>
                                        <SelectItem value="resource">Resource 🎁</SelectItem>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid w-full gap-2">
                                <label className="text-xs font-semibold uppercase text-muted-foreground">Description</label>
                                <Textarea
                                    placeholder={editingNode.node_type === 'event' ? "What happens here?" : editingNode.node_type === 'resource' ? "What is this item/skill?" : "What is this place?"}
                                    value={editingNode.description || ''}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditingNode({ ...editingNode, description: e.target.value })}
                                />
                            </div>

                            {editingNode.node_type === 'location' && (
                                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="grid w-full gap-2">
                                        <label className="text-xs font-semibold uppercase text-muted-foreground">Gameplay Notes</label>
                                        <Textarea
                                            placeholder="Mechanisms, triggers..."
                                            className="h-24"
                                            value={editingNode.gameplay_notes || ''}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditingNode({ ...editingNode, gameplay_notes: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid w-full gap-2">
                                        <label className="text-xs font-semibold uppercase text-muted-foreground">Lore</label>
                                        <Textarea
                                            placeholder="History, world-building..."
                                            className="h-24"
                                            value={editingNode.lore || ''}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditingNode({ ...editingNode, lore: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            {editingNode.node_type === 'event' && (
                                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="grid w-full gap-2">
                                        <label className="text-xs font-semibold uppercase text-muted-foreground">Trigger Condition</label>
                                        <Textarea
                                            placeholder="Boss dead, item found..."
                                            className="h-24"
                                            value={(editingNode.metadata?.trigger as string) || ''}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditingNode({ ...editingNode, metadata: { ...editingNode.metadata, trigger: e.target.value } })}
                                        />
                                    </div>
                                    <div className="grid w-full gap-2">
                                        <label className="text-xs font-semibold uppercase text-muted-foreground">Outcome</label>
                                        <Textarea
                                            placeholder="New area unlocked, item given..."
                                            className="h-24"
                                            value={(editingNode.metadata?.outcome as string) || ''}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditingNode({ ...editingNode, metadata: { ...editingNode.metadata, outcome: e.target.value } })}
                                        />
                                    </div>
                                </div>
                            )}

                            {editingNode.node_type === 'resource' && (
                                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="grid w-full gap-2">
                                        <label className="text-xs font-semibold uppercase text-muted-foreground">Acquisition</label>
                                        <Textarea
                                            placeholder="Found in chest, crafted..."
                                            className="h-24"
                                            value={(editingNode.metadata?.acquisition as string) || ''}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditingNode({ ...editingNode, metadata: { ...editingNode.metadata, acquisition: e.target.value } })}
                                        />
                                    </div>
                                    <div className="grid w-full gap-2">
                                        <label className="text-xs font-semibold uppercase text-muted-foreground">Progression Role</label>
                                        <Textarea
                                            placeholder="Key item, currency..."
                                            className="h-24"
                                            value={(editingNode.metadata?.role as string) || ''}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditingNode({ ...editingNode, metadata: { ...editingNode.metadata, role: e.target.value } })}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="grid w-full gap-2">
                                <label className="text-xs font-semibold uppercase text-muted-foreground">Reference Image</label>
                                <div className="space-y-3">
                                    {editingNode.image_url && (
                                        <div className="relative group rounded-lg overflow-hidden border bg-muted">
                                            <img src={editingNode.image_url} alt="Reference" className="w-full h-32 object-cover" />
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => setEditingNode({ ...editingNode, image_url: '' })}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="https://image-url.com or upload..."
                                            value={editingNode.image_url || ''}
                                            onChange={(e) => setEditingNode({ ...editingNode, image_url: e.target.value })}
                                            className="flex-1"
                                        />
                                        <div className="relative">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                className="absolute inset-0 opacity-0 cursor-pointer w-10"
                                                onChange={uploadImage}
                                            />
                                            <Button variant="outline" size="icon">
                                                <Upload className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid w-full gap-2">
                                <label className="text-xs font-semibold uppercase text-muted-foreground">Linked Tasks</label>
                                <div className="space-y-4 rounded-lg border bg-muted/40 p-4">
                                    <div className="flex flex-wrap gap-2">
                                        {availableTasks
                                            .filter(t => (editingNode.linked_tasks || []).includes(t.id))
                                            .map(task => (
                                                <div key={task.id} className="flex items-center gap-2 bg-background border rounded-full px-3 py-1 text-sm shadow-sm">
                                                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                                                    <span className="truncate max-w-[150px]">{task.title}</span>
                                                    <button onClick={() => toggleTaskLink(task.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        {(editingNode.linked_tasks || []).length === 0 && (
                                            <span className="text-sm text-muted-foreground italic">No tasks linked.</span>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search tasks to link..."
                                            className="pl-9 bg-background"
                                            value={taskSearch}
                                            onChange={(e) => setTaskSearch(e.target.value)}
                                        />
                                    </div>

                                    {taskSearch && (
                                        <div className="max-h-32 overflow-y-auto rounded-md border bg-background text-sm">
                                            {availableTasks
                                                .filter(t => !(editingNode.linked_tasks || []).includes(t.id) && t.title.toLowerCase().includes(taskSearch.toLowerCase()))
                                                .map(task => (
                                                    <div
                                                        key={task.id}
                                                        className="flex items-center justify-between p-2 hover:bg-muted cursor-pointer transition-colors"
                                                        onClick={() => {
                                                            toggleTaskLink(task.id)
                                                            setTaskSearch("")
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <CircleIcon className="h-3 w-3 text-muted-foreground" />
                                                            <span>{task.title}</span>
                                                        </div>
                                                        <Plus className="h-3 w-3 text-primary" />
                                                    </div>
                                                ))}
                                            {availableTasks.filter(t => !(editingNode.linked_tasks || []).includes(t.id) && t.title.toLowerCase().includes(taskSearch.toLowerCase())).length === 0 && (
                                                <div className="p-2 text-center text-muted-foreground">No matching tasks found.</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid w-full gap-2">
                                <label className="text-xs font-semibold uppercase text-muted-foreground">Color Highlight</label>
                                <div className="flex gap-2">
                                    <Input
                                        type="color"
                                        className="w-12 h-9 p-1 px-1"
                                        value={editingNode.color}
                                        onChange={(e) => setEditingNode({ ...editingNode, color: e.target.value })}
                                    />
                                    <Input
                                        value={editingNode.color}
                                        onChange={(e) => setEditingNode({ ...editingNode, color: e.target.value })}
                                        placeholder="#000000"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="sm:justify-between">
                        <Button variant="destructive" size="sm" onClick={deleteNode}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Node
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setEditingNode(null)}>Cancel</Button>
                            <Button onClick={saveNode}>Save Changes</Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!editingConnection} onOpenChange={(open) => !open && setEditingConnection(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Connection</DialogTitle>
                        <DialogDescription>
                            Define the relationship between these two locations.
                        </DialogDescription>
                    </DialogHeader>

                    {editingConnection && (
                        <div className="grid gap-6 py-4">
                            <div className="grid w-full gap-2">
                                <label className="text-xs font-semibold uppercase text-muted-foreground">Type</label>
                                <Select
                                    value={editingConnection.connection_type}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditingConnection({ ...editingConnection, connection_type: e.target.value as 'path' | 'unlock' | 'story' | 'teleport' | 'gated' })}
                                >
                                    <SelectItem value="path">Standard Path 🛤️</SelectItem>
                                    <SelectItem value="unlock">Unlock Dependency 🔑</SelectItem>
                                    <SelectItem value="story">Story Beat 📖</SelectItem>
                                    <SelectItem value="teleport">Teleport 🌀</SelectItem>
                                    <SelectItem value="gated">Gated Access 🚪</SelectItem>
                                </Select>
                            </div>

                            <div className="grid w-full gap-2">
                                <label className="text-xs font-semibold uppercase text-muted-foreground">Requirements</label>
                                <Input
                                    placeholder="Level 5, Boss Key, etc."
                                    value={editingConnection.requirements || ''}
                                    onChange={(e) => setEditingConnection({ ...editingConnection, requirements: e.target.value })}
                                />
                            </div>

                            <div className="grid w-full gap-2">
                                <label className="text-xs font-semibold uppercase text-muted-foreground">Notes</label>
                                <Textarea
                                    placeholder="Any additional gameplay notes..."
                                    value={editingConnection.notes || ''}
                                    onChange={(e) => setEditingConnection({ ...editingConnection, notes: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="sm:justify-between">
                        <Button variant="destructive" size="sm" onClick={deleteConnection}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove Connection
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setEditingConnection(null)}>Cancel</Button>
                            <Button onClick={saveConnection}>Save Changes</Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
