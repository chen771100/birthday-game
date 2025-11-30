/* ========================================
   關卡二：裝飾蛋糕 (重構版 v2.0)
   ======================================== */

// 狀態管理
let selectedDeco = null;
let candleCount = 0;
let selectedCandleStyle = 'classic';
let selectedCandleColor = 'pink';
const MAX_CANDLES = 3;
const MAX_DECORATIONS = 15;

// 歷史記錄(用於撤銷/重做)
let decorationHistory = [];
let historyIndex = -1;

// 裝飾品分類
const DECORATION_CATEGORIES = {
    fruits: ['🍓', '🫐', '🍒', '🍑', '🍊', '🍋'],
    stars: ['⭐', '✨', '💫', '🌟'],
    hearts: ['💖', '💝', '💗', '❤️'],
    flowers: ['🌸', '🌺', '🌻', '🌹'],
    misc: ['🎀', '🎈', '🎁', '🦋']
};

let currentCategory = 'fruits';
let selectedDecoElement = null; // 當前選中的裝飾品元素

function initGame2() {
    // 重置狀態
    candleCount = 0;
    selectedCandleStyle = 'classic';
    selectedCandleColor = 'pink';
    decorationHistory = [];
    historyIndex = -1;
    selectedDecoElement = null;
    
    // 重置 gameState 裝飾資料
    gameState.cake.decorations = [];
    gameState.cake.candles = [];
    gameState.cake.message = '';
    gameState.cake.creamColor = '#FFB6C1';
    
    document.getElementById('candle-num').textContent = '0';
    
    renderDecorateCake();
    setupCreamColors();
    setupDecorationCategories();
    setupDecorations();
    setupCandleStyles();
    setupMessage();
    setupKeyboardShortcuts();
    setupFinishButton();
    updateUndoRedoButtons();
    
    // 初始化歷史記錄
    saveToHistory();
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

// 裝飾品分類切換
function setupDecorationCategories() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            updateDecorationButtons();
            if (typeof playSfxClick === 'function') playSfxClick();
        });
    });
    
    // 初始化按鈕
    updateDecorationButtons();
}

// 更新裝飾品按鈕
function updateDecorationButtons() {
    const container = document.querySelector('.decorations-items');
    if (!container) return;
    
    container.innerHTML = '';
    
    const decos = DECORATION_CATEGORIES[currentCategory] || [];
    decos.forEach(deco => {
        const btn = document.createElement('button');
        btn.className = 'deco-btn';
        btn.dataset.deco = deco;
        btn.textContent = deco;
        btn.addEventListener('click', () => {
            if (gameState.cake.decorations.length >= MAX_DECORATIONS) {
                showToast('裝飾品已達上限（15個）');
                return;
            }
            if (typeof playSfxClick === 'function') playSfxClick();
            addDecoration(deco);
        });
        container.appendChild(btn);
    });
}

// 裝飾品
function setupDecorations() {
    const clearBtn = document.getElementById('clear-deco-btn');
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (typeof playSfxClick === 'function') playSfxClick();
            if (confirm('確定要清除所有裝飾品嗎?')) {
                clearAllDecorations();
            }
        });
    }
    
    if (undoBtn) {
        undoBtn.addEventListener('click', () => {
            undo();
            if (typeof playSfxClick === 'function') playSfxClick();
        });
    }
    
    if (redoBtn) {
        redoBtn.addEventListener('click', () => {
            redo();
            if (typeof playSfxClick === 'function') playSfxClick();
        });
    }
}

// 清除所有裝飾品
function clearAllDecorations() {
    saveToHistory();
    const decorationsLayer = document.getElementById('decorations-layer');
    decorationsLayer.innerHTML = '';
    gameState.cake.decorations = [];
    selectedDecoElement = null;
    updateDecorationCount();
}

