# 高爾夫球場使用狀況 — GitHub Pages 測試包

## 上傳步驟

1. 在 GitHub 建一個新的 repository，例如 `golf-usage`（**Public**，Pages 才免費）
2. 把這個資料夾裡的**所有檔案**上傳到 repo 根目錄（index.html、usage-sample.json、manifest.json、以及全部 icon 檔）
   （網頁上點 `Add file` → `Upload files` → 拖進去 → `Commit changes`）
3. 進 repo 的 `Settings` → 左側 `Pages`
4. `Source` 選 **Deploy from a branch**，Branch 選 **main** + **/ (root)**，按 `Save`
5. 等 1～2 分鐘，重新整理該頁面，上方會出現網址：
   `https://<你的帳號>.github.io/golf-usage/`
6. 手機開這個網址即可測試（Safari 分享鍵 → 加入主畫面；Chrome 選單 → 加到主畫面）

## App 圖示

已內含以下圖示檔，加到主畫面後會顯示綠底的日曆＋高爾夫球圖示，全螢幕開啟（沒有網址列）：

| 檔案 | 用途 |
|---|---|
| `icon-180.png` | iPhone / iPad 加入主畫面 |
| `icon-192.png` / `icon-512.png` | Android 加入主畫面 |
| `icon-maskable-192.png` / `icon-maskable-512.png` | Android 自適應圖示（圓形／方形裁切） |
| `icon-32.png` / `favicon.ico` | 瀏覽器分頁小圖示 |
| `manifest.json` | 定義 App 名稱「球場使用」、主題色、全螢幕模式 |

⚠️ 這些檔案必須跟 `index.html` 放在**同一個資料夾**，圖示才會生效。
若之前已經加到主畫面過，iOS 會記住舊圖示 —— 請先刪掉主畫面上的舊捷徑，再重新加入一次。

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
