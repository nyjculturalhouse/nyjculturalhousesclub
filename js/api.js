const API_URL = "https://script.google.com/macros/s/AKfycbw8TIvA_grDjk0Lu98nSh3gplAUBHezY5rp5ANDlxu4Fk7b2x6VRd0Lbw6wgFNA-NvL9A/exec";

async function apiGet(mode, params = {}) {
    const query = new URLSearchParams({ mode, ...params });

    const res = await fetch(`${API_URL}?${query.toString()}`);

    try {
        return await res.json();
    } catch (e) {
        console.error("GET JSON parse error", e);
        return null;
    }
}

async function apiPost(data) {
    const honeypotValue = document.getElementById('honeypot')?.value;

    const payload = {
        ...data,
        honeypot: honeypotValue
    };

    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        redirect: 'follow',
        body: JSON.stringify(payload)
    });

    try {
        return await res.json();
    } catch (e) {
        console.error("POST JSON parse error", e);
        return null;
    }
}
