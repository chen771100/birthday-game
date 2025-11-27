/* ========================================
   關卡三：吹蠟燭
   ======================================== */

let blowPower = 0;
let candlesBlown = 0;
let totalCandles = 0;
let blowInterval = null;

function initGame3() {
    setupFinalCake();
    setupCandles();
    setupBlowing();
}

// 設定最終蛋糕顯示
function setupFinalCake() {
    const cakeDisplay = document.getElementById('final-cake-display');
    const { shape, flavor, creamColor } = gameState.cake;
    
    // 口味顏色
    const colors = {
        chocolate: '#8B4513',
        strawberry: '#FFB6C1',
        vanilla: '#FFF8DC'
    };
    
    cakeDisplay.style.background = colors[flavor];
    
    // 形狀
    if (shape === 'circle') {
        cakeDisplay.style.borderRadius = '50% 50% 20px 20px';
    } else if (shape === 'heart') {
        cakeDisplay.style.width = '180px';
        cakeDisplay.style.height = '160px';
        cakeDisplay.style.borderRadius = '20px';
        cakeDisplay.style.transform = 'rotate(-45deg)';
    }
    
    // 奶油顏色
    if (creamColor) {
        cakeDisplay.style.boxShadow = `inset 0 40px 0 ${creamColor}, 0 10px 30px rgba(0,0,0,0.2)`;
    }
}

// 設定蠟燭
function setupCandles() {
    const container = document.getElementById('candles-container');
    container.innerHTML = '';
    
    const candles = gameState.cake.candles;
    totalCandles = candles.length || 3;
    
    // 如果沒有蠟燭，建立預設的
    if (candles.length === 0) {
        for (let i = 0; i < 3; i++) {
            candles.push({ color: 'pink' });
        }
        totalCandles = 3;
    }
    
    candles.forEach((candleData, index) => {
        const candle = document.createElement('div');
        candle.className = 'blow-candle';
        candle.dataset.index = index;
        
        // 設定顏色
        const colorGradients = {
            pink: 'linear-gradient(to bottom, #FFB6C1, #FF69B4)',
            blue: 'linear-gradient(to bottom, #87CEEB, #4169E1)',
            yellow: 'linear-gradient(to bottom, #FFD700, #FFA500)'
        };
        candle.style.background = colorGradients[candleData.color] || colorGradients.pink;
        
        // 火焰
        const flame = document.createElement('span');
        flame.className = 'flame';
        flame.textContent = '🔥';
        candle.appendChild(flame);
        
        // 煙霧
        const smoke = document.createElement('span');
        smoke.className = 'smoke';
        smoke.textContent = '💨';
        candle.appendChild(smoke);
        
        container.appendChild(candle);
    });
}

// 設定吹蠟燭互動
function setupBlowing() {
    const blowArea = document.getElementById('blow-area');
    const powerFill = document.getElementById('blow-power-fill');
    const hint = document.getElementById('blow-hint');
    const candles = document.querySelectorAll('.blow-candle');
    
    let isBlowing = false;
    let clickCount = 0;
    let lastClickTime = 0;
    
    // 減少吹力的定時器
    setInterval(() => {
        if (!isBlowing && blowPower > 0) {
            blowPower = Math.max(0, blowPower - 2);
            powerFill.style.width = blowPower + '%';
        }
    }, 100);
    
    // 點擊/觸控吹氣
    function handleBlow() {
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
        const unbownCandles = document.querySelectorAll('.blow-candle:not(.blown)');
        
        if (unbownCandles.length > 0) {
            const candle = unbownCandles[0];
            candle.classList.add('blown');
            candlesBlown++;
            blowPower = Math.max(0, blowPower - 30);
            powerFill.style.width = blowPower + '%';
            
            // 全部吹熄
            if (candlesBlown >= totalCandles) {
                hint.textContent = '🎉 太棒了！蠟燭全部吹熄了！';
                hint.style.animation = 'none';
                
                setTimeout(() => {
                    showScreen('game4');
                    initGame4();
                }, 2000);
            }
        }
    }
    
    // 事件監聽
    blowArea.addEventListener('click', handleBlow);
    blowArea.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleBlow();
    });
    
    // 長按快速吹氣
    let holdInterval = null;
    
    blowArea.addEventListener('mousedown', () => {
        holdInterval = setInterval(handleBlow, 100);
    });
    
    blowArea.addEventListener('mouseup', () => {
        if (holdInterval) {
            clearInterval(holdInterval);
            holdInterval = null;
        }
    });
    
    blowArea.addEventListener('mouseleave', () => {
        if (holdInterval) {
            clearInterval(holdInterval);
            holdInterval = null;
        }
    });
    
    blowArea.addEventListener('touchend', () => {
        if (holdInterval) {
            clearInterval(holdInterval);
            holdInterval = null;
        }
    });
}
