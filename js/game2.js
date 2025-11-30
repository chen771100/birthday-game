/* ========================================
   關卡二：裝飾蛋糕 (Canvas 版本)
   整合自 game 模組
   ======================================== */

class CakeDecoratorGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // 從 gameState 取得蛋糕資料
        const { flavor, shape } = gameState.cake;
        
        // 根據口味設定蛋糕顏色
        const flavorColors = {
            chocolate: '#8B4513',
            strawberry: '#FFB6C1',
            vanilla: '#FFFACD'
        };
        
        // 遊戲狀態
        this.cakeColor = flavorColors[flavor] || '#FFB6C1';
        this.creamColor = '#FFFFFF';
        this.layers = shape === 'heart' ? 1 : 2; // 愛心蛋糕預設1層
        this.currentDeco = null;
        this.decorations = [];
        this.candles = [];
        this.history = [];
        this.message = '';
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.drawCake();
        
        // 設置預設選中狀態
        const defaultCreamColor = document.querySelector('.cream-color[data-color="#FFFFFF"]');
        if (defaultCreamColor) defaultCreamColor.classList.add('active');
        
        const defaultLayer = document.querySelector(`.layer-btn[data-layers="${this.layers}"]`);
        if (defaultLayer) defaultLayer.classList.add('active');
    }
    
    bindEvents() {
        // 蛋糕顏色選擇
        document.querySelectorAll('.cake-color').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.cake-color').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.cakeColor = e.target.dataset.color;
                this.drawCake();
            });
        });
        
        // 奶油顏色選擇
        document.querySelectorAll('.cream-color').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.cream-color').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.creamColor = e.target.dataset.color;
                gameState.cake.creamColor = this.creamColor;
                this.drawCake();
            });
        });
        
        // 裝飾品選擇
        document.querySelectorAll('.deco-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.deco-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentDeco = e.target.dataset.deco;
            });
        });
        
        // 層數選擇
        document.querySelectorAll('.layer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.layer-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.layers = parseInt(e.target.dataset.layers);
                this.drawCake();
            });
        });
        
        // 蠟燭按鈕
        document.querySelectorAll('.candle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (this.candles.length >= 3) return;
                
                const color = e.target.dataset.candle;
                this.saveHistory();
                this.candles.push({ color: color });
                this.updateCandleCount();
                this.drawCake();
            });
        });
        
        // 畫布點擊 - 放置裝飾
        this.canvas.addEventListener('click', (e) => {
            if (this.currentDeco) {
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                if (this.isOnCake(x, y)) {
                    this.saveHistory();
                    this.decorations.push({
                        type: this.currentDeco,
                        x: x,
                        y: y
                    });
                    this.drawCake();
                }
            }
        });
        
        // 撤銷按鈕
        const undoBtn = document.getElementById('undoBtn');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => this.undo());
        }
        
        // 清除裝飾按鈕
        const clearDecoBtn = document.getElementById('clearDecoBtn');
        if (clearDecoBtn) {
            clearDecoBtn.addEventListener('click', () => {
                this.saveHistory();
                this.decorations = [];
                this.drawCake();
            });
        }
        
        // 清除蠟燭按鈕
        const clearCandleBtn = document.getElementById('clearCandleBtn');
        if (clearCandleBtn) {
            clearCandleBtn.addEventListener('click', () => {
                this.saveHistory();
                this.candles = [];
                this.updateCandleCount();
                this.drawCake();
            });
        }
        
        // 祝福文字
        const messageInput = document.getElementById('cake-message');
        const addMessageBtn = document.getElementById('add-message-btn');
        if (addMessageBtn && messageInput) {
            addMessageBtn.addEventListener('click', () => {
                this.message = messageInput.value.trim();
                gameState.cake.message = this.message;
                this.drawCake();
                
                addMessageBtn.textContent = '已添加！✨';
                setTimeout(() => {
                    addMessageBtn.textContent = '加入文字';
                }, 1000);
            });
        }
        
        // 完成按鈕
        const finishBtn = document.getElementById('finish-decorate-btn');
        if (finishBtn) {
            finishBtn.addEventListener('click', () => this.finishDecoration());
        }
    }
    
    updateCandleCount() {
        const display = document.getElementById('candle-num');
        if (display) {
            display.textContent = this.candles.length;
        }
    }
    
    // 檢查點擊是否在蛋糕上
    isOnCake(x, y) {
        const centerX = this.canvas.width / 2;
        const baseY = this.canvas.height - 80;
        
        if (this.layers === 1) {
            return y > baseY - 100 && y < baseY && x > centerX - 120 && x < centerX + 120;
        } else if (this.layers === 2) {
            return y > baseY - 180 && y < baseY && x > centerX - 120 && x < centerX + 120;
        } else {
            return y > baseY - 260 && y < baseY && x > centerX - 120 && x < centerX + 120;
        }
    }
    
    // 繪製蛋糕
    drawCake(options = {}) {
        const { skipCandles = false } = options;
        const ctx = this.ctx;
        const centerX = this.canvas.width / 2;
        const baseY = this.canvas.height - 80;
        
        // 清空畫布並繪製背景
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 繪製漸層背景
        const bgGradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        bgGradient.addColorStop(0, '#FFF5F8');
        bgGradient.addColorStop(1, '#FFE4EC');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 繪製蛋糕盤
        this.drawPlate(centerX, baseY);
        
        // 根據層數繪製蛋糕
        if (this.layers >= 1) {
            this.drawCakeLayer(centerX, baseY - 10, 120, 80, this.cakeColor, this.creamColor);
        }
        if (this.layers >= 2) {
            this.drawCakeLayer(centerX, baseY - 90, 95, 70, this.cakeColor, this.creamColor);
        }
        if (this.layers >= 3) {
            this.drawCakeLayer(centerX, baseY - 160, 70, 60, this.cakeColor, this.creamColor);
        }
        
        // 繪製頂部裝飾奶油
        this.drawTopCream(centerX, baseY);
        
        // 繪製所有放置的裝飾品
        this.decorations.forEach(deco => {
            this.drawDecoration(deco.type, deco.x, deco.y);
        });
        
        // 繪製蠟燭（可選）
        if (!skipCandles) {
            this.drawCandles(centerX, baseY);
        }
        
        // 繪製祝福文字
        if (this.message) {
            this.drawMessage(centerX, baseY);
        }
    }
    
    // 繪製蛋糕盤
    drawPlate(x, y) {
        const ctx = this.ctx;
        
        // 盤子陰影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.beginPath();
        ctx.ellipse(x, y + 15, 140, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 盤子
        ctx.fillStyle = '#ECEFF1';
        ctx.beginPath();
        ctx.ellipse(x, y + 5, 135, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#FAFAFA';
        ctx.beginPath();
        ctx.ellipse(x, y, 130, 15, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 繪製蛋糕層
    drawCakeLayer(x, y, width, height, cakeColor, creamColor) {
        const ctx = this.ctx;
        
        // 蛋糕本體陰影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.beginPath();
        ctx.ellipse(x + 5, y + 5, width, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 底部橢圓
        ctx.fillStyle = this.darkenColor(cakeColor, 20);
        ctx.beginPath();
        ctx.ellipse(x, y, width, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 側面
        ctx.fillStyle = cakeColor;
        ctx.beginPath();
        ctx.moveTo(x - width, y);
        ctx.lineTo(x - width, y - height);
        ctx.quadraticCurveTo(x, y - height - 15, x + width, y - height);
        ctx.lineTo(x + width, y);
        ctx.closePath();
        ctx.fill();
        
        // 添加漸層效果
        const gradient = ctx.createLinearGradient(x - width, 0, x + width, 0);
        gradient.addColorStop(0, 'rgba(0,0,0,0.1)');
        gradient.addColorStop(0.3, 'rgba(255,255,255,0.2)');
        gradient.addColorStop(0.7, 'rgba(255,255,255,0.1)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.15)');
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // 頂部橢圓
        ctx.fillStyle = this.lightenColor(cakeColor, 10);
        ctx.beginPath();
        ctx.ellipse(x, y - height, width, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 奶油邊緣
        this.drawCreamEdge(x, y - height, width, creamColor);
    }
    
    // 繪製奶油邊緣裝飾
    drawCreamEdge(x, y, width, color) {
        const ctx = this.ctx;
        const numPuffs = 16;
        
        for (let i = 0; i < numPuffs; i++) {
            const angle = (i / numPuffs) * Math.PI * 2;
            const px = x + Math.cos(angle) * (width - 5);
            const py = y + Math.sin(angle) * 12;
            
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(px, py - 5, 12, 0, Math.PI * 2);
            ctx.fill();
            
            // 高光
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.arc(px - 3, py - 8, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // 繪製頂部奶油裝飾
    drawTopCream(centerX, baseY) {
        let topY, topWidth;
        
        if (this.layers === 1) {
            topY = baseY - 90;
            topWidth = 120;
        } else if (this.layers === 2) {
            topY = baseY - 160;
            topWidth = 95;
        } else {
            topY = baseY - 220;
            topWidth = 70;
        }
        
        // 中央大奶油花
        this.drawCreamSwirl(centerX, topY, 25, this.creamColor);
    }
    
    // 繪製奶油漩渦
    drawCreamSwirl(x, y, size, color) {
        const ctx = this.ctx;
        
        // 基底
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // 漩渦層次
        for (let i = 0; i < 3; i++) {
            const offset = i * 5;
            ctx.fillStyle = this.lightenColor(color, i * 10);
            ctx.beginPath();
            ctx.arc(x, y - offset, size - i * 5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 頂部尖點
        ctx.fillStyle = this.lightenColor(color, 20);
        ctx.beginPath();
        ctx.moveTo(x, y - 20);
        ctx.quadraticCurveTo(x + 8, y - 10, x, y - 5);
        ctx.quadraticCurveTo(x - 8, y - 10, x, y - 20);
        ctx.fill();
    }
    
    // 繪製蠟燭
    drawCandles(centerX, baseY) {
        if (this.candles.length === 0) return;
        
        let topY;
        if (this.layers === 1) {
            topY = baseY - 95;
        } else if (this.layers === 2) {
            topY = baseY - 165;
        } else {
            topY = baseY - 225;
        }
        
        const spacing = 35;
        const totalWidth = (this.candles.length - 1) * spacing;
        const startX = centerX - totalWidth / 2;
        
        const colorGradients = {
            pink: ['#FFB6C1', '#FF69B4'],
            blue: ['#87CEEB', '#4169E1'],
            yellow: ['#FFD700', '#FFA500'],
            purple: ['#DDA0DD', '#9932CC'],
            green: ['#98FB98', '#32CD32'],
            rainbow: ['#FF6B6B', '#4ECDC4']
        };
        
        this.candles.forEach((candle, index) => {
            const x = startX + index * spacing;
            const colors = colorGradients[candle.color] || colorGradients.pink;
            
            const ctx = this.ctx;
            
            // 蠟燭本體
            const candleGradient = ctx.createLinearGradient(x - 5, topY, x + 5, topY);
            candleGradient.addColorStop(0, colors[0]);
            candleGradient.addColorStop(1, colors[1]);
            
            ctx.fillStyle = candleGradient;
            ctx.beginPath();
            ctx.roundRect(x - 5, topY - 40, 10, 40, 3);
            ctx.fill();
            
            // 蠟燭芯
            ctx.fillStyle = '#333';
            ctx.fillRect(x - 1, topY - 45, 2, 8);
            
            // 火焰
            this.drawFlame(x, topY - 50);
        });
    }
    
    // 繪製火焰
    drawFlame(x, y) {
        const ctx = this.ctx;
        
        // 外焰 (橘色)
        ctx.fillStyle = '#FF6600';
        ctx.beginPath();
        ctx.moveTo(x, y - 18);
        ctx.quadraticCurveTo(x + 8, y - 8, x + 5, y);
        ctx.quadraticCurveTo(x, y + 3, x - 5, y);
        ctx.quadraticCurveTo(x - 8, y - 8, x, y - 18);
        ctx.fill();
        
        // 內焰 (黃色)
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(x, y - 12);
        ctx.quadraticCurveTo(x + 4, y - 6, x + 3, y);
        ctx.quadraticCurveTo(x, y + 2, x - 3, y);
        ctx.quadraticCurveTo(x - 4, y - 6, x, y - 12);
        ctx.fill();
        
        // 核心 (白色)
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(x, y - 2, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 繪製裝飾品
    drawDecoration(type, x, y) {
        const ctx = this.ctx;
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const emojis = {
            'strawberry': '🍓',
            'cherry': '🍒',
            'blueberry': '🫐',
            'star': '⭐',
            'heart': '❤️',
            'flower': '🌸',
            'candy': '🍬',
            'cookie': '🍪',
            'sprinkles': '✨',
            'chocolate': '🍫',
            'ribbon': '🎀'
        };
        
        if (type === 'sprinkles') {
            const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
            for (let i = 0; i < 8; i++) {
                const offsetX = (Math.random() - 0.5) * 30;
                const offsetY = (Math.random() - 0.5) * 30;
                ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                ctx.beginPath();
                ctx.ellipse(x + offsetX, y + offsetY, 3, 6, Math.random() * Math.PI, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            ctx.fillText(emojis[type] || type, x, y);
        }
    }
    
    // 繪製祝福文字
    drawMessage(centerX, baseY) {
        const ctx = this.ctx;
        
        // 文字背景
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        const textWidth = ctx.measureText(this.message).width + 20;
        ctx.fillRect(centerX - textWidth / 2, baseY + 30, textWidth, 30);
        
        // 文字
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = '#E91E63';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.message, centerX, baseY + 45);
    }
    
    // 顏色加深
    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max((num >> 16) - amt, 0);
        const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
        const B = Math.max((num & 0x0000FF) - amt, 0);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }
    
    // 顏色加亮
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min((num >> 16) + amt, 255);
        const G = Math.min((num >> 8 & 0x00FF) + amt, 255);
        const B = Math.min((num & 0x0000FF) + amt, 255);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }
    
    // 保存歷史記錄
    saveHistory() {
        this.history.push({
            decorations: JSON.parse(JSON.stringify(this.decorations)),
            candles: JSON.parse(JSON.stringify(this.candles))
        });
        if (this.history.length > 20) {
            this.history.shift();
        }
    }
    
    // 撤銷
    undo() {
        if (this.history.length > 0) {
            const lastState = this.history.pop();
            this.decorations = lastState.decorations;
            this.candles = lastState.candles;
            this.updateCandleCount();
            this.drawCake();
        }
    }
    
    // 完成裝飾
    finishDecoration() {
        // 確保至少有1根蠟燭
        if (this.candles.length === 0) {
            this.candles = [{ color: 'pink' }];
        }
        
        // 英文代碼轉 emoji 映射表
        const emojiMap = {
            'strawberry': '🍓',
            'cherry': '🍒',
            'blueberry': '🫐',
            'star': '⭐',
            'heart': '❤️',
            'flower': '🌸',
            'candy': '🍬',
            'cookie': '🍪',
            'sprinkles': '✨',
            'chocolate': '🍫',
            'ribbon': '🎀'
        };
        
        // 儲存到 gameState
        gameState.cake.creamColor = this.creamColor;
        gameState.cake.decorations = this.decorations.map(d => ({
            type: emojiMap[d.type] || d.type,  // 轉換為 emoji
            x: d.x,
            y: d.y
        }));
        gameState.cake.candles = this.candles.map(c => ({
            color: c.color
        }));
        gameState.cake.message = this.message;
        gameState.cake.layers = this.layers;
        
        // 儲存蛋糕圖片到 gameState（含蠟燭，用於最終顯示）
        gameState.cake.imageData = this.canvas.toDataURL('image/png');
        
        // 儲存無蠟燭版本（用於吹蠟燭畫面）
        this.drawCake({ skipCandles: true });
        gameState.cake.imageDataNoCandles = this.canvas.toDataURL('image/png');
        // 恢復原圖
        this.drawCake();
        
        showScreen('game3');
        initGame3();
    }
    
    // 儲存圖片
    saveImage() {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // 繪製背景
        const gradient = tempCtx.createLinearGradient(0, 0, 0, tempCanvas.height);
        gradient.addColorStop(0, '#FFF5F8');
        gradient.addColorStop(1, '#FFE4EC');
        tempCtx.fillStyle = gradient;
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // 複製蛋糕內容
        tempCtx.drawImage(this.canvas, 0, 0);
        
        // 下載圖片
        const link = document.createElement('a');
        link.download = '我的蛋糕_' + new Date().toLocaleDateString('zh-TW') + '.png';
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
    }
}

// 遊戲實例
let cakeGame = null;

function initGame2() {
    // 初始化 Canvas 蛋糕裝飾遊戲
    cakeGame = new CakeDecoratorGame('cakeCanvas');
}
