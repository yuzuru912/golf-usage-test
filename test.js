const MIN = '2026-08-01';
const MAX = '2026-09-30';

$.ajax({
  url: 'https://car-inapi.csun.com.tw/api/GetGolfReservation',
  method: 'POST',
  contentType: 'application/json;',
  dataType: 'json',
  data: JSON.stringify({
    StartDateTime: MIN,
    EndDateTime: MAX
  }),
    success: function (res) {
    console.log(res);

    if (res.count === 0) {
        console.log('查無資料');
        return;
    }

    res.data.forEach(function (item) {
        console.log(item);
    });
    },
  error: function (xhr) {
    console.error('請求失敗：', xhr.status, xhr.responseText);
  }
});



      $('#notice').html(`
        <div class="note container-sm py-3 px-3">
          無法連線到資料來源
          （${esc(errorThrown || textStatus || '未知錯誤')}）。
        </div>
      `);