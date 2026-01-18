import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Command } from 'cmdk'
import {
    LayoutGrid,
    CheckSquare,
    BookOpen,
    FileText,
    Map as MapIcon,
    Database,
    Settings,
    Search
} from 'lucide-react'
import { Dialog, DialogContent } from '../ui/dialog'

export function CommandPalette() {
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()
    const { projectId } = useParams()

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }
        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    const runCommand = (command: () => void) => {
        setOpen(false)
        command()
    }

    if (!projectId) return null

    const navItems = [
        { name: "Overview", icon: LayoutGrid, href: `/project/${projectId}` },
        { name: "Tasks", icon: CheckSquare, href: `/project/${projectId}/tasks` },
        { name: "Game Design Doc", icon: BookOpen, href: `/project/${projectId}/gdd` },
        { name: "Project Docs", icon: FileText, href: `/project/${projectId}/docs` },
        { name: "World Map", icon: MapIcon, href: `/project/${projectId}/world` },
        { name: "Systems", icon: Database, href: `/project/${projectId}/systems` },
        { name: "Settings", icon: Settings, href: `/project/${projectId}/settings` },
    ]

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="p-0 overflow-hidden shadow-2xl border-none max-w-lg">
                <Command className="flex flex-col h-full bg-card rounded-xl overflow-hidden">
                    <div className="flex items-center border-b px-3 h-12" cmdk-input-wrapper="">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Command.Input
                            placeholder="Type a command or search..."
                            className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
                        <Command.Empty className="py-6 text-center text-sm">No results found.</Command.Empty>
                        <Command.Group heading="Navigation" className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                            {navItems.map((item) => (
                                <Command.Item
                                    key={item.href}
                                    onSelect={() => runCommand(() => navigate(item.href))}
                                    className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                >
                                    <item.icon className="mr-2 h-4 w-4" />
                                    <span>{item.name}</span>
                                </Command.Item>
                            ))}
                        </Command.Group>
                    </Command.List>
                </Command>
            </DialogContent>
        </Dialog>
    )
}
