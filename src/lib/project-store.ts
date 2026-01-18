import { create } from 'zustand'
import { supabase } from './supabase'

export interface Project {
    id: string
    name: string
    description: string | null
    workspace_id: string
    owner_id: string
    created_at: string
    updated_at: string
    is_public: boolean
    public_settings: {
        show_overview: boolean
        show_milestones: boolean
        show_team: boolean
        primary_color?: string
    } | null
}

export interface Member {
    id: string
    workspace_id: string
    user_id: string
    role: string
    joined_at: string
}

interface ProjectState {
    projects: Project[]
    loading: boolean
    error: string | null
    members: Member[]
    fetchProjects: () => Promise<void>
    createProject: (name: string, description: string) => Promise<void>
    updateProject: (id: string, updates: Partial<Project>) => Promise<void>
    deleteProject: (id: string) => Promise<void>
    fetchProject: (id: string) => Promise<Project | null>
    fetchMembers: (workspaceId: string) => Promise<void>
    inviteMember: (workspaceId: string, email: string) => Promise<string | null>
    updatePublicSettings: (id: string, isPublic: boolean, settings?: Project['public_settings']) => Promise<void>
}

export const useProjectStore = create<ProjectState>((set, get) => ({
    projects: [],
    loading: false,
    error: null,
    members: [],
    fetchProjects: async () => {
        set({ loading: true, error: null })
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('updated_at', { ascending: false })

        if (error) {
            console.error("Error fetching projects:", error)
            set({ error: error.message, loading: false })
        } else {
            set({ projects: data as Project[], loading: false })
        }
    },
    createProject: async (name: string, description: string) => {
        set({ loading: true, error: null })
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            set({ error: "Not authenticated", loading: false })
            return
        }

        const { error } = await supabase
            .from('projects')
            .insert([{ name, description, owner_id: user.id }])

        if (error) {
            set({ error: error.message, loading: false })
        } else {
            // Refresh list
            get().fetchProjects()
        }
    },
    updateProject: async (id: string, updates: Partial<Project>) => {
        const { error } = await supabase
            .from('projects')
            .update(updates)
            .eq('id', id)

        if (error) {
            set({ error: error.message })
        } else {
            set({
                projects: get().projects.map(p => p.id === id ? { ...p, ...updates } : p)
            })
        }
    },
    deleteProject: async (id: string) => {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id)

        if (error) {
            set({ error: error.message })
        } else {
            set({
                projects: get().projects.filter(p => p.id !== id)
            })
        }
    },
    fetchProject: async (id: string) => {
        // Check if we already have it
        const existing = get().projects.find(p => p.id === id)
        if (existing) return existing

        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .single()

        if (error || !data) {
            console.error("Error fetching project:", error)
            return null
        }

        const project = data as Project
        set({ projects: [...get().projects, project] })
        return project
    },
    fetchMembers: async (workspaceId: string) => {
        // Simple caching: if we already have members for this workspace, skip
        if (get().members.length > 0 && get().members[0].workspace_id === workspaceId) {
            return
        }

        set({ loading: true })
        const { data, error } = await supabase
            .from('workspace_members')
            .select(`
                id,
                workspace_id,
                user_id,
                role,
                joined_at
            `)
            .eq('workspace_id', workspaceId)

        if (error) {
            set({ error: error.message, loading: false })
        } else {
            set({ members: data as Member[], loading: false })
        }
    },
    inviteMember: async (workspaceId: string, email: string) => {
        const token = Math.random().toString(36).substring(2, 15)
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days

        const { error } = await supabase
            .from('invitations')
            .insert([{
                workspace_id: workspaceId,
                email,
                token,
                expires_at: expiresAt
            }])

        if (error) {
            set({ error: error.message })
            return null
        }

        return token
    },
    updatePublicSettings: async (id: string, isPublic: boolean, settings?: Project['public_settings']) => {
        const updates: any = { is_public: isPublic }
        if (settings) updates.public_settings = settings

        const { error } = await supabase
            .from('projects')
            .update(updates)
            .eq('id', id)

        if (error) {
            set({ error: error.message })
        } else {
            set({
                projects: get().projects.map(p => p.id === id ? { ...p, ...updates } : p)
            })
        }
    }
}))
