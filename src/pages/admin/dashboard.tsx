import { useEffect } from 'react';
import { useAdminStore } from '../../lib/admin-store';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Loader2, Plus, Edit, Trash2, FileText, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/ui/badge';

export function AdminDashboard() {
    const { posts, fetchPosts, deletePost, loading } = useAdminStore();

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            await deletePost(id);
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Manage blog posts and SEO templates.</p>
                </div>
                <Button asChild>
                    <Link to="/admin/editor/new">
                        <Plus className="mr-2 h-4 w-4" /> Create New
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6">
                {posts.map((post) => (
                    <Card key={post.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    {post.title}
                                    <Badge variant={post.published ? "default" : "secondary"}>
                                        {post.published ? "Published" : "Draft"}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs font-normal">
                                        {post.type}
                                    </Badge>
                                </CardTitle>
                                <CardDescription>
                                    /{post.type === 'blog' ? 'blog' : 'templates'}/{post.slug}
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" asChild>
                                    <Link to={`/admin/editor/${post.id}`}>
                                        <Edit className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(post.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-500 mb-4 line-clamp-2">{post.excerpt || "No excerpt defined."}</p>
                            <div className="flex gap-4 text-xs text-slate-400">
                                <span className="flex items-center gap-1">
                                    <FileText className="w-3 h-3" /> Updated {new Date(post.updated_at).toLocaleDateString()}
                                </span>
                                {post.published && (
                                    <a href={`/${post.type === 'blog' ? 'blog' : 'templates'}/${post.slug}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-indigo-600">
                                        <Globe className="w-3 h-3" /> View Live
                                    </a>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {posts.length === 0 && (
                    <div className="text-center py-20 border border-dashed rounded-lg">
                        <p className="text-muted-foreground">No content posts found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
