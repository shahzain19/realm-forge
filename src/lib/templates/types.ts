export interface TemplateSection {
    id: string;
    title: string;
    content: string; // Markdown supported
}

export interface TemplateFAQ {
    question: string;
    answer: string;
}

export interface TemplateCTA {
    headline: string;
    description: string;
    buttonText: string;
    href: string;
}

export interface TemplateConfig {
    slug: string;
    title: string;          // Page Title
    seoTitle: string;       // <title> tag
    description: string;    // Meta description
    keywords: string[];     // Meta keywords
    heroHeadline: string;
    heroSubtext: string;
    heroImage?: string;     // Optional hero image path
    sections: TemplateSection[];
    faq: TemplateFAQ[];
    cta: TemplateCTA;
}
