# Birthday Game - Copilot Instructions

## 專案概述
這是一個純前端的互動式生日慶祝遊戲，包含 5 個連續關卡。使用 Vanilla JavaScript，無框架依賴。

## 架構模式

### 檔案結構
```
birthday-game/
├── index.html          # 單頁應用，所有畫面皆為 <section class="screen">
├── css/style.css       # 統一樣式表，使用 CSS 變數管理主題色
└── js/
    ├── main.js         # 核心：gameState 物件、螢幕切換、共用函數
    ├── game1.js        # 關卡邏輯依序載入
    ├── game2.js        # 每個遊戲有獨立的 initGameX() 入口
    ├── game3.js
    ├── game4.js
    └── game5.js
```

### 全域狀態管理
所有遊戲狀態儲存在 `main.js` 的 `gameState` 物件：
```javascript
const gameState = {
    playerName: '',
    cake: { shape, flavor, creamColor, decorations, candles, message },
    collectedBlessings: [],
    wish: '',
    currentScreen: 'welcome'
};
```

### 畫面切換模式
- 使用 `showScreen(screenName)` 切換顯示的 section
- 透過 `.screen.active` CSS class 控制顯示/隱藏
- 每個關卡結束時呼叫下一關的 `initGameX()` 函數

## 開發慣例

### CSS 命名規則
- 畫面容器：`#game1-screen`, `#game2-screen`...
- 遊戲區域：`.game-container`, `.game-header`
- 互動元素：`.btn`, `.btn-primary`, `.btn-small`
- 主題色使用 CSS 變數：`--primary-color`, `--secondary-color`, `--accent-color`

### JavaScript 模式
- 每個關卡 JS 檔案有一個 `initGameX()` 作為進入點
- 使用 `data-*` 屬性傳遞選項值（如 `data-shape="circle"`）
- 拖曳功能統一使用 `makeDraggable(element)` 模式
- 同時支援滑鼠與觸控事件（mousedown/touchstart）

### 動畫實作
- CSS animations 用於重複性動畫（float, flicker, pulse）
- JavaScript 控制動態效果（進度條、計時器）
- 使用 `@keyframes` 定義於 `style.css`

## 新增關卡指南

1. 在 `index.html` 新增 `<section id="gameX-screen" class="screen">`
2. 建立 `js/gameX.js`，實作 `initGameX()` 函數
3. 在前一關結束處呼叫 `showScreen('gameX'); initGameX();`
4. 在 `index.html` 底部 `<script>` 標籤中引入新 JS 檔

## 跨關卡資料傳遞
蛋糕外觀在關卡間保持一致，透過 `gameState.cake` 傳遞，使用 `applyCakeStyle(element)` 套用樣式到任何蛋糕顯示元素。

## 祝福語擴充
祝福語儲存在 `main.js` 的 `blessings` 陣列，氣球遊戲會隨機抽取顯示：
```javascript
const blessings = [
    '生日快樂！🎉',
    '願你天天開心！😊',
    // 新增祝福語只需在此陣列追加
];
```
收集到的祝福會存入 `gameState.collectedBlessings`，並在結束畫面顯示。

## 響應式設計 (RWD)

### 斷點設定
| 斷點 | 裝置 | 主要調整 |
|------|------|---------|
| `> 768px` | 桌面 | 預設佈局 |
| `≤ 768px` | 平板 | `.tools-panel` 改為橫向排列 |
| `≤ 480px` | 手機 | 選項改為垂直排列、縮小蛋糕尺寸 |

### RWD 開發規範
- 使用 `@media (max-width: Xpx)` 撰寫響應式樣式
- 避免固定寬度，優先使用 `max-width` 和百分比
- 觸控區域至少 44x44px（符合無障礙標準）
- 遊戲區域高度使用 `min-height` 而非固定值

### 關鍵響應式類別
```css
/* 平板以下 */
@media (max-width: 768px) {
    .decorate-container { flex-direction: column; }
    .tools-panel { flex-direction: row; flex-wrap: wrap; }
}

/* 手機 */
@media (max-width: 480px) {
    .options { flex-direction: column; }
    #cake-canvas { width: 250px; height: 250px; }
}
```
