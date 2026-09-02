/* ============================================================
   1. 全域變數與工具函數
   ============================================================ */

const DATA_URL         = 'usage-sample.json'; // 預設 API 網址
const RANGE_DAYS       = 31;                  // 可查詢前後天數
const AUTO_REFRESH_SEC = 0;                  // 自動更新秒數 (0 代表關閉)

// 原生 DOM 選擇器別名
const $$ = s => document.querySelector(s); 
const pad = n => String(n).padStart(2, '0');

const ymd = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const parseYmd = s => { const [y, m, dd] = s.split('-').map(Number); return new Date(y, m - 1, dd); };
const addDays = (s, k) => { const d = parseYmd(s); d.setDate(d.getDate() + k); return ymd(d); };
const isSameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
const esc = s => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// 星期對照表
const WEEK_DAYS = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];

// 日期區間算力 (YYYY-MM-DD)
const TODAY = ymd(new Date());
const MIN   = addDays(TODAY, -RANGE_DAYS); 
const MAX   = addDays(TODAY, RANGE_DAYS);  

const params = new URLSearchParams(location.search);

// 當前選取的日期 (預設優先讀取 URL 的 ?date=)
let curDate = (function() {
  const q = (params.get('date') || '').trim();
  return (q && /^\d{4}-\d{2}-\d{2}$/.test(q) && q >= MIN && q <= MAX) ? q : TODAY;
})();

let viewDate = parseYmd(curDate); // Modal 日曆視角月份
let filter   = 'all';             // 球道篩選 (all/std/dyn/aa)
let query    = '';                // 關鍵字搜尋
let rows     = [];                // API 資料陣列
let lastLoad = null;

const cache  = new Map();
const srcUrl = (params.get('src') || DATA_URL || '').trim();


/* ============================================================
   2. 邏輯與輔助函式
   ============================================================ */

function todaysRows() {
  return rows.filter(r => !r.date || r.date === curDate);
}

function isActive(r) {
  if (!r.time || !r.end || curDate !== TODAY) return false;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  const [h1, m1] = r.time.split(':').map(Number);
  const [h2, m2] = r.end.split(':').map(Number);
  
  const startMinutes = h1 * 60 + m1;
  const endMinutes = h2 * 60 + m2;
  
  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

function slot(r) {
  return r.end ? `${r.time}～${r.end}` : r.time;
}


/* ============================================================
   3. 資料抓取 (jQuery $.ajax POST)
   ============================================================ */
function load(force) {
  lastLoad = new Date();
  const key = '__all__';
  
  if (force) cache.delete(key);

  if (!force && cache.has(key)) { 
    rows = cache.get(key); 
    if (typeof render === 'function') render(); 
    return; 
  }

  setLoading(true);

  if (!srcUrl) {
    if ($('#notice').length) {
      $('#notice').html('<div class="note container-sm py-3 px-3">尚未設定 API 網址，請在設定區填入 DATA_URL。</div>');
    }
    rows = [];
    setLoading(false);
    if (typeof render === 'function') render();
    return;
  }

  $.ajax({
    type: "GET",
    url: srcUrl,
    data: { 
      StartDateTime: MIN,
      EndDateTime: MAX
    },
    dataType: "json",
    success: (data) => {
      if ($('#notice').length) $('#notice').empty();
      
      rows = parseRows(data);
      cache.set(key, rows);
      
      setLoading(false);
      if (typeof render === 'function') render();
    },
    error: (jqXHR, textStatus, errorThrown) => {
      console.error('AJAX 錯誤:', textStatus, errorThrown);
      
      if ($('#notice').length) {
        $('#notice').html(`<div class="note container-sm py-3 px-3">無法連線到資料來源（${esc(errorThrown || textStatus)}），請稍後再試。</div>`);
      }
      
      rows = [];
      setLoading(false);
      if (typeof render === 'function') render();
    }
  });
}

function setLoading(on) {
  const btn = $$('#btnRefresh');
  if (btn) btn.classList.toggle('spin', on);
  const listEl = $$('#list');
  if (on && listEl) listEl.innerHTML = '<div class="sk"></div><div class="sk"></div><div class="sk"></div>';
}

function parseRows(json) {
  const list = Array.isArray(json) ? json : (json.data || []);
  return list.map(row => ({
    date:   row.date || '',
    time:   row.startTime ? row.startTime.slice(0, 5) : '',
    end:    row.endTime   ? row.endTime.slice(0, 5)   : '',
    course: row.course === 'dynamic' ? 'dyn' : row.course === 'standard' ? 'std' : 'oth',
    eid:    String(row.empId || '').trim(),
    name:   String(row.name || '').trim(),
    phone:  String(row.phone || '').trim()
  }));
}