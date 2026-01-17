import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { useAuthStore } from "../lib/store"
import { ChevronRight, Layout, Zap, Users, Shield, Globe } from "lucide-react"
import HeroArt from "../assets/images/hero-art.png"

export function LandingPage() {
    const { user } = useAuthStore()

    return (
        <div className="min-h-screen bg-background selection:bg-primary/10">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 glass border-b border-subtle">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <Zap className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="font-heading font-bold text-xl tracking-tight">RealmForge</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {user ? (
                            <Link to="/dashboard">
                                <Button>Go to Dashboard</Button>
                            </Link>
                        ) : (
                            <>
                                <Link to="/login">
                                    <Button variant="ghost">Sign In</Button>
                                </Link>
                                <Link to="/signup">
                                    <Button className="shadow-lg shadow-primary/20">Get Started</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <main>
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                    <div className="absolute inset-0 -z-10 bg-grid-white" />
                    <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

                    <div className="container mx-auto px-6">
                        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                            <div className="flex-1 text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-in fade-in slide-in-from-bottom-3 duration-700">
                                    <Shield className="w-4 h-4" />
                                    <span>Now in Beta</span>
                                    <ChevronRight className="w-4 h-4 opacity-50" />
                                </div>
                                <h1 className="font-heading text-5xl lg:text-7xl font-bold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
                                    Craft Your World, <br />
                                    <span className="text-primary italic">One Node</span> at a Time.
                                </h1>
                                <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
                                    The ultimate collaborative platform for world-builders, game designers, and storytellers. Visualize your universe with node-based mapping and integrated GDD tools.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-300">
                                    <Link to="/signup">
                                        <Button size="lg" className="h-14 px-8 text-lg shadow-xl shadow-primary/20">
                                            Start Forging Free
                                        </Button>
                                    </Link>
                                    <Link to="/login">
                                        <Button size="lg" variant="outline" className="h-14 px-8 text-lg glass">
                                            View Demo
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            <div className="flex-1 relative animate-in fade-in zoom-in duration-1000">
                                <div className="absolute inset-0 bg-primary/20 blur-3xl -z-10 rounded-full scale-75" />
                                <div className="relative rounded-2xl border border-white/40 shadow-2xl overflow-hidden glass">
                                    <img
                                        src={HeroArt}
                                        alt="World Forge Art"
                                        className="w-full h-auto aspect-square object-cover"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                                                <Layout className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="text-white text-sm">
                                                <p className="font-bold">Celestial Anvil</p>
                                                <p className="opacity-70">World Mapping Node #042</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-24 bg-zinc-50/50 relative border-y border-subtle">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="font-heading text-3xl lg:text-5xl font-bold mb-4">Everything You Need to Build</h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">From lore management to complex systems balancing, RealmForge handles the heavy lifting.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                {
                                    title: "Collaborative World Mapping",
                                    desc: "Define locations, routes, and dependencies with our intuitive node-based graph editor.",
                                    icon: Globe,
                                    color: "bg-blue-500"
                                },
                                {
                                    title: "Integrated GDD Editor",
                                    desc: "A powerful markdown-based editor for your Game Design Document, synced in real-time.",
                                    icon: Layout,
                                    color: "bg-purple-500"
                                },
                                {
                                    title: "Real-time Sync",
                                    desc: "Work with your team in real-time. Changes are saved instantly and broadcasted globally.",
                                    icon: Zap,
                                    color: "bg-amber-500"
                                },
                                {
                                    title: "Team Management",
                                    desc: "Invite collaborators, manage roles, and track project history seamlessly.",
                                    icon: Users,
                                    color: "bg-emerald-500"
                                },
                                {
                                    title: "Asset Library",
                                    desc: "Manage and reference your world's assets, images, and documents in one central place.",
                                    icon: Shield,
                                    color: "bg-rose-500"
                                },
                                {
                                    title: "Export Tools",
                                    desc: "Export your world data to JSON or PNG formats to integrate with your game engine.",
                                    icon: ChevronRight,
                                    color: "bg-indigo-500"
                                }
                            ].map((feature, i) => (
                                <div key={i} className="p-8 rounded-2xl bg-white border border-subtle shadow-sm hover:shadow-md transition-shadow group">
                                    <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                        <feature.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="font-heading text-xl font-bold mb-3">{feature.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 overflow-hidden relative">
                    <div className="absolute inset-0 bg-primary/5 -z-10" />
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="font-heading text-4xl lg:text-6xl font-bold mb-8">Ready to Forge Your Realm?</h2>
                        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">Join thousands of world-builders and start your journey today.</p>
                        <Link to="/signup">
                            <Button size="lg" className="h-16 px-12 text-xl shadow-2xl shadow-primary/30">
                                Create Your First Project
                            </Button>
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="py-12 border-t border-subtle">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-primary" />
                        <span className="font-heading font-bold text-lg">RealmForge</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        © 2026 RealmForge. Built for the dreamers.
                    </div>
                    <div className="flex gap-6">
                        <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Twitter</a>
                        <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Discord</a>
                        <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
