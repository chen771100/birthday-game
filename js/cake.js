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
     * @param {Object} cakeData - 蛋糕資料 (shape, flavor, creamColor, decorations, candles, message, imageData)
     * @param {Object} options - 選項 { size: 'normal'|'small', showCandles: true, showFlame: true, useImage: true, overlayCandles: false }
     */
    render(container, cakeData, options = {}) {
        const {
            shape = 'circle',
            flavor = 'vanilla',
            creamColor = '#FFB6C1',
            decorations = [],
            candles = [],
            message = '',
            imageData = null
        } = cakeData;

        const {
            size = 'normal',
            showCandles = true,
            showFlame = true,
            useImage = true,  // 預設使用圖片（如果有的話）
            overlayCandles = false  // 混合模式：圖片 + DOM 蠟燭
        } = options;

        // 尺寸配置
        const sizeConfig = size === 'small' 
            ? { width: 160, height: 180, fontSize: 16, candleHeight: 28, candleWidth: 8 }
            : { width: 250, height: 280, fontSize: 20, candleHeight: 35, candleWidth: 10 };

        // 清空容器
        container.innerHTML = '';
        container.className = 'cake-container';
        container.style.position = 'relative';

        // 如果有 imageData 且允許使用圖片
        if (imageData && useImage) {
            const img = document.createElement('img');
            img.src = imageData;
            img.className = 'cake-image';
            img.style.width = sizeConfig.width + 'px';
            img.style.height = 'auto';
            img.style.display = 'block';
            container.appendChild(img);
            container.style.width = sizeConfig.width + 'px';
            
            // 混合模式：在圖片上疊加 DOM 蠟燭
            if (overlayCandles && showCandles && candles.length > 0) {
                const candleLayer = this.createCandlesLayer(candles, sizeConfig, showFlame);
                candleLayer.style.position = 'absolute';
                // 根據蛋糕層數計算蠟燭位置
                // Canvas 尺寸 400x450, baseY=370
                // 1層: topY = 370-95 = 275, 2層: topY = 370-165 = 205, 3層: topY = 370-225 = 145
                const layers = cakeData.layers || 2;
                let topPercent;
                if (layers === 1) {
                    topPercent = '42%';  // 275/450 ≈ 61%, 但蠟燭要往上一點
                } else if (layers === 2) {
                    topPercent = '28%';  // 205/450 ≈ 46%
                } else {
                    topPercent = '15%';  // 145/450 ≈ 32%
                }
                candleLayer.style.top = topPercent;
                candleLayer.style.left = '0';
                candleLayer.style.width = '100%';
                container.appendChild(candleLayer);
            }
            
            return container;
        }

        // 否則使用 DOM 渲染
        container.style.width = sizeConfig.width + 'px';
        container.style.height = (shape === 'peach' ? sizeConfig.height * 1.3 : sizeConfig.height) + 'px';

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
     * 注意：裝飾品座標是基於 400x450 Canvas 的，需要縮放到目標容器尺寸
     */
    createDecorationsLayer(decorations, sizeConfig) {
        const layer = document.createElement('div');
        layer.className = 'cake-decorations-layer';

        // Canvas 原始尺寸
        const canvasWidth = 400;
        const canvasHeight = 450;

        // 計算縮放比例
        const scaleX = sizeConfig.width / canvasWidth;
        const scaleY = sizeConfig.height / canvasHeight;

        decorations.forEach(deco => {
            const item = document.createElement('span');
            item.className = 'cake-deco-item';
            item.textContent = deco.type;
            item.style.position = 'absolute';
            // 縮放座標
            item.style.left = (deco.x * scaleX) + 'px';
            item.style.top = (deco.y * scaleY) + 'px';
            item.style.fontSize = (sizeConfig.fontSize * 1.2) + 'px';
            item.style.transform = `scale(${deco.scale || 1}) rotate(${deco.rotation || 0}deg)`;
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

            // 數字蠟燭
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
