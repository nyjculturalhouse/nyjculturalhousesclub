const API_URL = "https://script.google.com/macros/s/AKfycbz7wNZ6WAygSpqk2fPxJxe9CyOOQlR6KHaUjC29k-hcDl2iFHMbfzDvlbtEUet36roypQ/exec";

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

        headers: {
            'Content-Type': 'text/plain;charset=utf-8'
        },

        body: JSON.stringify(data)
    });

    // 🔥 추가
    const result = await res.json();

    // 🔥 추가
    return result;
}
