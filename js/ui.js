function showView(v) {
    document.querySelectorAll('.card').forEach(c => {
        c.classList.add('hidden');
    });

    const targetView = document.getElementById('view-' + v);
    if (targetView) {
        targetView.classList.remove('hidden');
    }

    if(v === 'attendance') {
        initDays();
    }

    if(v === 'admin') {
        // admin 화면으로 진입 시 통계뿐만 아니라 출석 체크 현황도 함께 불러오도록 확장 가능
        loadStats();
        loadAttendanceCheck(); 
    }

    window.scrollTo(0, 0);
}

function showStep(s) {
    curStep = s;

    // 안전한 접근을 위해 요소 존재 여부 확인 추가
    document.getElementById('step-days')?.classList.toggle('hidden', s !== 1);
    document.getElementById('step-clubs')?.classList.toggle('hidden', s !== 2);
    document.getElementById('step-members')?.classList.toggle('hidden', s !== 3);
}

function handleBack() {
    if(curStep === 1) {
        showView('home');
    } else {
        showStep(curStep - 1);
    }
}

function showCompleteToast() {
    // 봇이나 악의적인 요청이 아닌, 정상적인 처리 완료 후 호출되므로
    // UI를 차단하여 추가 연타를 물리적으로 방지합니다.
    const overlay = document.getElementById('overlay');
    const toast = document.getElementById('toast');
    
    if (overlay) overlay.style.display = 'block';
    if (toast) toast.style.display = 'block';

    // 2초 뒤 새로고침 (이 시간 동안은 사용자가 버튼을 누를 수 없음)
    setTimeout(() => {
        location.reload();
    }, 2000);
}
