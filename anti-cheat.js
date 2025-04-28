// anti-cheat-utils.js

// Precomputed hash of the original script (replace with the actual hash of the original script)
const expectedHash = "your_precomputed_sha256_hash_here"; 

// Backend URL for communication
const URL = "http://node70.lunes.host:3081/";

// SHA256 hash function (to verify script integrity)
function sha256(str) {
    const crypto = window.crypto || window.msCrypto; // for IE11
    const msgUint8 = new TextEncoder().encode(str); // encode the string as a Uint8Array
    return crypto.subtle.digest('SHA-256', msgUint8).then(hashBuffer => {
        // Convert buffer to hex
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
        return hashHex;
    });
}

// Verify the integrity of the script by checking its hash against the expected hash
function verifyScriptIntegrity(scriptContent) {
    sha256(scriptContent).then((hash) => {
        if (hash !== expectedHash) {
            console.log('[Anti-Cheat] ❌ Script integrity check failed!');
            alert('Cheat detected!');
            return false;
        }
        console.log('[Anti-Cheat] ✅ Script passed integrity check.');
        return true;
    });
}

// Send the fetched script content to the backend
function sendScriptContent(scriptContent) {
    try {
        GM_xmlhttpRequest({
            method: 'POST',
            url: URL + 'receive',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({ script: scriptContent }),
            onload: function(response) {
                const data = JSON.parse(response.responseText);
                console.log('[Anti-Cheat] ✅ Sent script to server:', data);
            },
            onerror: function(err) {
                console.error('[Anti-Cheat] ❌ Failed to send script:', err);
            }
        });
    } catch (err) {
        console.error('[Anti-Cheat] ❌ Failed to send script:', err);
    }
}

// Fetch the script text from the backend and initiate the integrity check and sending
async function fetchAndSendScript() {
    try {
        GM_xmlhttpRequest({
            method: 'GET',
            url: URL + 'get-script-text',
            onload: function(response) {
                const scriptText = response.responseText;
                console.log('[Anti-Cheat] 📄 Fetched script text from server.');

                // Verify the integrity of the fetched script (before sending it)
                if (verifyScriptIntegrity(scriptText)) {
                    sendScriptContent(scriptText);
                }
            },
            onerror: function(err) {
                console.error('[Anti-Cheat] ❌ Failed fetching script text:', err);
            }
        });
    } catch (err) {
        console.error('[Anti-Cheat] ❌ Failed fetching script text:', err);
    }
}
