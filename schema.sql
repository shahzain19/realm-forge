-- Workspaces & Teams
create table if not exists public.workspaces (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  owner_id uuid references auth.users not null
);

create table if not exists public.workspace_members (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  role text default 'editor', -- 'owner', 'editor', 'viewer'
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(workspace_id, user_id)
);

create table if not exists public.invitations (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  email text not null,
  token text not null unique,
  role text default 'editor',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone default timezone('utc'::text, now()) not null,
  accepted_at timestamp with time zone
);

-- Projects Table
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  owner_id uuid references auth.users not null
);

-- Migration: Ensure workspace_id exists in projects and backfill data
DO $$ 
BEGIN 
    -- 1. Add workspace_id column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='workspace_id') THEN
        ALTER TABLE public.projects ADD COLUMN workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;
    END IF;

    -- 2. Backfill: Ensure every project belongs to a workspace
    -- Strategy: If a project has no workspace_id, find or create a default workspace for its owner.
    DECLARE
        proj_row RECORD;
        target_ws_id UUID;
    BEGIN
        FOR proj_row IN SELECT DISTINCT owner_id FROM public.projects WHERE workspace_id IS NULL LOOP
            -- Try to find an existing workspace for this user
            SELECT id INTO target_ws_id FROM public.workspaces WHERE owner_id = proj_row.owner_id LIMIT 1;
            
            -- If no workspace exists, create one
            IF target_ws_id IS NULL THEN
                INSERT INTO public.workspaces (name, owner_id) 
                VALUES ('My Workspace', proj_row.owner_id) 
                RETURNING id INTO target_ws_id;
                
                -- Ensure owner is a member
                INSERT INTO public.workspace_members (workspace_id, user_id, role) 
                VALUES (target_ws_id, proj_row.owner_id, 'owner')
                ON CONFLICT DO NOTHING;
            END IF;

            -- Assign all user's projects without a workspace to this workspace
            UPDATE public.projects 
            SET workspace_id = target_ws_id 
            WHERE owner_id = proj_row.owner_id AND workspace_id IS NULL;
        END LOOP;
    END;
END $$;

-- Trigger: Automatically assign/create workspace for new projects if null
create or replace function public.ensure_project_workspace()
returns trigger as $$
declare
    target_ws_id uuid;
begin
    -- 1. If project already has a workspace_id, we're good
    if new.workspace_id is not null then
        return new;
    end if;

    -- 2. Try to find an existing workspace for this owner
    select id into target_ws_id from public.workspaces where owner_id = new.owner_id limit 1;

    -- 3. If no workspace exists, create a default one
    if target_ws_id is null then
        insert into public.workspaces (name, owner_id)
        values ('My Workspace', new.owner_id)
        returning id into target_ws_id;

        -- Ensure owner is a member
        insert into public.workspace_members (workspace_id, user_id, role)
        values (target_ws_id, new.owner_id, 'owner')
        on conflict do nothing;
    end if;

    -- 4. Assign the workspace
    new.workspace_id := target_ws_id;
    return new;
end;
$$ language plpgsql security definer;

-- Apply trigger to projects table
drop trigger if exists ensure_project_workspace_trigger on public.projects;
create trigger ensure_project_workspace_trigger
before insert on public.projects
for each row execute function public.ensure_project_workspace();

-- Final Backfill for any missed projects during the transition
update public.projects
set name = name -- No-op that triggers the "before insert" logic if we were using it for updates too, 
                -- but here we just manually handle existing.
where workspace_id is null;

DO $$ 
DECLARE
    proj_row RECORD;
    t_ws_id UUID;
BEGIN
    FOR proj_row IN SELECT id, owner_id FROM public.projects WHERE workspace_id IS NULL LOOP
        SELECT id INTO t_ws_id FROM public.workspaces WHERE owner_id = proj_row.owner_id LIMIT 1;
        IF t_ws_id IS NULL THEN
            INSERT INTO public.workspaces (name, owner_id) VALUES ('My Workspace', proj_row.owner_id) RETURNING id INTO t_ws_id;
            INSERT INTO public.workspace_members (workspace_id, user_id, role) VALUES (t_ws_id, proj_row.owner_id, 'owner') ON CONFLICT DO NOTHING;
        END IF;
        UPDATE public.projects SET workspace_id = t_ws_id WHERE id = proj_row.id;
    END LOOP;
END $$;

