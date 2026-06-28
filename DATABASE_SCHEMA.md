# ONDAY Catalog - структура базы данных

## Общие принципы

База: PostgreSQL через Supabase.

Ключевые решения:

- Supabase Auth хранит учетные записи входа.
- Таблица `profiles` хранит бизнес-профиль сотрудника.
- Все чувствительные данные защищаются серверной логикой и RLS.
- Уникальность товара не включает поставщика.
- Предложения поставщиков хранятся отдельно от общей карточки товара.
- Продажная цена хранится на уровне товара, закупочная цена - на уровне предложения поставщика.
- Все денежные суммы хранятся в целых тенге как `integer` или `bigint`.
- EAC хранится отдельно от SIM как статус `yes`, `no`, `unknown`.

## Enum-значения

Рекомендуемые enum или check constraints:

- `user_role`: `owner`, `admin`, `seller`.
- `account_status`: `active`, `blocked`, `invited`, `disabled`.
- `import_mode`: `partial_update`, `full_replace`.
- `import_status`: `draft`, `parsed`, `confirmed`, `failed`, `cancelled`.
- `import_row_status`: `recognized`, `needs_review`, `conflict`, `rejected`, `confirmed`.
- `offer_status`: `in_stock`, `out_of_stock`, `archived`.
- `price_method`: `margin_percent`, `manual`.
- `price_status`: `approved`, `needs_review`, `missing`.
- `eac_status`: `yes`, `no`, `unknown`.
- `order_status`: `new`, `confirmed`, `ordered`, `in_transit`, `delivered`, `cancelled`.
- `notification_type`: `price_up`, `price_down`, `new_product`, `out_of_stock`, `main_supplier_changed`, `new_order`, `import_error`.

## Таблицы доступа

### `profiles`

Профиль сотрудника, связанный с Supabase Auth.

Поля:

- `id uuid primary key` - совпадает с `auth.users.id`.
- `first_name text not null`.
- `last_name text not null`.
- `login text unique not null`.
- `email text unique`.
- `phone text`.
- `role user_role not null`.
- `status account_status not null default 'invited'`.
- `must_change_password boolean not null default true`.
- `last_login_at timestamptz`.
- `forced_logout_after timestamptz`.
- `created_by uuid references profiles(id)`.
- `created_at timestamptz not null default now()`.
- `updated_at timestamptz not null default now()`.

### `roles`

Если нужны редактируемые роли поверх базовых owner/admin/seller.

Поля:

- `id uuid primary key`.
- `code text unique not null`.
- `name_ru text not null`.
- `name_kz text`.
- `description text`.
- `is_system boolean not null default false`.

### `permissions`

Справочник прав.

Поля:

- `id uuid primary key`.
- `code text unique not null`.
- `name_ru text not null`.
- `name_kz text`.
- `description text`.

Рекомендуемые permission codes:

- `upload_prices`;
- `confirm_import`;
- `edit_products`;
- `manage_sales_prices`;
- `apply_bulk_margin`;
- `process_orders`;
- `create_users`;
- `manage_users`;
- `manage_roles`;
- `view_purchase_prices`;
- `view_real_suppliers`;
- `view_alternative_offers`;
- `manage_suppliers`;
- `manage_archive`;
- `manage_bank_rates`;
- `manage_telegram`;
- `view_audit_logs`;
- `manage_settings`;
- `export_internal_catalog`.
- `manage_product_images`.

### `role_permissions`

- `role_id uuid references roles(id)`.
- `permission_id uuid references permissions(id)`.
- `primary key (role_id, permission_id)`.

### `user_permissions`

- `profile_id uuid references profiles(id)`.
- `permission_id uuid references permissions(id)`.
- `is_allowed boolean not null`.
- `updated_by uuid references profiles(id)`.
- `updated_at timestamptz not null default now()`.
- `primary key (profile_id, permission_id)`.

### `login_events`

Журнал входов и устройств. Ограничение по IP и устройствам не требуется, но входы нужно фиксировать.

Поля:

