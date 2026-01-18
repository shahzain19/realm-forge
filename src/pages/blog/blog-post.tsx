import { useEffect, useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { SEOHead } from '../../components/seo-head';
import { Loader2, ArrowLeft, Calendar, Sparkles } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';

export function BlogPostPage() {
    const { slug } = useParams<{ slug: string }>();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    // Read-only editor
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            LinkExtension.configure({ openOnClick: true })
        ],
        editable: false,
        content: '',
        editorProps: {
            attributes: {
                class: 'prose prose-lg prose-indigo max-w-none',
            },
        },
    });

    useEffect(() => {
        const fetchPost = async () => {
            if (!slug) return;

            const { data, error } = await supabase
                .from('content_posts')
                .select('*')
                .eq('slug', slug)
                .eq('published', true)
                .single();

            if (error || !data) {
                setNotFound(true);
            } else {
                setPost(data);
                editor?.commands.setContent(data.content);
            }
            setLoading(false);
        };
        fetchPost();
    }, [slug, editor]);

    // Handle updates when editor is finally ready
    useEffect(() => {
        if (post && editor && !editor.getText()) {
            editor.commands.setContent(post.content);
        }
    }, [post, editor]);

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;
    if (notFound) return <Navigate to="/blog" replace />;

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900">
            <SEOHead
                title={post.seo_title || post.title}
                description={post.seo_description || post.excerpt}
                keywords={post.keywords}
                ogImage={post.cover_image}
                type="article"
            />

            {/* Navigation */}
            <nav className="border-b border-slate-100 bg-white/80 backdrop-blur sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/blog" className="flex items-center gap-2 font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Blog</span>
                    </Link>
                    <Link to="/" className="flex items-center gap-2 font-bold text-slate-900">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                            <Sparkles className="h-4 w-4" />
                        </div>
                    </Link>
                </div>
            </nav>

            <article className="container mx-auto px-4 py-16 max-w-3xl">
                <header className="mb-12 text-center">
                    <div className="flex items-center justify-center gap-4 text-sm text-slate-500 mb-6">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(post.published_at!).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                        <span>•</span>
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                            {post.type}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-8">
                        {post.title}
                    </h1>
                    {post.cover_image && (
                        <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-lg mb-10">
                            <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
                        </div>
                    )}
                </header>

                <div className="prose prose-lg prose-slate prose-headings:font-bold prose-headings:tracking-tight prose-a:text-indigo-600 hover:prose-a:text-indigo-500 mx-auto">
                    <EditorContent editor={editor} />
                </div>
            </article>

            <footer className="border-t border-slate-100 mt-20 py-12 bg-slate-50">
                <div className="container mx-auto px-4 text-center">
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">Ready to build your world?</h3>
                    <p className="text-slate-600 mb-8">Join RealmForge today to start crafting your RPG masterpiece.</p>
                    <Link to="/signup" className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                        Get Started Free
                    </Link>
                </div>
            </footer>
        </div>
    );
}
