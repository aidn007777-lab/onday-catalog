alter table public.products
add column if not exists "salePrice" numeric;

create or replace view public.public_catalog_products as
select
  id,
  category,
  brand,
  model,
  memory,
  color,
  "simType",
  "salePrice",
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

alter table public.products enable row level security;

drop policy if exists "products_select_demo" on public.products;
drop policy if exists "products_insert_demo" on public.products;
drop policy if exists "products_update_demo" on public.products;

create policy "products_select_demo"
on public.products
for select
to anon, authenticated
using (true);

create policy "products_insert_demo"
on public.products
for insert
to anon, authenticated
with check (true);

create policy "products_update_demo"
on public.products
for update
to anon, authenticated
using (true)
with check (true);
