# 高爾夫球場使用狀況 — GitHub Pages 測試包

## 上傳步驟

1. 在 GitHub 建一個新的 repository，例如 `golf-usage`（**Public**，Pages 才免費）
2. 把這個資料夾裡的 `index.html`、`usage-sample.json` 兩個檔案上傳到 repo 根目錄
   （網頁上點 `Add file` → `Upload files` → 拖進去 → `Commit changes`）
3. 進 repo 的 `Settings` → 左側 `Pages`
4. `Source` 選 **Deploy from a branch**，Branch 選 **main** + **/ (root)**，按 `Save`
5. 等 1～2 分鐘，重新整理該頁面，上方會出現網址：
   `https://<你的帳號>.github.io/golf-usage/`
6. 手機開這個網址即可測試（Safari 分享鍵 → 加入主畫面；Chrome 選單 → 加到主畫面）

## 已經設定好的部分

`index.html` 裡的 `DATA_URL` 已指向同資料夾的 `usage-sample.json`：

```js
const DATA_URL = 'usage-sample.json';
```

因為兩個檔在同一個網域，**不會有 CORS 問題**。

## 之後要換成真實資料

- 若正式 API 好了：把 `DATA_URL` 改成完整網址，例如
  `const DATA_URL = 'https://你們網站/api/x7k2m9/usage.json';`
  （這時 API 端要加 `Access-Control-Allow-Origin: *`）
- 也可以不改檔案，直接開 `https://<你的帳號>.github.io/golf-usage/?src=你的JSON網址` 測試

## ⚠️ 重要：不要把真實員工資料放上 GitHub Pages

GitHub Pages 的網頁**任何人只要知道網址就看得到**，就算 repo 設成 Private，
Pages 發布出來的內容仍然是公開的（私人 Pages 只有 Enterprise 方案才有）。

- 用 `usage-sample.json` 這種假資料測試 → 沒問題
- 放真實的工號、姓名、手機 → **不要這樣做**，正式上線請放在公司內網或自家伺服器

另外 GitHub Pages 只能放靜態檔案，所以 `?date={date}` 這種帶參數的查詢方式在這裡不能用，
測試時請用「一次回傳整批」的模式（本測試包就是這樣設定的）。
