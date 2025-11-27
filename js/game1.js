/* ========================================
   關卡一：製作蛋糕
   ======================================== */

let mixProgress = 0;
let isMixing = false;
let lastAngle = 0;

function initGame1() {
    setupShapeSelection();
    setupFlavorSelection();
    setupMixing();
    setupBaking();
}

// 步驟一：選擇形狀
function setupShapeSelection() {
    const shapeButtons = document.querySelectorAll('.shape-options .option-btn');
    
    shapeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // 移除其他選中狀態
            shapeButtons.forEach(b => b.classList.remove('selected'));
            // 添加選中狀態
            btn.classList.add('selected');
            // 儲存選擇
            gameState.cake.shape = btn.dataset.shape;
            
            // 延遲後進入下一步
            setTimeout(() => {
                goToStep(2);
            }, 500);
        });
    });
}

// 步驟二：選擇口味
function setupFlavorSelection() {
    const flavorButtons = document.querySelectorAll('.flavor-options .option-btn');
    
    flavorButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            flavorButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            gameState.cake.flavor = btn.dataset.flavor;
            
            // 更新麵糊顏色
            updateBatterColor();
            
            setTimeout(() => {
                goToStep(3);
            }, 500);
        });
    });
}

// 更新麵糊顏色
function updateBatterColor() {
    const batter = document.querySelector('.batter');
    const colors = {
        chocolate: '#8B4513',
        strawberry: '#FFB6C1',
        vanilla: '#FFF8DC'
    };
    batter.style.background = colors[gameState.cake.flavor];
}

// 步驟三：攪拌
function setupMixing() {
    const bowl = document.querySelector('.bowl');
    const progressFill = document.getElementById('mix-progress');
    const percentText = document.getElementById('mix-percent');
    
    let centerX, centerY;
    let isMouseDown = false;
    
    // 取得碗的中心點
    function updateCenter() {
        const rect = bowl.getBoundingClientRect();
        centerX = rect.left + rect.width / 2;
        centerY = rect.top + rect.height / 2;
    }
    
    // 計算角度
    function getAngle(x, y) {
        return Math.atan2(y - centerY, x - centerX);
    }
    
    // 處理滑鼠/觸控移動
    function handleMove(x, y) {
        if (!isMouseDown) return;
        
        const currentAngle = getAngle(x, y);
        let angleDiff = currentAngle - lastAngle;
        
        // 處理角度跨越 -π 到 π 的情況
        if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        
        // 累積進度
        mixProgress += Math.abs(angleDiff) * 2;
        mixProgress = Math.min(mixProgress, 100);
        
        // 更新顯示
        progressFill.style.width = mixProgress + '%';
        percentText.textContent = Math.floor(mixProgress);
        
        // 添加攪拌動畫
        bowl.classList.add('mixing');
        
        lastAngle = currentAngle;
        
        // 完成攪拌
        if (mixProgress >= 100) {
            isMouseDown = false;
            bowl.classList.remove('mixing');
            setTimeout(() => {
                goToStep(4);
            }, 500);
        }
    }
    
    // 滑鼠事件
    bowl.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        updateCenter();
        lastAngle = getAngle(e.clientX, e.clientY);
        bowl.classList.add('mixing');
    });
    
    document.addEventListener('mousemove', (e) => {
        handleMove(e.clientX, e.clientY);
    });
    
    document.addEventListener('mouseup', () => {
        isMouseDown = false;
        bowl.classList.remove('mixing');
    });
    
    // 觸控事件
    bowl.addEventListener('touchstart', (e) => {
        isMouseDown = true;
        updateCenter();
        const touch = e.touches[0];
        lastAngle = getAngle(touch.clientX, touch.clientY);
        bowl.classList.add('mixing');
        e.preventDefault();
    });
    
    document.addEventListener('touchmove', (e) => {
        if (!isMouseDown) return;
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
    });
    
    document.addEventListener('touchend', () => {
        isMouseDown = false;
        bowl.classList.remove('mixing');
    });
}

// 步驟四：烘烤
function setupBaking() {
    const bakeBtn = document.getElementById('bake-btn');
    const timer = document.getElementById('bake-timer');
    const timerDisplay = document.getElementById('timer-display');
    const oven = document.querySelector('.oven');
    const cakeInOven = document.querySelector('.cake-in-oven');
    
    // 設定蛋糕顏色
    const colors = {
        chocolate: '#8B4513',
        strawberry: '#FFB6C1',
        vanilla: '#FFF8DC'
    };
    
    bakeBtn.addEventListener('click', () => {
        // 隱藏按鈕，顯示計時器
        bakeBtn.style.display = 'none';
        timer.classList.add('active');
        oven.classList.add('baking');
        
        // 設定蛋糕顏色
        cakeInOven.style.background = colors[gameState.cake.flavor];
        
        // 倒數計時
        let timeLeft = 5;
        const countdown = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = `00:0${timeLeft}`;
            
            if (timeLeft <= 0) {
                clearInterval(countdown);
                oven.classList.remove('baking');
                
                // 完成！
                setTimeout(() => {
                    setupFinishedCake();
                    goToStep(5);
                }, 500);
            }
        }, 1000);
    });
}

// 設定完成的蛋糕預覽
function setupFinishedCake() {
    const preview = document.getElementById('finished-cake-preview');
    const { shape, flavor } = gameState.cake;
    
    // 口味顏色
    const colors = {
        chocolate: '#8B4513',
        strawberry: '#FFB6C1',
        vanilla: '#FFF8DC'
    };
    
    preview.style.background = colors[flavor];
    
    // 形狀
    if (shape === 'circle') {
        preview.style.borderRadius = '50% 50% 20px 20px';
    } else if (shape === 'heart') {
        preview.style.width = '120px';
        preview.style.height = '120px';
        preview.style.borderRadius = '20px';
        preview.style.transform = 'rotate(-45deg)';
    }
}

// 切換步驟
function goToStep(stepNum) {
    const steps = document.querySelectorAll('.making-step');
    steps.forEach(step => step.classList.remove('active'));
    document.getElementById(`step${stepNum}`).classList.add('active');
}

// 進入裝飾關卡
document.addEventListener('DOMContentLoaded', () => {
    const toDecorateBtn = document.getElementById('to-decorate-btn');
    if (toDecorateBtn) {
        toDecorateBtn.addEventListener('click', () => {
            showScreen('game2');
            initGame2();
        });
    }
});