- `id uuid primary key`.
- `profile_id uuid references profiles(id)`.
- `login_at timestamptz not null default now()`.
- `ip_address inet`.
- `user_agent text`.
- `device_fingerprint text`.
- `success boolean not null`.
- `failure_reason text`.

### `user_security_settings`

Настройки безопасности пользователя.

Поля:

- `profile_id uuid primary key references profiles(id)`.
- `two_factor_enabled boolean not null default false`.
- `two_factor_required boolean not null default false`.
- `two_factor_method text`.
- `updated_at timestamptz not null default now()`.

Для владельца и администраторов 2FA нужно предусмотреть. В тестовой версии она может быть отключена.

## Справочники и нормализация

### `dictionaries`

Типы справочников.

Поля:

- `id uuid primary key`.
- `code text unique not null` - `brand`, `category`, `model`, `memory`, `color`, `sim`, `verification_noise`, `eac_alias`.
- `name_ru text not null`.
- `name_kz text`.
- `is_editable boolean not null default true`.

### `dictionary_entries`

Канонические значения.

Поля:

- `id uuid primary key`.
- `dictionary_id uuid references dictionaries(id)`.
- `value_ru text not null`.
- `value_kz text`.
- `sort_order int not null default 0`.
- `metadata jsonb not null default '{}'`.
- `is_active boolean not null default true`.
- `created_at timestamptz not null default now()`.
- `updated_at timestamptz not null default now()`.

Ограничение:

- `unique (dictionary_id, value_ru)`.

Стартовые значения:

- категории: смартфоны, планшеты, ноутбуки, смарт-часы, наушники, колонки, аксессуары, прочее;
- бренды: Apple, Samsung, Xiaomi, Poco, Realme, OPPO, Huawei, Honor;
- память: 32 GB, 64 GB, 128 GB, 256 GB, 512 GB, 1 TB, 2 TB;
- SIM: 1 SIM + eSIM, 2 SIM, eSIM, Уточните у администратора.

### `aliases`

Варианты написания, синонимы и опечатки.

Поля:

- `id uuid primary key`.
- `dictionary_entry_id uuid references dictionary_entries(id)`.
- `alias text not null`.
- `normalized_alias text not null`.
- `language text`.
- `created_by uuid references profiles(id)`.
- `created_at timestamptz not null default now()`.

Индексы:

- `unique (dictionary_entry_id, normalized_alias)`.
- индекс по `normalized_alias`.

Для `verification_noise` хранятся значения, которые нужно полностью удалять из рабочего текста при импорте: `верификация`, `вериф`, `с верификацией`, `без верификации`, `верификация жоқ`, `verified`, `verification`, `verify`, варианты регистра, сокращения и эмодзи.

### `parser_rules`

Правила первой версии парсера. Парсер работает по правилам, справочникам и алиасам без платного AI API.

Поля:

- `id uuid primary key`.
- `code text unique not null`.
- `target_dictionary_code text` - например `brand`, `model`, `memory`, `color`, `sim`, `eac_alias`, `verification_noise`.
- `pattern text not null`.
- `pattern_type text not null` - `literal`, `regex`, `normalized_alias`.
- `priority int not null default 100`.
- `action text not null` - `map_value`, `delete_text`, `split_color`, `detect_price`, `mark_conflict`.
- `metadata jsonb not null default '{}'`.
- `is_active boolean not null default true`.
- `created_by uuid references profiles(id)`.
- `created_at timestamptz not null default now()`.
- `updated_at timestamptz not null default now()`.

Правила с `action = 'delete_text'` используются для полного удаления слов и строк про верификацию до распознавания товара.

## Поставщики и склады

### `warehouses`

Публичные склады, которые видит продавец.

Поля:

- `id uuid primary key`.
- `public_name_ru text not null`.
- `public_name_kz text`.
- `city text not null`.
- `delivery_text_ru text not null`.
- `delivery_text_kz text`.
- `delivery_minutes_min int`.
- `delivery_minutes_max int`.
- `sort_order int not null default 0`.
- `is_active boolean not null default true`.
- `created_at timestamptz not null default now()`.
- `updated_at timestamptz not null default now()`.

