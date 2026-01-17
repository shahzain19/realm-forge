import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Loader2, FileWarning } from 'lucide-react'
import { DocumentEditor } from './document-editor'
import { Button } from '../ui/button'

export function GDDEditorRedirect() {
    const { projectId } = useParams()
    const [docId, setDocId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        async function fetchMainGDD() {
            if (!projectId) return
            setLoading(true)

            // 1. Try to find the main GDD
            const { data } = await supabase
                .from('project_documents')
                .select('id')
                .eq('project_id', projectId)
                .eq('is_main_gdd', true)
                .single()

            if (data) {
                setDocId(data.id)
                setLoading(false)
            } else {
                // 2. If no main GDD, find the first available document
                const { data: firstDoc } = await supabase
                    .from('project_documents')
                    .select('id')
                    .eq('project_id', projectId)
                    .order('created_at', { ascending: true })
                    .limit(1)
                    .single()

                if (firstDoc) {
                    // Auto-promote first doc to main if none exist
                    await supabase
                        .from('project_documents')
                        .update({ is_main_gdd: true })
                        .eq('id', firstDoc.id)

                    setDocId(firstDoc.id)
                    setLoading(false)
                } else {
                    // 3. If absolutely no documents, create a default GDD
                    const { data: newDoc, error: createError } = await supabase
                        .from('project_documents')
                        .insert([{
                            project_id: projectId,
                            title: 'Game Design Document',
                            content: { type: 'doc', content: [{ type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Brand New GDD' }] }] },
                            is_main_gdd: true
                        }])
                        .select()
                        .single()

                    if (newDoc) {
                        setDocId(newDoc.id)
                    } else {
                        setError(createError?.message || "Failed to initialize GDD")
                    }
                    setLoading(false)
                }
            }
        }

        fetchMainGDD()
    }, [projectId])

    if (loading) {
        return (
            <div className="flex flex-col h-full items-center justify-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Initializing Design Document...</p>
            </div>
        )
    }

    if (error || !docId) {
        return (
            <div className="flex flex-col h-full items-center justify-center space-y-4 p-8 text-center">
                <FileWarning className="h-12 w-12 text-destructive/50" />
                <h2 className="text-xl font-bold">GDD Not Found</h2>
                <p className="text-muted-foreground max-w-md">
                    We couldn't load the primary specification for this project.
                    You can try re-initializing it or head to the Document Manager.
                </p>
                <div className="flex gap-4">
                    <Button onClick={() => window.location.reload()}>Retry</Button>
                    <Button variant="outline" onClick={() => navigate(`/project/${projectId}/docs`)}>Go to Docs</Button>
                </div>
            </div>
        )
    }

    return <DocumentEditor documentId={docId} />
}
