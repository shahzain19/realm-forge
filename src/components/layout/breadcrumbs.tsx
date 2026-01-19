import { ChevronRight, Home } from 'lucide-react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { useProjectStore } from '../../lib/project-store';
import { useEffect } from 'react';

export function Breadcrumbs() {
    const { projectId } = useParams();
    const location = useLocation();
    const { currentProject, fetchProject } = useProjectStore();

    useEffect(() => {
        if (projectId && (!currentProject || currentProject.id !== projectId)) {
            fetchProject(projectId);
        }
    }, [projectId, currentProject, fetchProject]);

    const pathSegments = location.pathname.split('/').filter(Boolean);

    const breadcrumbs = [];

    // Home
    breadcrumbs.push({
        label: 'Home',
        href: '/',
        icon: Home,
    });

    // Project
    if (projectId && currentProject) {
        breadcrumbs.push({
            label: currentProject.name || 'Project',
            href: `/project/${projectId}`,
        });

        // Sub-pages
        if (pathSegments.length > 2) {
            const subPage = pathSegments[2];
            const pageLabels: Record<string, string> = {
                'tasks': 'Tasks',
                'milestones': 'Milestones',
                'gdd': 'Game Design Doc',
                'docs': 'Project Docs',
                'world': 'World Map',
                'systems': 'Systems',
                'settings': 'Settings',
            };

            if (pageLabels[subPage]) {
                breadcrumbs.push({
                    label: pageLabels[subPage],
                    href: `/project/${projectId}/${subPage}`,
                });
            }
        }
    }

    return (
        <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
            {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center">
                    {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
                    <Link
                        to={crumb.href}
                        className="flex items-center hover:text-foreground transition-colors"
                    >
                        {crumb.icon && <crumb.icon className="h-4 w-4 mr-1" />}
                        <span className={index === breadcrumbs.length - 1 ? 'font-medium text-foreground' : ''}>
                            {crumb.label}
                        </span>
                    </Link>
                </div>
            ))}
        </nav>
    );
}
