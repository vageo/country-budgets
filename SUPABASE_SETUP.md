# Настройка Supabase Edge Function

Это руководство по деплою Edge Function для безопасного хранения API ключей.

## Что уже сделано

- ✅ Создана структура проекта Supabase
- ✅ Написан код Edge Function ([supabase/functions/get-config/index.ts](supabase/functions/get-config/index.ts))
- ✅ Обновлён [amplitude-init.js](amplitude-init.js) для работы с Supabase
- ✅ Добавлен [.env.local](.env.local) с локальными переменными окружения

## Что нужно сделать (деплой)

### Способ 1: Через Supabase Dashboard (рекомендуется для начала)

#### Шаг 1: Создайте Edge Function

1. Откройте https://supabase.com/dashboard/project/vwfzeutapgquuysjqoec
2. В левом меню выберите **Edge Functions**
3. Нажмите **Create a new function**
4. Введите имя функции: `get-config`
5. Скопируйте код из файла [supabase/functions/get-config/index.ts](supabase/functions/get-config/index.ts)
6. Вставьте код в редактор
7. Нажмите **Deploy function**

#### Шаг 2: Добавьте секреты (API ключи)

1. В том же разделе **Edge Functions** перейдите на вкладку **Secrets**
2. Нажмите **Add secret**
3. Введите:
   - **Name:** `AMPLITUDE_API_KEY`
   - **Value:** `2498cd94a1675a04df5d84ff8e847fb6`
4. Нажмите **Save**

#### Шаг 3: Проверьте работу функции

1. Откройте в браузере: https://vwfzeutapgquuysjqoec.supabase.co/functions/v1/get-config
2. Вы должны увидеть JSON с ключом:
   ```json
   {
     "amplitudeKey": "2498cd94a1675a04df5d84ff8e847fb6"
   }
   ```

#### Шаг 4: Протестируйте на вашем сайте

1. Откройте [budget-sankey-2024.html](budget-sankey-2024.html) в браузере
2. Откройте консоль браузера (F12 → Console)
3. Вы должны увидеть:
   ```
   [Amplitude] Fetching config from Supabase...
   [Amplitude] Config loaded from Supabase
   [Amplitude] Initialized successfully
   ```

---

### Способ 2: Через Supabase CLI (для продвинутых)

#### Установка CLI

```bash
npm install -g supabase
```

#### Логин в Supabase

```bash
supabase login
```

Откроется браузер для авторизации.

#### Линк проекта

```bash
supabase link --project-ref vwfzeutapgquuysjqoec
```

#### Деплой функции

```bash
supabase functions deploy get-config
```

#### Добавление секретов

```bash
supabase secrets set AMPLITUDE_API_KEY=2498cd94a1675a04df5d84ff8e847fb6
```

#### Проверка

```bash
curl https://vwfzeutapgquuysjqoec.supabase.co/functions/v1/get-config \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3ZnpldXRhcGdxdXV5c2pxb2VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MzQ0NDYsImV4cCI6MjA3OTIxMDQ0Nn0.EgnrrPIhdWfHJoBhPv09Dw4-d0mBIH7RHLOmwPSrhuQ"
```

---

## Добавление других API ключей в будущем

### Шаг 1: Добавьте новый секрет в Supabase

Например, для Google Analytics:

**Через Dashboard:**
- Edge Functions → Secrets → Add secret
- Name: `GOOGLE_ANALYTICS_KEY`
- Value: `ваш_ключ`

**Через CLI:**
```bash
supabase secrets set GOOGLE_ANALYTICS_KEY=ваш_ключ
```

### Шаг 2: Обновите код Edge Function

Откройте [supabase/functions/get-config/index.ts](supabase/functions/get-config/index.ts) и добавьте:

```typescript
const config = {
  amplitudeKey: Deno.env.get('AMPLITUDE_API_KEY'),
  googleAnalyticsKey: Deno.env.get('GOOGLE_ANALYTICS_KEY'), // Новая строка
}
```

### Шаг 3: Задеплойте обновлённую функцию

**Через Dashboard:** скопируйте обновлённый код и нажмите Deploy

**Через CLI:**
```bash
supabase functions deploy get-config
```

---

## Локальная разработка (fallback)

Если вам нужно работать без интернета, создайте файл `amplitude-config.js`:

```javascript
// amplitude-config.js
window.AMPLITUDE_API_KEY = '2498cd94a1675a04df5d84ff8e847fb6';
```

Скрипт [amplitude-init.js](amplitude-init.js) автоматически использует этот файл, если Supabase недоступен.

**ВАЖНО:** `amplitude-config.js` уже в `.gitignore`, не коммитьте его в Git!

---

## Архитектура

```
Браузер (budget-sankey-2024.html)
    ↓
    fetch('https://vwfzeutapgquuysjqoec.supabase.co/functions/v1/get-config')
    ↓
Supabase Edge Function (get-config)
    ↓ читает из env
Переменные окружения Supabase (Secrets)
    ↓
Возвращает { amplitudeKey: '...' }
    ↓
amplitude-init.js инициализирует Amplitude
```

## Безопасность

- ✅ API ключи НЕ в коде браузера (в открытом виде)
- ✅ Ключи хранятся в секретах Supabase (зашифрованы)
- ✅ Edge Function доступна публично, но возвращает только нужные ключи
- ✅ CORS настроен корректно (доступ только с вашего домена можно ограничить)

## Troubleshooting

### Ошибка "Configuration not available"

**Причина:** Секрет `AMPLITUDE_API_KEY` не задан в Supabase.

**Решение:** Повторите Шаг 2 (добавление секретов).

### Ошибка CORS

**Причина:** Браузер блокирует запрос из-за CORS политики.

**Решение:** Проверьте, что в [supabase/functions/get-config/index.ts](supabase/functions/get-config/index.ts) есть CORS headers:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  // ...
}
```

### Amplitude не инициализируется

1. Откройте консоль браузера (F12 → Console)
2. Посмотрите логи `[Amplitude]`
3. Если видите "API key is missing" — проверьте деплой функции
4. Если видите "Supabase request error" — проверьте URL функции

---

## Контакты

Если возникнут вопросы:
- Документация Supabase Edge Functions: https://supabase.com/docs/guides/functions
- GitHub Issues: https://github.com/vageo/country-budgets/issues
