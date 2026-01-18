import { useEffect, useState } from "react"
import { useAdminStore } from "../../lib/admin-store"
import { useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"

export function AdminRoute({ children }: { children: React.ReactNode }) {
    const { isAdmin, checkAdminStatus, loading } = useAdminStore()
    const [checking, setChecking] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        checkAdminStatus().then((isAdm) => {
            setChecking(false)
            if (!isAdm) {
                navigate("/") // or /login?error=unauthorized
            }
        })
    }, [checkAdminStatus, navigate])

    if (loading || checking) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!isAdmin) return null

    return <>{children}</>
}
