import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { SEOHead } from '../../components/seo-head';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Link } from 'react-router-dom';
import { Calendar, Sparkles } from 'lucide-react';

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    cover_image: string | null;
    published_at: string;
    // author join
}

export function BlogIndex() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            const { data, error } = await supabase
                .from('content_posts')
                .select('id, title, slug, excerpt, cover_image, published_at')
                .eq('published', true)
                .eq('type', 'blog')
                .order('published_at', { ascending: false });

            if (!error && data) {
                setPosts(data as any);
            }
            setLoading(false);
        };
        fetchPosts();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <SEOHead
                title="RealmForge Blog - Game Design Insights"
                description="Articles, tutorials, and updates from the RealmForge team about game design, world building, and RPG mechanics."
            />

            {/* Navigation (Simple) */}
            <nav className="border-b border-slate-100 bg-white/80 backdrop-blur sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 font-bold text-slate-900 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <span>RealmForge</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-sm font-medium text-slate-900 hover:text-indigo-600">
                            Log In
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-4 py-12">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">The Forge Log</h1>
                    <p className="text-xl text-slate-600">Insights, updates, and techniques for modern game world building.</p>
                </div>

                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
                        {[1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-200 rounded-xl"></div>)}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map(post => (
                            <Link key={post.id} to={`/blog/${post.slug}`} className="group">
                                <Card className="h-full hover:shadow-lg transition-all border-slate-200 overflow-hidden">
                                    {post.cover_image && (
                                        <div className="h-48 w-full overflow-hidden">
                                            <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                    )}
                                    <div className={!post.cover_image ? "h-2 bg-indigo-600" : ""}></div>
                                    <CardHeader>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(post.published_at!).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </div>
                                        <CardTitle className="leading-tight group-hover:text-indigo-600 transition-colors">{post.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-slate-600 text-sm line-clamp-3">{post.excerpt}</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}

                {!loading && posts.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-slate-500">No articles published yet. Check back soon!</p>
                    </div>
                )}
            </main>
        </div>
    );
}