// 添加裝飾品
function addDecoration(decoType, existingData = null) {
    const decorationsLayer = document.getElementById('decorations-layer');
    
    const decoItem = document.createElement('span');
    decoItem.className = 'cake-deco-item draggable';
    decoItem.textContent = decoType;
    decoItem.style.cursor = 'grab';
    
    // 使用現有數據或隨機位置
    const containerWidth = decorationsLayer.offsetWidth || 200;
    const containerHeight = decorationsLayer.offsetHeight || 200;
    
    let posX, posY, scale, rotation;
    
    if (existingData) {
        posX = existingData.x;
        posY = existingData.y;
        scale = existingData.scale || 1;
        rotation = existingData.rotation || 0;
    } else {
        posX = Math.max(0, Math.min(40 + Math.random() * 120, containerWidth - 30));
        posY = Math.max(0, Math.min(20 + Math.random() * 60, containerHeight - 30));
        scale = 1;
        rotation = 0;
        saveToHistory(); // 只在新增時保存歷史
    }
    
    decoItem.style.left = posX + 'px';
    decoItem.style.top = posY + 'px';
    decoItem.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
    
    // 建立資料物件
    const decoData = {
        type: decoType,
        x: posX,
        y: posY,
        scale: scale,
        rotation: rotation
    };
    
    if (!existingData) {
        gameState.cake.decorations.push(decoData);
    }

    // 點擊選中
    decoItem.addEventListener('click', (e) => {
        if (e.detail === 1) { // 單擊
            selectDecoration(decoItem, decoData);
        }
    });
    
    // 雙擊移除
    decoItem.addEventListener('dblclick', () => {
        removeDecoration(decoItem, decoData);
    });
    
    // 添加拖曳功能
    makeDraggable(decoItem, decorationsLayer, decoData);
    
    decorationsLayer.appendChild(decoItem);
    updateDecorationCount();
}

// 選中裝飾品
function selectDecoration(element, data) {
    // 移除之前的選中狀態
    document.querySelectorAll('.cake-deco-item').forEach(el => el.classList.remove('selected'));
    
    element.classList.add('selected');
    selectedDecoElement = { element, data };
}

// 移除裝飾品
function removeDecoration(element, data) {
    saveToHistory();
    element.remove();
    const index = gameState.cake.decorations.indexOf(data);
    if (index > -1) {
        gameState.cake.decorations.splice(index, 1);
    }
    if (selectedDecoElement && selectedDecoElement.element === element) {
        selectedDecoElement = null;
    }
    updateDecorationCount();
}

// 更新裝飾品數量顯示
function updateDecorationCount() {
    const counter = document.getElementById('deco-count');
    if (counter) {
        counter.textContent = `${gameState.cake.decorations.length} / ${MAX_DECORATIONS}`;
    }
}

// 使元素可拖曳（並同步更新位置）
function makeDraggable(element, container, dataObject) {
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;
    
    const startDrag = (e) => {
        isDragging = true;
        element.style.zIndex = 100;
        element.style.transform = 'scale(1.2)';
        element.style.cursor = 'grabbing';
        
        if (e.type === 'touchstart') {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        } else {
            startX = e.clientX;
            startY = e.clientY;
        }
        
        initialLeft = element.offsetLeft;
        initialTop = element.offsetTop;
        
        e.preventDefault();
    };
    
    const drag = (e) => {
        if (!isDragging) return;
        
        e.preventDefault();
        
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
        
        let newLeft = initialLeft + deltaX;
        let newTop = initialTop + deltaY;
        
        // 邊界檢查
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        const elemWidth = element.offsetWidth;
        const elemHeight = element.offsetHeight;
        
        newLeft = Math.max(0, Math.min(newLeft, containerWidth - elemWidth));
        newTop = Math.max(0, Math.min(newTop, containerHeight - elemHeight));
        
        element.style.left = newLeft + 'px';
        element.style.top = newTop + 'px';
        
        // 更新狀態
        if (dataObject) {
            dataObject.x = newLeft;
            dataObject.y = newTop;
        }
    };
    
    const stopDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        element.style.zIndex = '';
        
        // 恢復原始變換（保留縮放和旋轉）
        const scale = dataObject.scale || 1;
        const rotation = dataObject.rotation || 0;
        element.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
        element.style.cursor = 'grab';
        
        // 拖曳結束後保存歷史
        saveToHistory();
    };
    
    element.addEventListener('mousedown', startDrag);
    element.addEventListener('touchstart', startDrag, { passive: false });
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });
    
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);
}

