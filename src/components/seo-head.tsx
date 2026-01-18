import { useEffect } from 'react';

interface SEOHeadProps {
    title: string;
    description: string;
    keywords?: string[];
    canonicalUrl?: string;
    ogImage?: string;
    type?: string;
    schema?: Record<string, any>;
}

export function SEOHead({ title, description, keywords, canonicalUrl, ogImage, type = 'website', schema }: SEOHeadProps) {
    useEffect(() => {
        // Title
        document.title = title;

        // ... existing meta logic ...
        // Helper to set meta tag
        const setMeta = (name: string, content: string) => {
            let element = document.querySelector(`meta[name="${name}"]`);
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute('name', name);
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        };

        // Helper to set OG tag
        const setOg = (property: string, content: string) => {
            let element = document.querySelector(`meta[property="${property}"]`);
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute('property', property);
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        };

        // Description
        setMeta('description', description);

        // Keywords
        if (keywords && keywords.length > 0) {
            setMeta('keywords', keywords.join(', '));
        }

        // Open Graph
        setOg('og:title', title);
        setOg('og:description', description);
        setOg('og:type', type);
        if (ogImage) setOg('og:image', ogImage);
        if (canonicalUrl) setOg('og:url', canonicalUrl);

        // Twitter Card
        setMeta('twitter:card', 'summary_large_image');
        setMeta('twitter:title', title);
        setMeta('twitter:description', description);
        if (ogImage) setMeta('twitter:image', ogImage);

        // Canonical Link
        if (canonicalUrl) {
            let link = document.querySelector(`link[rel="canonical"]`);
            if (!link) {
                link = document.createElement('link');
                link.setAttribute('rel', 'canonical');
                document.head.appendChild(link);
            }
            link.setAttribute('href', canonicalUrl);
        }

        // Schema.org JSON-LD
        if (schema) {
            let script = document.querySelector(`script[type="application/ld+json"]`);
            if (!script) {
                script = document.createElement('script');
                script.setAttribute('type', 'application/ld+json');
                document.head.appendChild(script);
            }
            script.textContent = JSON.stringify(schema);
        }

    }, [title, description, keywords, canonicalUrl, ogImage, type, schema]);

    return null; // This component handles side effects only
}
