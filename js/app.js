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
        MODAL UTILS
    ========================= */
    function showModal(isAlreadySubmitted) {
        const modal = document.getElementById('result-modal');
        const title = document.getElementById('modal-title');
        const desc = document.getElementById('modal-desc');
        const icon = document.getElementById('modal-icon');

        if (isAlreadySubmitted) {
            icon.innerText = '⚠️';
            title.innerText = '이미 출석이 등록되었습니다.';
            desc.innerText = '인원에 변동이 있는 경우에는 문화의집 사무실로 방문해 주세요.';
        } else {
            icon.innerText = '✅';
            title.innerText = '출석이 등록되었습니다.';
            desc.innerText = '오늘의 출석이 성공적으로 반영되었습니다.';
        }
        modal.classList.remove('hidden');
    }

    window.closeModal = () => {
        document.getElementById('result-modal').classList.add('hidden');
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

    function init() {
        showStep("step-days");
        renderDays();
    }

    /* =========================
        STEP 1 - DAYS
    ========================= */
    function renderDays() {
        const days = [
            { key: "화", en: "TUE", ko: "화" },
            { key: "수", en: "WED", ko: "수" },
            { key: "목", en: "THU", ko: "목" },
            { key: "금", en: "FRI", ko: "금" },
            { key: "토", en: "SAT", ko: "토" },
            { key: "일", en: "SUN", ko: "일" }
        ];

        const box = document.getElementById("day-buttons");
        if (!box) return;
        box.innerHTML = "";

        days.forEach(d => {
            const btn = document.createElement("button");
            btn.className = "flex flex-col-reverse items-center justify-center p-4 rounded-xl border bg-white hover:border-black transition active:scale-95";
            btn.innerHTML = `
                <span class="day-en text-xs font-bold text-gray-500">${d.en}</span>
                <span class="day-kr text-2xl font-black text-gray-800">${d.ko}</span>
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
        box.innerHTML = '<p class="text-gray-500 p-4">불러오는 중...</p>';

        const clubs = await apiGet("getClubs", { day });
        box.innerHTML = "";

        if (!clubs || clubs.length === 0) {
            box.innerHTML = "<p class='text-gray-500 p-4'>등록된 동아리가 없습니다.</p>";
            return;
        }

        clubs.forEach(c => {
            const btn = document.createElement("button");
            btn.className = "p-4 rounded-xl border bg-white hover:border-black transition text-left";
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
        box.innerHTML = '<p class="text-gray-500 p-4">불러오는 중...</p>';

        let members = await apiGet("getMembers", { club });
        box.innerHTML = "";

        if (members?.length === 1 && typeof members[0] === "string") {
            members = members[0].split(",").map(v => v.trim()).filter(Boolean);
        }

        if (!members?.length) {
            box.innerHTML = "<p class='text-gray-500 p-4'>등록된 인원이 없습니다.</p>";
            return;
        }

        members.forEach(m => {
            const btn = document.createElement("button");
            btn.className = "p-3 border rounded-xl bg-white transition hover:border-black";
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
        if (!state.club) { alert("동아리를 선택하세요."); return; }
        if (!state.members.length) { alert("인원을 선택하세요."); return; }

        const today = new Date().toISOString().split('T')[0];
        const hasSubmitted = localStorage.getItem(`attendance_${today}`);

        if (hasSubmitted) {
            showModal(true);
            return;
        }

        const res = await apiPost({
            mode: "submitAttendance",
            clubName: state.club,
            attendees: state.members,
            day: state.day,
            uid: getOrCreateUID()
        });

        if (!res || res.error) {
            alert(res?.error || "응답이 없습니다.");
            return;
        }

        localStorage.setItem(`attendance_${today}`, 'true');
        showModal(false); 
        
        state.members = [];
        state.club = '';
        state.day = '';
        init();
    }

    return { init, submit };
})();

window.AttendanceApp = AttendanceApp;
window.submitAttendance = AttendanceApp.submit;
