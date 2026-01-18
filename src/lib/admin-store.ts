import { create } from 'zustand';
import { supabase } from './supabase';

export interface ContentPost {
    id: string;
    slug: string;
    title: string;
    type: 'blog' | 'seo_template';
    excerpt?: string;
    content: any; // JSONB
    cover_image?: string;
    seo_title?: string;
    seo_description?: string;
    published: boolean;
    published_at?: string;
    author_id: string;
    created_at: string;
    updated_at: string;
}

interface AdminState {
    isAdmin: boolean;
    loading: boolean;
    posts: ContentPost[];

    checkAdminStatus: () => Promise<boolean>;
    fetchPosts: () => Promise<void>;
    createPost: (post: Partial<ContentPost>) => Promise<ContentPost | null>;
    updatePost: (id: string, updates: Partial<ContentPost>) => Promise<void>;
    deletePost: (id: string) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
    isAdmin: false,
    loading: true,
    posts: [],

    checkAdminStatus: async () => {
        set({ loading: true });
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            set({ isAdmin: false, loading: false });
            return false;
        }

        const { data, error } = await supabase.rpc('is_admin');
        const isAdmin = !!data && !error;
        console.log("Admin Check:", isAdmin);

        set({ isAdmin, loading: false });
        return isAdmin;
    },

    fetchPosts: async () => {
        const { data, error } = await supabase
            .from('content_posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error(error);
        set({ posts: data || [] });
    },

    createPost: async (post) => {
        const { data, error } = await supabase
            .from('content_posts')
            .insert([{
                ...post,
                author_id: (await supabase.auth.getUser()).data.user?.id
            }])
            .select()
            .single();

        if (error) {
            console.error(error);
            return null;
        }

        set({ posts: [data, ...get().posts] });
        return data;
    },

    updatePost: async (id, updates) => {
        const { error } = await supabase
            .from('content_posts')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) {
            console.error(error);
            return;
        }

        set({ posts: get().posts.map(p => p.id === id ? { ...p, ...updates } : p) });
    },

    deletePost: async (id) => {
        const { error } = await supabase
            .from('content_posts')
            .delete()
            .eq('id', id);

        if (error) {
            console.error(error);
            return;
        }

        set({ posts: get().posts.filter(p => p.id !== id) });
    }
}));
