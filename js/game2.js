/* ========================================
   關卡二：裝飾蛋糕 (重構版)
   ======================================== */

let selectedDeco = null;
let candleCount = 0;
let selectedCandleStyle = 'classic';
let selectedCandleColor = 'pink';
const MAX_CANDLES = 3; // 蠟燭上限

function initGame2() {
    // 重置狀態
    candleCount = 0;
    selectedCandleStyle = 'classic';
    selectedCandleColor = 'pink';
    
    // 重置 gameState 裝飾資料
    gameState.cake.decorations = [];
    gameState.cake.candles = [];
    gameState.cake.message = '';
    gameState.cake.creamColor = '#FFB6C1';
    
    document.getElementById('candle-num').textContent = '0';
    
    renderDecorateCake();
    setupCreamColors();
    setupDecorations();
    setupCandleStyles();
    setupMessage();
    setupFinishButton();
}

// 渲染裝飾用蛋糕
function renderDecorateCake() {
    const container = document.getElementById('decorating-cake');
    const { shape, flavor, creamColor } = gameState.cake;
    
    container.innerHTML = '';
    container.className = `decorate-cake shape-${shape}`;
    
    // 使用 CakeRenderer 渲染蛋糕主體
    const cakeBody = CakeRenderer.createCakeBody(shape, flavor, creamColor, {
        width: 200, height: 120, fontSize: 24, candleHeight: 40, candleWidth: 12
    });
    container.appendChild(cakeBody);
    
    // 建立裝飾品圖層（可拖曳）
    const decoLayer = document.createElement('div');
    decoLayer.id = 'decorations-layer';
    decoLayer.className = 'cake-decorations-layer';
    container.appendChild(decoLayer);
    
    // 建立蠟燭圖層
    const candleLayer = document.createElement('div');
    candleLayer.id = 'candles-layer';
    candleLayer.className = 'cake-candles-layer';
    container.appendChild(candleLayer);
    
    // 建立文字圖層
    const msgLayer = document.createElement('div');
    msgLayer.id = 'message-layer';
    msgLayer.className = 'cake-message-layer';
    container.appendChild(msgLayer);
}

// 更新蛋糕奶油顏色
function updateCakeColor(creamColor) {
    gameState.cake.creamColor = creamColor;
    
    const container = document.getElementById('decorating-cake');
    const { shape, flavor } = gameState.cake;
    
    // 重新渲染蛋糕主體
    const oldBody = container.querySelector('.cake-body');
    if (oldBody) {
        const newBody = CakeRenderer.createCakeBody(shape, flavor, creamColor, {
            width: 200, height: 120, fontSize: 24, candleHeight: 40, candleWidth: 12
        });
        container.replaceChild(newBody, oldBody);
    }
}

// 奶油顏色選擇
function setupCreamColors() {
    const creamButtons = document.querySelectorAll('.cream-btn');
    const applyCreamBtn = document.getElementById('apply-cream-btn');
    
    // 重置按鈕狀態
    creamButtons.forEach(b => b.classList.remove('active'));
    creamButtons[0]?.classList.add('active');
    
    creamButtons.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', () => {
            document.querySelectorAll('.cream-btn').forEach(b => b.classList.remove('active'));
            newBtn.classList.add('active');
            gameState.cake.creamColor = newBtn.dataset.cream;
        });
    });
    
    // 塗抹按鈕
    const newApplyBtn = applyCreamBtn.cloneNode(true);
    applyCreamBtn.parentNode.replaceChild(newApplyBtn, applyCreamBtn);
    
    newApplyBtn.addEventListener('click', () => {
        const color = gameState.cake.creamColor;
        updateCakeColor(color);
        
        if (typeof playSfxSuccess === 'function') playSfxSuccess();
        
        newApplyBtn.textContent = '已塗抹！✨';
        newApplyBtn.disabled = true;
        setTimeout(() => {
            newApplyBtn.textContent = '塗抹奶油';
            newApplyBtn.disabled = false;
        }, 1000);
    });
}

