// anti-cheat.js
(function() {
    'use strict';

    console.log('[Anti-Cheat] External anti-cheat logic loaded.');

    async function getScriptContent() {
        const scripts = document.getElementsByTagName('script');
        let fullContent = '';

        for (const script of scripts) {
            try {
                if (script.src) {
                    // External script
                    const res = await fetch(script.src);
                    fullContent += await res.text();
                } else if (script.textContent) {
                    // Inline script
                    fullContent += script.textContent;
                }
            } catch (err) {
                console.warn('[Anti-Cheat] Could not fetch a script:', err);
            }
        }

        return fullContent;
    }

    async function sendScriptContentToServer() {
        const allScriptContent = await getScriptContent();

        fetch('https://yourserver.com/api/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: allScriptContent,
                clientToken: window.clientToken || null,
                joinCode: window.joinCode || null,
            })
        })
        .then(res => res.json())
        .then(data => console.log('[Anti-Cheat] Server response:', data))
        .catch(err => console.error('[Anti-Cheat] Error sending script content:', err));
    }

    // Expose to global window
    window.checkScriptIntegrity = sendScriptContentToServer;

})();
