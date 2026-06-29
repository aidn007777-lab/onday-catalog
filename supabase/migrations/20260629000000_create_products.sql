create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  supplier text not null,
  category text not null,
  brand text not null,
  model text not null,
  memory text not null,
  color text not null,
  "simType" text not null,
  "purchasePrice" numeric,
  status text not null default 'available' check (status in ('available', 'outOfStock', 'pricePending')),
  "createdAt" timestamp with time zone not null default now(),
  "updatedAt" timestamp with time zone not null default now(),
  constraint products_supplier_model_memory_color_sim_type_key unique (supplier, model, memory, color, "simType")
);

create or replace function public.set_products_updated_at()
returns trigger
language plpgsql
as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;

create trigger products_set_updated_at
before update on public.products
for each row
execute function public.set_products_updated_at();

create or replace view public.public_catalog_products as
select
  id,
  category,
  brand,
  model,
  memory,
  color,
  "simType",
  case
    when lower(supplier) in (lower('Mobilagid'), lower('Алматы')) then 'almaty-1'
    else 'taraz-1'
  end as "warehouseId",
  status,
  "createdAt",
  "updatedAt"
from (
  select
    products.*,
    row_number() over (
      partition by lower(model), lower(memory), lower(color), lower("simType")
      order by
        case
          when lower(supplier) = lower('Дархан') then 1
          when lower(supplier) = lower('Талисман') then 2
          when lower(supplier) = lower('Mobilagid') then 3
          when lower(supplier) = lower('Алматы') then 4
          else 5
        end,
        "updatedAt" desc
    ) as supplier_rank
  from public.products
) ranked_products
where supplier_rank = 1;

grant select, insert, update on public.products to anon, authenticated;
grant select on public.public_catalog_products to anon, authenticated;