// 裝飾品
function setupDecorations() {
    const decoButtons = document.querySelectorAll('.deco-btn');
    
    decoButtons.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', () => {
            if (typeof playSfxClick === 'function') playSfxClick();
            
            const deco = newBtn.dataset.deco;
            addDecoration(deco);
        });
    });
}

// 添加裝飾品
function addDecoration(decoType) {
    const decorationsLayer = document.getElementById('decorations-layer');
    const decoIndex = gameState.cake.decorations.length;
    
    const decoItem = document.createElement('span');
    decoItem.className = 'cake-deco-item draggable';
    decoItem.textContent = decoType;
    decoItem.dataset.index = decoIndex;
    
    // 隨機位置
    const posX = 40 + Math.random() * 120;
    const posY = 20 + Math.random() * 60;
    decoItem.style.left = posX + 'px';
    decoItem.style.top = posY + 'px';
    
    // 添加拖曳功能
    makeDraggable(decoItem, decorationsLayer, decoIndex);
    
    decorationsLayer.appendChild(decoItem);
    
    // 儲存裝飾
    gameState.cake.decorations.push({
        type: decoType,
        x: posX,
        y: posY
    });
}

// 使元素可拖曳（並同步更新位置）
function makeDraggable(element, container, decoIndex) {
    let isDragging = false;
    let startX, startY, initialX, initialY;
    
    const startDrag = (e) => {
        isDragging = true;
        element.style.zIndex = 100;
        
        if (e.type === 'touchstart') {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        } else {
            startX = e.clientX;
            startY = e.clientY;
        }
        
        initialX = element.offsetLeft;
        initialY = element.offsetTop;
        
        e.preventDefault();
    };
    
    const drag = (e) => {
        if (!isDragging) return;
        
        let currentX, currentY;
        if (e.type === 'touchmove') {
            currentX = e.touches[0].clientX;
            currentY = e.touches[0].clientY;
        } else {
            currentX = e.clientX;
            currentY = e.clientY;
        }
        
        const deltaX = currentX - startX;
        const deltaY = currentY - startY;
        
        element.style.left = (initialX + deltaX) + 'px';
        element.style.top = (initialY + deltaY) + 'px';
    };
    
    const endDrag = () => {
        if (isDragging) {
            isDragging = false;
            element.style.zIndex = 10;
            
            // 更新 gameState 中的位置
            if (decoIndex !== undefined && gameState.cake.decorations[decoIndex]) {
                gameState.cake.decorations[decoIndex].x = parseInt(element.style.left);
                gameState.cake.decorations[decoIndex].y = parseInt(element.style.top);
            }
        }
    };
    
    element.addEventListener('mousedown', startDrag);
    element.addEventListener('touchstart', startDrag, { passive: false });
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });
    
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
}

// 蠟燭樣式選擇
function setupCandleStyles() {
    const styleButtons = document.querySelectorAll('.candle-style-btn');
    const colorButtons = document.querySelectorAll('.candle-btn');
    
    // 重置樣式按鈕
    styleButtons.forEach(b => b.classList.remove('active'));
    styleButtons[0]?.classList.add('active');
    
    // 重置顏色按鈕
    colorButtons.forEach(b => b.classList.remove('active'));
    
    styleButtons.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', () => {
            if (typeof playSfxClick === 'function') playSfxClick();
            document.querySelectorAll('.candle-style-btn').forEach(b => b.classList.remove('active'));
            newBtn.classList.add('active');
            selectedCandleStyle = newBtn.dataset.style;
        });
    });
    
    colorButtons.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', () => {
            if (typeof playSfxClick === 'function') playSfxClick();
            document.querySelectorAll('.candle-btn').forEach(b => b.classList.remove('active'));
            newBtn.classList.add('active');
            selectedCandleColor = newBtn.dataset.candle;
            addCandle();
        });
    });
}

