import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProjectStore } from '../../lib/project-store'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Loader2, UserPlus, Trash2, Mail, Copy, Check } from 'lucide-react'


export default function ProjectSettings() {
    const { projectId } = useParams()
    const navigate = useNavigate()
    const { projects, members, fetchMembers, inviteMember, updateProject, deleteProject } = useProjectStore()

    const project = projects.find(p => p.id === projectId)

    const [name, setName] = useState(project?.name || '')
    const [description, setDescription] = useState(project?.description || '')
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviting, setInviting] = useState(false)
    const [inviteLink, setInviteLink] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const [saving, setSaving] = useState(false)

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
            setInviteLink(`${window.location.origin}/accept-invitation/${token}`)
            setInviteEmail('')
        }
        setInviting(false)
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
        </div>
    )
}
