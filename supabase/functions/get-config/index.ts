// Supabase Edge Function для безопасного получения API ключей
// Деплой: через Supabase Dashboard или CLI

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  // CORS headers для доступа из браузера
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Обработка preflight запроса
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Получаем API ключи из переменных окружения Supabase
    // Эти переменные задаются через Supabase Dashboard → Edge Functions → Secrets
    const config = {
      amplitudeKey: Deno.env.get('AMPLITUDE_API_KEY'),
      // Здесь можно добавить другие ключи в будущем:
      // googleAnalyticsKey: Deno.env.get('GOOGLE_ANALYTICS_KEY'),
      // sentryDsn: Deno.env.get('SENTRY_DSN'),
    }

    // Проверяем, что ключ задан
    if (!config.amplitudeKey) {
      console.error('AMPLITUDE_API_KEY not set in Supabase secrets')
      return new Response(
        JSON.stringify({ error: 'Configuration not available' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        },
      )
    }

    // Возвращаем конфигурацию
    return new Response(
      JSON.stringify(config),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600' // Кешируем на 1 час
        },
        status: 200
      },
    )
  } catch (error) {
    console.error('Error in get-config function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      },
    )
  }
})
