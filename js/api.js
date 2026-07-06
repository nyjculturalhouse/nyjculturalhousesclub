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
    // 봇 방지를 위해 숨겨진 필드(honeypot) 값을 가져와 함께 전송합니다.
    const honeypotValue = document.getElementById('honeypot')?.value;
    const payload = {
        ...data,
        honeypot: honeypotValue
    };

    // 구글 웹앱(GAS)은 POST 요청 시 필수적으로 리다이렉트(302)를 발생시킵니다.
    // redirect: 'follow'를 명시해야만 정상적으로 최종 JSON 응답을 받아올 수 있습니다.
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 
            'Content-Type': 'text/plain;charset=utf-8' 
        },
        redirect: 'follow', 
        body: JSON.stringify(payload)
    });

    const result = await res.json(); 
    return result; 
}
