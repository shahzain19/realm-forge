import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../lib/admin-store';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';

export function AdminEditor() {
    const { id } = useParams(); // 'new' or UUID
    const navigate = useNavigate();
    const { posts, createPost, updatePost } = useAdminStore();

    // Local State
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [type, setType] = useState<'blog' | 'seo_template'>('blog');
    const [excerpt, setExcerpt] = useState('');
    const [seoTitle, setSeoTitle] = useState('');
    const [seoDesc, setSeoDesc] = useState('');
    const [published, setPublished] = useState(false);
    const [saving, setSaving] = useState(false);

    const isNew = id === 'new';

    // Editor Setup
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            Link.configure({ openOnClick: false })
        ],
        content: '',
        editorProps: {
            attributes: {
                class: 'prose prose-zinc max-w-none focus:outline-none min-h-[400px] border rounded-md p-4 bg-white',
            },
        },
    });

    // Load Data
    useEffect(() => {
        if (!isNew && id && posts.length > 0) {
            const post = posts.find(p => p.id === id);
            if (post) {
                setTitle(post.title);
                setSlug(post.slug);
                setType(post.type);
                setExcerpt(post.excerpt || '');
                setSeoTitle(post.seo_title || '');
                setSeoDesc(post.seo_description || '');
                setPublished(post.published);
                editor?.commands.setContent(post.content);
            }
        }
    }, [id, posts, isNew, editor]);

    const handleSave = async () => {
        if (!editor || !title || !slug) return;
        setSaving(true);

        const content = editor.getJSON();
        const postData = {
            title,
            slug,
            type,
            excerpt,
            seo_title: seoTitle,
            seo_description: seoDesc,
            published,
            content
        };

        if (isNew) {
            await createPost(postData);
            navigate('/admin');
        } else if (id) {
            await updatePost(id, postData);
            setSaving(false);
        }
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-5xl">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/admin')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <h1 className="text-2xl font-bold">{isNew ? 'Create Post' : 'Edit Post'}</h1>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save {published ? ' & Publish' : ' Draft'}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Editor */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-2">
                        <Label>Post Title</Label>
                        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter title..." className="text-lg font-semibold" />
                    </div>

                    <div className="space-y-2">
                        <Label>Content</Label>
                        <div className="min-h-[500px]">
                            <EditorContent editor={editor} />
                        </div>
                    </div>
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-6">
                    <div className="p-4 bg-slate-50 border rounded-lg space-y-4">
                        <h3 className="font-semibold text-sm text-slate-900">Publishing</h3>

                        <div className="space-y-2">
                            <Label>URL Slug</Label>
                            <Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="my-post-url" />
                        </div>

                        <div className="space-y-2">
                            <Label>Content Type</Label>
                            <select
                                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                value={type}
                                onChange={(e) => setType(e.target.value as any)}
                            >
                                <option value="blog">Blog Post</option>
                                <option value="seo_template">SEO Template</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between border-t pt-4">
                            <Label>Published Status</Label>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={published}
                                    onCheckedChange={setPublished}
                                />
                                <span className={published ? "text-emerald-600 font-semibold" : "text-slate-500"}>
                                    {published ? "Live" : "Draft"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 border rounded-lg space-y-4">
                        <h3 className="font-semibold text-sm text-slate-900">SEO Metadata</h3>

                        <div className="space-y-2">
                            <Label>SEO Title</Label>
                            <Input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder="Uses main title if empty" />
                        </div>

                        <div className="space-y-2">
                            <Label>Meta Description</Label>
                            <Textarea value={seoDesc} onChange={e => setSeoDesc(e.target.value)} placeholder="160 characters max..." rows={3} />
                        </div>

                        <div className="space-y-2">
                            <Label>Excerpt</Label>
                            <Textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="Short summary for list views..." rows={3} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