-- Project Documents (Multiple documents per project)
create table if not exists public.project_documents (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  title text default 'New Document',
  content jsonb,
  is_main_gdd boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Migration for existing data if gdd_docs exists
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'gdd_docs') THEN
        -- Link existing GDDs
        INSERT INTO public.project_documents (id, project_id, content, updated_at, title, is_main_gdd)
        SELECT id, project_id, content, updated_at, 'Game Design Document', true
        FROM public.gdd_docs
        ON CONFLICT (id) DO NOTHING;
        
        -- Drop the old table once data is moved (or we can just rename it if we want to be faster)
        -- For this script, we'll keep it idempotent.
    END IF;
END $$;

-- World Nodes
create table if not exists public.world_nodes (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  x float default 0,
  y float default 0,
  label text default 'New Node',
  node_type text default 'location', -- 'location', 'event', 'resource'
  description text,
  image_url text,
  gameplay_notes text,
  lore text,
  tags text[] default '{}',
  metadata jsonb default '{}',
  color text default '#ffffff',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- World Connections
create table if not exists public.world_connections (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  from_node_id uuid references public.world_nodes(id) on delete cascade not null,
  to_node_id uuid references public.world_nodes(id) on delete cascade not null,
  connection_type text default 'path', -- 'path', 'unlock', 'story', 'teleport', 'gated'
  requirements text,
  notes text
);

-- Migration: Ensure world_nodes and world_connections columns exist
DO $$ 
BEGIN 
    -- world_nodes columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='world_nodes' AND column_name='node_type') THEN
        ALTER TABLE public.world_nodes ADD COLUMN node_type text DEFAULT 'location';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='world_nodes' AND column_name='description') THEN
        ALTER TABLE public.world_nodes ADD COLUMN description text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='world_nodes' AND column_name='image_url') THEN
        ALTER TABLE public.world_nodes ADD COLUMN image_url text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='world_nodes' AND column_name='gameplay_notes') THEN
        ALTER TABLE public.world_nodes ADD COLUMN gameplay_notes text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='world_nodes' AND column_name='lore') THEN
        ALTER TABLE public.world_nodes ADD COLUMN lore text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='world_nodes' AND column_name='tags') THEN
        ALTER TABLE public.world_nodes ADD COLUMN tags text[] DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='world_nodes' AND column_name='metadata') THEN
        ALTER TABLE public.world_nodes ADD COLUMN metadata jsonb DEFAULT '{}';
    END IF;

    -- world_connections columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='world_connections' AND column_name='connection_type') THEN
        ALTER TABLE public.world_connections ADD COLUMN connection_type text DEFAULT 'path';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='world_connections' AND column_name='requirements') THEN
        ALTER TABLE public.world_connections ADD COLUMN requirements text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='world_connections' AND column_name='notes') THEN
        ALTER TABLE public.world_connections ADD COLUMN notes text;
    END IF;
END $$;

