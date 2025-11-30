/* ========================================
   關卡三：吹蠟燭 (重構版)
   ======================================== */

let blowPower = 0;
let candlesBlown = 0;
let totalCandles = 0;
let blowInterval = null;
let powerDecayInterval = null;

function initGame3() {
    // 重置狀態
    blowPower = 0;
    candlesBlown = 0;
    
    // 清理舊的定時器
    if (powerDecayInterval) {
        clearInterval(powerDecayInterval);
        powerDecayInterval = null;
    }
    
    renderBlowCake();
    setupBlowing();
}

// 渲染吹蠟燭畫面的蛋糕
function renderBlowCake() {
    const container = document.getElementById('blow-cake-container');
    const candles = gameState.cake.candles;
    
    // 如果沒有蠟燭，加入預設
    if (candles.length === 0) {
        gameState.cake.candles = [{ color: 'pink', style: 'classic' }];
    }
    
    totalCandles = gameState.cake.candles.length;
    
    // 準備無蠟燭版本的蛋糕資料
    const cakeDataForBlowing = {
        ...gameState.cake,
        imageData: gameState.cake.imageDataNoCandles || gameState.cake.imageData  // 使用無蠟燭版本
    };
    
    // 使用 CakeRenderer 渲染蛋糕
    // 混合模式：使用無蠟燭的 Canvas 圖片 + 疊加 DOM 蠟燭
    CakeRenderer.render(container, cakeDataForBlowing, {
        size: 'normal',
        showCandles: true,
        showFlame: true,
        useImage: true,
        overlayCandles: true  // 混合模式：圖片 + DOM 蠟燭
    });
    
    // 為蠟燭添加吹熄效果的 class
    const candleElements = container.querySelectorAll('.cake-candle');
    candleElements.forEach((candle, index) => {
        candle.classList.add('blow-candle');
        candle.dataset.index = index;
        
        // 添加煙霧元素
        const smoke = document.createElement('span');
        smoke.className = 'candle-smoke';
        smoke.textContent = '💨';
        candle.appendChild(smoke);
    });
}

// 設定吹蠟燭互動
function setupBlowing() {
    const blowArea = document.getElementById('blow-area');
    const powerFill = document.getElementById('blow-power-fill');
    const hint = document.getElementById('blow-hint');
    
    // 重置 UI
    powerFill.style.width = '0%';
    hint.textContent = '點擊畫面吹氣！';
    hint.style.animation = 'pulse 1s infinite';
    
    let isBlowing = false;
    let clickCount = 0;
    let lastClickTime = 0;
    let holdInterval = null;
    
    // 減少吹力的定時器
    powerDecayInterval = setInterval(() => {
        if (!isBlowing && blowPower > 0) {
            blowPower = Math.max(0, blowPower - 2);
            powerFill.style.width = blowPower + '%';
        }
    }, 100);
    
    // 點擊/觸控吹氣
    function handleBlow() {
        if (candlesBlown >= totalCandles) return; // 已完成
        
        // 播放吹氣音效
        if (typeof playSfxBlow === 'function') playSfxBlow();
        
        const now = Date.now();
        
        // 計算點擊頻率增加吹力
        if (now - lastClickTime < 500) {
            clickCount++;
        } else {
            clickCount = 1;
        }
        lastClickTime = now;
        
        // 增加吹力
        blowPower = Math.min(100, blowPower + 5 + clickCount * 2);
        powerFill.style.width = blowPower + '%';
        
        // 檢查是否可以吹熄蠟燭
        if (blowPower >= 70) {
            blowNextCandle();
        }
        
        isBlowing = true;
        setTimeout(() => {
            isBlowing = false;
        }, 200);
    }
    
    // 吹熄下一根蠟燭
    function blowNextCandle() {
        const unblownCandles = document.querySelectorAll('.blow-candle:not(.blown)');
        
        if (unblownCandles.length > 0) {
            const candle = unblownCandles[0];
            candle.classList.add('blown');
            candlesBlown++;
            blowPower = Math.max(0, blowPower - 30);
            powerFill.style.width = blowPower + '%';
            
            if (typeof playSfxSuccess === 'function') playSfxSuccess();
            
            // 全部吹熄
            if (candlesBlown >= totalCandles) {
                if (powerDecayInterval) {
                    clearInterval(powerDecayInterval);
                    powerDecayInterval = null;
                }
                if (holdInterval) {
                    clearInterval(holdInterval);
                    holdInterval = null;
                }
                
                hint.textContent = '🎉 太棒了！蠟燭全部吹熄了！';
                hint.style.animation = 'none';
                
                setTimeout(() => {
                    showScreen('game4');
                    initGame4();
                }, 2000);
            }
        }
    }
    
    // 使用克隆替換避免重複綁定事件
    const newBlowArea = blowArea.cloneNode(true);
    newBlowArea.innerHTML = blowArea.innerHTML;
    blowArea.parentNode.replaceChild(newBlowArea, blowArea);
    
    const area = document.getElementById('blow-area');
    
    area.addEventListener('click', handleBlow);
    area.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleBlow();
    }, { passive: false });
    
    area.addEventListener('mousedown', () => {
        holdInterval = setInterval(handleBlow, 100);
    });
    
    area.addEventListener('mouseup', () => {
        if (holdInterval) {
            clearInterval(holdInterval);
            holdInterval = null;
        }
    });
    
    area.addEventListener('mouseleave', () => {
        if (holdInterval) {
            clearInterval(holdInterval);
            holdInterval = null;
        }
    });
    
    area.addEventListener('touchend', () => {
        if (holdInterval) {
            clearInterval(holdInterval);
            holdInterval = null;
        }
    });
}