### `suppliers`

Настоящие поставщики. Продавец не должен иметь прямой доступ к настоящему названию.

Поля:

- `id uuid primary key`.
- `real_name text not null`.
- `warehouse_id uuid references warehouses(id)`.
- `city text not null`.
- `priority int not null`.
- `priority_in_city int`.
- `internal_comment text`.
- `is_active boolean not null default true`.
- `last_import_at timestamptz`.
- `created_at timestamptz not null default now()`.
- `updated_at timestamptz not null default now()`.

Индексы:

- `unique (real_name)`.
- индекс по `(is_active, priority)`.
- индекс по `warehouse_id`.

Стартовый порядок: Дархан, Талисман, F3Company, Mobilagid, затем поставщики Алматы по внутреннему порядку.

## Каталог

### `products`

Общая карточка уникального товара.

Поля:

- `id uuid primary key`.
- `brand_id uuid references dictionary_entries(id)`.
- `category_id uuid references dictionary_entries(id)`.
- `model_id uuid references dictionary_entries(id)`.
- `memory_id uuid references dictionary_entries(id)`.
- `color_id uuid references dictionary_entries(id)`.
- `sim_id uuid references dictionary_entries(id)`.
- `eac eac_status not null default 'unknown'`.
- `main_offer_id uuid`.
- `is_active boolean not null default true`.
- `archive_status text`.
- `created_at timestamptz not null default now()`.
- `updated_at timestamptz not null default now()`.

Ограничение уникальности:

- `unique (brand_id, model_id, memory_id, color_id, sim_id, eac)`.

Индексы:

- по `brand_id`, `model_id`, `memory_id`, `color_id`, `sim_id`, `eac`;
- составной индекс для фильтров каталога;
- search index по нормализованной строке товара.

### `supplier_offers`

Предложение поставщика внутри товара.

Поля:

- `id uuid primary key`.
- `product_id uuid references products(id)`.
- `supplier_id uuid references suppliers(id)`.
- `purchase_price_kzt integer`.
- `offer_status offer_status not null default 'in_stock'`.
- `source_import_id uuid references imports(id)`.
- `source_import_row_id uuid references import_rows(id)`.
- `source_text text`.
- `appeared_at timestamptz not null default now()`.
- `last_seen_at timestamptz`.
- `unavailable_at timestamptz`.
- `archive_delete_after timestamptz`.
- `is_deleted boolean not null default false`.
- `deleted_at timestamptz`.
- `deleted_by uuid references profiles(id)`.
- `priority_snapshot int`.
- `created_at timestamptz not null default now()`.
- `updated_at timestamptz not null default now()`.

Ограничение:

- `unique (product_id, supplier_id)`.

### `product_images`

Фотографии товаров.

Поля:

- `id uuid primary key`.
- `product_id uuid references products(id)`.
- `model_id uuid references dictionary_entries(id)`.
- `storage_path text not null`.
- `source_url text`.
- `source_type text` - `manufacturer`, `supplier_allowed`, `owner_uploaded`.
- `alt_text_ru text`.
- `alt_text_kz text`.
- `is_primary boolean not null default false`.
- `color_id uuid references dictionary_entries(id)`.
- `uploaded_by uuid references profiles(id)`.
- `created_at timestamptz not null default now()`.

В первой версии достаточно одной фотографии на модель через `model_id`. `color_id` оставлен для будущих цветовых фотографий.

## Цены

### `sales_prices`

Текущая утвержденная продажная цена товара.

Поля:

- `id uuid primary key`.
- `product_id uuid unique references products(id)`.
- `price_method price_method not null`.
- `margin_percent numeric(8,4)`.
- `cash_price_kzt integer`.
- `kaspi_24_price_kzt integer`.
- `home_24_price_kzt integer`.
- `halyk_24_price_kzt integer`.
- `price_status price_status not null default 'missing'`.
- `approved_by uuid references profiles(id)`.
- `approved_at timestamptz`.
- `created_at timestamptz not null default now()`.
- `updated_at timestamptz not null default now()`.

