const API_URL = "https://script.google.com/macros/s/AKfycbw8TIvA_grDjk0Lu98nSh3gplAUBHezY5rp5ANDlxu4Fk7b2x6VRd0Lbw6wgFNA-NvL9A/exec";

async function apiGet(mode, params = {}) {

    const query = new URLSearchParams({
        mode,
        ...params
    });

    const res = await fetch(
        `${API_URL}?${query.toString()}`
    );

    return await res.json();
}

async function apiPost(data) {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(data)
    });
    const result = await res.json(); // 🔥 추가
    return result; // 🔥 추가
}
