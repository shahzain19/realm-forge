import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react'

interface InvitationDetails {
    workspace_name: string;
}

interface AcceptInvitationResult {
    error?: string;
}

export function AcceptInvitation() {
    const { token } = useParams()
    const navigate = useNavigate()
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading')
    const [workspaceName, setWorkspaceName] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        async function validateAndAccept() {
            if (!token) return

            // 1. Get Invitation via RPC (to bypass RLS for workspace name)
            const { data, error: invError } = await supabase
                .rpc('get_invitation_details', { p_token: token })

            const invitation = data?.[0] as InvitationDetails | undefined

            if (invError || !invitation) {
                console.error("Invitation error:", invError)
                setStatus('invalid')
                return
            }

            setWorkspaceName(invitation.workspace_name)

            // 2. Check Auth
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setStatus('error')
                setError('You must be logged in to accept an invitation.')
                return
            }

            // 3. Accept Invitation via RPC (Atomically joins and marks invite as used)
            const { data: result, error: acceptError } = await supabase
                .rpc('accept_invitation', { p_token: token })

            const acceptResult = result as AcceptInvitationResult | null
            if (acceptError || acceptResult?.error) {
                console.error("Join error:", acceptError || acceptResult?.error)
                setError(acceptResult?.error || "Failed to join workspace")
                setStatus('error')
                return
            }

            setStatus('success')
        }

        validateAndAccept()
    }, [token, navigate])

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl border-t-4 border-primary">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Workspace Invitation</CardTitle>
                    <CardDescription>
                        {status === 'loading' && "Validating your invitation..."}
                        {status === 'success' && "You're in!"}
                        {status === 'invalid' && "This invitation is no longer valid or has expired."}
                        {status === 'error' && "Something went wrong."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center py-6">
                    {status === 'loading' && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
                    {status === 'success' && (
                        <div className="text-center space-y-4">
                            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                            <p className="font-medium text-lg">Joined {workspaceName}</p>
                            <p className="text-sm text-muted-foreground">You now have access to this workspace and all its projects.</p>
                        </div>
                    )}
                    {(status === 'invalid' || status === 'error') && (
                        <div className="text-center space-y-4">
                            <XCircle className="h-16 w-16 text-destructive mx-auto" />
                            <p className="text-sm text-muted-foreground">{error || "Please ask the administrator for a new link."}</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    {status === 'success' ? (
                        <Button className="w-full" onClick={() => navigate('/')}>
                            Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Link to="/" className="w-full">
                            <Button variant="outline" className="w-full">Back to Home</Button>
                        </Link>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
