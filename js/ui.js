function showView(v) {
    document.querySelectorAll('.card').forEach(c => {
        c.classList.add('hidden');
    });

    const targetView = document.getElementById('view-' + v);
    if (targetView) targetView.classList.remove('hidden');

    if (v === 'attendance') initDays();
    if (v === 'admin') {
        loadStats();
        loadAttendanceCheck();
    }

    window.scrollTo(0, 0);
}

/**
 * ⚠️ showStep은 "한 개만 존재해야 정상"
 * app.js 기준으로 단일 관리
 */
function showStep(s) {
    document.getElementById('step-days')?.classList.toggle('hidden', s !== 1);
    document.getElementById('step-clubs')?.classList.toggle('hidden', s !== 2);
    document.getElementById('step-members')?.classList.toggle('hidden', s !== 3);

    if (typeof curStep !== "undefined") curStep = s;
}

function handleBack() {
    if (typeof curStep === "undefined") return;

    if (curStep === 1) {
        showView('home');
    } else {
        showStep(curStep - 1);
    }
}

function showCompleteToast() {
    const overlay = document.getElementById('overlay');
    const toast = document.getElementById('toast');

    if (overlay) overlay.style.display = 'block';
    if (toast) toast.style.display = 'block';

    setTimeout(() => {
        location.reload();
    }, 2000);
}
