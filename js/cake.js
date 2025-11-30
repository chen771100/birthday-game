/* ========================================
   蛋糕統一渲染模組
   所有畫面的蛋糕都使用這個模組渲染
   ======================================== */

const CakeRenderer = {
    // 口味顏色對應
    flavorColors: {
        chocolate: { main: '#6B4423', light: '#8B5A2B', dark: '#4A2C17' },
        strawberry: { main: '#FFB6C1', light: '#FFD1DC', dark: '#FF8FAB' },
        vanilla: { main: '#FFF8DC', light: '#FFFEF0', dark: '#F5E6C8' }
    },

    // 蠟燭顏色對應
    candleColors: {
        pink: { gradient: 'linear-gradient(to bottom, #FFB6C1, #FF69B4)', stripe: '#FF69B4' },
        blue: { gradient: 'linear-gradient(to bottom, #87CEEB, #4169E1)', stripe: '#4169E1' },
        yellow: { gradient: 'linear-gradient(to bottom, #FFD700, #FFA500)', stripe: '#FFA500' },
        purple: { gradient: 'linear-gradient(to bottom, #DDA0DD, #9932CC)', stripe: '#9932CC' },
        green: { gradient: 'linear-gradient(to bottom, #98FB98, #32CD32)', stripe: '#32CD32' },
        rainbow: { 
            gradient: 'linear-gradient(to bottom, #FF6B6B 0%, #FFD93D 25%, #6BCB77 50%, #4D96FF 75%, #9B59B6 100%)',
            stripe: '#FF6B6B'
        }
    },

    /**
     * 渲染蛋糕到指定容器
     * @param {HTMLElement} container - 目標容器
     * @param {Object} cakeData - 蛋糕資料 (shape, flavor, creamColor, decorations, candles, message)
     * @param {Object} options - 選項 { size: 'normal'|'small', showCandles: true, showFlame: true }
     */
    render(container, cakeData, options = {}) {
        const {
            shape = 'circle',
            flavor = 'vanilla',
            creamColor = '#FFB6C1',
            decorations = [],
            candles = [],
            message = ''
        } = cakeData;

        const {
            size = 'normal',
            showCandles = true,
            showFlame = true
        } = options;

        // 尺寸配置
        const sizeConfig = size === 'small' 
            ? { width: 160, height: 100, fontSize: 16, candleHeight: 28, candleWidth: 8 }
            : { width: 200, height: 120, fontSize: 20, candleHeight: 35, candleWidth: 10 };

        // 清空容器
        container.innerHTML = '';
        container.className = 'cake-container';
        container.style.width = sizeConfig.width + 'px';
        container.style.height = (shape === 'peach' ? sizeConfig.height * 1.3 : sizeConfig.height) + 'px';
        container.style.position = 'relative';

        // 建立蛋糕主體
        const cakeElement = this.createCakeBody(shape, flavor, creamColor, sizeConfig);
        container.appendChild(cakeElement);

        // 渲染裝飾品
        if (decorations.length > 0) {
            const decoLayer = this.createDecorationsLayer(decorations, sizeConfig);
            container.appendChild(decoLayer);
        }

        // 渲染蠟燭
        if (showCandles && candles.length > 0) {
            const candleLayer = this.createCandlesLayer(candles, sizeConfig, showFlame);
            container.appendChild(candleLayer);
        }

        // 渲染祝福文字
        if (message) {
            const msgLayer = this.createMessageLayer(message, sizeConfig);
            container.appendChild(msgLayer);
        }

        return container;
    },

    /**
     * 建立蛋糕主體
     */
    createCakeBody(shape, flavor, creamColor, sizeConfig) {
        const cake = document.createElement('div');
        cake.className = `cake-body shape-${shape}`;
        
        const colors = this.flavorColors[flavor] || this.flavorColors.vanilla;

        if (shape === 'peach') {
            // 壽桃造型 - 不需要奶油
            cake.innerHTML = `
                <div class="peach-body">
                    <div class="peach-highlight"></div>
                    <div class="peach-leaf">🍃</div>
                </div>
            `;
        } else if (shape === 'circle') {
            // 圓柱形蛋糕
            cake.innerHTML = `
                <div class="cylinder-cake">
                    <div class="cylinder-top" style="background: ${creamColor}"></div>
                    <div class="cylinder-body" style="background: ${colors.main}">
                        <div class="cylinder-cream-drip" style="--cream-color: ${creamColor}"></div>
                    </div>
                    <div class="cylinder-bottom"></div>
                </div>
            `;
        } else {
            // 方形（正方體）蛋糕
            cake.innerHTML = `
                <div class="cube-cake">
                    <div class="cube-top" style="background: ${creamColor}"></div>
                    <div class="cube-front" style="background: ${colors.main}">
                        <div class="cube-cream-drip" style="--cream-color: ${creamColor}"></div>
                    </div>
                    <div class="cube-right" style="background: ${colors.dark}"></div>
                </div>
            `;
        }

        return cake;
    },

    /**
     * 建立裝飾品圖層
     */
    createDecorationsLayer(decorations, sizeConfig) {
        const layer = document.createElement('div');
        layer.className = 'cake-decorations-layer';

        decorations.forEach(deco => {
            const item = document.createElement('span');
            item.className = 'cake-deco-item';
            item.textContent = deco.type;
            item.style.fontSize = sizeConfig.fontSize + 'px';
            // 將原始位置轉換為相對位置 (原本基於 300x300 畫布)
            const relX = (deco.x / 300) * sizeConfig.width;
            const relY = (deco.y / 300) * sizeConfig.height * 0.8;
            item.style.left = relX + 'px';
            item.style.top = relY + 'px';
            layer.appendChild(item);
        });

        return layer;
    },

    /**
     * 建立蠟燭圖層
     */
    createCandlesLayer(candles, sizeConfig, showFlame) {
        const layer = document.createElement('div');
        layer.className = 'cake-candles-layer';

        const count = candles.length;
        const spacing = sizeConfig.width / (count + 1);

        candles.forEach((candleData, index) => {
            const candle = document.createElement('div');
            const style = candleData.style || 'classic';
            const color = candleData.color || 'pink';
            candle.className = `cake-candle style-${style}`;
            
            // 設定顏色
            const colorConfig = this.candleColors[color] || this.candleColors.pink;
            candle.style.setProperty('--candle-gradient', colorConfig.gradient);
            candle.style.setProperty('--candle-stripe', colorConfig.stripe);
            candle.style.width = sizeConfig.candleWidth + 'px';
            candle.style.height = sizeConfig.candleHeight + 'px';

            // 位置
            candle.style.left = (spacing * (index + 1) - sizeConfig.candleWidth / 2) + 'px';
            candle.style.top = (-sizeConfig.candleHeight + 5) + 'px';

            // 數字蠟燭顯示數字
            if (style === 'number') {
                candle.textContent = index + 1;
            }

            // 火焰
            if (showFlame) {
                const flame = document.createElement('span');
                flame.className = 'candle-flame';
                flame.textContent = '🔥';
                candle.appendChild(flame);
            }

            layer.appendChild(candle);
        });

        return layer;
    },

    /**
     * 建立祝福文字圖層
     */
    createMessageLayer(message, sizeConfig) {
        const layer = document.createElement('div');
        layer.className = 'cake-message-layer';
        layer.textContent = message;
        layer.style.fontSize = (sizeConfig.fontSize * 0.7) + 'px';
        return layer;
    }
};

// 匯出給全域使用
window.CakeRenderer = CakeRenderer;
