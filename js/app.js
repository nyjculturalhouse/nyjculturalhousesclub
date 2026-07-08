const AttendanceApp = (() => {

    /* =========================
        STATE & USER ID GENERATOR
    ========================= */
    // 브라우저별 고유 UID를 로컬스토리지에 생성/관리하여 IP 차단 버그 우회
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
            { key: "수", en: "Wednesday", ko: "요일" },
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
            uid: getOrCreateUID() // 고유 식별키 전송
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
        
        // 제출 후 상태 및 스텝 초기화
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


/* ==========================================================
   🔥 FullCalendar 구글 연동 전용 스크립트 결합 (디자인 변형 없음)
========================================================== */
document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return; // 달력 ID가 화면에 없으면 실행 중지
    
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'ko',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,listWeek'
        },
        buttonText: {
            today: '오늘',
            month: '월',
            week: '주',
            list: '목록'
        },
        editable: false,
        selectable: true,
        events: async function(info, successCallback, failureCallback) {
            try {
                // api.js를 통해 주간 통계 및 출석 현황을 기반으로 일정 데이터 조회
                const stats = await apiGet("getStats");
                
                if (!stats || stats.error) {
                    successCallback([]);
                    return;
                }

                // 구글 시트 데이터를 FullCalendar 표준 일정 포맷으로 치환
                const events = stats.map(item => {
                    // 주차 데이터(예: "2026년 7월 2주차")를 연동 표기 형태로 변환 처리
                    return {
                        title: `${item.week} 합계: ${item.total}명`,
                        start: new Date(), // 기본 현재 시점 배치 설정
                        allDay: true,
                        color: '#111111' // 기존 테마 스펙 다크 차콜 유지
                    };
                });

                successCallback(events);
            } catch (error) {
                console.error("Calendar load error:", error);
                failureCallback(error);
            }
        }
    });
    
    calendar.render();
});
