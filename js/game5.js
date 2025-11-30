/* ========================================
   關卡五：許願星遊戲
   ======================================== */

let starsCollected = 0;
const targetStars = 3;
let starSpawnInterval = null;

function initGame5() {
    starsCollected = 0;
    updateStarUI();
    startStarGame();
    setupWishInput();
}

function updateStarUI() {
    document.getElementById('star-count').textContent = starsCollected;
    
    // 更新星星槽
    const slots = document.querySelectorAll('.star-slot');
    slots.forEach((slot, index) => {
        if (index < starsCollected) {
            slot.textContent = '⭐';
            slot.classList.add('collected');
        } else {
            slot.textContent = '☆';
            slot.classList.remove('collected');
        }
    });
}

function startStarGame() {
    const container = document.getElementById('stars-container');
    container.innerHTML = '';
    
    // 定期產生流星
    spawnStar();
    starSpawnInterval = setInterval(() => {
        if (starsCollected < targetStars) {
            spawnStar();
        }
    }, 2500);
}

function spawnStar() {
    const container = document.getElementById('stars-container');
    const star = document.createElement('div');
    star.className = 'shooting-star';
    star.textContent = '⭐';
    
    // 隨機位置
    star.style.left = (50 + Math.random() * 200) + 'px';
    star.style.top = (20 + Math.random() * 100) + 'px';
    
    // 拖曳功能
    makeStarDraggable(star);
    
    container.appendChild(star);
    
    // 一段時間後消失
    setTimeout(() => {
        if (star.parentNode && !star.classList.contains('collected')) {
            star.style.transition = 'opacity 0.5s';
            star.style.opacity = '0';
            setTimeout(() => star.remove(), 500);
        }
    }, 5000);
}

function makeStarDraggable(star) {
    let isDragging = false;
    let startX, startY, initialX, initialY;
    
    function startDrag(e) {
        if (star.classList.contains('collected')) return;
        
        isDragging = true;
        star.style.cursor = 'grabbing';
        star.style.zIndex = 100;
        star.style.animation = 'none';
        
        if (e.type === 'touchstart') {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        } else {
            startX = e.clientX;
            startY = e.clientY;
        }
        
        initialX = star.offsetLeft;
        initialY = star.offsetTop;
        
        e.preventDefault();
    }
    
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
        
        star.style.left = (initialX + deltaX) + 'px';
        star.style.top = (initialY + deltaY) + 'px';
    }
    
    function endDrag(e) {
        if (!isDragging) return;
        isDragging = false;
        star.style.cursor = 'grab';
        
        // 檢查是否落入許願池
        checkWishPool(star);
    }
    
    star.addEventListener('mousedown', startDrag);
    star.addEventListener('touchstart', startDrag);
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag);
    
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
}

function checkWishPool(star) {
    const pool = document.getElementById('wish-pool');
    const poolRect = pool.getBoundingClientRect();
    const starRect = star.getBoundingClientRect();
    
    // 計算星星中心點
    const starCenterX = starRect.left + starRect.width / 2;
    const starCenterY = starRect.top + starRect.height / 2;
    
    // 檢查是否在許願池範圍內
    if (
        starCenterX >= poolRect.left &&
        starCenterX <= poolRect.right &&
        starCenterY >= poolRect.top &&
        starCenterY <= poolRect.bottom
    ) {
        // 成功收集！
        collectStar(star);
    }
}

function collectStar(star) {
    star.classList.add('collected');
    starsCollected++;
    updateStarUI();
    
    // 播放成功音效
    if (typeof playSfxSuccess === 'function') playSfxSuccess();
    
    // 動畫效果
    star.style.transition = 'all 0.5s';
    star.style.transform = 'scale(2)';
    star.style.opacity = '0';
    
    // 許願池發光
    const pool = document.getElementById('wish-pool');
    pool.style.boxShadow = '0 0 50px rgba(255, 215, 0, 0.8)';
    setTimeout(() => {
        pool.style.boxShadow = '0 0 30px rgba(74, 144, 217, 0.5)';
    }, 500);
    
    setTimeout(() => {
        star.remove();
    }, 500);
    
    // 收集完成
    if (starsCollected >= targetStars) {
        clearInterval(starSpawnInterval);
        // 播放完成音效
        if (typeof playSfxComplete === 'function') playSfxComplete();
        showWishInput();
    }
}

function showWishInput() {
    const wishArea = document.getElementById('wish-input-area');
    wishArea.classList.remove('hidden');
    
    // 清除剩餘的星星
    const container = document.getElementById('stars-container');
    container.innerHTML = '';
}

function setupWishInput() {
    const submitBtn = document.getElementById('submit-wish-btn');
    const wishText = document.getElementById('wish-text');
    
    submitBtn.addEventListener('click', () => {
        const wish = wishText.value.trim() || '希望一切都好！';
        gameState.wish = wish;
        
        // 前往結束畫面
        showEndScreen();
    });
    
    // Enter 鍵提交（需要按 Ctrl/Cmd + Enter）
    wishText.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            submitBtn.click();
        }
    });
}
