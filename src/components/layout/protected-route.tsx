import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../../lib/store"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
    children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, loading, initialize } = useAuthStore()
    const navigate = useNavigate()

    useEffect(() => {
        initialize()
    }, [initialize])

    useEffect(() => {
        if (!loading && !user) {
            navigate("/login")
        }
    }, [user, loading, navigate])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!user) return null

    return <>{children}</>
}
