/* ========================================
   生日遊戲 - 主程式
   ======================================== */

// 遊戲狀態
const gameState = {
    mode: 'self', // 'self' 或 'friend'
    playerName: '',
    senderName: '',
    cake: {
        shape: 'circle',
        flavor: 'vanilla',
        creamColor: '#FFB6C1',
        decorations: [],
        candles: [],
        message: ''
    },
    collectedBlessings: [],
    wish: '',
    currentScreen: 'welcome'
};

// 祝福語列表
const blessings = [
    '生日快樂！🎉',
    '願你天天開心！😊',
    '心想事成！💫',
    '健康平安！💪',
    '幸福美滿！💕',
    '萬事如意！🌟',
    '青春永駐！✨',
    '笑口常開！😄',
    '夢想成真！🌈',
    '好運連連！🍀',
    '財源滾滾！💰',
    '事業順利！📈',
    '愛情甜蜜！💝',
    '友誼長存！🤝',
    '快樂每一天！🌻'
];

// DOM 元素
const screens = {
    welcome: document.getElementById('welcome-screen'),
    game1: document.getElementById('game1-screen'),
    game2: document.getElementById('game2-screen'),
    game3: document.getElementById('game3-screen'),
    game4: document.getElementById('game4-screen'),
    game5: document.getElementById('game5-screen'),
    end: document.getElementById('end-screen'),
    gift: document.getElementById('gift-screen')
};

// 切換螢幕
function showScreen(screenName) {
    Object.values(screens).forEach(screen => {
        if (screen) screen.classList.remove('active');
    });
    if (screens[screenName]) {
        screens[screenName].classList.add('active');
    }
    gameState.currentScreen = screenName;

    // 更新玩家名稱顯示
    document.querySelectorAll('.player-name').forEach(el => {
        if (gameState.mode === 'friend') {
            el.textContent = `🎁 為 ${gameState.playerName} 製作祝福`;
        } else {
            el.textContent = `🎂 ${gameState.playerName} 的生日派對`;
        }
    });
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 檢查是否有分享資料
    checkSharedGift();
    
    // 模式選擇
    const modeButtons = document.querySelectorAll('.mode-btn');
    const inputSection = document.getElementById('input-section');
    const senderInput = document.getElementById('sender-input');
    const nameLabel = document.getElementById('name-label');
    
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modeButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            gameState.mode = btn.dataset.mode;
            
            // 顯示輸入區
            inputSection.classList.remove('hidden');
            
            // 根據模式調整顯示
            if (gameState.mode === 'friend') {
                nameLabel.textContent = '壽星的名字（你要祝福的人）：';
                senderInput.classList.remove('hidden');
            } else {
                nameLabel.textContent = '請輸入你的名字：';
                senderInput.classList.add('hidden');
            }
        });
    });

    // 開始按鈕
    const startBtn = document.getElementById('start-btn');
    const nameInput = document.getElementById('birthday-name');
    const senderNameInput = document.getElementById('sender-name');

    startBtn.addEventListener('click', () => {
        const name = nameInput.value.trim() || '壽星';
        gameState.playerName = name;
        
        if (gameState.mode === 'friend') {
            gameState.senderName = senderNameInput.value.trim() || '神秘朋友';
        }
        
        showScreen('game1');
        initGame1();
    });

    // Enter 鍵也可以開始
    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            startBtn.click();
        }
    });

    // 重新開始按鈕
    document.getElementById('replay-btn').addEventListener('click', () => {
        // 清除 URL 參數
        window.history.replaceState({}, document.title, window.location.pathname);
        location.reload();
    });

    // 複製連結按鈕
    const copyLinkBtn = document.getElementById('copy-link-btn');
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', copyShareLink);
    }

    // LINE 分享按鈕
    const lineBtn = document.getElementById('share-line-btn');
    if (lineBtn) {
        lineBtn.addEventListener('click', shareToLine);
    }

    // Facebook 分享按鈕
    const fbBtn = document.getElementById('share-fb-btn');
    if (fbBtn) {
        fbBtn.addEventListener('click', shareToFacebook);
    }

    // 收禮畫面的「我也要製作」按鈕
    const createOwnBtn = document.getElementById('create-own-btn');
    if (createOwnBtn) {
        createOwnBtn.addEventListener('click', () => {
            window.history.replaceState({}, document.title, window.location.pathname);
            location.reload();
        });
    }
});

