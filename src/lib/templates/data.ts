import type { TemplateConfig } from './types';

export const templates: TemplateConfig[] = [
    {
        slug: 'rpg-world',
        title: 'Ultimate RPG World Building Template | RealmForge',
        seoTitle: 'RPG World Building Template - Free Interactive Game Design Doc',
        description: 'Start your role-playing game with a professional GDD template. Includes world generation systems, character progression trees, and quest structures. Export to JSON/PDF.',
        keywords: ['rpg gdd template', 'role playing game design document', 'world building tools', 'interactive game design', 'rpg mechanics template'],
        heroHeadline: 'Forge Your Fantasy Realm',
        heroSubtext: 'A comprehensive, interactive framework for crafting deep RPG worlds, complex factions, and immersive storylines.',
        sections: [
            {
                id: 'core-mechanics',
                title: 'Core RPG Systems',
                content: `
### Foundations of Adventure
Every great RPG starts with a solid mechanical foundation. This template provides a pre-structured system for defining your game's core loop, whether it's turn-based tactical combat or real-time action.

- **Attribute Systems**: Define primary stats (Strength, Magic, Agility) and their derivative secondary stats (Evasion, Crit Chance).
- **Class Architectures**: innovative node-based class editors to visualize skill trees and progression paths.
- **Combat Logic**: Built-in combat flowcharts to map out turn phases, action economy, and status effect interactions.

Don't just write about your mechanics—simulate them. RealmForge allows you to link your attribute tables directly to your character sheets, ensuring that a change in base stats ripples through your entire design document instantly.
                `
            },
            {
                id: 'world-building',
                title: 'Immersive World Building',
                content: `
### Geography & Politics
A map is more than just graphics; it's a political landscape. Our RPG World Template includes dedicated sections for:

1.  **Biomes & Flora/Fauna**: Catalog ecosystem chains and resource distribution.
2.  **Faction Relations**: Interactive web graphs showing the dynamic relationships between guilds, kingdoms, and cults.
3.  **Economy Simulation**: Plan trade routes and scarcity mechanics that drive player conflict.

Use the integrated map annotation tools to place pins for key locators, linking them directly to their lore entries. No more flipping between pages to find out who rules the Iron City.
                `
            },
            {
                id: 'quest-design',
                title: 'Quest & Narrative Flow',
                content: `
### Weaving the Tale
Say goodbye to linear text documents. Design branching narratives with our node-based Story Graph editor.

- **Non-Linear Dialog**: Visualise conversation trees with conditionals and flags.
- **Quest Chains**: Map out prerequisites, failure states, and multi-stage objectives.
- **NPC Dossiers**: Deep character profiles with relationship matrices to the player and other NPCs.

This template anticipates the complexity of modern RPG storytelling, giving you the tools to manage thousands of lines of dialog without losing the thread of your plot.
                `
            }
        ],
        faq: [
            {
                question: "Is this template suitable for JRPGs?",
                answer: "Absolutely. The attribute and combat systems are highly flexible, allowing you to define party-based mechanics, limit breaks, and element tables common in JRPGs."
            },
            {
                question: "Can I export this to my engine?",
                answer: "Yes. RealmForge supports JSON and CSV exports, meaning your item tables, quest IDs, and dialogue trees can be imported directly into Unity, Unreal, or Godot."
            },
            {
                question: "Does it support multiplayer RPGs?",
                answer: "The template includes sections for server-side logic, networking replication strategies, and economy security, making it perfect for MMORPGs or co-op RPGs."
            }
        ],
        cta: {
            headline: "Ready to Build Your Legacy?",
            description: "Join thousands of game masters and designers using the RPG World Template to organize their chaos.",
            buttonText: "Start Building Free",
            href: "/signup?template=rpg-world"
        }
    },
    {
        slug: 'open-world',
        title: 'Open World Game Design Template | RealmForge',
        seoTitle: 'Open World Game Design Document Template - Interactive Sandbox Design',
        description: 'Master the scale of open world games. Plan emergent gameplay, streaming zones, and dynamic event systems with this specialized design template.',
        keywords: ['open world gdd', 'sandbox game design', 'emergent gameplay template', 'level streaming design', 'game world partitioning'],
        heroHeadline: 'Design Without Boundaries',
        heroSubtext: 'Structure your massive sandbox with tools built for scale. Manage zones, emergent systems, and content density efficiently.',
        sections: [
            {
                id: 'world-partitioning',
                title: 'Zone Management & Streaming',
                content: `
### Mastering Scale
Open worlds die when they feel empty. This template helps you manage content density across vast virtual kilometers.

- **Zone Blueprints**: Define the biome, difficulty level, and key landmarks for each sector.
- **Streaming Logic**: Document your technical approach to level of detail (LOD) and asset streaming boundaries.
- **Point of Interest (POI) Density**: Calculate travel times and engagement frequencies to ensure players always have something to discover.
                `
            },
            {
                id: 'emergent-gameplay',
                title: 'Emergent Systems Design',
                content: `
### The Living World
The best open worlds function without the player. Design systems that interact with each other to create unscripted chaos.

1.  **AI Faction Logic**: Define how NPCs behave when the player isn't watching. Patrol routes, schedule systems, and inter-faction skirmishes.
2.  **Dynamic Weather & Time**: Map out how rain, snow, or night cycles affect gameplay attributes like stealth or vehicle handling.
3.  **Economy & Ecology**: Create closed-loop systems where hunting depletes fauna, affecting predator populations and vendor prices.
                `
            },
            {
                id: 'traversal-mechanics',
                title: 'Traversal & Exploration',
                content: `
### Getting There is Half the Fun
How players move through your world defines their experience. This template focuses heavily on movement mechanics.

- **Vehicle Physics & Handling**: Sections for defining torque curves, terrain resistance, and damage models.
- **Parkour & Climbing**: Document interaction points, raycast logic for ledges, and stamina consumption rates.
- **Fast Travel Balance**: Design the strategic placement of travel nodes to respect the scale of your world while respecting player time.
                `
            }
        ],
        faq: [
            {
                question: "How does this help with technical performance?",
                answer: "The template encourages 'Technical Design' alongside creative design, providing sections for polygon budgets, draw distance limits, and entity counts per zone."
            },
            {
                question: "Can I use this for procedural generation?",
                answer: "Yes. The 'World Generation Rules' section allows you to define seed parameters, noise algorithms, and asset placement logic for proc-gen worlds."
            }
        ],
        cta: {
            headline: "Build Your Horizon",
            description: "Don't let the scope overwhelm you. Structure your open world ambition with RealmForge.",
            buttonText: "Create Open World Project",
            href: "/signup?template=open-world"
        }
    },
    {
        slug: 'survival',
        title: 'Survival Game GDD Template | RealmForge',
        seoTitle: 'Survival Game Design Document & Mechanics Template',
        description: 'Design the ultimate survival experience. Balance crafting recipes, vitals management, and base building mechanics with this specialized template.',
        keywords: ['survival game gdd', 'crafting system template', 'base building mechanics', 'vitals management design', 'inventory system gdd'],
        heroHeadline: 'Survive. Build. Thrive.',
        heroSubtext: 'The definitive framework for balancing scarcity, progression, and player agency in survival games.',
        sections: [
            {
                id: 'loop-design',
                title: 'The Survival Loop',
                content: `
### Balancing Scarcity
Survival games live or die by their core loop: Gather, Craft, Survive. This template provides calculators and spreadsheets to balance this delicate economy.

- **Vitals Decay Rates**: Precisely tune hunger, thirst, and fatigue depletion over time.
- **Resource Heatmaps**: Define where critical resources spawn and how dangerous it is to retrieve them.
- **Risk vs Reward**: Chart the progression of tool tiers against environmental hazards.
                `
            },
            {
                id: 'crafting-structure',
                title: 'Deep Crafting Systems',
                content: `
### From Stick to Fortress
Manage complex recipe trees without the headache.

1.  **Recipe Dependency Graphs**: Visualize which stations are required for which items, preventing progression locks.
2.  **Component Breakdown**: detailed item cards showing weight, stack size, durability, and salvage yield.
3.  **Building Physics**: Document stability algorithms, snap points, and structural integrity logic for base building.
                `
            }
        ],
        faq: [
            {
                question: "Does this handle multiplayer survival?",
                answer: "Yes, it includes sections for clan systems, territory control, and offline raid protection logic."
            }
        ],
        cta: {
            headline: "Can You Design Survival?",
            description: "Balance the harsh elements with rewarding progression. Start your documentation today.",
            buttonText: "Use Survival Template",
            href: "/signup?template=survival"
        }
    },
    {
        slug: 'horror',
        title: 'Horror Game Design Template | RealmForge',
        seoTitle: 'Horror Game GDD Template - Pacing & Atmosphere Design',
        description: 'Craft terrors that haunt. Use our Horror GDD template to structure pacing, jump scares, audio design, and psychological tension curves.',
        keywords: ['horror game gdd', 'scary game design document', 'pacing graph template', 'audio design for horror', 'monster ai behavior'],
        heroHeadline: 'Design the Dread',
        heroSubtext: 'A psychological framework for crafting fear, tension, and unforgettable atmosphere.',
        sections: [
            {
                id: 'tension-pacing',
                title: 'The Tension Curve',
                content: `
### Orchestrating Fear
Horror is rhythm. This template features our signature "Tension Graph" tool to map intensity over playtime.

- **Safe Zones vs Danger Zones**: Clearly delineate areas of respite and areas of threat.
- **Scare Budgeting**: Track the frequency of jump scares to ensure they remain impactful and don't desensitize the player.
- **Psychological Triggers**: Document the specific phobias and themes your game explores (isolation, claustrophobia, helplessness).
                `
            },
            {
                id: 'monster-design',
                title: 'Entity Engineering',
                content: `
### The Thing in the Dark
Design monsters that are more than just hitboxes.

1.  **AI Behavior States**: Define Stalking, Chasing, Searching, and Idle behaviors.
2.  **Audio Cues**: Map specific sounds to monster states to give players feedback without UI.
3.  **Lore & Origins**: Flesh out the backstory of your antagonists to make them tragic or truly evil.
                `
            }
        ],
        faq: [
            {
                question: "Is this for survival horror or psychological?",
                answer: "Both. The template has toggles to enable/disable combat mechanics depending on if you are making a Resident Evil style game or an Amnesia style one."
            }
        ],
        cta: {
            headline: "Make Them Scream",
            description: "Structure the nightmare. Build your horror masterpiece with precision.",
            buttonText: "Start Horror Project",
            href: "/signup?template=horror"
        }
    }
];
