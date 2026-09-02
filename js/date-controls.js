/* ============================================================
   日期選擇與 Ajax 查詢
   ============================================================ */

function goto(dateStr) {
  // 限制只能查詢今天前後 31 天
  if (dateStr < MIN) dateStr = MIN;
  if (dateStr > MAX) dateStr = MAX;

  // 日期沒有改變就不重新查詢
  if (curDate === dateStr) return;

  curDate = dateStr;

  // 網址保留目前選擇的日期，例如 ?date=2026-09-01
  const params = new URLSearchParams(window.location.search);
  params.set('date', curDate);
  history.replaceState(null, '', `${location.pathname}?${params}`);

  // 日期改變後，重新 Ajax 查詢該日期資料
  load();
}


/* ============================================================
   Modal 日曆渲染
   ============================================================ */

function renderCalendarGrid() {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const titleEl = $$('#mTitle');
  if (titleEl) {
    titleEl.textContent = `${year} 年 ${month + 1} 月`;
  }

  const grid = $$('#calGrid');
  if (!grid) return;

  grid.innerHTML = '';

  // 星期標題
  ['日', '一', '二', '三', '四', '五', '六'].forEach(week => {
    grid.innerHTML += `
      <div class="fw-bold text-secondary small py-1 text-center">
        ${week}
      </div>
    `;
  });

  // 當月第一天是星期幾；補上前方空格
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    grid.innerHTML += '<div></div>';
  }

  const minDateObj = parseYmd(MIN);
  const maxDateObj = parseYmd(MAX);
  const selectedDateObj = parseYmd(curDate);
  const todayObj = parseYmd(TODAY);

  // 產生當月每一天的按鈕
  for (let day = 1; day <= totalDays; day++) {
    const targetDate = new Date(year, month, day);
    const targetYmd = ymd(targetDate);

    const isToday = isSameDay(targetDate, todayObj);
    const isSelected = isSameDay(targetDate, selectedDateObj);
    const isDisabled =
      targetDate < minDateObj || targetDate > maxDateObj;

    const dayBtn = document.createElement('button');

    dayBtn.type = 'button';
    dayBtn.textContent = day;
    dayBtn.disabled = isDisabled;

    dayBtn.className = `
      btn btn-sm rounded-circle p-0
      d-flex align-items-center justify-content-center mx-auto
      ${isSelected ? 'btn-success' : ''}
      ${!isSelected && isToday ? 'btn-outline-success fw-bold' : ''}
      ${!isSelected && !isToday ? 'btn-light' : ''}
      ${isDisabled ? 'opacity-25' : ''}
    `;

    dayBtn.style.width = '32px';
    dayBtn.style.height = '32px';

    if (!isDisabled) {
      dayBtn.onclick = () => {
        goto(targetYmd);
        closeCalModal();
      };
    }

    grid.appendChild(dayBtn);
  }
}

function closeCalModal() {
  const calModalEl = $$('#calModal');

  if (!calModalEl || !window.bootstrap) return;

  const modalInstance = bootstrap.Modal.getInstance(calModalEl);

  if (modalInstance) {
    modalInstance.hide();
  }
}


/* ============================================================
   DOM 事件繫結
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // 重新整理：重新 Ajax 抓取目前選擇日期
  const btnRefresh = $$('#btnRefresh');

  if (btnRefresh) {
    btnRefresh.onclick = () => load();
  }

  // 球道篩選只重繪畫面，不需重新呼叫 API
  document.querySelectorAll('input[name="course"]').forEach(radio => {
    radio.addEventListener('change', event => {
      filter = event.target.value;
      render();
    });
  });

  // 每次打開日曆，從目前選取日期的月份開始顯示
  const calModalEl = $$('#calModal');

  if (calModalEl) {
    calModalEl.addEventListener('show.bs.modal', () => {
      viewDate = parseYmd(curDate);
      renderCalendarGrid();
    });
  }

  // 日曆上一個月
  const mPrev = $$('#mPrev');

  if (mPrev) {
    mPrev.onclick = () => {
      viewDate.setMonth(viewDate.getMonth() - 1);
      renderCalendarGrid();
    };
  }

  // 日曆下一個月
  const mNext = $$('#mNext');

  if (mNext) {
    mNext.onclick = () => {
      viewDate.setMonth(viewDate.getMonth() + 1);
      renderCalendarGrid();
    };
  }

  // 日曆內的「回到今天」
  const calToday = $$('#calToday');

  if (calToday) {
    calToday.onclick = () => {
      goto(TODAY);
      closeCalModal();
    };
  }

  // 姓名／工號搜尋只重繪畫面，不需重新呼叫 API
  const searchInput = $$('#q');

  if (searchInput) {
    searchInput.oninput = event => {
      query = event.target.value.trim();
      render();
    };
  }

  // 開啟頁面時，Ajax 查詢今天資料
  load();
});