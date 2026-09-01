begin;

create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public, anon, authenticated;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  color_hex text not null,
  sort_order smallint not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint categories_slug_format_check
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint categories_name_format_check
    check (
      name = btrim(name)
      and char_length(name) between 2 and 64
    ),
  constraint categories_color_hex_format_check
    check (color_hex ~ '^#[0-9A-Fa-f]{6}$'),
  constraint categories_sort_order_check
    check (sort_order >= 0)
);

comment on table public.categories is
  'Read-only system category catalog shared by authenticated Fintrack AI users.';
comment on column public.categories.slug is
  'Stable machine identifier. Application logic must use the slug instead of hard-coded UUIDs.';
comment on column public.categories.color_hex is
  'Presentation token from the approved Fintrack AI data-visualization palette.';

create trigger categories_set_updated_at
before update on public.categories
for each row
execute function private.set_updated_at();

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid not null references public.categories (id),
  amount_idr bigint not null,
  transaction_date date not null,
  merchant text,
  notes text,
  source text not null default 'manual',
  receipt_object_key text,
  receipt_items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint transactions_amount_idr_check
    check (amount_idr between 1 and 999999999999),
  constraint transactions_merchant_format_check
    check (
      merchant is null
      or (
        merchant = btrim(merchant)
        and char_length(merchant) between 1 and 120
      )
    ),
  constraint transactions_notes_format_check
    check (
      notes is null
      or (
        notes = btrim(notes)
        and char_length(notes) between 1 and 1000
      )
    ),
  constraint transactions_source_check
    check (source in ('manual', 'receipt_ai')),
  constraint transactions_receipt_object_key_check
    check (
      receipt_object_key is null
      or (
        receipt_object_key = btrim(receipt_object_key)
        and char_length(receipt_object_key) between 1 and 512
        and receipt_object_key like ('receipts/' || user_id::text || '/%')
        and receipt_object_key !~ '(^|/)\.\.?(/|$)'
        and receipt_object_key !~ '^(https?:)?//'
        and receipt_object_key !~ E'\\\\'
      )
    ),
  constraint transactions_receipt_items_type_check
    check (jsonb_typeof(receipt_items) = 'array'),
  constraint transactions_receipt_items_count_check
    check (jsonb_array_length(receipt_items) <= 200),
  constraint transactions_receipt_items_size_check
    check (octet_length(receipt_items::text) <= 262144)
);

comment on table public.transactions is
  'User-owned, reviewed expense records. RLS enforces tenant isolation.';
comment on column public.transactions.amount_idr is
  'Whole Indonesian rupiah amount; decimals are intentionally unsupported.';
comment on column public.transactions.receipt_object_key is
  'Private Cloudflare R2 object key scoped to receipts/{user_id}/. Never store a public or signed URL here.';
comment on column public.transactions.receipt_items is
  'Reviewed receipt line items only. Raw Gemini responses must not be persisted.';

create trigger transactions_set_updated_at
before update on public.transactions
for each row
execute function private.set_updated_at();

create index transactions_user_date_idx
on public.transactions (user_id, transaction_date desc, created_at desc);

create index transactions_user_category_date_idx
on public.transactions (user_id, category_id, transaction_date desc);

create table public.weekly_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  week_start date not null,
  summary text not null,
  model_name text not null,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint weekly_insights_user_week_unique
    unique (user_id, week_start),
  constraint weekly_insights_week_start_check
    check (extract(isodow from week_start) = 1),
  constraint weekly_insights_summary_format_check
    check (
      summary = btrim(summary)
      and char_length(summary) between 1 and 2000
    ),
  constraint weekly_insights_model_name_format_check
    check (
      model_name = btrim(model_name)
      and char_length(model_name) between 1 and 100
    )
);

comment on table public.weekly_insights is
  'Persisted weekly AI summaries. One reviewed summary is retained per user and ISO week.';
comment on column public.weekly_insights.week_start is
  'Monday starting the represented ISO week.';
comment on column public.weekly_insights.model_name is
  'Exact provider model identifier used for generation, retained for auditability.';

create trigger weekly_insights_set_updated_at
before update on public.weekly_insights
for each row
execute function private.set_updated_at();

create index weekly_insights_user_generated_at_idx
on public.weekly_insights (user_id, generated_at desc);

alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.weekly_insights enable row level security;

revoke all on table public.categories from public, anon, authenticated;
revoke all on table public.transactions from public, anon, authenticated;
revoke all on table public.weekly_insights from public, anon, authenticated;

grant select on table public.categories to authenticated;
grant select on table public.categories to service_role;

grant select, insert, update, delete
on table public.transactions
to authenticated, service_role;

grant select, insert, update, delete
on table public.weekly_insights
to authenticated, service_role;

create policy "Authenticated users can read the category catalog"
on public.categories
for select
to authenticated
using ((select auth.uid()) is not null);

create policy "Users can read their own transactions"
on public.transactions
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own transactions"
on public.transactions
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own transactions"
on public.transactions
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own transactions"
on public.transactions
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can read their own weekly insights"
on public.weekly_insights
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own weekly insights"
on public.weekly_insights
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own weekly insights"
on public.weekly_insights
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own weekly insights"
on public.weekly_insights
for delete
to authenticated
using ((select auth.uid()) = user_id);

insert into public.categories (slug, name, color_hex, sort_order)
values
  ('food-drink', 'Makanan & minuman', '#D96C52', 10),
  ('transportation', 'Transportasi', '#285A73', 20),
  ('shopping', 'Belanja', '#8A6FA8', 30),
  ('bills', 'Tagihan', '#B48A32', 40),
  ('health', 'Kesehatan', '#5A8F7B', 50),
  ('other', 'Lainnya', '#64748B', 60);

commit;