// 歷史記錄管理
function saveToHistory() {
    // 移除當前索引之後的歷史
    decorationHistory = decorationHistory.slice(0, historyIndex + 1);
    
    // 深拷貝當前狀態
    const state = JSON.parse(JSON.stringify(gameState.cake.decorations));
    decorationHistory.push(state);
    historyIndex++;
    
    // 限制歷史記錄數量
    if (decorationHistory.length > 20) {
        decorationHistory.shift();
        historyIndex--;
    }
    
    updateUndoRedoButtons();
}

// 撤銷
function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        restoreFromHistory();
    }
}

// 重做
function redo() {
    if (historyIndex < decorationHistory.length - 1) {
        historyIndex++;
        restoreFromHistory();
    }
}

// 從歷史恢復
function restoreFromHistory() {
    const decorationsLayer = document.getElementById('decorations-layer');
    decorationsLayer.innerHTML = '';
    
    const state = decorationHistory[historyIndex];
    gameState.cake.decorations = JSON.parse(JSON.stringify(state));
    
    // 重新渲染所有裝飾品
    gameState.cake.decorations.forEach(data => {
        addDecoration(data.type, data);
    });
    
    updateUndoRedoButtons();
    updateDecorationCount();
}

// 更新撤銷/重做按鈕狀態
function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    
    if (undoBtn) {
        undoBtn.disabled = historyIndex <= 0;
    }
    if (redoBtn) {
        redoBtn.disabled = historyIndex >= decorationHistory.length - 1;
    }
}

// 快捷鍵支援
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // 只在 game2 畫面時生效
        if (gameState.currentScreen !== 'game2') return;
        
        // Delete - 刪除選中的裝飾品
        if (e.key === 'Delete' && selectedDecoElement) {
            removeDecoration(selectedDecoElement.element, selectedDecoElement.data);
        }
        
        // Ctrl+Z - 撤銷
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            undo();
        }
        
        // Ctrl+Y 或 Ctrl+Shift+Z - 重做
        if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'Z')) {
            e.preventDefault();
            redo();
        }
        
        // 如果有選中的裝飾品
        if (selectedDecoElement) {
            const { element, data } = selectedDecoElement;
            
            // + 或 = - 放大
            if (e.key === '+' || e.key === '=') {
                e.preventDefault();
                data.scale = Math.min((data.scale || 1) + 0.1, 2);
                element.style.transform = `scale(${data.scale}) rotate(${data.rotation || 0}deg)`;
                saveToHistory();
            }
            
            // - - 縮小
            if (e.key === '-') {
                e.preventDefault();
                data.scale = Math.max((data.scale || 1) - 0.1, 0.3);
                element.style.transform = `scale(${data.scale}) rotate(${data.rotation || 0}deg)`;
                saveToHistory();
            }
            
            // [ - 逆時針旋轉
            if (e.key === '[') {
                e.preventDefault();
                data.rotation = (data.rotation || 0) - 15;
                element.style.transform = `scale(${data.scale || 1}) rotate(${data.rotation}deg)`;
                saveToHistory();
            }
            
            // ] - 順時針旋轉
            if (e.key === ']') {
                e.preventDefault();
                data.rotation = (data.rotation || 0) + 15;
                element.style.transform = `scale(${data.scale || 1}) rotate(${data.rotation}deg)`;
                saveToHistory();
            }
        }
    });
}

// 顯示提示訊息
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
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
    
    // 儲存資料屬性以便重建狀態
    candle.dataset.color = selectedCandleColor;
    candle.dataset.style = selectedCandleStyle;
    
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
    
    // 點擊移除
    candle.addEventListener('click', (e) => {
        e.stopPropagation();
        candle.remove();
        candleCount--;
        document.getElementById('candle-num').textContent = candleCount;
        
        // 重建 gameState
        const remainingCandles = document.querySelectorAll('.cake-candle');
        gameState.cake.candles = Array.from(remainingCandles).map(c => ({
            color: c.dataset.color,
            style: c.dataset.style
        }));
        
        // 重新排列
        arrangeCandles();
        
        // 如果是數字蠟燭，重新編號
        remainingCandles.forEach((c, i) => {
            if (c.dataset.style === 'number') {
                // 保留火焰
                const f = c.querySelector('.candle-flame');
                c.textContent = i + 1;
                if (f) c.appendChild(f);
            }
        });
    });
    
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
