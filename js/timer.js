/* ============================================================
   閒置 5 分鐘提示與關閉刷新機制
   ============================================================ */
(function () {
  const IDLE_TIMEOUT_MS = 5*60*1000; 
  let idleTimer = null;
  let isIdleModalOpen = false;

  // 顯示閒置彈窗
  function showIdleModal() {
    isIdleModalOpen = true;

    // 1. 若日曆 Modal 正在開啟，先將日曆關閉
    const calModalEl = document.querySelector('#calModal');
    if (calModalEl && window.bootstrap) {
      const calInstance = bootstrap.Modal.getInstance(calModalEl);
      if (calInstance) calInstance.hide();
    }

    // 2. 顯示閒置彈窗
    const idleModalEl = document.querySelector('#idleModal');
    if (idleModalEl && window.bootstrap) {
      const modalInstance = new bootstrap.Modal(idleModalEl);
      modalInstance.show();
    } else {
      alert('頁面已閒置超過 5 分鐘，按下確定將重新整理。');
      window.location.reload();
    }
  }

  // 重置計時器
  function resetIdleTimer() {
    if (isIdleModalOpen) return;

    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(showIdleModal, IDLE_TIMEOUT_MS);
  }

  // 監聽使用者互動事件
  const activityEvents = ['mousemove', 'keydown', 'touchstart', 'scroll', 'click'];
  activityEvents.forEach(eventName => {
    window.addEventListener(eventName, resetIdleTimer, { passive: true });
  });

  // 初始化事件
  document.addEventListener('DOMContentLoaded', () => {
    resetIdleTimer();

    // 動態給閒置彈窗的遮罩加上專屬 Class，防止影響一般彈窗
    const idleModalEl = document.querySelector('#idleModal');
    if (idleModalEl) {
      idleModalEl.addEventListener('show.bs.modal', () => {
        setTimeout(() => {
          const backdrops = document.querySelectorAll('.modal-backdrop');
          if (backdrops.length > 0) {
            backdrops[backdrops.length - 1].classList.add('idle-backdrop');
          }
        }, 10);
         
      });
      goto(TODAY);
    }

    // 重新整理按鈕事件
    const btnReload = document.querySelector('#btnReload');
    btnReload.addEventListener('click', () => {
  const idleModalEl = document.querySelector('#idleModal');
  const modalInstance = idleModalEl && window.bootstrap
    ? bootstrap.Modal.getInstance(idleModalEl)
    : null;

  if (modalInstance) modalInstance.hide();

  isIdleModalOpen = false;
  load();
  resetIdleTimer();
});
  }
);
})();