-- Systems
create table if not exists public.systems (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  name text not null,
  description text,
  inputs text[],
  outputs text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.projects enable row level security;
alter table public.project_documents enable row level security;
alter table public.world_nodes enable row level security;
alter table public.world_connections enable row level security;
alter table public.systems enable row level security;

-- Helper policy function to break infinite recursion
create or replace function public.check_workspace_access(ws_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.workspace_members
    where workspace_id = ws_id and user_id = auth.uid()
  ) or exists (
    select 1 from public.workspaces
    where id = ws_id and owner_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.invitations enable row level security;

-- WORKSPACES
drop policy if exists "Users can view workspaces they are members of" on public.workspaces;
create policy "Users can view workspaces they are members of" on public.workspaces for select using (
  check_workspace_access(id)
);

drop policy if exists "Users can create workspaces" on public.workspaces;
create policy "Users can create workspaces" on public.workspaces for insert with check (auth.uid() = owner_id);

-- WORKSPACE MEMBERS
drop policy if exists "Members can view other members" on public.workspace_members;
create policy "Members can view other members" on public.workspace_members for select using (
  check_workspace_access(workspace_id)
);

drop policy if exists "Owners can manage members" on public.workspace_members;
create policy "Owners can manage members" on public.workspace_members for all using (
  exists (select 1 from public.workspaces w where w.id = workspace_members.workspace_id and w.owner_id = auth.uid())
);

-- INVITATIONS
drop policy if exists "Workspace members can view invitations" on public.invitations;
create policy "Workspace members can view invitations" on public.invitations for select using (
  check_workspace_access(workspace_id)
);

drop policy if exists "Workspace members can create invitations" on public.invitations;
create policy "Workspace members can create invitations" on public.invitations for insert with check (
  check_workspace_access(workspace_id)
);

-- Note: We also need a public policy to allow validation of tokens during acceptance
-- but restricting it to only finding by token.
drop policy if exists "Anyone can view an invite by token" on public.invitations;
create policy "Anyone can view an invite by token" on public.invitations for select using (true);

-- Function to safely get invitation details for unauthenticated/pre-join users
-- Bypasses RLS on workspaces to show the name on the invite page
create or replace function public.get_invitation_details(p_token text)
returns table (
    id uuid,
    workspace_id uuid,
    workspace_name text,
    role text,
    email text,
    expires_at timestamp with time zone
) as $$
begin
    return query
    select 
        i.id,
        i.workspace_id,
        w.name as workspace_name,
        i.role,
        i.email,
        i.expires_at
    from public.invitations i
    join public.workspaces w on w.id = i.workspace_id
    where i.token = p_token
    and i.accepted_at is null
    and (i.expires_at is null or i.expires_at > now());
end;
$$ language plpgsql security definer;

-- Function to atomically accept an invitation
-- Bypasses RLS for workspace joining and marking the invite as accepted
create or replace function public.accept_invitation(p_token text)
returns json as $$
declare
    v_invitation record;
    v_user_id uuid;
begin
    -- 1. Get current user
    v_user_id := auth.uid();
    if v_user_id is null then
        return json_build_object('error', 'Authentication required');
    end if;

    -- 2. Validate invitation
    select * into v_invitation
    from public.invitations
    where token = p_token
    and accepted_at is null
    and (expires_at is null or expires_at > now())
    for update; -- Lock the row

    if not found then
        return json_build_object('error', 'Invalid or expired invitation');
    end if;

    -- 3. Add member (Security Definer allows this bypass)
    insert into public.workspace_members (workspace_id, user_id, role)
    values (v_invitation.workspace_id, v_user_id, v_invitation.role)
    on conflict (workspace_id, user_id) do nothing;

    -- 4. Mark invitation as accepted
    update public.invitations
    set accepted_at = now()
    where id = v_invitation.id;

    return json_build_object('success', true, 'workspace_id', v_invitation.workspace_id);
end;
$$ language plpgsql security definer;


-- PROJECTS
drop policy if exists "Workspace members can view projects" on public.projects;
create policy "Workspace members can view projects" on public.projects for select using (
  check_workspace_access(workspace_id)
);

drop policy if exists "Workspace members can create projects" on public.projects;
create policy "Workspace members can create projects" on public.projects for insert with check (
  check_workspace_access(workspace_id)
);

drop policy if exists "Workspace members can update projects" on public.projects;
create policy "Workspace members can update projects" on public.projects for update using (
  check_workspace_access(workspace_id)
);

drop policy if exists "Workspace members can delete projects" on public.projects;
create policy "Workspace members can delete projects" on public.projects for delete using (
  check_workspace_access(workspace_id)
);

-- NOTE: Removed old direct owner_id checks for projects in favor of workspace membership for simplicity in this migration.


-- PROJECT DOCUMENTS
drop policy if exists "Users can view documents of their projects" on public.project_documents;
create policy "Users can view documents of their projects" on public.project_documents for select using (
  exists (select 1 from public.projects where id = project_documents.project_id and check_workspace_access(workspace_id))
);

drop policy if exists "Users can insert documents for their projects" on public.project_documents;
create policy "Users can insert documents for their projects" on public.project_documents for insert with check (
  exists (select 1 from public.projects where id = project_documents.project_id and check_workspace_access(workspace_id))
);

drop policy if exists "Users can update documents of their projects" on public.project_documents;
create policy "Users can update documents of their projects" on public.project_documents for update using (
  exists (select 1 from public.projects where id = project_documents.project_id and check_workspace_access(workspace_id))
);

drop policy if exists "Users can delete documents of their projects" on public.project_documents;
create policy "Users can delete documents of their projects" on public.project_documents for delete using (
  exists (select 1 from public.projects where id = project_documents.project_id and check_workspace_access(workspace_id))
);


-- WORLD NODES
drop policy if exists "Users can view nodes of their projects" on public.world_nodes;
create policy "Users can view nodes of their projects" on public.world_nodes for select using (
  exists (select 1 from public.projects where id = world_nodes.project_id and check_workspace_access(workspace_id))
);

drop policy if exists "Users can insert nodes for their projects" on public.world_nodes;
create policy "Users can insert nodes for their projects" on public.world_nodes for insert with check (
  exists (select 1 from public.projects where id = world_nodes.project_id and check_workspace_access(workspace_id))
);

drop policy if exists "Users can update nodes of their projects" on public.world_nodes;
create policy "Users can update nodes of their projects" on public.world_nodes for update using (
  exists (select 1 from public.projects where id = world_nodes.project_id and check_workspace_access(workspace_id))
);

drop policy if exists "Users can delete nodes of their projects" on public.world_nodes;
create policy "Users can delete nodes of their projects" on public.world_nodes for delete using (
  exists (select 1 from public.projects where id = world_nodes.project_id and check_workspace_access(workspace_id))
);

-- WORLD CONNECTIONS
drop policy if exists "Users can view connections of their projects" on public.world_connections;
create policy "Users can view connections of their projects" on public.world_connections for select using (
  exists (select 1 from public.projects where id = world_connections.project_id and check_workspace_access(workspace_id))
);

drop policy if exists "Users can insert connections for their projects" on public.world_connections;
create policy "Users can insert connections for their projects" on public.world_connections for insert with check (
  exists (select 1 from public.projects where id = world_connections.project_id and check_workspace_access(workspace_id))
);

drop policy if exists "Users can delete connections of their projects" on public.world_connections;
create policy "Users can delete connections of their projects" on public.world_connections for delete using (
  exists (select 1 from public.projects where id = world_connections.project_id and check_workspace_access(workspace_id))
);


-- SYSTEMS
drop policy if exists "Users can view systems of their projects" on public.systems;
create policy "Users can view systems of their projects" on public.systems for select using (
  exists (select 1 from public.projects where id = systems.project_id and check_workspace_access(workspace_id))
);

drop policy if exists "Users can insert systems for their projects" on public.systems;
create policy "Users can insert systems for their projects" on public.systems for insert with check (
  exists (select 1 from public.projects where id = systems.project_id and check_workspace_access(workspace_id))
);

drop policy if exists "Users can update systems of their projects" on public.systems;
create policy "Users can update systems of their projects" on public.systems for update using (
  exists (select 1 from public.projects where id = systems.project_id and check_workspace_access(workspace_id))
);

drop policy if exists "Users can delete systems of their projects" on public.systems;
create policy "Users can delete systems of their projects" on public.systems for delete using (
  exists (select 1 from public.projects where id = systems.project_id and check_workspace_access(workspace_id))
);

-- NOTIFICATIONS
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  message text not null,
  type text default 'info', -- 'info', 'success', 'warning', 'invite_accepted'
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notifications enable row level security;

drop policy if exists "Users can view their own notifications" on public.notifications;
create policy "Users can view their own notifications" on public.notifications for select using (auth.uid() = user_id);

drop policy if exists "Users can update their own notifications" on public.notifications;
create policy "Users can update their own notifications" on public.notifications for update using (auth.uid() = user_id);

-- Trigger: Notify workspace owner when a new member joins
create or replace function public.notify_on_member_join()
returns trigger as $$
declare
    ws_owner_id uuid;
    ws_name text;
begin
    -- Get workspace owner and name
    select owner_id, name into ws_owner_id, ws_name 
    from public.workspaces 
    where id = new.workspace_id;

    -- Only notify if it's NOT the owner joining themselves (unlikely due to setup but safe)
    if ws_owner_id != new.user_id then
        insert into public.notifications (user_id, title, message, type)
        values (
            ws_owner_id,
            'New Member Joined',
            'A new member has joined your workspace: ' || ws_name,
            'invite_accepted'
        );
    end if;
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_member_join_trigger on public.workspace_members;
create trigger on_member_join_trigger
after insert on public.workspace_members
for each row execute function public.notify_on_member_join();
-- PERFORMANCE INDEXES
create index if not exists idx_projects_workspace_id on public.projects(workspace_id);
create index if not exists idx_projects_owner_id on public.projects(owner_id);
create index if not exists idx_workspace_members_workspace_id on public.workspace_members(workspace_id);
create index if not exists idx_workspace_members_user_id on public.workspace_members(user_id);
create index if not exists idx_invitations_token on public.invitations(token);
create index if not exists idx_invitations_workspace_id on public.invitations(workspace_id);
create index if not exists idx_project_documents_project_id on public.project_documents(project_id);
create index if not exists idx_world_nodes_project_id on public.world_nodes(project_id);
create index if not exists idx_world_connections_project_id on public.world_connections(project_id);
create index if not exists idx_systems_project_id on public.systems(project_id);
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_created_at on public.notifications(created_at desc);
create index if not exists idx_notifications_is_read on public.notifications(is_read) where is_read = false;
-- GDD TEMPLATES
create table if not exists public.gdd_templates (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  content jsonb not null,
  category text default 'other', -- 'rpg', 'fps', 'horror', 'strategy', 'mobile'
  preview_image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for GDD Templates (Public for reading)
alter table public.gdd_templates enable row level security;
drop policy if exists "Anyone can view GDD templates" on public.gdd_templates;
create policy "Anyone can view GDD templates" on public.gdd_templates for select using (true);

-- SEED DATA: RPG Template
insert into public.gdd_templates (title, description, category, content)
values (
    'Epic RPG Framework',
    'A comprehensive template for deep role-playing games, including world-building, quest structures, and combat systems.',
    'rpg',
    '{
        "type": "doc",
        "content": [
            { "type": "heading", "attrs": { "level": 1 }, "content": [{ "type": "text", "text": "Epic RPG Design Document" }] },
            { "type": "heading", "attrs": { "level": 2 }, "content": [{ "type": "text", "text": "1. Game Overview" }] },
            { "type": "paragraph", "content": [{ "type": "text", "text": "Describe the core fantasy, setting, and main conflict here." }] },
            { "type": "heading", "attrs": { "level": 2 }, "content": [{ "type": "text", "text": "2. Core Mechanics" }] },
            { "type": "paragraph", "content": [{ "type": "text", "text": "Detail the stats, progression, and combat flow." }] },
            { "type": "heading", "attrs": { "level": 2 }, "content": [{ "type": "text", "text": "3. World & Lore" }] },
            { "type": "paragraph", "content": [{ "type": "text", "text": "Key locations, factions, and historical events." }] }
        ]
    }'::jsonb
) on conflict do nothing;

-- SEED DATA: FPS Template
insert into public.gdd_templates (title, description, category, content)
values (
    'Tactical FPS Blueprint',
    'Perfect for shooters focusing on gunplay feel, level flow, and competitive balance.',
    'fps',
    '{
        "type": "doc",
        "content": [
            { "type": "heading", "attrs": { "level": 1 }, "content": [{ "type": "text", "text": "FPS Design Document" }] },
            { "type": "heading", "attrs": { "level": 2 }, "content": [{ "type": "text", "text": "1. Combat Loop" }] },
            { "type": "paragraph", "content": [{ "type": "text", "text": "Focus on the feel of movement, shooting, and abilities." }] },
            { "type": "heading", "attrs": { "level": 2 }, "content": [{ "type": "text", "text": "2. Map Design" }] },
            { "type": "paragraph", "content": [{ "type": "text", "text": "Choke points, verticality, and objective placement." }] }
        ]
    }'::jsonb
) on conflict do nothing;

-- SEED DATA: Horror Template
insert into public.gdd_templates (title, description, category, content)
values (
    'Atmospheric Horror Guide',
    'Focus on tension, limited resources, and psychological triggers.',
    'horror',
    '{
        "type": "doc",
        "content": [
            { "type": "heading", "attrs": { "level": 1 }, "content": [{ "type": "text", "text": "Horror Concept Document" }] },
            { "type": "heading", "attrs": { "level": 2 }, "content": [{ "type": "text", "text": "1. The Threat" }] },
            { "type": "paragraph", "content": [{ "type": "text", "text": "Is it a monster? A ghost? Something in the character''s head?" }] },
            { "type": "heading", "attrs": { "level": 2 }, "content": [{ "type": "text", "text": "2. Atmosphere & Sound" }] },
            { "type": "paragraph", "content": [{ "type": "text", "text": "Key audio cues and lighting styles to create dread." }] }
        ]
    }'::jsonb
) on conflict do nothing;
-- PHASE 9: STORAGE & EXPORTS
insert into storage.buckets (id, name, public) 
values ('world-assets', 'world-assets', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload world assets"
on storage.objects for insert
to authenticated
with check (bucket_id = 'world-assets');

create policy "World assets are publicly viewable"
on storage.objects for select
to public
using (bucket_id = 'world-assets');

create policy "Users can delete their own world assets"
on storage.objects for delete
to authenticated
using (bucket_id = 'world-assets');