Если маржа не указана, `price_status = 'missing'`, а продавцу показывается "Цена уточняется".

### `bank_rates`

Настраиваемые банковские проценты.

Поля:

- `id uuid primary key`.
- `code text unique not null` - `kaspi_24`, `home_24`, `halyk_24`.
- `name text not null`.
- `percent numeric(8,4) not null`.
- `is_enabled boolean not null default true`.
- `updated_by uuid references profiles(id)`.
- `updated_at timestamptz not null default now()`.

Стартовые значения:

- `kaspi_24`: `18.5`;
- `home_24`: `22`;
- `halyk_24`: `28`.

### `price_history`

История изменений закупочных и продажных цен.

Поля:

- `id uuid primary key`.
- `product_id uuid references products(id)`.
- `supplier_offer_id uuid references supplier_offers(id)`.
- `change_type text not null`.
- `old_purchase_price_kzt integer`.
- `new_purchase_price_kzt integer`.
- `old_cash_price_kzt integer`.
- `new_cash_price_kzt integer`.
- `old_margin_percent numeric(8,4)`.
- `new_margin_percent numeric(8,4)`.
- `recommended_cash_price_kzt integer`.
- `requires_review boolean not null default false`.
- `review_status text`.
- `created_by uuid references profiles(id)`.
- `created_at timestamptz not null default now()`.

## Импорт

### `imports`

Сессия загрузки прайса.

Поля:

- `id uuid primary key`.
- `supplier_id uuid references suppliers(id)`.
- `mode import_mode not null`.
- `raw_text text`.
- `raw_text_retention_until date`.
- `raw_text_deleted_at timestamptz`.
- `summary_payload jsonb not null default '{}'`.
- `bulk_margin_percent numeric(8,4)`.
- `status import_status not null default 'draft'`.
- `rows_total int not null default 0`.
- `rows_recognized int not null default 0`.
- `rows_needs_review int not null default 0`.
- `confirmed_by uuid references profiles(id)`.
- `confirmed_at timestamptz`.
- `created_by uuid references profiles(id)`.
- `created_at timestamptz not null default now()`.

### `import_rows`

Распознанные или спорные строки preview.

Поля:

- `id uuid primary key`.
- `import_id uuid references imports(id)`.
- `line_no int`.
- `source_text text`.
- `source_text_deleted_at timestamptz`.
- `parsed_payload jsonb not null default '{}'`.
- `brand_id uuid references dictionary_entries(id)`.
- `category_id uuid references dictionary_entries(id)`.
- `model_id uuid references dictionary_entries(id)`.
- `memory_id uuid references dictionary_entries(id)`.
- `color_id uuid references dictionary_entries(id)`.
- `sim_id uuid references dictionary_entries(id)`.
- `eac eac_status not null default 'unknown'`.
- `purchase_price_kzt integer`.
- `margin_percent numeric(8,4)`.
- `cash_price_kzt integer`.
- `status import_row_status not null default 'needs_review'`.
- `confidence numeric(5,4)`.
- `error_message text`.
- `conflict_group text`.
- `action text` - `create`, `update`, `skip`, `mark_out_of_stock`.
- `created_product_id uuid references products(id)`.
- `created_offer_id uuid references supplier_offers(id)`.
- `created_at timestamptz not null default now()`.

Если цвет не распознан, строка остается `needs_review` и не сохраняется автоматически.

Если одинаковый товар в одном импорте указан с разной ценой, строки получают статус `conflict` и общий `conflict_group`. Цена не выбирается автоматически.

Исходный текст импорта и исходные строки хранятся 12 месяцев. После этого `raw_text` и `source_text` можно очистить, сохранив `summary_payload`, итог импорта и audit log.

Первая версия импорта не требует и не использует платный AI API: все решения должны быть воспроизводимы через `parser_rules`, `dictionaries`, `dictionary_entries` и `aliases`.

## Заказы

### `orders`

Заявки поставщику.

Поля:

