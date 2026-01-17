import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'

interface AuthState {
    session: Session | null
    user: User | null
    loading: boolean
    initialize: () => Promise<void>
    signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
    session: null,
    user: null,
    loading: true,
    initialize: async () => {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession()
        set({ session, user: session?.user ?? null, loading: false })

        // Listen for changes
        supabase.auth.onAuthStateChange((_event, session) => {
            set({ session, user: session?.user ?? null, loading: false })
        })
    },
    signOut: async () => {
        await supabase.auth.signOut()
        set({ session: null, user: null })
    },
}))
