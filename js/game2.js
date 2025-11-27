/* ========================================
   關卡二：裝飾蛋糕
   ======================================== */

let selectedDeco = null;
let candleCount = 0;

function initGame2() {
    setupCakeBase();
    setupCreamColors();
    setupDecorations();
    setupCandles();
    setupMessage();
    setupFinishButton();
}

// 設定蛋糕基底
function setupCakeBase() {
    const cake = document.getElementById('decorating-cake');
    const { shape, flavor } = gameState.cake;
    
    // 口味顏色
    const colors = {
        chocolate: '#8B4513',
        strawberry: '#FFB6C1',
        vanilla: '#FFF8DC'
    };
    
    cake.style.background = colors[flavor];
    
    // 形狀
    cake.className = '';
    if (shape === 'circle') {
        cake.classList.add('circle');
    } else if (shape === 'heart') {
        cake.classList.add('heart');
    }
}

// 奶油顏色選擇
function setupCreamColors() {
    const creamButtons = document.querySelectorAll('.cream-btn');
    const applyCreamBtn = document.getElementById('apply-cream-btn');
    
    creamButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            creamButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gameState.cake.creamColor = btn.dataset.cream;
        });
    });
    
    applyCreamBtn.addEventListener('click', () => {
        const cake = document.getElementById('decorating-cake');
        const color = gameState.cake.creamColor;
        
        // 添加奶油效果
        cake.style.boxShadow = `inset 0 30px 0 ${color}`;
        
        // 動畫效果
        applyCreamBtn.textContent = '已塗抹！✨';
        setTimeout(() => {
            applyCreamBtn.textContent = '塗抹奶油';
        }, 1000);
    });
}

// 裝飾品
function setupDecorations() {
    const decoButtons = document.querySelectorAll('.deco-btn');
    const decorationsLayer = document.getElementById('decorations-layer');
    const cakeCanvas = document.getElementById('cake-canvas');
    
    decoButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const deco = btn.dataset.deco;
            
            // 建立裝飾品元素
            const decoItem = document.createElement('div');
            decoItem.className = 'decoration-item';
            decoItem.textContent = deco;
            
            // 隨機位置（在蛋糕範圍內）
            const canvasRect = cakeCanvas.getBoundingClientRect();
            decoItem.style.left = (100 + Math.random() * 100) + 'px';
            decoItem.style.top = (80 + Math.random() * 80) + 'px';
            
            // 添加拖曳功能
            makeDraggable(decoItem, decorationsLayer);
            
            decorationsLayer.appendChild(decoItem);
            
            // 儲存裝飾
            gameState.cake.decorations.push({
                type: deco,
                x: parseInt(decoItem.style.left),
                y: parseInt(decoItem.style.top)
            });
        });
    });
}

// 使元素可拖曳
function makeDraggable(element, container) {
    let isDragging = false;
    let startX, startY, initialX, initialY;
    
    element.addEventListener('mousedown', startDrag);
    element.addEventListener('touchstart', startDrag);
    
    function startDrag(e) {
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
    }
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag);
    
    function drag(e) {
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
    }
    
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
    
    function endDrag() {
        if (isDragging) {
            isDragging = false;
            element.style.zIndex = 10;
        }
    }
}

// 蠟燭
function setupCandles() {
    const candleButtons = document.querySelectorAll('.candle-btn');
    const candlesLayer = document.getElementById('candles-layer');
    const candleNumDisplay = document.getElementById('candle-num');
    
    const candleColors = {
        pink: 'pink',
        blue: 'blue',
        yellow: 'yellow'
    };
    
    candleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (candleCount >= 3) return; // 最多3根蠟燭
            
            const color = btn.dataset.candle;
            
            // 建立蠟燭
            const candle = document.createElement('div');
            candle.className = `candle ${candleColors[color]}`;
            
            candlesLayer.appendChild(candle);
            candleCount++;
            
            // 置中排列蠟燭的位置
            const positions = {
                1: [145],                  // 1根蠟燭置中
                2: [125, 165],             // 2根蠟燭
                3: [105, 145, 185]         // 3根蠟燭
            };
            
            // 重新排列所有蠟燭
            const candleElements = candlesLayer.querySelectorAll('.candle');
            const currentPositions = positions[candleCount];
            candleElements.forEach((c, i) => {
                c.style.left = currentPositions[i] + 'px';
                c.style.top = '50px';
            });
            
            candleNumDisplay.textContent = candleCount;
            
            // 更新儲存的蠟燭資訊（清空並重建）
            gameState.cake.candles = [];
            candleElements.forEach((c, i) => {
                const candleColor = c.classList.contains('pink') ? 'pink' : 
                                   c.classList.contains('blue') ? 'blue' : 'yellow';
                gameState.cake.candles.push({
                    color: candleColor,
                    x: currentPositions[i],
                    y: 50
                });
            });
        });
    });
}

// 祝福文字
function setupMessage() {
    const messageInput = document.getElementById('cake-message');
    const addMessageBtn = document.getElementById('add-message-btn');
    const messageLayer = document.getElementById('message-layer');
    
    addMessageBtn.addEventListener('click', () => {
        const message = messageInput.value.trim();
        if (message) {
            messageLayer.textContent = message;
            gameState.cake.message = message;
            
            addMessageBtn.textContent = '已添加！✨';
            setTimeout(() => {
                addMessageBtn.textContent = '加入文字';
            }, 1000);
        }
    });
}

// 完成裝飾按鈕
function setupFinishButton() {
    const finishBtn = document.getElementById('finish-decorate-btn');
    
    finishBtn.addEventListener('click', () => {
        // 確保至少有1根蠟燭
        if (candleCount === 0) {
            // 自動添加1根預設蠟燭
            gameState.cake.candles = [
                { color: 'pink', x: 120, y: 50 }
            ];
            candleCount = 1;
        }
        
        showScreen('game3');
        initGame3();
    });
}
