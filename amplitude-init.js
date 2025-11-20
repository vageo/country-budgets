(async function initAmplitude(){
    if (typeof window === 'undefined') return;
    if (window.__AMPLITUDE_INITIALIZED__) return;

    let apiKey = null;

    try {
        // Пытаемся получить API ключ из Supabase Edge Function
        console.info('[Amplitude] Fetching config from Supabase...');

        const response = await fetch('https://vwfzeutapgquuysjqoec.supabase.co/functions/v1/get-config', {
            headers: {
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3ZnpldXRhcGdxdXV5c2pxb2VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MzQ0NDYsImV4cCI6MjA3OTIxMDQ0Nn0.EgnrrPIhdWfHJoBhPv09Dw4-d0mBIH7RHLOmwPSrhuQ'
            }
        });

        if (response.ok) {
            const config = await response.json();
            apiKey = config.amplitudeKey;
            console.info('[Amplitude] Config loaded from Supabase');
        } else {
            console.warn('[Amplitude] Supabase config failed, trying fallback...');
        }
    } catch (err) {
        console.warn('[Amplitude] Supabase request error:', err.message);
    }

    // Fallback на локальный amplitude-config.js (для разработки без интернета)
    if (!apiKey && window.AMPLITUDE_API_KEY) {
        apiKey = window.AMPLITUDE_API_KEY;
        console.info('[Amplitude] Using local config (amplitude-config.js)');
    }

    // Если ключ не найден ни в Supabase, ни локально
    if (!apiKey || typeof apiKey !== 'string') {
        console.warn('[Amplitude] API key is missing. Deploy Supabase Edge Function or create amplitude-config.js.');
        return;
    }

    // Загружаем официальный Amplitude SDK
    const script = document.createElement('script');
    script.src = `https://cdn.amplitude.com/script/${apiKey}.js`;
    script.async = true;

    script.onload = function() {
        if (window.amplitude && window.sessionReplay) {
            // Добавляем Session Replay плагин
            window.amplitude.add(window.sessionReplay.plugin({sampleRate: 1}));

            // Инициализируем с полным автокапчуром
            window.amplitude.init(apiKey, {
                fetchRemoteConfig: true,
                autocapture: {
                    attribution: true,
                    fileDownloads: true,
                    formInteractions: true,
                    pageViews: true,
                    sessions: true,
                    elementInteractions: true,
                    networkTracking: true,
                    webVitals: true,
                    frustrationInteractions: true
                }
            });

            window.__AMPLITUDE_INITIALIZED__ = true;
            console.info('[Amplitude] Initialized successfully with full autocapture & Session Replay');
        } else {
            console.error('[Amplitude] SDK loaded but amplitude or sessionReplay not found');
        }
    };

    script.onerror = function() {
        console.error('[Amplitude] Failed to load SDK script');
    };

    document.head.appendChild(script);
})();
