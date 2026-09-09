/* ============================================================
   4. 卡片與畫面渲染 (獨立權責)
   ============================================================ */

function card(r) {
  // 1. 安全處理電話號碼，防止 null/undefined 導致程式崩潰
  const phoneStr = String(r.phone || '').trim();
  const digits = phoneStr.replace(/[^\d+]/g, '');
  
  const cls = r.course;
  const act = isActive(r);

  const isEmptySlot = !r.name && !r.eid;

  // 可預約（空球道）樣式
  if (isEmptySlot) {
    return `
    <div class="card ${cls} empty-slot" style="background-color: #f8fafc; border: 1.5px dashed #cbd5e1;">
      <div class="card-body-custom">
        <div class="line1">
          <span class="name" style="color: #64748b; font-size: 1rem;">可預約球道</span>
        </div>
        <div class="line2">
          <span class="tag ${cls}">${cls === 'std' ? '標準球道' : '動態球道'}</span>
          ${r.time ? `<span class="time" style="color: #64748b;">${slot(r)}</span>` : ''}
        </div>
      </div>
    </div>`;
  }
  
  // 已預約卡片樣式
  return `
  <div class="card ${cls}${act ? ' is-active live' : ''}">
    <div class="card-body-custom">
      <div class="line1">
        <span class="name">${(r.name || '（未填姓名）')}</span>
            ${r.eid ? `<span class="eid">${(r.eid)}</span>` : ''}
        ${act ? '<span class="badge-live"><i class="dot"></i>使用中</span>' : ''}
      </div>
      <div class="line2">
        <span class="tag ${cls}" style="font-weight: 600;">${cls === 'std' ? '標準球道' : '動態球道'}</span>
        ${r.time ? `<span class="time" style="font-weight: 600;">${slot(r)}</span>` : ''}
        ${phoneStr ? `<span class="phone">${(phoneStr)}</span>` : '<span class="phone">無電話</span>'}
      </div>
    </div>

    <div class="card-action">
      ${digits
        ? `<a class="call" href="tel:${(digits)}" aria-label="撥打給 ${(r.name)}">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
               <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>
             </svg>
           </a>`
        : `<span class="call off" title="無電話號碼">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
               <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>
               <line x1="22" y1="2" x2="2" y2="22"/>
             </svg>
           </span>`}
    </div>
  </div>`;
}

function render() {
  // 只保留目前選擇日期 (curDate) 的資料
  const base = rows.filter(r => r.date === curDate);

  const cStd = base.filter(r => r.course === 'std').length;
  const cDyn = base.filter(r => r.course === 'dyn').length;

  if ($$('#nAll')) $$('#nAll').textContent = base.length;
  if ($$('#nStd')) $$('#nStd').textContent = cStd;
  if ($$('#nDyn')) $$('#nDyn').textContent = cDyn;

  let list = filter === 'all' ? base : base.filter(r => r.course === filter);
  if (query) {
    const q = query.toLowerCase();
    list = list.filter(r => (r.eid + ' ' + r.name + ' ' + r.phone).toLowerCase().includes(q));
  }

  const d = parseYmd(curDate);
  if ($$('#dLabel')) $$('#dLabel').textContent = (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日' + (curDate === TODAY ? '（今天）' : '');
  if ($$('#dWeek')) $$('#dWeek').textContent = d.getFullYear() + ' 年・' + WEEK_DAYS[d.getDay()];

  const realUsers = list.filter(r => r.name || r.eid);
  const userCount = realUsers.length;
  const nLive = base.filter(r => (r.name || r.eid) && isActive(r)).length;

  if ($$('#count')) {
    $$('#count').innerHTML = userCount
      ? '共 ' + userCount + ' 位使用者' + (filter === 'all' ? '（標準 ' + cStd + '・動態 ' + cDyn + '）' : '')
        + (nLive ? ' <b class="livecnt">・目前使用中 ' + nLive + ' 位</b>' : '')
      : '';
  }

  if ($$('#list')) {
    $$('#list').innerHTML = list.length 
      ? list.map(card).join('') 
      : `<div class="empty text-center py-4">
          <div class="big">⛳</div>
          <div>這一天${filter === 'std' ? '標準球道' : filter === 'dyn' ? '動態球道' : ''}沒有使用紀錄</div>
         </div>`;
  }

  if ($$('#srcNote')) {
    $$('#srcNote').textContent = lastLoad
      ? '資料已更新 ' + pad(lastLoad.getHours()) + ':' + pad(lastLoad.getMinutes())
      : '';
  }
}
