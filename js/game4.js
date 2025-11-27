/* ========================================
   關卡四：氣球遊戲
   ======================================== */

let balloonGameTimer = null;
let balloonsCollected = 0;
let timeLeft = 30;
const targetBalloons = 10;

function initGame4() {
    balloonsCollected = 0;
    timeLeft = 30;
    
    updateBalloonUI();
    startBalloonGame();
}

function updateBalloonUI() {
    document.getElementById('balloon-timer').textContent = timeLeft;
    document.getElementById('balloon-count').textContent = balloonsCollected;
}

function startBalloonGame() {
    const balloonArea = document.getElementById('balloon-area');
    balloonArea.innerHTML = '';
    
    // 計時器
    balloonGameTimer = setInterval(() => {
        timeLeft--;
        updateBalloonUI();
        
        if (timeLeft <= 0) {
            endBalloonGame();
        }
    }, 1000);
    
    // 持續產生氣球
    spawnBalloon();
    setInterval(spawnBalloon, 1500);
}

function spawnBalloon() {
    if (timeLeft <= 0) return;
    
    const balloonArea = document.getElementById('balloon-area');
    const balloon = document.createElement('div');
    balloon.className = 'balloon';
    
    // 隨機氣球顏色
    const balloonEmojis = ['🎈', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣'];
    balloon.textContent = balloonEmojis[Math.floor(Math.random() * balloonEmojis.length)];
    
    // 隨機位置和速度
    const left = Math.random() * (balloonArea.offsetWidth - 60);
    balloon.style.left = left + 'px';
    balloon.style.bottom = '-60px';
    
    // 動畫時間（越後面越快）
    const duration = Math.max(3, 6 - (30 - timeLeft) * 0.1);
    balloon.style.animationDuration = duration + 's';
    
    // 儲存對應的祝福語
    const blessingIndex = Math.floor(Math.random() * blessings.length);
    balloon.dataset.blessing = blessings[blessingIndex];
    
    // 點擊事件
    balloon.addEventListener('click', (e) => {
        e.stopPropagation();
        popBalloon(balloon);
    });
    
    balloon.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        popBalloon(balloon);
    });
    
    balloonArea.appendChild(balloon);
    
    // 氣球飄出螢幕後移除
    balloon.addEventListener('animationend', () => {
        if (!balloon.classList.contains('popped')) {
            balloon.remove();
        }
    });
}

function popBalloon(balloon) {
    if (balloon.classList.contains('popped')) return;
    
    balloon.classList.add('popped');
    balloonsCollected++;
    updateBalloonUI();
    
    // 儲存祝福語
    const blessing = balloon.dataset.blessing;
    if (!gameState.collectedBlessings.includes(blessing)) {
        gameState.collectedBlessings.push(blessing);
    }
    
    // 顯示祝福
    showBlessing(blessing);
    
    // 移除氣球
    setTimeout(() => {
        balloon.remove();
    }, 300);
    
    // 達到目標
    if (balloonsCollected >= targetBalloons) {
        setTimeout(() => {
            endBalloonGame();
        }, 1000);
    }
}

function showBlessing(text) {
    const popup = document.getElementById('blessing-popup');
    const blessingText = document.getElementById('blessing-text');
    
    blessingText.textContent = text;
    popup.classList.remove('hidden');
    
    setTimeout(() => {
        popup.classList.add('hidden');
    }, 1500);
}

function endBalloonGame() {
    clearInterval(balloonGameTimer);
    
    const balloonArea = document.getElementById('balloon-area');
    
    // 顯示結果訊息
    const resultMsg = document.createElement('div');
    resultMsg.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px 50px;
        border-radius: 20px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        text-align: center;
        z-index: 100;
    `;
    
    if (balloonsCollected >= targetBalloons) {
        resultMsg.innerHTML = `
            <h3 style="color: #FF6B9D; margin-bottom: 10px;">🎉 太棒了！</h3>
            <p>你收集了 ${balloonsCollected} 個祝福氣球！</p>
        `;
    } else {
        resultMsg.innerHTML = `
            <h3 style="color: #FF6B9D; margin-bottom: 10px;">⏰ 時間到！</h3>
            <p>你收集了 ${balloonsCollected} 個祝福氣球！</p>
        `;
    }
    
    balloonArea.innerHTML = '';
    balloonArea.appendChild(resultMsg);
    
    // 前往下一關
    setTimeout(() => {
        showScreen('game5');
        initGame5();
    }, 2500);
}
