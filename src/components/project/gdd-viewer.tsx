import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { useEffect } from 'react'

interface GddViewerProps {
    content: any
}

export function GddViewer({ content }: GddViewerProps) {
    const editor = useEditor({
        editable: false,
        extensions: [
            StarterKit,
            Image,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
        ],
        editorProps: {
            attributes: {
                class: 'prose prose-zinc max-w-none focus:outline-none',
            },
        },
        content: content
    })

    // Update content if it changes (e.g. initial load)
    useEffect(() => {
        if (editor && content) {
            // Only set if different to avoid cursor jumps (not relevant for read-only but good practice)
            // For read-only, we just want to ensure it matches prop
            if (JSON.stringify(editor.getJSON()) !== JSON.stringify(content)) {
                editor.commands.setContent(content)
            }
        }
    }, [content, editor])

    if (!editor) {
        return null
    }

    return <EditorContent editor={editor} />
}