// 添加蠟燭
function addCandle() {
    const candlesLayer = document.getElementById('candles-layer');
    const candleNumDisplay = document.getElementById('candle-num');
    
    if (candleCount >= MAX_CANDLES) {
        // 提示已達上限
        candleNumDisplay.style.color = '#e74c3c';
        candleNumDisplay.style.transform = 'scale(1.2)';
        setTimeout(() => {
            candleNumDisplay.style.color = '';
            candleNumDisplay.style.transform = '';
        }, 300);
        return;
    }
    
    // 建立蠟燭
    const candle = document.createElement('div');
    candle.className = `cake-candle style-${selectedCandleStyle}`;
    
    const colorConfig = CakeRenderer.candleColors[selectedCandleColor] || CakeRenderer.candleColors.pink;
    candle.style.setProperty('--candle-gradient', colorConfig.gradient);
    candle.style.setProperty('--candle-stripe', colorConfig.stripe);
    
    // 數字蠟燭顯示數字
    if (selectedCandleStyle === 'number') {
        candle.textContent = candleCount + 1;
    }
    
    // 火焰
    const flame = document.createElement('span');
    flame.className = 'candle-flame';
    flame.textContent = '🔥';
    candle.appendChild(flame);
    
    candlesLayer.appendChild(candle);
    candleCount++;
    
    // 置中排列蠟燭
    arrangeCandles();
    
    candleNumDisplay.textContent = candleCount;
    
    // 更新 gameState
    gameState.cake.candles.push({
        color: selectedCandleColor,
        style: selectedCandleStyle
    });
}

// 排列蠟燭（置中）
function arrangeCandles() {
    const candlesLayer = document.getElementById('candles-layer');
    const candles = candlesLayer.querySelectorAll('.cake-candle');
    
    const containerWidth = 200;
    const candleWidth = 12;
    const spacing = 35;
    const totalWidth = (candles.length - 1) * spacing;
    const startX = (containerWidth - totalWidth) / 2 - candleWidth / 2;
    
    candles.forEach((candle, i) => {
        candle.style.left = (startX + i * spacing) + 'px';
        candle.style.top = '-35px';
    });
}

// 祝福文字
function setupMessage() {
    const messageInput = document.getElementById('cake-message');
    const addMessageBtn = document.getElementById('add-message-btn');
    const messageLayer = document.getElementById('message-layer');
    
    // 重置輸入框
    messageInput.value = '';
    
    // 使用克隆替換避免重複綁定
    const newBtn = addMessageBtn.cloneNode(true);
    addMessageBtn.parentNode.replaceChild(newBtn, addMessageBtn);
    
    newBtn.addEventListener('click', () => {
        const message = messageInput.value.trim();
        if (message) {
            messageLayer.textContent = message;
            gameState.cake.message = message;
            
            newBtn.textContent = '已添加！✨';
            newBtn.disabled = true;
            setTimeout(() => {
                newBtn.textContent = '加入文字';
                newBtn.disabled = false;
            }, 1000);
        } else {
            // 提示需要輸入
            messageInput.style.borderColor = '#e74c3c';
            messageInput.placeholder = '請輸入祝福語...';
            setTimeout(() => {
                messageInput.style.borderColor = '';
                messageInput.placeholder = '生日快樂！';
            }, 1500);
        }
    });
    
    // 按 Enter 也可以加入
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            newBtn.click();
        }
    });
}

// 完成裝飾按鈕
function setupFinishButton() {
    const finishBtn = document.getElementById('finish-decorate-btn');
    
    const newBtn = finishBtn.cloneNode(true);
    finishBtn.parentNode.replaceChild(newBtn, finishBtn);
    
    newBtn.addEventListener('click', () => {
        // 確保至少有1根蠟燭
        if (gameState.cake.candles.length === 0) {
            gameState.cake.candles = [
                { color: 'pink', style: 'classic' }
            ];
        }
        
        showScreen('game3');
        initGame3();
    });
}
