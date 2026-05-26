function showView(v) {

    document.querySelectorAll('.card').forEach(c => {
        c.classList.add('hidden');
    });

    document
        .getElementById('view-' + v)
        .classList.remove('hidden');

    if(v === 'attendance') {
        initDays();
    }

    if(v === 'admin') {
        loadStats();
    }

    window.scrollTo(0, 0);
}

function showStep(s) {

    curStep = s;

    document
        .getElementById('step-days')
        .classList.toggle('hidden', s !== 1);

    document
        .getElementById('step-clubs')
        .classList.toggle('hidden', s !== 2);

    document
        .getElementById('step-members')
        .classList.toggle('hidden', s !== 3);
}

function handleBack() {

    if(curStep === 1) {
        showView('home');
    } else {
        showStep(curStep - 1);
    }
}

function showCompleteToast() {

    document.getElementById('overlay').style.display = 'block';

    document.getElementById('toast').style.display = 'block';

    setTimeout(() => {
        location.reload();
    }, 2000);
}
