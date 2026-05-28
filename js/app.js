let curStep = 1;
let selDay = '';
let selClub = '';
let selMembers = [];

function adminAuth() {

    const pw = prompt("관리자 비밀번호를 입력하세요.");

    if (pw === "0226") {

        loadStats();

    } else if (pw !== null) {

        alert("비밀번호가 올바르지 않습니다.");

        location.href = "index.html";
    }
}

async function loadStats() {

    const box = document.getElementById('admin-content');

    if (!box) return;

    box.innerHTML = '<p style="text-align:center; padding:20px;">데이터 분석 중...</p>';

    try {

        const stats = await apiGet("getStats");

        if(!stats || stats.length === 0) {

            box.innerHTML = '<p style="text-align:center; padding:20px;">출석 기록이 없습니다.</p>';

            return;
        }

        stats.sort((a, b) => b.week.localeCompare(a.week));

        let html = '<table><tr><th>날짜 (주차)</th><th>전체 인원</th></tr>';

        stats.forEach(s => {
            html += '<tr><td>' + s.week + '</td><td style="font-weight:bold; color:#3182f6;">' + s.total + '명</td></tr>';
        });

        html += '</table>';

        box.innerHTML = html;

    } catch (e) {

        box.innerHTML = '<p style="text-align:center; color:red;">불러오기 실패</p>';
    }
}


// 🔥 추가
async function loadAttendanceCheck() {

    const box = document.getElementById('attendance-check-content');

    if (!box) return;

    box.innerHTML = '<p style="text-align:center; padding:20px;">불러오는 중...</p>';

    try {

        const data = await apiGet("getAttendanceStatus");

        if(!data || data.length === 0) {

            box.innerHTML = '<p style="text-align:center; padding:20px;">데이터가 없습니다.</p>';

            return;
        }

        let html = '<table><tr><th>동아리</th><th>저번주</th><th>이번주</th></tr>';

        data.forEach(d => {

            const lastWeekColor = d.lastWeek ? '#3182f6' : 'red';
            const lastWeekText = d.lastWeek ? '완료' : '미체크';
            const thisWeekColor = d.thisWeek ? '#3182f6' : 'red';
            const thisWeekText = d.thisWeek ? '완료' : '미체크';

            html += '<tr>';
            html += '<td>' + d.club + '</td>';
            html += '<td style="font-weight:bold; color:' + lastWeekColor + ';">' + lastWeekText + '</td>';
            html += '<td style="font-weight:bold; color:' + thisWeekColor + ';">' + thisWeekText + '</td>';
            html += '</tr>';
        });

        html += '</table>';

        box.innerHTML = html;

    } catch (e) {

        console.error(e);

        box.innerHTML = '<p style="text-align:center; color:red;">불러오기 실패</p>';
    }
}


function initDays() {

    showStep(1);

    const days = ['화','수','목','금','토','일'];

    const box = document.getElementById('day-buttons');

    if (!box) return;

    box.innerHTML = '';

    days.forEach(d => {

        const b = document.createElement('button');

        b.className = 'btn';

        b.innerText = d + '요일';

        b.onclick = () => {

            b.classList.add('selected');

            setTimeout(() => {
                selDay = d;
                loadClubs(d);
            }, 300);
        };

        box.appendChild(b);
    });
}

async function loadClubs(day) {

    showStep(2);

    const box = document.getElementById('club-buttons');

    box.innerHTML = '<p style="text-align:center;">불러오는 중...</p>';

    const clubs = await apiGet("getClubs", {
        day: day
    });

    box.innerHTML = '';

    if (!clubs || clubs.length === 0) {

        box.innerHTML = '<p style="text-align:center;">등록된 동아리가 없습니다.</p>';
        return;
    }

    clubs.forEach(c => {

        const b = document.createElement('button');

        b.className = 'btn';

        b.innerText = c;

        b.onclick = () => {

            b.classList.add('selected');

            setTimeout(() => {
                selClub = c;
                loadMembers(c);
            }, 300);
        };

        box.appendChild(b);
    });
}

