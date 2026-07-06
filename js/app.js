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
       INIT
    ========================= */
    function init() {
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

        document.getElementById("step-clubs").classList.remove("hidden");
        document.getElementById("step-members").classList.add("hidden");

        const box = document.getElementById("club-buttons");
        box.innerHTML = "로딩중...";

        const clubs = await apiGet("getClubs", { day });

        box.innerHTML = "";

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

        document.getElementById("step-members").classList.remove("hidden");

        const title = document.getElementById("club-title");
        title.innerText = club;

        const box = document.getElementById("member-list");
        box.innerHTML = "";

        let members = await apiGet("getMembers", { club });

        if (members?.length === 1 && typeof members[0] === "string") {
            members = members[0].split(",");
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
