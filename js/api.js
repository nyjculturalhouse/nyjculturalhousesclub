const API_URL = "https://script.google.com/macros/s/AKfycbw8TIvA_grDjk0Lu98nSh3gplAUBHezY5rp5ANDlxu4Fk7b2x6VRd0Lbw6wgFNA-NvL9A/exec";

/* =========================
   GET
========================= */
async function apiGet(mode, params = {}) {
    const query = new URLSearchParams({ mode, ...params });

    try {
        const res = await fetch(`${API_URL}?${query.toString()}`);
        return await res.json();
    } catch (e) {
        console.error("GET error", e);
        return null;
    }
}

/* =========================
   POST (핵심 수정)
========================= */
async function apiPost(data) {

    // 🔥 DOM 의존 제거 (안전하게 처리)
    const honeypotEl = document.getElementById('honeypot');
    const honeypotValue = honeypotEl ? honeypotEl.value : "";

    const payload = {
        ...data,
        honeypot: honeypotValue
    };

    try {
        const res = await fetch(API_URL, {
            method: "POST",

            // 🔥 중요: GAS 안정성 위해 JSON 유지
            headers: {
                "Content-Type": "application/json"
            },

            redirect: "follow",
            body: JSON.stringify(payload)
        });

        const text = await res.text();

        // 🔥 JSON 안전 파싱
        try {
            return JSON.parse(text);
        } catch {
            console.warn("Non-JSON response:", text);
            return { error: "서버 응답 오류" };
        }

    } catch (e) {
        console.error("POST error", e);
        return { error: "네트워크 오류" };
    }
}
