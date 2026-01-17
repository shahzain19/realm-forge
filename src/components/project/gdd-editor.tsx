import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { supabase } from '../../lib/supabase'
import { Button } from "../ui/button"
import {
    Bold, Italic, List, ListOrdered, Heading1, Heading2, Quote,
    Loader2, Save, Image as ImageIcon, CheckSquare,
    Code
} from "lucide-react"
import { GDDTemplateMarketplace } from './gdd-template-marketplace'

export function GDDEditor() {
    const { projectId } = useParams()
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: "Type '/' to choose a command...",
            }),
            Image,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
        ],
        editorProps: {
            attributes: {
                class: 'prose prose-slate dark:prose-invert max-w-none focus:outline-none min-h-[500px] px-8 py-6',
            },
        },
    })

    // Load Content
    useEffect(() => {
        async function loadGDD() {
            if (!projectId || !editor) return

            const { data } = await supabase
                .from('gdd_docs')
                .select('content')
                .eq('project_id', projectId)
                .single()

            if (data && data.content) {
                editor.commands.setContent(data.content)
            }
            setLoading(false)
        }
        loadGDD()
    }, [projectId, editor])

    const saveDoc = useCallback(async () => {
        if (!projectId || !editor) return
        setSaving(true)
        const json = editor.getJSON()

        const { error } = await supabase
            .from('gdd_docs')
            .upsert({ project_id: projectId, content: json }, { onConflict: 'project_id' })

        if (error) {
            console.error("Error saving:", error)
        }
        setSaving(false)
    }, [projectId, editor])

    useEffect(() => {
        const interval = setInterval(() => {
            if (editor && editor.isDestroyed === false) {
                saveDoc()
            }
        }, 30000)
        return () => clearInterval(interval)
    }, [saveDoc, editor])


    if (loading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
    }

    if (!editor) return null

    const addImage = () => {
        const url = window.prompt('URL')
        if (url) {
            editor.chain().focus().setImage({ src: url }).run()
        }
    }

    return (
        <div className="flex flex-col h-full bg-background relative">
            {/* Top Toolbar */}
            <div className="border-b border-border p-2 flex gap-1 flex-wrap bg-card/95 backdrop-blur sticky top-0 z-10 items-center justify-between">
                <div className="flex gap-1 overflow-x-auto no-scrollbar">
                    <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'bg-accent' : ''}>
                        <Bold className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'bg-accent' : ''}>
                        <Italic className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-border mx-2 self-center" />

                    <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'bg-accent' : ''}>
                        <Heading1 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'bg-accent' : ''}>
                        <Heading2 className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-border mx-2 self-center" />

                    <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'bg-accent' : ''}>
                        <List className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'bg-accent' : ''}>
                        <ListOrdered className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleTaskList().run()} className={editor.isActive('taskList') ? 'bg-accent' : ''}>
                        <CheckSquare className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-border mx-2 self-center" />

                    <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'bg-accent' : ''}>
                        <Quote className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive('codeBlock') ? 'bg-accent' : ''}>
                        <Code className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-border mx-2 self-center" />

                    <Button variant="ghost" size="sm" onClick={addImage}>
                        <ImageIcon className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-border mx-2 self-center" />

                    <GDDTemplateMarketplace onSelect={(content) => {
                        if (window.confirm("Replace current content with this template?")) {
                            // @ts-expect-error: Tiptap content type is complex
                            editor.commands.setContent(content)
                        }
                    }} />
                </div>

                <div className="flex gap-2">
                    <div className="text-xs text-muted-foreground self-center">
                        {saving ? "Saving..." : "Saved"}
                    </div>
                    <Button size="sm" onClick={saveDoc} disabled={saving}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Manual
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-auto bg-slate-50/50">
                <div className="max-w-4xl mx-auto my-8 bg-background min-h-[calc(100vh-200px)] shadow-sm border border-border rounded-lg">
                    <EditorContent editor={editor} />
                </div>
            </div>
        </div>
    )
}
