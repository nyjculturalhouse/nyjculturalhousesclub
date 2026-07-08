const AttendanceApp = (() => {

    /* =========================
        STATE & USER ID GENERATOR
    ========================= */
    function getOrCreateUID() {
        let uid = localStorage.getItem("user_unique_id");
        if (!uid) {
            uid = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
            localStorage.setItem("user_unique_id", uid);
        }
        return uid;
    }

    let state = {
        day: '',
        club: '',
        members: []
    };

    /* =========================
        STEP CONTROL
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
            { key: "화", en: "Tuesday", ko: "화요일" },
            { key: "수", en: "Wednesday", ko: "수요일" },
            { key: "목", en: "Thursday", ko: "목요일" },
            { key: "금", en: "Friday", ko: "금요일" },
            { key: "토", en: "Saturday", ko: "토요일" },
            { key: "일", en: "Sunday", ko: "일요일" }
        ];

        const box = document.getElementById("day-buttons");
        if (!box) return;
        box.innerHTML = "";

        days.forEach(d => {
            const btn = document.createElement("button");
            btn.className = "p-4 rounded-xl border bg-white hover:bg-blue-50 active:scale-95 transition text-left";
            btn.innerHTML = `
                <div class="font-bold">${d.en}</div>
                <div class="text-sm text-gray-500">${d.ko}</div>
            `;

            btn.onclick = () => {
                state.day = d.key;
                document.querySelectorAll("#day-buttons button").forEach(b => b.classList.remove("selected"));
                btn.classList.add("selected");
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

        showStep("step-clubs");

        const box = document.getElementById("club-buttons");
        if (!box) return;
        box.innerHTML = '<p class="text-gray-500">불러오는 중...</p>';

        const clubs = await apiGet("getClubs", { day });
        box.innerHTML = "";

        if (!clubs || clubs.length === 0) {
            box.innerHTML = "<p class='text-gray-500'>등록된 동아리가 없습니다.</p>";
            return;
        }

        clubs.forEach(c => {
            const btn = document.createElement("button");
            btn.className = "p-4 rounded-xl border bg-white hover:bg-blue-50 transition text-left";
            btn.innerText = c;

            btn.onclick = () => {
                state.club = c;
                document.querySelectorAll("#club-buttons button").forEach(x => x.classList.remove("selected"));
                btn.classList.add("selected");
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
        showStep("step-members");

        const title = document.getElementById("club-title");
        if (title) title.innerText = club;

        const box = document.getElementById("member-list");
        if (!box) return;
        box.innerHTML = '<p class="text-gray-500">불러오는 중...</p>';

        let members = await apiGet("getMembers", { club });
        box.innerHTML = "";

        if (members?.length === 1 && typeof members[0] === "string") {
            members = members[0].split(",").map(v => v.trim()).filter(Boolean);
        }

        if (!members?.length) {
            box.innerHTML = "<p class='text-gray-500'>등록된 인원이 없습니다.</p>";
            return;
        }

        members.forEach(m => {
            const btn = document.createElement("button");
            btn.className = "p-3 border rounded-xl bg-white transition";
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
        if (!state.club) {
            alert("동아리를 선택하세요.");
            return;
        }
        if (!state.members.length) {
            alert("인원을 선택하세요.");
            return;
        }

        const res = await apiPost({
            mode: "submitAttendance",
            clubName: state.club,
            attendees: state.members,
            day: state.day,
            uid: getOrCreateUID()
        });

        if (!res) {
            alert("응답이 없습니다.");
            return;
        }

        if (res.error) {
            alert(res.error);
            return;
        }

        alert("출석이 저장되었습니다.");
        
        state.members = [];
        state.club = '';
        state.day = '';
        init();
    }

    return {
        init,
        submit
    };

})();

window.AttendanceApp = AttendanceApp;
window.submitAttendance = AttendanceApp.submit;

// 💡 [안내] calendar.html 자체 캘린더 구동 로직과의 충돌 방지를 위해 app.js 내부의 중복 이벤트 바인딩 코드는 제거되었습니다.
