# ONDAY Catalog

Next.js-приложение ONDAY Catalog с админским импортом WhatsApp-прайсов и каталогом товаров на Supabase.

## Что уже есть

- Next.js App Router, TypeScript, Tailwind CSS и ESLint.
- Темный интерфейс ONDAY Catalog с адаптацией под компьютер, планшет и смартфон.
- Локальные переводы RU/KZ.
- Демо-парсер WhatsApp-прайсов на правилах и алиасах.
- Supabase-таблица `products` для каталога.
- Админская таблица всех предложений поставщиков.
- Публичная витрина без настоящих поставщиков и закупочных цен.
- Тестовые публичные склады: `Тараз — склад 1` и `Алматы — склад 1`.

## Что сознательно не подключено

- Настоящая авторизация.
- Telegram-уведомления.

## Supabase

В `.env.local` и Vercel должны быть заданы:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Для браузерного клиента подходит новый Supabase publishable key с префиксом `sb_publishable_`.

SQL-миграции лежат в `supabase/migrations`.
Для уже созданной таблицы после первой миграции выполните:

```text
supabase/migrations/20260629010000_add_sale_price.sql
```

## Запуск

```bash
npm install
npm run dev
```

После запуска приложение будет доступно по адресу:

```text
http://localhost:3000
```

## Проверки

```bash
npm run typecheck
npm run lint
npm run build
```
