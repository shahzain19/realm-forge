# 🌍 WorldForge Studio

**Collaborative workspace for designing game worlds, systems, and mechanics.**

WorldForge Studio is a focused ForgeHub-style platform exclusively for game developers. It replaces scattered tools (Notion, Discord, Google Docs, Miro) with a single structured workspace where teams design, document, visualize, and collaborate on game ideas — from concept to production-ready design documents.

---

# 🎯 Product Vision

## The Problem

Game development planning is fragmented:

* ❌ Design docs live in random documents
* ❌ World maps live in screenshots or whiteboards
* ❌ Systems are poorly documented
* ❌ New collaborators onboard slowly
* ❌ No single source of truth

Teams waste time syncing instead of building.

## The Solution

WorldForge Studio provides:

* 📁 A structured workspace for game projects
* 📝 Real-time collaborative GDD editing
* 🗺 Visual world mapping canvas
* ⚙️ Structured systems design
* 📤 Exportable production-ready documentation

One workspace. One source of truth. Built for game creators.

---

# 🧩 MVP Objective

The MVP must allow a small team to:

1. Create a project
2. Invite collaborators
3. Write a structured Game Design Document
4. Design a world map visually
5. Define core systems
6. Collaborate in realtime
7. Export the project

If this works smoothly, the product is already valuable.

---

# 🏗️ MVP Feature Scope

## 1. Authentication & Teams (Collaboration)
* **User Accounts**: Email/Password and OAuth (Google/GitHub) via Supabase.
* **Workspaces**: Users belong to a workspace/team.
* **Invitation System**:
    *   Generate unique, time-limited invite links.
    *   Admin interface to manage pending invites.
    *   Acceptance flow (sign up or sign in to join).
* **Roles & Permissions**:
    *   **Owner**: Full access, billing, team management.
    *   **Editor**: Can create and edit projects/docs.
    *   **Viewer**: Read-only access.
* **Presence**: See who is currently online in the workspace.

---

## 2. Project Workspace Structure

Each project contains predefined sections:

```
Project
 ├── Overview
 ├── GDD
 ├── World
 ├── Systems
 ├── Assets
 └── Notes
```

---

## 3. GDD Editor (Core)

Markdown-based editor with:

* Live preview
* Templates:

  * Core Loop
  * Player Mechanics
  * World Lore
  * Progression
  * Monetization (optional)
* Auto-save
* Basic version history

Purpose: Replace Notion / Docs for game design.

---

## 4. World Builder (Visual Canvas)

2D canvas tool:

* Create location nodes
* Connect nodes
* Attach notes per node
* Upload reference images
* Drag, zoom, pan

Purpose: Visualize maps, worlds, and progression flow.

---

## 5. Systems Designer

Structured system cards:

Each system includes:

* Name
* Description
* Inputs
* Outputs
* Dependencies
* Notes

Example systems:

* Combat
* Economy
* AI
* Crafting
* Progression

---

## 6. Realtime Collaboration & Sync

* **Multiplayer Cursors**: See other users' cursors in real-time on the GDD and World Canvas.
* **Live Text Editing**: Simultaneous editing in the GDD (Operational Transformation/CRDTs).
* **Object Locking**: Visual indicators when another user is editing a specific node or system card.
* **Awareness**: "Users in this document" avatar stack in the header.
* **Latency Handling**: Optimistic UI updates for instant feedback.
Powered by realtime sync engine.

---

## 7. Export

* Export GDD → Markdown / PDF
* Export World Map → PNG
* Export Systems → JSON / Markdown

Allows teams to ship docs into production pipelines.

---

# 🎨 Design Vision

## Visual Style

* Cozy, warm developer aesthetic
* Soft dark backgrounds
* Rounded cards
* Subtle shadows
* Comfortable spacing
* Minimal animation

Avoid corporate / Netflix-style UI.

---

## Typography

* Primary Font: Poppins
* Clear hierarchy
* Large readable headings

---

## Color Direction

* Dark zinc / neutral base
* Warm accent colors
* Muted highlights
* Low contrast eye strain

---

## Layout Principles

* Sidebar navigation
* Workspace canvas center
* Tool panels on edges
* Grid-based alignment
* Keyboard friendly

---

# 🧱 Technical Stack

Frontend:

* Vite
* React
* TypeScript
* Tailwind CSS
* Zustand

Backend:

* Supabase (auth, database, storage)

Realtime:

* Yjs / Liveblocks

Canvas:

* Konva / Fabric.js

Editors:

* TipTap or Monaco

---

# ⏱️ MVP Timeline (Target)

Week 1

* Auth
* Dashboard
* Project creation
* Layout system

Week 2

* GDD editor
* Autosave
* Templates

Week 3

* World canvas
* Node system
* Save / load

Week 4

* Systems designer
* Export
* Polish
* Deploy

---

# 🚀 Long-Term Expansion

* AI world generation
* Procedural tools
* Unity / Godot export
* Asset marketplace
* Freelancer hiring directly from projects
* Plugin ecosystem

WorldForge Studio becomes the creation engine feeding the freelancer marketplace ecosystem.
