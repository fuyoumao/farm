/**
 * 统一天气时间系统
 * 按照重建文档规范实现，跨地图统一使用
 */

class UnifiedWeatherSystem {
    constructor(core) {
        this.core = core;
        this.initialized = false;
        this.listeners = new Map();
        
        // 天气图标映射
        this.weatherIcons = {
            '晴天': '☀️',
            '刮风': '💨',
            '下雨': '🌧️',
            '下雪': '❄️',
            '阴天': '☁️'
        };
    }

    /**
     * 初始化天气时间系统
     */
    initialize() {
        if (!this.core) {
            console.error('❌ 核心系统实例未传入，无法初始化天气系统');
            return false;
        }

        if (!this.core.initialized) {
            console.error('❌ 统一核心系统未初始化，无法初始化天气系统');
            return false;
        }

        if (!this.core.gameData) {
            console.error('❌ 游戏数据不存在，无法初始化天气系统');
            return false;
        }

        // 确保天气数据结构存在
        if (!this.core.gameData.weather) {
            this.core.gameData.weather = this.getDefaultWeatherData();
            console.log('🌤️ 初始化默认天气数据');
        }

        // 验证数据完整性
        this.validateWeatherData();

        this.initialized = true;
        console.log('🌤️ 统一天气时间系统初始化完成');
        console.log('🌤️ 当前天气数据:', this.core.gameData.weather);

        // 立即更新一次显示
        this.updateDisplay();
        
        // 输出初始化摘要
        console.log('🌤️ === 天气系统初始化摘要 ===');
        console.log(`当前天气: ${this.getCurrentWeather()}`);
        console.log(`当前季节: ${this.getCurrentSeason()}`);
        console.log(`当前天数: ${this.getCurrentDay()}`);
        console.log(`天气变化间隔: ${this.core.gameData.weather.weatherDuration / 1000}秒`);
        console.log('==========================');

        return true;
    }

    /**
     * 获取默认天气数据
     */
    getDefaultWeatherData() {
        return {
            currentDay: 1,
            currentSeason: "春天",
            currentWeather: "晴天",
            daysInSeason: 0,
            weatherStartTime: Date.now(),
            weatherDuration: 30000, // 30秒
            daysPerSeason: 10,
            seasons: ["春天", "夏天", "秋天", "冬天"],
            weathers: ["晴天", "刮风", "下雨", "下雪", "阴天"]
        };
    }

    /**
     * 验证天气数据完整性
     */
    validateWeatherData() {
        const weather = this.core.gameData.weather;
        const defaults = this.getDefaultWeatherData();
        
        // 确保所有必要字段存在
        Object.keys(defaults).forEach(key => {
            if (weather[key] === undefined) {
                weather[key] = defaults[key];
                console.log(`🔧 修复缺失的天气数据字段: ${key}`);
            }
        });
    }

    /**
     * 更新天气时间状态 - 每秒调用
     */
    update() {
        if (!this.initialized) return;

        const weather = this.core.gameData.weather;
        const now = Date.now();
        const elapsed = now - weather.weatherStartTime;

        // 检查是否需要变化天气
        if (elapsed >= weather.weatherDuration) {
            this.changeWeather();
        }
    }

    /**
     * 变化天气
     */
    changeWeather() {
        const weather = this.core.gameData.weather;
        const oldWeather = weather.currentWeather;
        
        // 重置天气开始时间
        weather.weatherStartTime = Date.now();
        
        // 选择新天气
        let newWeather;
        do {
            newWeather = weather.weathers[Math.floor(Math.random() * weather.weathers.length)];
        } while (
            // 冬天不能下雨
            (weather.currentSeason === "冬天" && newWeather === "下雨") ||
            // 非冬天不能下雪
            (weather.currentSeason !== "冬天" && newWeather === "下雪") ||
            // 不能连续相同天气
            newWeather === oldWeather
        );
        
        weather.currentWeather = newWeather;
        
        // 增加天数
        weather.currentDay++;
        weather.daysInSeason++;
        
        // 检查季节变化
        if (weather.daysInSeason >= weather.daysPerSeason) {
            this.changeSeason();
        }
        
        console.log(`🌤️ 天气变化: ${oldWeather} → ${newWeather}, 第${weather.currentDay}天`);
        
        // 保存数据
        this.core.saveGameData();
        
        // 应用天气效果到田地
        this.applyWeatherEffectsToFields(oldWeather, weather.currentWeather);

        // 触发事件
        this.emit('weatherChanged', {
            oldWeather,
            newWeather: weather.currentWeather,
            currentDay: weather.currentDay,
            currentSeason: weather.currentSeason
        });

        // 更新显示
        this.updateDisplay();
    }

    /**
     * 变化季节
     */
    changeSeason() {
        const weather = this.core.gameData.weather;
        const oldSeason = weather.currentSeason;
        
        // 重置季节天数
        weather.daysInSeason = 0;
        
        // 切换到下一季节
        const currentSeasonIndex = weather.seasons.indexOf(weather.currentSeason);
        weather.currentSeason = weather.seasons[(currentSeasonIndex + 1) % weather.seasons.length];
        
        console.log(`🌸 季节变化: ${oldSeason} → ${weather.currentSeason}`);
        
        // 触发事件
        this.emit('seasonChanged', {
            oldSeason,
            newSeason: weather.currentSeason,
            currentDay: weather.currentDay
        });
    }

    /**
     * 获取当前天气
     */
    getCurrentWeather() {
        return this.core.gameData.weather?.currentWeather || '晴天';
    }

