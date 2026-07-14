// 💡 config.js 파일이 api.js와 같은 폴더(js/) 안에 있으므로 경로를 ./config.js로 수정합니다.
import { API_URL } from './config.js'; 

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
   POST (CORS 해결 버전)
========================= */
async function apiPost(data) {

    const honeypotEl = document.getElementById('honeypot');
    const honeypotValue = honeypotEl ? honeypotEl.value : "";

    const payload = {
        ...data,
        honeypot: honeypotValue
    };

    try {
        // 🔥 GAS의 CORS 제한을 우회하기 위해 text/plain 또는 헤더 생략 방식을 사용합니다.
        const res = await fetch(API_URL, {
            method: "POST",
            headers: {
                // 원래 application/json 이었던 부분을 text/plain 으로 변경하여 Preflight 차단을 우회합니다.
                "Content-Type": "text/plain;charset=utf-8"
            },
            redirect: "follow",
            body: JSON.stringify(payload)
        });

        const text = await res.text();

        // JSON 안전 파싱
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

// 외부 파일에서 모듈로 호출하여 사용할 수 있도록 내보냅니다.
export { apiGet, apiPost };
