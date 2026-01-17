import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Loader2, Plus, FileText, Trash2, Edit2, BookOpen } from 'lucide-react'
import { DocumentEditor } from './document-editor'
import { Badge } from '../ui/badge'

interface Document {
    id: string
    title: string
    is_main_gdd: boolean
    updated_at: string
}

export function DocumentManager() {
    const { projectId } = useParams()
    const [documents, setDocuments] = useState<Document[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null)

    const fetchDocuments = useCallback(async () => {
        if (!projectId) return
        // setLoading(true) // Removed to avoid cascading render as it's already true by default
        const { data, error } = await supabase
            .from('project_documents')
            .select('id, title, is_main_gdd, updated_at')
            .eq('project_id', projectId)
            .order('updated_at', { ascending: false })

        if (error) {
            console.error("Error fetching documents:", error)
        } else if (data) {
            setDocuments(data)
        }
        setLoading(false)
    }, [projectId])

    useEffect(() => {
        const timer = setTimeout(() => {
            void fetchDocuments()
        }, 0)
        return () => clearTimeout(timer)
    }, [fetchDocuments])

    const createDocument = async () => {
        if (!projectId) return
        const { data } = await supabase
            .from('project_documents')
            .insert([{
                project_id: projectId,
                title: 'New Design Document',
                content: { type: 'doc', content: [] }
            }])
            .select()
            .single()

        if (data) {
            setDocuments([data, ...documents])
            setSelectedDocId(data.id)
        }
    }

    const deleteDocument = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this document?")) return
        const { error } = await supabase
            .from('project_documents')
            .delete()
            .eq('id', id)

        if (!error) {
            setDocuments(documents.filter(d => d.id !== id))
        }
    }

    const promoteToMainGdd = async (id: string) => {
        if (!projectId) return

        // 1. Remove main flag from others
        await supabase
            .from('project_documents')
            .update({ is_main_gdd: false })
            .eq('project_id', projectId)

        // 2. Set this one as main
        const { error } = await supabase
            .from('project_documents')
            .update({ is_main_gdd: true })
            .eq('id', id)

        if (!error) {
            fetchDocuments()
        }
    }

    if (selectedDocId) {
        return <DocumentEditor documentId={selectedDocId} onBack={() => {
            setSelectedDocId(null)
            fetchDocuments()
        }} />
    }

    if (loading) {
        return <div className="flex h-[400px] items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
    }

    return (
        <div className="p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Document Manager</h1>
                    <p className="text-muted-foreground mt-1">Manage your project design documents, research, and lore.</p>
                </div>
                <Button onClick={createDocument} className="gap-2 shadow-sm">
                    <Plus className="h-4 w-4" />
                    New Document
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.map((doc) => (
                    <Card
                        key={doc.id}
                        className="group hover:border-primary/50 transition-all cursor-pointer overflow-hidden flex flex-col shadow-sm hover:shadow-md"
                        onClick={() => setSelectedDocId(doc.id)}
                    >
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                                    <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                {doc.is_main_gdd && (
                                    <Badge variant="default" className="text-[10px] uppercase tracking-wider bg-orange-500 hover:bg-orange-600">Main GDD</Badge>
                                )}
                            </div>
                            <CardTitle className="text-xl mt-4 line-clamp-1 flex items-center gap-2">
                                {doc.title}
                                {doc.is_main_gdd && (
                                    <Badge variant="default" className="text-[10px] uppercase tracking-wider bg-orange-500 hover:bg-orange-600">Core</Badge>
                                )}
                            </CardTitle>
                            <CardDescription>
                                Last edited {new Date(doc.updated_at).toLocaleDateString()}
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="mt-auto border-t bg-muted/30 p-2 flex justify-between">
                            <Button variant="ghost" size="sm" className="gap-2 text-xs" onClick={(e) => {
                                e.stopPropagation()
                                setSelectedDocId(doc.id)
                            }}>
                                <Edit2 className="h-3 w-3" />
                                Edit
                            </Button>
                            {!doc.is_main_gdd ? (
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="sm" className="gap-2 text-xs text-primary hover:bg-primary/10" onClick={(e) => {
                                        e.stopPropagation()
                                        promoteToMainGdd(doc.id)
                                    }}>
                                        <BookOpen className="h-3 w-3" />
                                        Make Main GDD
                                    </Button>
                                    <Button variant="ghost" size="sm" className="gap-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={(e) => {
                                        e.stopPropagation()
                                        deleteDocument(doc.id)
                                    }}>
                                        <Trash2 className="h-3 w-3" />
                                        Delete
                                    </Button>
                                </div>
                            ) : (
                                <span className="text-[10px] text-muted-foreground px-3 font-medium uppercase tracking-tight">Primary Specification</span>
                            )}
                        </CardFooter>
                    </Card>
                ))}

                {documents.length === 0 && (
                    <div className="col-span-full py-20 border-2 border-dashed rounded-xl flex flex-col items-center justify-center bg-muted/30">
                        <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <h3 className="text-lg font-medium">No documents yet</h3>
                        <p className="text-muted-foreground mb-6">Start by creating your first design document.</p>
                        <Button onClick={createDocument} variant="outline" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Create Document
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