async function loadMembers(club) {

    showStep(3);

    const title = document.getElementById('club-title');
    if (title) title.innerText = club;

    const box = document.getElementById('member-list');

    if (!box) return;

    box.innerHTML = '';

    selMembers = [];

    let members = await apiGet("getMembers", {
        club: club
    });

    if (
        members.length === 1 &&
        typeof members[0] === 'string' &&
        members[0].includes(',')
    ) {

        members = members[0]
            .split(',')
            .map(v => v.trim())
            .filter(Boolean);
    }

    if (!members || members.length === 0) {

        box.innerHTML = '<p style="text-align:center;">등록된 인원이 없습니다.</p>';
        return;
    }

    members.forEach(m => {

        const b = document.createElement('button');

        b.className = 'btn';

        b.innerText = m;

        b.onclick = () => {

            b.classList.toggle('selected');

            const i = selMembers.indexOf(m);

            if(i > -1) {
                selMembers.splice(i, 1);
            } else {
                selMembers.push(m);
            }
        };

        box.appendChild(b);
    });
}

async function sendPost(mode) {

    let data = {
        mode: mode
    };

    if(mode === 'submitAttendance') {

        data.clubName = selClub;
        data.attendees = selMembers;

    } else if(mode === 'submitBooking') {

        data.name = document.getElementById('b_name').value;

        let phone = document.getElementById('b_phone').value
            .replace(/[^0-9]/g, '');

        if(phone.length === 11) {

            phone =
                phone.slice(0, 3) + '-' +
                phone.slice(3, 7) + '-' +
                phone.slice(7);

        } else if(phone.length === 10) {

            phone =
                phone.slice(0, 3) + '-' +
                phone.slice(3, 6) + '-' +
                phone.slice(6);
        }

        data.phone = phone;
        data.space = document.getElementById('b_space').value;
        data.content = document.getElementById('b_content').value;
        data.dateTime = document.getElementById('b_date').value;
        data.hours = document.getElementById('b_hours').value;

        data.agree1 = document.querySelector('input[name="agree1"]:checked')?.value || '';
        data.agree2 = document.querySelector('input[name="agree2"]:checked')?.value || '';

        data.org = document.getElementById('b_org')?.value || '';
        data.people = document.getElementById('b_people')?.value || '';

        if(!data.name || !data.dateTime) {
            return alert("필수 정보를 입력해주세요.");
        }

    } else if(mode === 'submitExternal') {

        data.club = document.getElementById('e_club').value;
        data.phone = document.getElementById('e_phone').value;
        data.event = document.getElementById('e_event').value;
        data.content = document.getElementById('e_content').value;
        data.dateTime = document.getElementById('e_date').value;

        if(!data.club || !data.dateTime) {
            return alert("필수 정보를 입력해주세요.");
        }
    }

    const submitBtns = document.querySelectorAll('.primary');

    submitBtns.forEach(btn => {
        btn.disabled = true;
    });

    try {

        const res = await apiPost(data);

        console.log(res);

        if (res && res.error) {
            alert(res.error);
            return;
        }

        showCompleteToast();

    } catch (e) {

        console.error(e);

        alert(
            "전송 실패\n\n" +
            (e.message || JSON.stringify(e))
        );

    } finally {

        submitBtns.forEach(btn => {
            btn.disabled = false;
        });
    }
}

function submitAttendance() {

    if(!selMembers.length) {
        return alert("인원을 선택하세요.");
    }

    sendPost('submitAttendance');
}

function showStep(s) {

    curStep = s;

    document
        .getElementById('step-days')
        ?.classList.toggle('hidden', s !== 1);

    document
        .getElementById('step-clubs')
        ?.classList.toggle('hidden', s !== 2);

    document
        .getElementById('step-members')
        ?.classList.toggle('hidden', s !== 3);
}
