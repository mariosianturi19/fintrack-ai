begin;

alter table public.wallets
  add column wallet_type text;

-- Existing migration wallets cannot be classified safely from their names.
-- Keep them usable without pretending to know their real payment source; the
-- owner can select the correct type from Profile after deployment.
update public.wallets
set wallet_type = 'other'
where wallet_type is null;

alter table public.wallets
  alter column wallet_type set not null,
  add constraint wallets_type_check
    check (wallet_type in ('bank', 'e_wallet', 'cash', 'other'));

comment on column public.wallets.wallet_type is
  'User-selected payment-source type. Existing migration wallets use other until the owner classifies them.';

notify pgrst, 'reload schema';
commit;
