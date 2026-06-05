create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null default '',
  highlights jsonb not null default '[]'::jsonb,
  cta_label text not null default 'Got it',
  cta_subtext text not null default '',
  is_active boolean not null default true,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists announcements_active_published_at_idx
  on public.announcements (is_active, published_at desc, created_at desc);

alter table public.announcements enable row level security;

create policy "Authenticated users can read announcements"
  on public.announcements
  for select
  using (auth.uid() is not null);

create table if not exists public.announcement_reads (
  id uuid primary key default gen_random_uuid(),
  announcement_id uuid not null references public.announcements (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  seen_at timestamptz not null default now(),
  unique (announcement_id, user_id)
);

create index if not exists announcement_reads_user_id_idx
  on public.announcement_reads (user_id);

create index if not exists announcement_reads_announcement_id_idx
  on public.announcement_reads (announcement_id);

alter table public.announcement_reads enable row level security;

create policy "Users can read their own announcement reads"
  on public.announcement_reads
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own announcement reads"
  on public.announcement_reads
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own announcement reads"
  on public.announcement_reads
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own announcement reads"
  on public.announcement_reads
  for delete
  using (auth.uid() = user_id);

insert into public.announcements (
  slug,
  title,
  summary,
  highlights,
  cta_label,
  cta_subtext,
  is_active,
  published_at
)
values (
  'finance-update-2026-06',
  'June finance feature drop',
  'We now store announcements in the database, so the app can pull the latest one automatically whenever a user logs in.',
  '[
    {
      "title": "Custom categories",
      "description": "Deepu now gets Smoking and Drinking, and every user can add or remove their own categories."
    },
    {
      "title": "Savings portfolio",
      "description": "Track Groww inflows and outflows as one running savings balance."
    },
    {
      "title": "Loan buckets",
      "description": "Create separate debt accounts and reduce the matching bucket when repayments happen."
    },
    {
      "title": "Card expenses",
      "description": "Credit card payments now show up as expenses in the ledger."
    },
    {
      "title": "Merchant aliases",
      "description": "AI can map merchant names like Rayudu Tiffins back to the right known name automatically."
    },
    {
      "title": "Personal diary",
      "description": "A new private diary section saves notes in the notes table."
    }
  ]'::jsonb,
  'Got it',
  'Open the dashboard to start using the latest update right away.',
  true,
  now()
)
on conflict (slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  highlights = excluded.highlights,
  cta_label = excluded.cta_label,
  cta_subtext = excluded.cta_subtext,
  is_active = excluded.is_active,
  published_at = excluded.published_at;
