(function initAmplitude(){
    if (typeof window === 'undefined') return;
    if (window.__AMPLITUDE_INITIALIZED__) return;

    const apiKey = window.AMPLITUDE_API_KEY;
    if (!apiKey || typeof apiKey !== 'string') {
        console.warn('[Amplitude] API key is missing. Create amplitude-config.js with window.AMPLITUDE_API_KEY.');
        return;
    }

    window.__AMPLITUDE_INITIALIZED__ = true;

    import('https://cdn.jsdelivr.net/npm/@amplitude/unified@1.0.0-beta.9/+esm')
        .then(amplitude => {
            if (amplitude?.initAll) {
                amplitude.initAll(apiKey, { serverZone: 'EU', analytics: { autocapture: true } });
                console.info('[Amplitude] Initialized');
            } else {
                console.error('[Amplitude] Failed to load SDK');
            }
        })
        .catch(err => {
            window.__AMPLITUDE_INITIALIZED__ = false;
            console.error('[Amplitude] SDK load error', err);
        });
})();