// 檢查是否有分享的禮物資料
function checkSharedGift() {
    const urlParams = new URLSearchParams(window.location.search);
    const giftData = urlParams.get('gift');
    
    if (giftData) {
        try {
            const data = JSON.parse(decodeURIComponent(atob(giftData)));
            showGiftScreen(data);
        } catch (e) {
            console.error('無法解析禮物資料', e);
        }
    }
}

// 顯示收禮畫面
function showGiftScreen(data) {
    showScreen('gift');
    
    // 設定收禮人名字
    document.querySelector('.gift-recipient').textContent = data.playerName;
    document.querySelector('.gift-sender').textContent = `來自 ${data.senderName} 的祝福 💝`;
    
    // 設定蛋糕
    const giftCake = document.getElementById('gift-cake-display');
    gameState.cake = data.cake;
    applyCakeStyle(giftCake, 'gift');
    
    // 設定祝福
    const giftBlessings = document.getElementById('gift-blessings');
    giftBlessings.innerHTML = '';
    data.blessings.forEach(blessing => {
        const tag = document.createElement('span');
        tag.className = 'blessing-tag';
        tag.textContent = blessing;
        giftBlessings.appendChild(tag);
    });
    
    // 設定願望
    document.getElementById('gift-wish').textContent = data.wish || '希望你永遠快樂！';
    
    // 建立彩帶
    createGiftConfetti();
}

// 建立收禮畫面的彩帶
function createGiftConfetti() {
    const container = document.getElementById('gift-confetti-container');
    if (!container) return;
    
    container.innerHTML = '';
    const colors = ['#FF6B9D', '#FFD93D', '#87CEEB', '#98FB98', '#DDA0DD', '#FF6347'];
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        confetti.style.animationDelay = Math.random() * 2 + 's';
        
        if (Math.random() > 0.5) {
            confetti.style.borderRadius = '50%';
        }
        
        container.appendChild(confetti);
    }
}

// 產生分享連結
function generateShareLink() {
    const data = {
        playerName: gameState.playerName,
        senderName: gameState.senderName,
        cake: gameState.cake,
        blessings: gameState.collectedBlessings,
        wish: gameState.wish
    };
    
    const encoded = btoa(encodeURIComponent(JSON.stringify(data)));
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?gift=${encoded}`;
}

// 複製分享連結
function copyShareLink() {
    const shareLink = document.getElementById('share-link');
    shareLink.select();
    shareLink.setSelectionRange(0, 99999);
    
    navigator.clipboard.writeText(shareLink.value).then(() => {
        document.getElementById('copy-success').classList.remove('hidden');
        setTimeout(() => {
            document.getElementById('copy-success').classList.add('hidden');
        }, 3000);
    });
}

// 分享到 LINE
function shareToLine() {
    const link = document.getElementById('share-link').value;
    const text = `🎂 ${gameState.senderName} 送給 ${gameState.playerName} 的生日祝福！`;
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`;
    window.open(lineUrl, '_blank');
}

// 分享到 Facebook
function shareToFacebook() {
    const link = document.getElementById('share-link').value;
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
    window.open(fbUrl, '_blank');
}

// 建立彩帶效果
function createConfetti() {
    const container = document.getElementById('confetti-container');
    container.innerHTML = '';
    
    const colors = ['#FF6B9D', '#FFD93D', '#87CEEB', '#98FB98', '#DDA0DD', '#FF6347'];
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        confetti.style.animationDelay = Math.random() * 2 + 's';
        
        // 隨機形狀
        if (Math.random() > 0.5) {
            confetti.style.borderRadius = '50%';
        }
        
        container.appendChild(confetti);
    }
}

