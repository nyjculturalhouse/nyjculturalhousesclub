/* 모바일 시간표: 기존 fixedSchedules 데이터를 그대로 재사용. */
(() => {
  const originalShowSchedule = window.showSchedule;
  let currentType = 'dance';
  const weekday = ['일','월','화','수','목','금','토'][new Date().getDay()];
  let currentDay = weekday === '월' ? '화' : weekday;
  let view = new URLSearchParams(location.search).get('view') === 'list' ? 'list' : 'grid';
  const panel = document.getElementById('schedule-list-panel');
  const grid = document.querySelector('.schedule-grid-shell');
  const picker = document.getElementById('schedule-day-picker');
  const week = document.getElementById('mobile-week-panel');
  const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function renderWeek(schedule) {
    const rowIndex = time => { const [h,m]=time.split(':').map(Number); return 2+((h-10)*60+m)/30; };
    let cells='<div class="week-corner">시간</div>'+schedule.data.map((r,i)=>'<div class="week-day" style="grid-column:'+(i+2)+';grid-row:1">'+escape(r.day)+'</div>').join('');
    for(let slot=0;slot<19;slot++){
      const hour=10+Math.floor(slot/2), minute=slot%2?'30':'00';
      cells+='<div class="week-time" style="grid-row:'+(slot+2)+';grid-column:1">'+(slot%2?'':hour+':'+minute)+'</div>';
      for(let day=0;day<6;day++)cells+='<div aria-hidden="true" class="week-cell '+(day>=4&&slot>=10?'week-closed':'')+'" style="grid-row:'+(slot+2)+';grid-column:'+(day+2)+'"></div>';
    }
    schedule.data.forEach((row,day)=>{
      if(day>=4)cells+='<div class="week-closed-label" style="grid-column:'+(day+2)+';grid-row:12/21">15:00<br>이후<br>미운영</div>';
      row.records.forEach((ev,index)=>{
        const [start,end]=ev.time.split('~');
        cells+='<button type="button" class="week-event" data-week-day="'+day+'" data-week-event="'+index+'" style="grid-column:'+(day+2)+';grid-row:'+rowIndex(start)+'/'+rowIndex(end)+'" aria-label="'+escape(row.day+'요일 이용 중 '+ev.time)+'"><strong>이용 중</strong><span>'+escape(start)+'<br>–'+escape(end)+'</span></button>';
      });
    });
    week.innerHTML='<p class="week-help">화~일을 한눈에 비교하세요. 파란 칸은 이용 중인 시간입니다. 누르면 시간을 확인할 수 있어요.</p><div class="mobile-week-grid" role="region" aria-label="'+escape(schedule.title)+' 화요일부터 일요일까지 주간 전체 시간표">'+cells+'</div><p class="week-help">파란 칸: 이용 중 · 흰 칸: 정기 일정 없음 · 회색 칸: 미운영<br>빈 칸이 실제 예약 가능을 의미하지는 않습니다.</p>';
  }

  function render() {
    const schedule = fixedSchedules[currentType];
    document.getElementById('schedule-room-title').textContent = schedule.title;
    document.querySelectorAll('[data-schedule-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.scheduleMode === view)));
    panel.hidden = view !== 'list'; grid.hidden = view !== 'grid'; picker.hidden = view !== 'list'; week.hidden = view !== 'grid'; renderWeek(schedule);
    picker.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.day === currentDay)));
    const rows = currentDay === '전체' ? schedule.data : schedule.data.filter(r => r.day === currentDay);
    panel.innerHTML = rows.map(row => `<section aria-label="${escape(row.day)}요일 일정"><h4 class="schedule-list-title">${escape(row.day)}요일 <span style="font-size:15px;font-weight:400;color:#58616a">· ${row.records.length}개 일정</span></h4>${row.records.length ? `<ul class="schedule-list">${row.records.map(ev => `<li class="schedule-record"><time>${escape(ev.time.replace('~',' – '))}</time><div><strong>이용 중</strong><small>정기 활동 시간</small></div></li>`).join('')}</ul>` : '<div class="schedule-empty">등록된 정기 일정이 없습니다.</div>'}${['토','일'].includes(row.day) ? '<p class="schedule-notice">주말(토, 일)은 15:00 이후 미운영합니다.</p>' : ''}</section>`).join('');
    const count = rows.reduce((n,r) => n+r.records.length,0);
    document.getElementById('schedule-list-status').textContent = `${schedule.title} · ${view === 'grid' ? '화~일 전체' : currentDay === '전체' ? '전체 요일' : currentDay+'요일'} · ${view === 'grid' ? schedule.data.reduce((n,r)=>n+r.records.length,0) : count}개 정기 일정`;
  }
  window.showSchedule = function(type) { originalShowSchedule(type); currentType = type; render(); };
  picker.addEventListener('click', event => { const button=event.target.closest('button[data-day]'); if(button){ currentDay=button.dataset.day; render(); }});
  document.querySelectorAll('[data-schedule-mode]').forEach(b => b.addEventListener('click', () => { view=b.dataset.scheduleMode; render(); }));
  week.addEventListener('click', event => {
    const button=event.target.closest('button[data-week-day]'); if(!button)return;
    const row=fixedSchedules[currentType].data[Number(button.dataset.weekDay)];const ev=row.records[Number(button.dataset.weekEvent)];
    document.getElementById('week-detail-title').textContent='이용 중인 시간';
    document.getElementById('week-detail-body').textContent=fixedSchedules[currentType].title+' · '+row.day+'요일 · '+ev.time;
    document.getElementById('week-detail-dialog').showModal();
  });
  // 링크로 바로 시간표 시안을 열어볼 수 있게 지원한다.
  if(location.hash === '#schedule') window.showBookingTab('schedule');
  else render();
})();
