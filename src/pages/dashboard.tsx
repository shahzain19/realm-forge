import { useEffect } from "react"
import { Link } from "react-router-dom"
import { DashboardLayout } from "../components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { useProjectStore } from "../lib/project-store"
import { CreateProjectDialog } from "../components/dashboard/create-project-dialog"
import { Loader2 } from "lucide-react"

export function Dashboard() {
    const { projects, loading, fetchProjects } = useProjectStore()

    useEffect(() => {
        fetchProjects()
    }, [fetchProjects])

    return (
        <DashboardLayout>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading && projects.length === 0 ? (
                    <div className="col-span-full flex justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <>
                        {projects.map((project) => (
                            <Card key={project.id} className="hover:bg-accent/50 transition-colors cursor-pointer group flex flex-col">
                                <CardHeader>
                                    <CardTitle>{project.name}</CardTitle>
                                    <CardDescription>
                                        Last updated {new Date(project.updated_at).toLocaleDateString()}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="aspect-video rounded-md bg-muted/50 mb-2 flex items-center justify-center text-muted-foreground text-sm">
                                        Map Preview
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {project.description || "No description"}
                                    </p>
                                </CardContent>
                                <CardFooter>
                                    <Link to={`/project/${project.id}`} className="w-full">
                                        <Button variant="secondary" className="w-full opacity-0 group-hover:opacity-100 transition-opacity">
                                            Open Studio
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        ))}

                        {/* Create Project Card */}
                        <Card className="hover:bg-accent/50 transition-colors cursor-pointer group opacity-60 min-h-[300px] border-dashed">
                            <CardHeader className="flex flex-row items-center justify-center h-full pt-6 p-0">
                                <CreateProjectDialog />
                            </CardHeader>
                        </Card>
                    </>
                )}
            </div>
        </DashboardLayout >
    )
}
