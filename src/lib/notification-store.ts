import { create } from 'zustand'
import { supabase } from './supabase'

export interface Notification {
    id: string
    user_id: string
    title: string
    message: string
    type: string
    is_read: boolean
    created_at: string
}

interface NotificationState {
    notifications: Notification[]
    unreadCount: number
    loading: boolean
    fetchNotifications: () => Promise<void>
    markAsRead: (id: string) => Promise<void>
    markAllAsRead: () => Promise<void>
    subscribe: () => () => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    fetchNotifications: async () => {
        set({ loading: true })
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (!error && data) {
            set({
                notifications: data as Notification[],
                unreadCount: data.filter(n => !n.is_read).length,
                loading: false
            })
        } else {
            set({ loading: false })
        }
    },
    markAsRead: async (id: string) => {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)

        if (!error) {
            const updated = get().notifications.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            )
            set({
                notifications: updated,
                unreadCount: updated.filter(n => !n.is_read).length
            })
        }
    },
    markAllAsRead: async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false)

        if (!error) {
            const updated = get().notifications.map(n => ({ ...n, is_read: true }))
            set({
                notifications: updated,
                unreadCount: 0
            })
        }
    },
    subscribe: () => {
        const channel = supabase
            .channel('notifications-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications'
                },
                (payload) => {
                    const newNotif = payload.new as Notification
                    set((state) => ({
                        notifications: [newNotif, ...state.notifications],
                        unreadCount: state.unreadCount + 1
                    }))
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }
}))
