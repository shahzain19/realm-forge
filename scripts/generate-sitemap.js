
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from .env
dotenv.config({ path: path.join(__dirname, '../.env') });

const BASE_URL = 'https://realm-forge-nine.vercel.app';

// Static Routes with Priority
const staticRoutes = [
    { url: '/', changefreq: 'weekly', priority: 1.0 },
    { url: '/login', changefreq: 'monthly', priority: 0.8 },
    { url: '/signup', changefreq: 'monthly', priority: 0.9 },
    // Templates
    { url: '/templates/rpg-world', changefreq: 'weekly', priority: 0.9 },
    { url: '/templates/open-world', changefreq: 'weekly', priority: 0.9 },
    { url: '/templates/survival', changefreq: 'weekly', priority: 0.9 },
    { url: '/templates/horror', changefreq: 'weekly', priority: 0.9 },
    // Public Blog Index
    { url: '/blog', changefreq: 'daily', priority: 0.9 },
];

async function generateSitemap() {
    console.log('🗺️ Generating Sitemap...');

    // 1. Initialize Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing Supabase environment variables. Skipping dynamic sitemap generation.');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. Fetch Blog Posts
    const { data: posts, error } = await supabase
        .from('content_posts')
        .select('slug, updated_at')
        .eq('published', true)
        .eq('type', 'blog');

    if (error) {
        console.error('❌ Error fetching posts:', error);
    }

    // 3. Build XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add Static Routes
    staticRoutes.forEach(route => {
        sitemap += `
    <url>
        <loc>${BASE_URL}${route.url}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>${route.changefreq}</changefreq>
        <priority>${route.priority}</priority>
    </url>`;
    });

    // Add Dynamic Blog Posts
    if (posts) {
        posts.forEach(post => {
            sitemap += `
    <url>
        <loc>${BASE_URL}/blog/${post.slug}</loc>
        <lastmod>${new Date(post.updated_at).toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`;
        });
    }

    sitemap += `
</urlset>`;

    // 4. Write to file
    const publicDir = path.join(__dirname, '../public');
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);

    console.log(`✅ Sitemap generated at ${path.join(publicDir, 'sitemap.xml')}`);
}

generateSitemap();
