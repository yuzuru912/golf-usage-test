/* ============================================================
   API 與共用設定
   ============================================================ */


const DATA_URL = 'usage-sample.json';
const API_METHOD = 'GET'; // 或 'POST'，視 API 設計而定
const RANGE_DAYS = 31;
const calendarDates = new Set(); //相同值只保留一次

const $$ = selector => document.querySelector(selector);

const pad = number => String(number).padStart(2, '0');

const ymd = date =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const parseYmd = value => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const addDays = (dateString, days) => {
  const date = parseYmd(dateString);
  date.setDate(date.getDate() + days);
  return ymd(date);
};

const isSameDay = (date1, date2) =>
  date1.getFullYear() === date2.getFullYear() &&
  date1.getMonth() === date2.getMonth() &&
  date1.getDate() === date2.getDate();


/* ============================================================
   頁面狀態
   ============================================================ */

const WEEK_DAYS = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];

const TODAY = ymd(new Date());
const MIN = addDays(TODAY, -RANGE_DAYS);
const MAX = addDays(TODAY, RANGE_DAYS);

let curDate = TODAY;
let rows = []; // 修正：補上全域變數宣告

let viewDate = parseYmd(curDate);
let filter = 'all';
let query = '';
let lastLoad = null;

let currentRequest = null;


/* ============================================================
   資料處理
   ============================================================ */

function isActive(row) {
  if (!row.time || !row.end || curDate !== TODAY) return false;

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const [startHour, startMinute] = row.time.split(':').map(Number);
  const [endHour, endMinute] = row.end.split(':').map(Number);

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  return nowMinutes >= startMinutes && nowMinutes < endMinutes;
}

function slot(row) {
  return row.end ? `${row.time}～${row.end}` : row.time;
}

function parseRows(response) {
  const list = Array.isArray(response)
    ? response
    : (response.data || response.Data || []);

  if (!Array.isArray(list)) {
    console.warn('API 回傳格式不正確：', response);
    return [];
  }

  return list.map(row => {
    const startTime = row.startTime || row.StartTime || '';
    const endTime = row.endTime || row.EndTime || '';

    return {
      date: row.date || row.Date || curDate, // 補上 date 欄位提供渲染比對
      time: String(startTime).slice(0, 5),
      end: String(endTime).slice(0, 5),
      course: row.course === 'dynamic' ? 'dyn' : 'std',
      eid: row.empId,
      name: row.name,
      phone: row.phone
    };
  });
}


/* ============================================================
   Ajax：每次查詢目前選擇的一天
   ============================================================ */
function load() {
  if (currentRequest) {
    currentRequest.abort();
  }

  const requestedDate = curDate;

  setLoading(true);

currentRequest = $.ajax({
    url: DATA_URL,
    method: API_METHOD,
    contentType: 'application/json; charset=utf-8',
    dataType: 'json',
    timeout: 10000,
    data: JSON.stringify({
      StartDateTime: requestedDate,
      EndDateTime: addDays(requestedDate, 1)
    })
  })
    .done(response => {
      if (curDate !== requestedDate) return;

      rows = parseRows(response);
      lastLoad = new Date();

      if ($('#notice').length) $('#notice').empty();
      render();
    })
    .fail((jqXHR, textStatus, errorThrown) => {
      if (textStatus === 'abort') return;
      if (curDate !== requestedDate) return;

      console.error('Ajax 請求失敗：', {
        status: jqXHR.status,
        textStatus,
        errorThrown,
        responseText: jqXHR.responseText
      });

      rows = [];

      // 修正：補齊模板字串的反引號
      if ($('#notice').length) {
        $('#notice').text(
          `無法連線到資料來源（${errorThrown || textStatus || '未知錯誤'}）。`
        );
      }

      render();
    })
    .always(() => {
      if (curDate === requestedDate) {
        setLoading(false);
      }

      currentRequest = null;
    });
}

function setLoading(isLoading) {
  const refreshButton = $$('#btnRefresh');
  const listElement = $$('#list');

  if (refreshButton) {
    refreshButton.classList.toggle('spin', isLoading);
    refreshButton.disabled = isLoading;
  }

  if (isLoading && listElement) {
    listElement.innerHTML = `
      <div class="sk"></div>
      <div class="sk"></div>
      <div class="sk"></div>
    `;
  }
}

