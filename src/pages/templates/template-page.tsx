import { useParams, Navigate } from 'react-router-dom';
import { templates } from '../../lib/templates/data';
import { SEOHead } from '../../components/seo-head';
import { HeroSection, FeatureGrid, FAQAccordion, CTASection } from '../../components/templates/ui-parts';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TemplatePage() {
    const { slug } = useParams<{ slug: string }>();
    const template = templates.find(t => t.slug === slug);

    if (!template) {
        return <Navigate to="/" replace />;
    }

    // JSON-LD Structured Data
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": template.title,
        "applicationCategory": "GameApplication",
        "operatingSystem": "Web",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": template.description
    };

    const faqLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": template.faq.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
            }
        }))
    };

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900">
            <SEOHead
                title={template.seoTitle}
                description={template.description}
                keywords={template.keywords}
                canonicalUrl={`https://realm-forge-nine.vercel.app/templates/${template.slug}`}
                type="product"
            />

            {/* Inject Schema.org */}
            <script type="application/ld+json">
                {JSON.stringify(jsonLd)}
            </script>
            <script type="application/ld+json">
                {JSON.stringify(faqLd)}
            </script>

            {/* Navigation (Simple for Landing) */}
            <nav className="border-b border-slate-100 bg-white/80 backdrop-blur sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 font-bold text-slate-900 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <span>RealmForge</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link to="/" className="text-sm font-medium text-slate-500 hover:text-slate-900 hidden sm:block">
                            All Templates
                        </Link>
                        <Link to="/login" className="text-sm font-medium text-slate-900 hover:text-indigo-600">
                            Log In
                        </Link>
                    </div>
                </div>
            </nav>

            <main>
                <HeroSection
                    headline={template.heroHeadline}
                    subtext={template.heroSubtext}
                    ctaText={template.cta.buttonText}
                    ctaHref={template.cta.href}
                />

                <FeatureGrid sections={template.sections} />

                <FAQAccordion items={template.faq} />

                <CTASection
                    headline={template.cta.headline}
                    description={template.cta.description}
                    buttonText={template.cta.buttonText}
                    href={template.cta.href}
                />
            </main>

            <footer className="bg-white border-t border-slate-100 py-12">
                <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
                    <p className="mb-4">© {new Date().getFullYear()} RealmForge. All rights reserved.</p>
                    <div className="flex justify-center gap-6">
                        {templates.map(t => (
                            <Link key={t.slug} to={`/templates/${t.slug}`} className="hover:text-indigo-600 transition-colors">
                                {t.title.split('|')[0].trim()}
                            </Link>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
}