// 顯示結束畫面
function showEndScreen() {
    showScreen('end');
    
    // 設定壽星名字
    document.querySelector('.birthday-person').textContent = gameState.playerName;
    
    // 如果是朋友模式，顯示送禮人
    const fromSender = document.querySelector('.from-sender');
    if (gameState.mode === 'friend' && fromSender) {
        fromSender.textContent = `來自 ${gameState.senderName} 的祝福`;
        fromSender.classList.remove('hidden');
    }
    
    // 設定願望
    document.getElementById('final-wish').textContent = gameState.wish || '希望一切都好！';
    
    // 顯示收集的祝福
    const blessingsContainer = document.getElementById('all-blessings');
    blessingsContainer.innerHTML = '';
    gameState.collectedBlessings.forEach(blessing => {
        const tag = document.createElement('span');
        tag.className = 'blessing-tag';
        tag.textContent = blessing;
        blessingsContainer.appendChild(tag);
    });
    
    // 顯示最終蛋糕
    const finalCake = document.getElementById('final-cake-card');
    applyCakeStyle(finalCake, 'final');
    
    // 如果是朋友模式，顯示分享區塊
    if (gameState.mode === 'friend') {
        const shareSection = document.getElementById('share-section');
        shareSection.classList.remove('hidden');
        
        // 產生分享連結
        const shareLink = document.getElementById('share-link');
        shareLink.value = generateShareLink();
    }
    
    // 建立彩帶
    createConfetti();
}

// 套用蛋糕樣式（完整版，包含裝飾品和蠟燭）
function applyCakeStyle(element, type = 'final') {
    const { shape, flavor, creamColor, decorations, candles, message } = gameState.cake;
    
    // 口味顏色
    const flavorColors = {
        chocolate: '#8B4513',
        strawberry: '#FFB6C1',
        vanilla: '#FFF8DC'
    };
    
    element.style.background = flavorColors[flavor] || '#F5DEB3';
    
    // 形狀
    element.className = '';
    if (shape === 'circle') {
        element.style.borderRadius = '50% 50% 20px 20px';
    } else if (shape === 'heart') {
        element.style.borderRadius = '20px';
        element.style.transform = 'rotate(-45deg)';
    } else {
        element.style.borderRadius = '20px 20px 10px 10px';
        element.style.transform = 'none';
    }
    
    // 奶油顏色覆蓋層
    if (creamColor) {
        element.style.boxShadow = `inset 0 30px 0 ${creamColor}, 0 10px 30px rgba(0,0,0,0.2)`;
    }
    
    // 渲染裝飾品
    const prefix = type === 'gift' ? '.gift' : '.final';
    const decorationsLayer = element.querySelector(`${prefix}-decorations-layer`);
    if (decorationsLayer && decorations && decorations.length > 0) {
        decorationsLayer.innerHTML = '';
        decorations.forEach(deco => {
            const decoItem = document.createElement('div');
            decoItem.className = 'decoration-item';
            decoItem.textContent = deco.type;
            // 調整位置比例（從裝飾畫面的300x300縮放到200x130）
            decoItem.style.left = (deco.x * 0.67) + 'px';
            decoItem.style.top = (deco.y * 0.43) + 'px';
            decorationsLayer.appendChild(decoItem);
        });
    }
    
    // 渲染蠟燭
    const candlesLayer = element.querySelector(`${prefix}-candles-layer`);
    if (candlesLayer && candles && candles.length > 0) {
        candlesLayer.innerHTML = '';
        // 重新計算蠟燭位置（置中排列）
        const spacing = 30;
        const totalWidth = (candles.length - 1) * spacing;
        const startX = (200 - totalWidth) / 2 - 4; // 4是蠟燭寬度的一半
        
        candles.forEach((candleData, index) => {
            const candle = document.createElement('div');
            candle.className = `candle ${candleData.color}`;
            candle.style.left = (startX + index * spacing) + 'px';
            candle.style.top = '10px';
            candlesLayer.appendChild(candle);
        });
    }
    
    // 渲染祝福文字
    const messageLayer = element.querySelector(`${prefix}-message-layer`);
    if (messageLayer && message) {
        messageLayer.textContent = message;
    }
}

// 工具函數：隨機範圍
function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

// 工具函數：延遲
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
