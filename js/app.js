const AttendanceApp = (() => {

    /* =========================
       STATE
    ========================= */
    let state = {
        day: '',
        club: '',
        members: []
    };

    /* =========================
       STEP CONTROL (추가 수정 핵심)
    ========================= */
    function showStep(step) {

        document.getElementById("step-days")?.classList.add("hidden");
        document.getElementById("step-clubs")?.classList.add("hidden");
        document.getElementById("step-members")?.classList.add("hidden");

        document.getElementById(step)?.classList.remove("hidden");
    }

    /* =========================
       INIT
    ========================= */
    function init() {
        showStep("step-days");
        renderDays();
    }

    /* =========================
       STEP 1 - DAYS
    ========================= */
    function renderDays() {

        const days = [
            { key: "화", label: "화요일" },
            { key: "수", label: "수요일" },
            { key: "목", label: "목요일" },
            { key: "금", label: "금요일" },
            { key: "토", label: "토요일" },
            { key: "일", label: "일요일" }
        ];

        const box = document.getElementById("day-buttons");
        box.innerHTML = "";

        days.forEach(d => {
            const btn = document.createElement("button");
            btn.className = "p-4 border rounded-xl bg-white";

            btn.innerHTML = `<b>${d.label}</b>`;

            btn.onclick = () => {
                state.day = d.key;
                loadClubs(d.key);
            };

            box.appendChild(btn);
        });
    }

    /* =========================
       STEP 2 - CLUBS
    ========================= */
    async function loadClubs(day) {

        state.club = '';
        state.members = [];

        showStep("step-clubs"); // 🔥 핵심 수정

        const box = document.getElementById("club-buttons");
        box.innerHTML = "로딩중...";

        const clubs = await apiGet("getClubs", { day });

        box.innerHTML = "";

        if (!clubs || clubs.length === 0) {
            box.innerHTML = "<p>동아리 없음</p>";
            return;
        }

        clubs.forEach(c => {
            const btn = document.createElement("button");
            btn.className = "p-4 border rounded-xl bg-white";
            btn.innerText = c;

            btn.onclick = () => {
                state.club = c;
                loadMembers(c);
            };

            box.appendChild(btn);
        });
    }

    /* =========================
       STEP 3 - MEMBERS
    ========================= */
    async function loadMembers(club) {

        state.members = [];

        showStep("step-members"); // 🔥 핵심 수정

        const title = document.getElementById("club-title");
        if (title) title.innerText = club;

        const box = document.getElementById("member-list");
        box.innerHTML = "";

        let members = await apiGet("getMembers", { club });

        if (members?.length === 1 && typeof members[0] === "string") {
            members = members[0]
                .split(",")
                .map(v => v.trim())   // 🔥 공백 제거
                .filter(Boolean);
        }

        if (!members?.length) {
            box.innerHTML = "<p>인원 없음</p>";
            return;
        }

        members.forEach(m => {

            const btn = document.createElement("button");
            btn.className = "p-3 border rounded-xl bg-white";
            btn.innerText = m;

            btn.onclick = () => {

                if (state.members.includes(m)) {
                    state.members = state.members.filter(x => x !== m);
                    btn.classList.remove("selected");
                } else {
                    state.members.push(m);
                    btn.classList.add("selected");
                }
            };

            box.appendChild(btn);
        });
    }

    /* =========================
       SUBMIT
    ========================= */
    async function submit() {

        if (!state.members.length) {
            alert("인원 선택하세요");
            return;
        }

        if (!state.club) {
            alert("동아리 선택하세요");
            return;
        }

        const res = await apiPost({
            mode: "submitAttendance",
            clubName: state.club,
            attendees: state.members
        });

        if (res?.error) {
            alert(res.error);
            return;
        }

        alert("제출 완료");

        state.members = [];
    }

    /* =========================
       PUBLIC API
    ========================= */
    return {
        init,
        submit
    };

})();

/* =========================
   GLOBAL HOOK
========================= */
window.AttendanceApp = AttendanceApp;
window.submitAttendance = AttendanceApp.submit;
