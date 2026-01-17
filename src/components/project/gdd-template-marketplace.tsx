import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Badge } from '../ui/badge'
import { Loader2, Search, BookOpen, Layers, Swords, Crosshair, Ghost } from 'lucide-react'
import { Input } from '../ui/input'
import { ScrollArea } from '../ui/scroll-area'

interface Template {
    id: string
    title: string
    description: string
    content: unknown
    category: string
    preview_image_url: string
}

interface GDDTemplateMarketplaceProps {
    onSelect: (content: unknown) => void
}

export function GDDTemplateMarketplace({ onSelect }: GDDTemplateMarketplaceProps) {
    const [templates, setTemplates] = useState<Template[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        async function fetchTemplates() {
            setLoading(true)
            const { data } = await supabase
                .from('gdd_templates')
                .select('*')
                .order('created_at', { ascending: false })

            if (data) setTemplates(data)
            setLoading(false)
        }
        fetchTemplates()
    }, [])

    const categories = [
        { id: 'rpg', label: 'RPG', icon: Swords },
        { id: 'fps', label: 'FPS', icon: Crosshair },
        { id: 'horror', label: 'Horror', icon: Ghost },
        { id: 'strategy', label: 'Strategy', icon: Layers },
    ]

    const filtered = templates.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
            t.description.toLowerCase().includes(search.toLowerCase())
        const matchesCategory = !selectedCategory || t.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    const handleApply = (content: unknown) => {
        onSelect(content)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Browse Templates
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 border-b">
                    <DialogTitle className="text-2xl">Template Marketplace</DialogTitle>
                    <DialogDescription>
                        Choose a professionally designed GDD template to kickstart your game development.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="p-6 border-b bg-muted/30 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search templates..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={selectedCategory === null ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedCategory(null)}
                            >
                                All
                            </Button>
                            {categories.map(cat => (
                                <Button
                                    key={cat.id}
                                    variant={selectedCategory === cat.id ? 'default' : 'outline'}
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => setSelectedCategory(cat.id)}
                                >
                                    <cat.icon className="h-4 w-4" />
                                    {cat.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <ScrollArea className="flex-1 p-6">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                No templates found matching your search.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filtered.map(template => (
                                    <Card key={template.id} className="group hover:border-primary/50 transition-all shadow-sm flex flex-col">
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge variant="secondary" className="capitalize">{template.category}</Badge>
                                            </div>
                                            <CardTitle className="text-lg group-hover:text-primary transition-colors">{template.title}</CardTitle>
                                            <CardDescription className="line-clamp-2">{template.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-1">
                                            <div className="aspect-video bg-muted rounded-md flex items-center justify-center border border-dashed border-muted-foreground/20">
                                                <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                                            </div>
                                        </CardContent>
                                        <CardFooter className="pt-2">
                                            <Button
                                                className="w-full"
                                                onClick={() => handleApply(template.content)}
                                            >
                                                Apply Template
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    )
}
