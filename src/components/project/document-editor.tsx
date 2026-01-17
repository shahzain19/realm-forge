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
    Code, ChevronLeft, Download
} from "lucide-react"
import { GDDTemplateMarketplace } from './gdd-template-marketplace'
import { downloadFile } from '../../lib/export-utils'

interface DocumentEditorProps {
    documentId?: string;
    onBack?: () => void;
}

export function DocumentEditor({ documentId, onBack }: DocumentEditorProps) {
    const { docId: paramDocId } = useParams()
    const activeDocId = documentId || paramDocId
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)
    const [title, setTitle] = useState('')

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
        async function loadDoc() {
            if (!activeDocId || !editor) return
            setLoading(true)

            const { data } = await supabase
                .from('project_documents')
                .select('content, title')
                .eq('id', activeDocId)
                .single()

            if (data) {
                if (data.content) {
                    editor.commands.setContent(data.content)
                }
                setTitle(data.title)
            }
            setLoading(false)
        }
        loadDoc()
    }, [activeDocId, editor])

    const saveDoc = useCallback(async () => {
        if (!activeDocId || !editor) return
        setSaving(true)
        const json = editor.getJSON()

        const { error } = await supabase
            .from('project_documents')
            .update({ content: json, title: title })
            .eq('id', activeDocId)

        if (error) {
            console.error("Error saving:", error)
        }
        setSaving(false)
    }, [activeDocId, editor, title])

    useEffect(() => {
        const interval = setInterval(() => {
            if (editor && editor.isDestroyed === false) {
                saveDoc()
            }
        }, 30000)
        return () => clearInterval(interval)
    }, [saveDoc, editor])

    const exportToMarkdown = () => {
        if (!editor) return

        // Simple Tiptap JSON to Markdown converter
        const json = editor.getJSON()
        let markdown = `# ${title}\n\n`

        interface TiptapNode {
            type: string;
            text?: string;
            content?: TiptapNode[];
            attrs?: {
                level?: number;
                checked?: boolean;
                [key: string]: unknown;
            };
            marks?: { type: string; attrs?: Record<string, unknown> }[];
        }

        const parseContent = (content: TiptapNode[]) => {
            content.forEach(node => {
                switch (node.type) {
                    case 'heading':
                        markdown += `${'#'.repeat(node.attrs?.level || 1)} `;
                        if (node.content) parseContent(node.content);
                        markdown += '\n\n';
                        break;
                    case 'paragraph':
                        if (node.content) parseContent(node.content);
                        markdown += '\n\n';
                        break;
                    case 'text': {
                        let text = node.text as string;
                        if (node.marks) {
                            (node.marks as { type: string }[]).forEach((mark) => {
                                if (mark.type === 'bold') text = `**${text}**`;
                                if (mark.type === 'italic') text = `*${text}*`;
                                if (mark.type === 'code') text = `\`${text}\``;
                            });
                        }
                        markdown += text;
                        break;
                    }
                    case 'bulletList':
                        (node.content || []).forEach((item) => {
                            markdown += '- ';
                            if (item.content) parseContent(item.content);
                            markdown += '\n';
                        });
                        markdown += '\n';
                        break;
                    case 'orderedList':
                        (node.content || []).forEach((item, idx: number) => {
                            markdown += `${idx + 1}. `;
                            if (item.content) parseContent(item.content);
                            markdown += '\n';
                        });
                        markdown += '\n';
                        break;
                    case 'blockquote':
                        markdown += '> ';
                        if (node.content) parseContent(node.content);
                        markdown += '\n\n';
                        break;
                    case 'taskList':
                        (node.content as TiptapNode[]).forEach((item) => {
                            markdown += item.attrs?.checked ? '- [x] ' : '- [ ] ';
                            if (item.content) parseContent(item.content);
                            markdown += '\n';
                        });
                        markdown += '\n';
                        break;
                    case 'horizontalRule':
                        markdown += '---\n\n';
                        break;
                    case 'image':
                        markdown += `![${node.attrs?.alt || ''}](${node.attrs?.src || ''})\n\n`;
                        break;
                }
            });
        };

        if (json.content) parseContent(json.content);
        downloadFile(markdown, `${title.replace(/\s+/g, '-').toLowerCase()}.md`, 'text/markdown');
    }


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
                <div className="flex gap-1 overflow-x-auto no-scrollbar items-center">
                    {onBack && (
                        <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back
                        </Button>
                    )}

                    <input
                        className="bg-transparent border-none focus:ring-0 font-semibold text-sm px-2 w-48"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Document Title"
                    />

                    <div className="w-px h-6 bg-border mx-2 self-center" />

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
                    <Button variant="outline" size="sm" onClick={exportToMarkdown}>
                        <Download className="mr-2 h-4 w-4" />
                        MD
                    </Button>
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
