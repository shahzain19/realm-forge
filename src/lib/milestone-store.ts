import { create } from 'zustand';
import { supabase } from './supabase';

export interface Milestone {
    id: string;
    project_id: string;
    title: string;
    description: string;
    due_date: string | null;
    status: 'pending' | 'in_progress' | 'completed' | 'blocked';
    progress: number;
    created_at: string;
    updated_at: string;
}

interface MilestoneState {
    milestones: Milestone[];
    loading: boolean;
    fetchMilestones: (projectId: string) => Promise<void>;
    addMilestone: (milestone: Partial<Milestone>) => Promise<void>;
    updateMilestone: (id: string, updates: Partial<Milestone>) => Promise<void>;
    deleteMilestone: (id: string) => Promise<void>;
    subscribeToMilestones: (projectId: string) => () => void;
}

export const useMilestoneStore = create<MilestoneState>((set) => ({
    milestones: [],
    loading: false,

    fetchMilestones: async (projectId: string) => {
        set({ loading: true });
        const { data } = await supabase
            .from('milestones')
            .select('*')
            .eq('project_id', projectId)
            .order('due_date', { ascending: true }); // Order by due date by default

        set({ milestones: data || [], loading: false });
    },

    addMilestone: async (milestone) => {
        const { data, error } = await supabase.from('milestones').insert([milestone]).select();
        if (data && !error) {
            set((state) => ({ milestones: [...state.milestones, data[0]] }));
        }
    },

    updateMilestone: async (id, updates) => {
        const { error } = await supabase.from('milestones').update(updates).eq('id', id);
        if (!error) {
            set((state) => ({
                milestones: state.milestones.map((m) => (m.id === id ? { ...m, ...updates } : m)),
            }));
        }
    },

    deleteMilestone: async (id) => {
        const { error } = await supabase.from('milestones').delete().eq('id', id);
        if (!error) {
            set((state) => ({
                milestones: state.milestones.filter((m) => m.id !== id),
            }));
        }
    },

    subscribeToMilestones: (projectId) => {
        const channel = supabase
            .channel(`public:milestones:${projectId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'milestones', filter: `project_id=eq.${projectId}` }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    set((state) => ({ milestones: [...state.milestones, payload.new as Milestone] }));
                } else if (payload.eventType === 'UPDATE') {
                    set((state) => ({
                        milestones: state.milestones.map((m) => (m.id === payload.new.id ? { ...m, ...payload.new } : m)),
                    }));
                } else if (payload.eventType === 'DELETE') {
                    set((state) => ({ milestones: state.milestones.filter((m) => m.id !== payload.old.id) }));
                }
            })
            .subscribe();

        return () => {
            void supabase.removeChannel(channel);
        };
    },
}));