    /**
     * 获取当前季节
     */
    getCurrentSeason() {
        return this.core.gameData.weather?.currentSeason || '春天';
    }

    /**
     * 获取当前天数
     */
    getCurrentDay() {
        return this.core.gameData.weather?.currentDay || 1;
    }

    /**
     * 获取天气图标
     */
    getWeatherIcon() {
        const weather = this.getCurrentWeather();
        return this.weatherIcons[weather] || '☀️';
    }

    /**
     * 获取季节天气文字
     */
    getSeasonWeatherText() {
        return `${this.getCurrentSeason()} · ${this.getCurrentWeather()}`;
    }

    /**
     * 更新所有地图的显示
     */
    updateDisplay() {
        // 检测当前页面类型
        const hasTeaShopElements = document.getElementById('weather-display') || document.getElementById('game-time');
        const hasRiceVillageElements = document.getElementById('rice-weather-icon') || document.getElementById('rice-season-text');
        
        let updatedPages = [];
        
        // 更新茶铺显示
        if (hasTeaShopElements) {
            this.updateTeaShopDisplay();
            updatedPages.push('茶铺');
        }
        
        // 更新稻香村显示
        if (hasRiceVillageElements) {
            this.updateRiceVillageDisplay();
            updatedPages.push('稻香村');
        }
        
        // 输出更新摘要
        if (updatedPages.length > 0) {
            console.log(`🌤️ 天气显示已更新: ${updatedPages.join(', ')}`);
        }
        
        // 触发显示更新事件
        this.emit('displayUpdated', {
            weather: this.getCurrentWeather(),
            season: this.getCurrentSeason(),
            day: this.getCurrentDay(),
            icon: this.getWeatherIcon(),
            text: this.getSeasonWeatherText(),
            updatedPages: updatedPages
        });
    }

    /**
     * 更新茶铺显示
     */
    updateTeaShopDisplay() {
        // 茶铺使用的是 weather-display 和 game-time 元素
        const weatherDisplay = document.getElementById('weather-display');
        if (weatherDisplay) {
            const weatherIcon = this.getWeatherIcon();
            const seasonText = this.getSeasonWeatherText();
            const newText = `${weatherIcon} ${seasonText}`;
            weatherDisplay.textContent = newText;
        }

        // 更新游戏时间
        const gameTime = document.getElementById('game-time');
        if (gameTime) {
            const currentDay = this.getCurrentDay();
            const newTime = `第${currentDay}天`;
            gameTime.textContent = newTime;
        }
    }

    /**
     * 更新稻香村显示
     */
    updateRiceVillageDisplay() {
        // 更新稻香村的天气显示元素
        const riceWeatherIcon = document.getElementById('rice-weather-icon');
        if (riceWeatherIcon) {
            riceWeatherIcon.textContent = this.getWeatherIcon();
        }
        
        const riceSeasonText = document.getElementById('rice-season-text');
        if (riceSeasonText) {
            const seasonText = this.getSeasonWeatherText();
            riceSeasonText.textContent = seasonText;
        }
        
        const riceDayNumber = document.getElementById('rice-day-number');
        if (riceDayNumber) {
            const currentDay = this.getCurrentDay();
            riceDayNumber.textContent = currentDay;
        }
    }

    /**
     * 事件系统
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`天气系统事件处理器错误 [${event}]:`, error);
                }
            });
        }
    }

    /**
     * 应用天气效果到田地 - 按照旧游戏规律
     */
    applyWeatherEffectsToFields(oldWeather, newWeather) {
        // 只在天气变化时应用一次性效果
        if (!this.core.gameData.teaShop || !this.core.gameData.teaShop.plots) {
            return;
        }

        this.core.gameData.teaShop.plots.forEach((plot, index) => {
            if (plot.state !== 'empty') {
                // 按照旧游戏规律应用天气效果
                switch (newWeather) {
                    case '下雨':
                        // 雨天增加湿度
                        plot.moisture = Math.min(100, plot.moisture + 20);
                        console.log(`💧 雨水滋润了田地${index + 1}，湿度: ${plot.moisture}%`);
                        break;
                    case '刮风':
                        // 刮风降低湿度
                        plot.moisture = Math.max(0, plot.moisture - 10);
                        console.log(`💨 大风使田地${index + 1}的水分蒸发，湿度: ${plot.moisture}%`);
                        break;
                    case '下雪':
                        // 下雪增加湿度和肥沃度
                        plot.moisture = Math.min(100, plot.moisture + 15);
                        plot.fertility = Math.min(100, plot.fertility + 10);
                        console.log(`❄️ 雪花为田地${index + 1}带来了养分，湿度: ${plot.moisture}%, 肥沃度: ${plot.fertility}%`);
                        break;
                    case '晴天':
                    case '阴天':
                        // 晴天和阴天无立即效果
                        break;
                }
            }
        });
    }

    /**
     * 获取系统状态信息
     */
    getSystemInfo() {
        const weather = this.core.gameData.weather;
        return {
            initialized: this.initialized,
            currentWeather: weather?.currentWeather,
            currentSeason: weather?.currentSeason,
            currentDay: weather?.currentDay,
            daysInSeason: weather?.daysInSeason,
            nextWeatherIn: weather ? Math.max(0, weather.weatherDuration - (Date.now() - weather.weatherStartTime)) : 0
        };
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnifiedWeatherSystem;
} else {
    window.UnifiedWeatherSystem = UnifiedWeatherSystem;
}
