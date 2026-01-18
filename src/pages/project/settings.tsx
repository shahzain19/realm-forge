import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProjectStore } from '../../lib/project-store'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Loader2, UserPlus, Trash2, Mail, Copy, Check, Download, Globe } from 'lucide-react'
import { generateProjectBundle } from '../../lib/export-utils'


export default function ProjectSettings() {
    const { projectId } = useParams()
    const navigate = useNavigate()
    const { projects, members, fetchMembers, inviteMember, updateProject, deleteProject, updatePublicSettings } = useProjectStore()

    const project = projects.find(p => p.id === projectId)

    const [name, setName] = useState(project?.name || '')
    const [description, setDescription] = useState(project?.description || '')
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviting, setInviting] = useState(false)
    const [inviteLink, setInviteLink] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const [saving, setSaving] = useState(false)

    // Publishing State
    const [isPublic, setIsPublic] = useState(project?.is_public || false)
    const [publicSettings, setPublicSettings] = useState(project?.public_settings || { show_overview: true, show_milestones: true, show_team: true })
    const [publishing, setPublishing] = useState(false)
    const [exporting, setExporting] = useState(false)

    // ... init ...

    const handleExport = async () => {
        if (!projectId) return
        setExporting(true)
        try {
            await generateProjectBundle(projectId)
        } catch (e) {
            console.error(e)
            alert("Export failed")
        } finally {
            setExporting(false)
        }
    }

    useEffect(() => {
        async function init() {
            if (!projectId) return

            let currentProject = project
            if (!currentProject) {
                // @ts-expect-error: Store initialization might be async or type mismatch during rehydration
                currentProject = await useProjectStore.getState().fetchProject(projectId)
            }

            if (currentProject?.workspace_id) {
                fetchMembers(currentProject.workspace_id)
                setName(currentProject.name)
                setDescription(currentProject.description || '')
            }
        }
        init()
    }, [projectId, project, fetchMembers])

    const handleSave = async () => {
        if (!projectId) return
        setSaving(true)
        await updateProject(projectId, { name, description })
        setSaving(false)
    }

    const handleDelete = async () => {
        if (!projectId || !window.confirm("Are you sure? This is IRREVERSIBLE.")) return
        await deleteProject(projectId)
        navigate('/')
    }

    const handleInvite = async () => {
        if (!inviteEmail || !project?.workspace_id) return
        setInviting(true)
        const token = await inviteMember(project.workspace_id, inviteEmail)
        if (token) {
            setInviteLink(`https://realm-forge-nine.vercel.app/accept-invitation/${token}`)
            setInviteEmail('')
        }
        setInviting(false)
    }

    const handlePublish = async () => {
        if (!projectId) return
        setPublishing(true)
        await updatePublicSettings(projectId, isPublic, publicSettings)
        setPublishing(false)
    }

    const copyToClipboard = () => {
        if (!inviteLink) return
        navigator.clipboard.writeText(inviteLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (!project) return (
        <div className="p-8 flex items-center justify-center min-h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mr-3" />
            <span className="text-muted-foreground">Loading Project Details...</span>
        </div>
    )

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Project Settings</h1>
                <p className="text-muted-foreground">Manage your project details and team collaboration.</p>
            </div>

            <div className="grid gap-8">
                {/* General Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>General</CardTitle>
                        <CardDescription>Update your project name and description.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Project Name</label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Epic Game" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A short summary of your vision" />
                        </div>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Publishing */}
                <Card className="border-indigo-100 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-indigo-950 flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-indigo-500" />
                                    Public Showcase
                                </CardTitle>
                                <CardDescription>Share a read-only view of your project with the world.</CardDescription>
                            </div>
                            {isPublic && (
                                <Badge className="bg-indigo-500 hover:bg-indigo-600">Live</Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="flex items-center justify-between p-4 rounded-lg border bg-secondary/20">
                            <div>
                                <h4 className="font-semibold text-sm">Make Project Public</h4>
                                <p className="text-xs text-muted-foreground">Anyone with the link can view selected parts of this project.</p>
                            </div>
                            <div className="flex items-center h-6">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                    checked={isPublic}
                                    onChange={(e) => setIsPublic(e.target.checked)}
                                />
                            </div>
                        </div>

                        {isPublic && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="space-y-3">
                                    <label className="text-sm font-medium">Visibility Settings</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <label className="flex items-center gap-2 text-sm p-3 border rounded-md cursor-pointer hover:bg-secondary/50">
                                            <input
                                                type="checkbox"
                                                checked={publicSettings?.show_overview}
                                                onChange={(e) => setPublicSettings({ ...publicSettings!, show_overview: e.target.checked })}
                                                className="rounded border-gray-300 text-indigo-600"
                                            />
                                            Show Wiki (GDD)
                                        </label>
                                        <label className="flex items-center gap-2 text-sm p-3 border rounded-md cursor-pointer hover:bg-secondary/50">
                                            <input
                                                type="checkbox"
                                                checked={publicSettings?.show_milestones}
                                                onChange={(e) => setPublicSettings({ ...publicSettings!, show_milestones: e.target.checked })}
                                                className="rounded border-gray-300 text-indigo-600"
                                            />
                                            Show Roadmap
                                        </label>
                                        <label className="flex items-center gap-2 text-sm p-3 border rounded-md cursor-pointer hover:bg-secondary/50">
                                            <input
                                                type="checkbox"
                                                checked={publicSettings?.show_team}
                                                onChange={(e) => setPublicSettings({ ...publicSettings!, show_team: e.target.checked })}
                                                className="rounded border-gray-300 text-indigo-600"
                                            />
                                            Show Team
                                        </label>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 p-3 bg-indigo-50 text-indigo-900 rounded-md border border-indigo-100">
                                    <Globe className="h-4 w-4 flex-shrink-0" />
                                    <code className="flex-1 text-xs truncate bg-transparent border-none focus:ring-0 p-0">
                                        https://realm-forge-nine.vercel.app/p/{projectId}
                                    </code>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0 hover:bg-indigo-100"
                                        onClick={() => {
                                            navigator.clipboard.writeText(`https://realm-forge-nine.vercel.app/p/${projectId}`)
                                        }}
                                    >
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="border-t bg-slate-50 px-6 py-4 flex justify-between">
                        <Button variant="ghost" asChild>
                            <a href={`/p/${projectId}`} target="_blank" rel="noreferrer">Preview Page</a>
                        </Button>
                        <Button onClick={handlePublish} disabled={publishing} className={isPublic ? "bg-indigo-600 hover:bg-indigo-700" : ""}>
                            {publishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Update Publishing"}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Team Management */}
                <Card>
                    <CardHeader>
                        <CardTitle>Team Collaboration</CardTitle>
                        <CardDescription>Invite others to work on this project with you.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    className="pl-9"
                                    placeholder="friend@email.com"
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                />
                            </div>
                            <Button onClick={handleInvite} disabled={inviting || !inviteEmail}>
                                {inviting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                                Generate Invite
                            </Button>
                        </div>

                        {inviteLink && (
                            <div className="bg-secondary/50 p-3 rounded-md flex items-center justify-between border border-border">
                                <code className="text-xs truncate mr-2">{inviteLink}</code>
                                <Button size="sm" variant="ghost" onClick={copyToClipboard}>
                                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        )}

                        <div className="space-y-4">
                            <label className="text-sm font-semibold">Current Members</label>
                            <div className="divide-y border rounded-lg">
                                {members.map((member) => (
                                    <div key={member.id} className="p-4 flex items-center justify-between bg-card">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                                                {member.user_id.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{member.user_id}</p>
                                                <p className="text-xs text-muted-foreground">Joined {new Date(member.joined_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <Badge variant="secondary">{member.role}</Badge>
                                    </div>
                                ))}
                                {members.length === 0 && (
                                    <div className="p-8 text-center text-muted-foreground">
                                        No members yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </div>

            {/* Data Export */}
            <Card>
                <CardHeader>
                    <CardTitle>Data Export</CardTitle>
                    <CardDescription>Download all your project data as a portable bundle (JSON/Markdown).</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleExport} disabled={exporting} variant="outline" className="w-full sm:w-auto">
                        {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        Export Project Bundle (.zip)
                    </Button>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>Permanently delete this project and all its data.</CardDescription>
                </CardHeader>
                <CardFooter className="border-t border-destructive/20 bg-destructive/5 px-6 py-4">
                    <Button variant="destructive" onClick={handleDelete}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Project
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
