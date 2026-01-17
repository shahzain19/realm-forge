import { useEffect } from 'react'
import { Bell, Check, Info, UserPlus, AlertTriangle } from 'lucide-react'
import { useNotificationStore } from '../../lib/notification-store'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { cn } from '../../lib/utils'

export function NotificationBell() {
    const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead, subscribe } = useNotificationStore()

    useEffect(() => {
        fetchNotifications()
        const unsubscribe = subscribe()
        return () => unsubscribe()
    }, [fetchNotifications, subscribe])

    const getIcon = (type: string) => {
        switch (type) {
            case 'invite_accepted': return <UserPlus className="h-4 w-4 text-blue-500" />
            case 'success': return <Check className="h-4 w-4 text-green-500" />
            case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />
            default: return <Info className="h-4 w-4 text-slate-500" />
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-accent/50 transition-colors">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] animate-in zoom-in"
                        >
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 shadow-2xl border-border bg-card/95 backdrop-blur-sm">
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <h3 className="font-bold text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                        <button
                            onClick={() => markAllAsRead()}
                            className="text-[10px] uppercase tracking-wider font-bold text-primary hover:underline"
                        >
                            Mark all read
                        </button>
                    )}
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                            <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                            No notifications yet
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <DropdownMenuItem
                                key={n.id}
                                className={cn(
                                    "p-4 flex flex-col items-start gap-1 cursor-pointer transition-colors",
                                    !n.is_read ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-accent/50"
                                )}
                                onClick={() => markAsRead(n.id)}
                            >
                                <div className="flex items-center gap-2 w-full">
                                    {getIcon(n.type)}
                                    <span className={cn("text-xs font-bold", !n.is_read ? "text-foreground" : "text-muted-foreground")}>
                                        {n.title}
                                    </span>
                                    {!n.is_read && <div className="ml-auto h-2 w-2 rounded-full bg-primary" />}
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                                    {n.message}
                                </p>
                                <span className="text-[10px] text-muted-foreground/60 mt-1 pl-6">
                                    {new Date(n.created_at).toLocaleString()}
                                </span>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
