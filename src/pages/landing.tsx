import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { useAuthStore } from "../lib/store"
import {
    Layout,
    Zap,
    Users,
    Globe,
    MousePointer2,
    Sparkles,
    Cpu,
    PenTool,
    Share2
} from "lucide-react"
import HeroArt from "../assets/images/hero-art.png"

export function LandingPage() {
    const { user } = useAuthStore()

    return (
        <div className="min-h-screen bg-white text-zinc-900 selection:bg-primary/10 overflow-x-hidden">
            {/* Header / Nav */}
            <nav className="fixed top-0 w-full z-50 glass-premium border-b border-zinc-100">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-heading font-black text-2xl tracking-tighter uppercase italic">RealmForge</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-bold text-zinc-500 uppercase tracking-widest">
                        <a href="#features" className="hover:text-primary transition-colors">Features</a>
                        <a href="#process" className="hover:text-primary transition-colors">Process</a>
                        <a href="#community" className="hover:text-primary transition-colors">Community</a>
                    </div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <Link to="/dashboard">
                                <Button className="h-11 px-6 font-bold rounded-xl">Portal</Button>
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="hidden sm:block">
                                    <Button variant="ghost" className="font-bold text-zinc-600">Enter</Button>
                                </Link>
                                <Link to="/signup">
                                    <Button className="h-11 px-6 font-bold rounded-xl shadow-xl shadow-primary/20">
                                        Join Beta
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <main>
                {/* Hero section */}
                <section className="relative pt-40 pb-20 lg:pt-60 lg:pb-40 overflow-hidden">
                    {/* Background elements */}
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent -z-10" />
                    <div className="absolute top-1/4 left-10 w-64 h-64 bg-primary/10 blur-[120px] rounded-full -z-10" />

                    <div className="container mx-auto px-6">
                        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                            <div className="flex-1 text-center lg:text-left z-10">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-10 shadow-2xl shadow-zinc-900/20">
                                    <Sparkles className="w-3 h-3 text-primary" />
                                    <span>V2.0 Collaborative Engine Live</span>
                                </div>
                                <h1 className="font-heading text-6xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-8 text-gradient">
                                    Forge Worlds. <br />
                                    <span className="relative">
                                        Ship Games.
                                        <div className="absolute -bottom-2 left-0 w-full h-3 bg-primary/20 -z-10 -rotate-1 rounded-full" />
                                    </span>
                                </h1>
                                <p className="text-xl text-zinc-500 mb-12 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                                    The industrial-grade workbench for narrative designers and world-builders.
                                    Real-time node mapping, semantic GDD tools, and instant logic visualization.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5">
                                    <Link to="/signup">
                                        <Button size="lg" className="h-16 px-10 text-xl font-black rounded-2xl shadow-2xl shadow-primary/30 transition-transform hover:scale-[1.02]">
                                            Open Your Forge
                                        </Button>
                                    </Link>
                                    <Link to="/login">
                                        <Button size="lg" variant="outline" className="h-16 px-10 text-xl font-bold bg-white/50 border-zinc-200 rounded-2xl hover:bg-zinc-50">
                                            Watch Trailer
                                        </Button>
                                    </Link>
                                </div>

                                <div className="mt-16 flex items-center justify-center lg:justify-start gap-8 opacity-40 grayscale group hover:grayscale-0 transition-all duration-500">
                                    <div className="text-sm font-black uppercase tracking-widest text-zinc-400">Trusted By</div>
                                    <div className="font-bold flex gap-10">
                                        <span className="italic">INDIE_X</span>
                                        <span className="tracking-tighter font-black">PROTO-STUDIO</span>
                                        <span className="underline decoration-primary decoration-4">FORGE.NET</span>
                                    </div>
                                </div>
                            </div>

                            {/* Floating UI Elements */}
                            <div className="flex-1 relative w-full max-w-2xl mx-auto lg:mx-0 order-first lg:order-last">
                                <div className="relative z-10 animate-float translate-x-4">
                                    <div className="p-2 rounded-[2.5rem] bg-zinc-200 ring-1 ring-zinc-200/50 shadow-2xl overflow-hidden">
                                        <div className="rounded-[2rem] overflow-hidden border-4 border-white shadow-inner">
                                            <img
                                                src={HeroArt}
                                                alt="World Forge Interface"
                                                className="w-full h-auto aspect-[4/3] object-cover"
                                            />
                                        </div>
                                    </div>

                                    {/* Floating stats card */}
                                    <div className="absolute -bottom-10 -left-10 glass-premium p-6 rounded-3xl shadow-2xl animate-float-delayed border-zinc-100 max-w-[200px]">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                                                <Users className="w-4 h-4 text-white" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Online</span>
                                        </div>
                                        <p className="text-2xl font-black tabular-nums">1,204</p>
                                        <p className="text-[10px] font-bold text-emerald-600">Architects crafting</p>
                                    </div>

                                    {/* Mouse pointer decoration */}
                                    <div className="absolute top-1/2 -right-6 animate-pulse-soft hidden md:block">
                                        <div className="flex items-center gap-2 bg-zinc-900 text-white px-3 py-1 rounded-full text-[10px] font-bold border border-white/20">
                                            <MousePointer2 className="w-3 h-3 text-primary fill-primary" />
                                            Alex is moving "Moon Gates"
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-primary/20 blur-[120px] -z-10 rounded-full scale-110 translate-y-20 opacity-50" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* The Forge Process Section */}
                <section id="process" className="py-32 relative bg-zinc-50 border-y border-zinc-100">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-24">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6">The Workflow</h2>
                            <h3 className="text-5xl lg:text-7xl font-black tracking-tighter mb-8 leading-tight">From Spark to Shipment.</h3>
                            <p className="text-xl text-zinc-500 font-medium italic">Your universe deserves more than a spreadsheet.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {[
                                { step: '01', title: 'Blueprint', desc: 'Draft initial concepts in our smart GDD editor.', icon: PenTool, color: 'text-blue-500' },
                                { step: '02', title: 'Survey', desc: 'Map locations and connections in real-time.', icon: Globe, color: 'text-emerald-500' },
                                { step: '03', title: 'Wire', desc: 'Define complex systems and RPG logic.', icon: Cpu, color: 'text-amber-500' },
                                { step: '04', title: 'Export', desc: 'Ship your world data directly to engines.', icon: Share2, color: 'text-purple-500' }
                            ].map((item, i) => (
                                <div key={i} className="group p-8 rounded-[2rem] bg-white border border-zinc-100 hover:border-primary/20 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 relative overflow-hidden">
                                    <div className="absolute -top-4 -right-4 text-8xl font-black text-zinc-50 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {item.step}
                                    </div>
                                    <div className={`w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center mb-10 group-hover:bg-primary transition-colors duration-500`}>
                                        <item.icon className="w-6 h-6 text-zinc-400 group-hover:text-white" />
                                    </div>
                                    <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">{item.step}</div>
                                    <h4 className="text-2xl font-black mb-4 tracking-tight">{item.title}</h4>
                                    <p className="text-zinc-500 font-medium text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Core Modules Grid */}
                <section id="features" className="py-32">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col lg:flex-row items-end justify-between mb-20 gap-8">
                            <div className="max-w-2xl">
                                <h2 className="text-5xl lg:text-7xl font-black tracking-tighter mb-4">Core Modules.</h2>
                                <p className="text-xl text-zinc-500 font-medium">Standardized tools for professional game designers.</p>
                            </div>
                            <Button variant="outline" className="h-14 px-8 rounded-xl font-bold border-zinc-200">View All Specs</Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                            {/* Feature 1 - World Mapping */}
                            <div className="md:col-span-8 group relative rounded-[3rem] bg-zinc-900 overflow-hidden text-white h-[450px]">
                                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
                                <div className="absolute inset-0 p-12 flex flex-col justify-end">
                                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-6">
                                        <Globe className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-4xl font-black mb-4 tracking-tighter">Spatial Node Map</h3>
                                    <p className="text-zinc-400 max-w-md font-medium">Interactive canvas to define territory, lore paths, and world-state dependencies. Collaborative by default.</p>
                                </div>
                                <div className="absolute top-10 right-10 scale-150 opacity-5 group-hover:opacity-20 transition-opacity duration-1000 rotate-12">
                                    <Globe className="w-96 h-96" />
                                </div>
                            </div>

                            {/* Feature 2 - Logic */}
                            <div className="md:col-span-4 rounded-[3rem] bg-zinc-100 overflow-hidden h-[450px] p-12 flex flex-col justify-between group border border-zinc-200 hover:border-primary/20 transition-colors">
                                <div className="w-12 h-12 rounded-xl bg-white shadow-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                                    <Cpu className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black mb-4 tracking-tighter text-zinc-900">Logic Designer</h3>
                                    <p className="text-zinc-500 font-medium">Design complex mechanics and IO interactions for systems balancing.</p>
                                </div>
                            </div>

                            {/* Feature 3 - GDD */}
                            <div className="md:col-span-4 rounded-[3rem] bg-white border border-zinc-200 overflow-hidden h-[450px] p-12 flex flex-col justify-between group hover:shadow-2xl transition-all">
                                <div className="w-12 h-12 rounded-xl bg-purple-500 text-white shadow-xl flex items-center justify-center">
                                    <Layout className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black mb-4 tracking-tighter text-zinc-900">Living GDD</h3>
                                    <p className="text-zinc-500 font-medium">Semantic markdown editor that links directly to your map nodes and systems.</p>
                                </div>
                            </div>

                            {/* Feature 4 - Realtime */}
                            <div className="md:col-span-8 group relative rounded-[3rem] bg-primary overflow-hidden text-white h-[450px]">
                                <div className="absolute inset-0 p-12 flex flex-col justify-center text-center items-center">
                                    <div className="w-16 h-16 rounded-2xl bg-white shadow-2xl flex items-center justify-center mb-8 animate-pulse-soft">
                                        <Zap className="w-8 h-8 text-primary" />
                                    </div>
                                    <h3 className="text-5xl font-black mb-6 tracking-tighter">Zero-Latency Sync</h3>
                                    <p className="text-zinc-100 max-w-lg font-medium opacity-80 leading-relaxed italic">
                                        "The feeling of building a world with your team in real-time is incomparable. RealmForge makes it feel like one shared brain."
                                    </p>
                                    <div className="mt-8 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/20" />
                                        <span className="text-sm font-black uppercase tracking-widest text-white/60">Lead Architect, Studio X</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats / Final CTA */}
                <section className="py-40 relative overflow-hidden bg-zinc-900">
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="grid grid-cols-10 h-full w-full">
                            {[...Array(100)].map((_, i) => (
                                <div key={i} className="border-[0.5px] border-white/20 aspect-square" />
                            ))}
                        </div>
                    </div>

                    <div className="container mx-auto px-6 text-center z-10 relative">
                        <h2 className="text-6xl lg:text-9xl font-black text-white tracking-tighter mb-12 leading-none">
                            Ready to <span className="text-primary italic">Export?</span>
                        </h2>
                        <p className="text-xl text-zinc-400 mb-16 max-w-2xl mx-auto font-medium">
                            Don't leave your lore in a scattered graveyard of folders. <br />
                            Forge the foundation of your legacy today.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link to="/signup">
                                <Button size="lg" className="h-20 px-12 text-2xl font-black rounded-3xl shadow-3xl shadow-primary/40 hover:scale-105 transition-transform">
                                    Start Forging Now
                                </Button>
                            </Link>
                        </div>

                        <div className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-white/10 pt-20">
                            {[
                                { val: '15k+', label: 'Nodes Created' },
                                { val: '2.4m', label: 'Words Authored' },
                                { val: '99.9%', label: 'Uptime' },
                                { val: '12ms', label: 'Sync Latency' }
                            ].map((stat, i) => (
                                <div key={i}>
                                    <div className="text-4xl font-black text-white mb-2 tabular-nums">{stat.val}</div>
                                    <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-20 border-t border-zinc-100 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
                        <div className="md:col-span-5">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                    <Zap className="w-6 h-6 text-white" />
                                </div>
                                <span className="font-heading font-black text-2xl tracking-tighter uppercase italic">RealmForge</span>
                            </div>
                            <p className="text-zinc-500 font-medium max-w-sm mb-10 leading-relaxed">
                                The industry standard workbench for world-building, and game narrative ecosystem. Built by designers, for designers.
                            </p>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-primary/10 transition-colors cursor-pointer group">
                                    <Users className="w-5 h-5 text-zinc-400 group-hover:text-primary" />
                                </div>
                                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-primary/10 transition-colors cursor-pointer group">
                                    <Globe className="w-5 h-5 text-zinc-400 group-hover:text-primary" />
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
                            <div>
                                <h5 className="font-black text-xs uppercase tracking-widest text-zinc-400 mb-8">Platform</h5>
                                <ul className="space-y-4 text-sm font-bold text-zinc-600">
                                    <li className="hover:text-primary transition-colors cursor-pointer">World Builder</li>
                                    <li className="hover:text-primary transition-colors cursor-pointer">Document Store</li>
                                    <li className="hover:text-primary transition-colors cursor-pointer">Logic Designer</li>
                                    <li className="hover:text-primary transition-colors cursor-pointer">Task Flow</li>
                                </ul>
                            </div>
                            <div>
                                <h5 className="font-black text-xs uppercase tracking-widest text-zinc-400 mb-8">Resources</h5>
                                <ul className="space-y-4 text-sm font-bold text-zinc-600">
                                    <li className="hover:text-primary transition-colors cursor-pointer">Documentation</li>
                                    <li className="hover:text-primary transition-colors cursor-pointer">API Reference</li>
                                    <li className="hover:text-primary transition-colors cursor-pointer">Showcase</li>
                                    <li className="hover:text-primary transition-colors cursor-pointer">Community</li>
                                </ul>
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <h5 className="font-black text-xs uppercase tracking-widest text-zinc-400 mb-8">Legal</h5>
                                <ul className="space-y-4 text-sm font-bold text-zinc-600">
                                    <li className="hover:text-primary transition-colors cursor-pointer">Privacy</li>
                                    <li className="hover:text-primary transition-colors cursor-pointer">Terms</li>
                                    <li className="hover:text-primary transition-colors cursor-pointer">License</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="pt-10 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">
                            © 2026 RealmForge Engine. All Rights Reserved.
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-[10px] font-black text-emerald-600 uppercase tracking-widest ring-1 ring-emerald-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Systems Operational
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
