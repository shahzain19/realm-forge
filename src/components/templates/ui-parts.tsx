import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export function HeroSection({ headline, subtext, ctaText, ctaHref }: { headline: string; subtext: string; ctaText: string; ctaHref: string; }) {
    return (
        <section className="relative py-20 lg:py-32 overflow-hidden bg-white">
            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl mx-auto text-center">
                    <Badge variant="secondary" className="mb-6 px-4 py-1 text-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100">
                        Professional Game Design Template
                    </Badge>
                    <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight mb-8 leading-[1.1]">
                        {headline}
                    </h1>
                    <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                        {subtext}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-12 rounded-full text-base font-semibold shadow-lg shadow-indigo-200 transition-all hover:scale-105" asChild>
                            <Link to={ctaHref}>
                                {ctaText} <ArrowRight className="ml-2 w-4 h-4" />
                            </Link>
                        </Button>
                        <Button variant="ghost" size="lg" className="text-slate-600 hover:text-slate-900 h-12 rounded-full">
                            View Live Demo
                        </Button>
                    </div>
                </div>
            </div>
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none opacity-40">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-3xl" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-50/50 rounded-full blur-3xl" />
            </div>
        </section>
    );
}

export function FeatureGrid({ sections }: { sections: { title: string, content: string }[] }) {
    return (
        <section className="py-24 bg-slate-50">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-3 gap-8">
                    {sections.map((section, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-6 font-bold text-xl">
                                {idx + 1}
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">{section.title}</h3>
                            <div className="prose prose-slate prose-sm text-slate-600 leading-relaxed">
                                {/* Simple Markdown Rendering support - basic replacement for lists and bold */}
                                {section.content.split('\n').map((line, i) => {
                                    if (line.startsWith('###')) return <h4 key={i} className="text-lg font-bold mt-4 mb-2">{line.replace('###', '')}</h4>;
                                    if (line.startsWith('-')) return <li key={i} className="list-disc ml-4 mb-1">{line.replace('-', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>;
                                    if (line.trim().length === 0) return <br key={i} />;
                                    // Handle bold in paragraph
                                    const parts = line.split(/(\*\*.*?\*\*)/g);
                                    return <p key={i} className="mb-2">
                                        {parts.map((part, j) => {
                                            if (part.startsWith('**') && part.endsWith('**')) {
                                                return <strong key={j}>{part.slice(2, -2)}</strong>;
                                            }
                                            return part;
                                        })}
                                    </p>;
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function FAQAccordion({ items }: { items: { question: string, answer: string }[] }) {
    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4 max-w-3xl">
                <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {items.map((item, idx) => (
                        <div key={idx} className="border border-slate-200 rounded-xl p-6 hover:border-indigo-200 transition-colors">
                            <h3 className="font-bold text-lg text-slate-900 mb-2 flex items-start gap-3">
                                <span className="bg-indigo-50 text-indigo-600 rounded-full w-6 h-6 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">?</span>
                                {item.question}
                            </h3>
                            <p className="text-slate-600 pl-9 leading-relaxed">{item.answer}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function CTASection({ headline, description, buttonText, href }: { headline: string; description: string; buttonText: string; href: string; }) {
    return (
        <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
            <div className="container mx-auto px-4 text-center relative z-10">
                <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-6">{headline}</h2>
                <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">{description}</p>
                <Button size="lg" className="bg-white text-indigo-900 hover:bg-slate-100 px-8 h-14 rounded-full text-lg font-bold" asChild>
                    <Link to={href}>{buttonText}</Link>
                </Button>
                <p className="mt-6 text-sm text-slate-500 flex items-center justify-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" /> Free Forever Tier • No Credit Card
                </p>
            </div>
            <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        </section>
    );
}