- `id uuid primary key`.
- `product_id uuid references products(id)`.
- `supplier_offer_id uuid references supplier_offers(id)`.
- `created_by uuid references profiles(id)`.
- `quantity int not null`.
- `client_name text`.
- `client_phone text`.
- `comment text`.
- `urgency text`.
- `internal_order_no text`.
- `status order_status not null default 'new'`.
- `sales_price_snapshot_kzt integer`.
- `public_warehouse_snapshot text`.
- `real_supplier_snapshot text`.
- `purchase_price_snapshot_kzt integer`.
- `created_at timestamptz not null default now()`.
- `updated_at timestamptz not null default now()`.

Внутренние snapshot-поля доступны только владельцу и разрешенным администраторам.

### `order_status_history`

- `id uuid primary key`.
- `order_id uuid references orders(id)`.
- `old_status order_status`.
- `new_status order_status not null`.
- `comment text`.
- `changed_by uuid references profiles(id)`.
- `changed_at timestamptz not null default now()`.

## Уведомления

### `notifications`

- `id uuid primary key`.
- `type notification_type not null`.
- `title_ru text not null`.
- `title_kz text`.
- `body_ru text`.
- `body_kz text`.
- `payload jsonb not null default '{}'`.
- `visibility text not null default 'all_allowed'`.
- `created_at timestamptz not null default now()`.

### `user_notifications`

- `notification_id uuid references notifications(id)`.
- `profile_id uuid references profiles(id)`.
- `read_at timestamptz`.
- `acknowledged_at timestamptz`.
- `primary key (notification_id, profile_id)`.

## Настройки и аудит

### `settings`

- `key text primary key`.
- `value jsonb not null`.
- `is_secret boolean not null default false`.
- `updated_by uuid references profiles(id)`.
- `updated_at timestamptz not null default now()`.

Telegram token хранить только в environment variables. Полный токен не хранится в БД, не показывается и не редактируется в интерфейсе.

Обязательные настройки:

- `session_idle_timeout_minutes` - по умолчанию 30;
- `telegram_owner_chat_id`;
- `telegram_group_chat_id` - зарезервировано на будущее;
- `telegram_enabled_notification_types`;
- `backup_export_enabled`;
- `backup_last_export_at`.

Telegram token в `settings` не хранить. Он должен быть только в environment variables.

### `audit_logs`

- `id uuid primary key`.
- `actor_id uuid references profiles(id)`.
- `action text not null`.
- `entity_type text not null`.
- `entity_id uuid`.
- `old_value jsonb`.
- `new_value jsonb`.
- `ip_address inet`.
- `user_agent text`.
- `created_at timestamptz not null default now()`.

## Read models и представления

### `catalog_seller_view`

Только публичные поля:

- product id;
- фото;
- бренд;
- категория;
- модель;
- память;
- цвет;
- SIM;
- EAC;
- публичный склад;
- город;
- срок доставки;
- наличная цена или "Цена уточняется";
- включенные банковские цены;
- дата обновления;
- статус наличия.

Не включает:

- `supplier_id`;
- `real_name`;
- `purchase_price_kzt`;
- `margin_percent`;
- альтернативные закупочные предложения;
- внутренние комментарии.

Для продавца эти поля запрещено передавать не только в UI, но и в любых API/DTO payloads, включая скрытые поля, вложенные объекты и export responses.

### `catalog_internal_view`

Для владельца и разрешенных администраторов:

- все публичные поля;
- основной поставщик;
- закупочная цена;
- маржа;
- альтернативные предложения;
- более дешевое предложение;
- история закупочных и продажных цен.

## RLS-политики

Минимальный принцип:

- `profiles`: пользователь видит себя; owner/admin с правом `manage_users` видят сотрудников.
- `suppliers`: sellers не читают настоящие названия напрямую.
- `supplier_offers`: sellers не читают напрямую.
- `sales_prices`: sellers читают только через публичный view/RPC.
- `orders`: продавец видит свои заказы без внутренних полей; owner/admin видят расширенные данные.
- `audit_logs`: только owner и пользователи с `view_audit_logs`.
- `settings`: секретные настройки не читаются клиентом.

Даже при RLS серверные действия должны дополнительно проверять права.
