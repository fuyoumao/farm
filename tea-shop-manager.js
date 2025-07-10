/**
 * 茶铺管理器
 * 处理茶铺相关的所有功能逻辑
 */

class TeaShopManager {
    constructor() {
        this.core = null;
        this.inventory = null;
        this.updateTimers = new Map();
        this.debugLogs = [];
    }

    /**
     * 初始化茶铺系统
     */
    init() {
        console.log('🍵 初始化茶铺管理器');
        
        // 获取核心系统实例
        this.core = window.core;
        if (!this.core) {
            console.error('❌ 核心系统未找到');
            return;
        }

        // 初始化核心系统
        this.core.init();
        
        // 创建物品系统
        // 使用统一的背包系统实例
        this.inventory = this.core.inventorySystem;
        
        // 设置事件监听
        this.setupEventListeners();
        
        // 初始化UI
        this.initializeUI();

        // 启动更新循环
        this.startUpdateLoop();

        // 监听天气变化事件
        this.setupWeatherListener();

        // 启动猫咪访问系统
        this.startCatVisitSystem();

        this.addDebugLog('茶铺系统初始化完成');
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 监听核心系统事件
        this.core.on('systemInitialized', (data) => {
            this.addDebugLog('核心系统初始化完成');
            this.updateAllDisplays();
        });

        // 监听物品变化事件
        this.inventory.on('itemAdded', (data) => {
            this.addDebugLog(`添加物品: ${data.itemName} x${data.quantity}`);
            this.updateInventoryDisplay();
        });

        this.inventory.on('itemRemoved', (data) => {
            this.addDebugLog(`移除物品: ${data.itemName} x${data.quantity}`);
            this.updateInventoryDisplay();
        });
    }

    /**
     * 初始化UI
     */
    initializeUI() {
        this.updateAllDisplays();
        this.renderFarmGrid();
        this.renderWorkspaces();
        this.renderCatsTable();
        this.updateRiceVillageButton();
    }

    /**
     * 更新所有显示
     */
    updateAllDisplays() {
        this.updateStatusDisplay();
        this.updateInventoryDisplay();
        this.updateCustomerDisplay();
        this.updateMadeTeaDisplay();
    }

    /**
     * 更新状态显示
     */
    updateStatusDisplay() {
        if (!this.core.initialized) return;

        const gameData = this.core.gameData;
        
        // 更新金币
        const fundsElement = document.getElementById('funds-display');
        if (fundsElement) {
            fundsElement.textContent = `${gameData.player.funds} 🪙`;
        }

        // 更新等级
        const levelElement = document.getElementById('level-display');
        if (levelElement) {
            levelElement.textContent = `${gameData.player.level}级`;
        }

        // 更新经验
        const expElement = document.getElementById('exp-display');
        if (expElement) {
            const expNeeded = gameData.player.level * 100; // 简单的经验计算
            expElement.textContent = `${gameData.player.exp}/${expNeeded}`;
        }
    }

    /**
     * 渲染种植网格
     */
    renderFarmGrid() {
        const farmGrid = document.getElementById('farm-grid');
        if (!farmGrid || !this.core.initialized) return;

        farmGrid.innerHTML = '';

        this.core.gameData.teaShop.plots.forEach((plot, index) => {
            const plotCard = document.createElement('div');
            plotCard.className = 'plot-card';
            plotCard.innerHTML = `
                <div class="plot-header">
                    <div class="plot-title">地块 #${index + 1}</div>
                    <div class="plot-status status-${plot.state}">${this.getPlotStatusText(plot)}</div>
                </div>
                <table class="conditions-table">
                    <tr>
                        <td>湿度</td>
                        <td>
                            <div class="progress-bar moisture-progress">
                                <div class="progress-fill" style="width: ${plot.moisture}%">
                                    <div class="progress-text">${plot.moisture}%</div>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>肥沃度</td>
                        <td>
                            <div class="progress-bar fertility-progress">
                                <div class="progress-fill" style="width: ${plot.fertility}%">
                                    <div class="progress-text">${plot.fertility}%</div>
                                </div>
                            </div>
                        </td>
                    </tr>
                    ${plot.state === 'growing' ? this.getPlotGrowthProgress(plot) : ''}
                </table>
                <div style="margin-top: 10px; display: flex; gap: 5px; flex-wrap: wrap;">
                    ${this.getPlotActions(plot, index)}
                </div>
            `;
            farmGrid.appendChild(plotCard);
        });
    }

    /**
     * 获取地块状态文本
     */
    getPlotStatusText(plot) {
        switch (plot.state) {
            case 'empty': return '空闲';
            case 'growing':
                if (plot.stageStartTime && plot.totalGrowTime) {
                    const elapsed = Date.now() - plot.stageStartTime;
                    const progress = Math.min(100, (elapsed / plot.totalGrowTime) * 100);
                    return `种植中 - ${plot.plantType} (${Math.round(progress)}%)`;
                }
                return `种植中 - ${plot.plantType}`;
            case 'ready': return '可收获';
            default: return '未知';
        }
    }

    /**
     * 获取种植进度显示
     */
    getPlotGrowthProgress(plot) {
        if (plot.state !== 'growing' || !plot.stageStartTime || !plot.totalGrowTime) {
            return '';
        }

        const elapsed = Date.now() - plot.stageStartTime;
        const progress = Math.min(100, (elapsed / plot.totalGrowTime) * 100);
        const remainingTime = Math.max(0, plot.totalGrowTime - elapsed);
        const remainingSeconds = Math.ceil(remainingTime / 1000);

        return `
            <tr>
                <td>生长进度</td>
                <td>
                    <div class="progress-bar growth-progress">
                        <div class="progress-fill" style="width: ${progress}%">
                            <div class="progress-text">${Math.round(progress)}%</div>
                        </div>
                    </div>
                    <div class="time-remaining" style="font-size: 11px; color: #6b7280; margin-top: 2px;">
                        ${remainingSeconds > 0 ? `剩余 ${remainingSeconds} 秒` : '已成熟'}
                    </div>
                </td>
            </tr>
        `;
    }

    /**
     * 获取地块操作按钮
     */
    getPlotActions(plot, index) {
        let actions = '';

        if (plot.state === 'empty') {
            actions += `<button class="action-btn" onclick="teaShopManager.showPlantModal(${index})">种植</button>`;
        } else if (plot.state === 'ready') {
            actions += `<button class="action-btn" onclick="teaShopManager.harvestPlot(${index})">收获</button>`;
        }

        actions += `<button class="action-btn" onclick="teaShopManager.waterPlot(${index})">💧 浇水</button>`;
        actions += `<button class="action-btn" onclick="teaShopManager.fertilizePlot(${index})">🌿 施肥</button>`;

        return actions;
    }

    /**
     * 渲染工作区
     */
    renderWorkspaces() {
        this.renderStoves();
        this.renderBoards();
        this.renderGrill();
    }

    /**
     * 渲染炉灶
     */
    renderStoves() {
        const stovesTable = document.getElementById('stoves-table');
        if (!stovesTable || !this.core.initialized) return;

        stovesTable.innerHTML = '';

        this.core.gameData.teaShop.stoves.forEach((stove, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>炉灶 #${index + 1}</td>
                <td>${this.getWorkspaceStatusText(stove)}</td>
                <td>${stove.recipe || '无'}</td>
                <td>${this.getWorkspaceProgress(stove)}</td>
                <td>${this.getStoveActions(stove, index)}</td>
            `;
            stovesTable.appendChild(row);
        });
    }

    /**
     * 渲染案板
     */
    renderBoards() {
        const boardsTable = document.getElementById('boards-table');
        if (!boardsTable || !this.core.initialized) return;

        boardsTable.innerHTML = '';

        this.core.gameData.teaShop.processingBoards.forEach((board, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>案板 #${index + 1}</td>
                <td>${this.getWorkspaceStatusText(board)}</td>
                <td>${board.recipe || '无'}</td>
                <td>${this.getWorkspaceProgress(board)}</td>
                <td>${this.getBoardActions(board, index)}</td>
            `;
            boardsTable.appendChild(row);
        });
    }

    /**
     * 渲染烤肉架
     */
    renderGrill() {
        const grillSection = document.getElementById('grill-section');
        const grillTable = document.getElementById('grill-table');
        
        if (!grillSection || !grillTable || !this.core.initialized) return;

        const grillSystem = this.core.gameData.teaShop.grillSystem;
        
        if (grillSystem.unlocked) {
            grillSection.style.display = 'block';

            // 检查烤制状态
            let status = '空闲';
            if (grillSystem.isGrilling) {
                if (grillSystem.startTime && grillSystem.duration) {
                    const elapsed = Date.now() - grillSystem.startTime;
                    if (elapsed >= grillSystem.duration) {
                        status = '已完成';
                    } else {
                        status = '烤制中';
                    }
                } else {
                    status = '烤制中';
                }
            }

            grillTable.innerHTML = `
                <tr>
                    <td>烤肉架 #1</td>
                    <td>${status}</td>
                    <td>${grillSystem.currentRecipe || '无'}</td>
                    <td>${this.getGrillProgress()}</td>
                    <td>${this.getGrillActions()}</td>
                </tr>
            `;
        } else {
            grillSection.style.display = 'none';
        }
    }

    /**
     * 获取工作区状态文本
     */
    getWorkspaceStatusText(workspace) {
        switch (workspace.state) {
            case 'idle': return '空闲';
            case 'cooking':
            case 'processing': return '工作中';
            case 'ready': return '完成';
            default: return '未知';
        }
    }

    /**
     * 获取工作区进度
     */
    getWorkspaceProgress(workspace) {
        if (workspace.state === 'idle') return '等待中';
        if (workspace.state === 'ready') return '已完成';

        if (workspace.startTime && workspace.duration) {
            const elapsed = Date.now() - workspace.startTime;
            const progress = Math.min(100, (elapsed / workspace.duration) * 100);
            const remainingTime = Math.max(0, workspace.duration - elapsed);
            const remainingSeconds = Math.ceil(remainingTime / 1000);

            return `
                <div class="progress-bar workspace-progress">
                    <div class="progress-fill" style="width: ${progress}%">
                        <div class="progress-text">${Math.round(progress)}%</div>
                    </div>
                </div>
                <div style="font-size: 11px; color: #6b7280; margin-top: 2px;">
                    ${remainingSeconds > 0 ? `剩余 ${remainingSeconds} 秒` : '已完成'}
                </div>
            `;
        }

        return '进行中';
    }

    /**
     * 获取炉灶操作按钮
     */
    getStoveActions(stove, index) {
        if (stove.state === 'idle') {
            return `<button class="action-btn" onclick="showTeaRecipeModal(${index})">🍵 制茶</button>`;
        } else if (stove.state === 'ready') {
            return `<button class="action-btn" onclick="collectTea(${index})">📦 收取</button>`;
        }
        return '工作中...';
    }

    /**
     * 获取案板操作按钮
     */
    getBoardActions(board, index) {
        if (board.state === 'idle') {
            return `<button class="action-btn" onclick="showProcessingModal(${index})">🧂 加工</button>`;
        } else if (board.state === 'ready') {
            return `<button class="action-btn" onclick="collectProcessed(${index})">📦 收取</button>`;
        }
        return '加工中...';
    }

    /**
     * 显示加工模态框
     */
    showProcessingModal(boardIndex) {
        this.addDebugLog(`显示加工配方 - 案板 #${boardIndex + 1}`);

        const processingRecipes = {
            '红糖': { source: '甘蔗', time: 10000, output: 3 },
            '薄荷叶': { source: '薄荷', time: 10000, output: 3 },
            '姜丝': { source: '生姜', time: 10000, output: 3 },
            '柚子丝': { source: '柚子', time: 10000, output: 3 },
            '银耳丝': { source: '银耳', time: 15000, output: 3 },
            '柠檬片': { source: '柠檬', time: 10000, output: 3 },
            '水蜜桃果肉': { source: '水蜜桃', time: 12000, output: 3 },
            '黄芪片': { source: '黄芪', time: 12000, output: 3 },
            '干桂花': { source: '桂花', time: 10000, output: 3 },
            '小圆子': { source: '糯米', time: 15000, output: 3 },
            '酒酿': { source: '米', time: 18000, output: 3 }
        };

        let modalContent = `
            <div class="modal" id="processing-modal" style="display: block;">
                <div class="modal-content">
                    <div class="modal-header">
                        <span>🧂 选择加工配方 - 案板 #${boardIndex + 1}</span>
                        <button class="modal-close" onclick="closeProcessingModal()">×</button>
                    </div>
                    <div class="modal-body">
                        <table class="inventory-table">
                            <thead>
                                <tr><th>产品名称</th><th>所需原料</th><th>加工时间</th><th>产出数量</th><th>状态</th><th>操作</th></tr>
                            </thead>
                            <tbody>
        `;

        Object.entries(processingRecipes).forEach(([productName, recipe]) => {
            const canMake = this.inventory.hasItem(recipe.source, 1, 'teaIngredients');
            const timeText = `${Math.round(recipe.time / 1000)}秒`;
            const statusText = canMake ? '✅ 可加工' : '❌ 原料不足';
            const statusColor = canMake ? '#059669' : '#dc2626';

            modalContent += `
                <tr>
                    <td>${productName}</td>
                    <td>${recipe.source}</td>
                    <td>${timeText}</td>
                    <td>${recipe.output}个</td>
                    <td style="color: ${statusColor};">${statusText}</td>
                    <td>
                        <button class="action-btn" ${canMake ? '' : 'disabled'}
                                onclick="startProcessing(${boardIndex}, '${productName}')">
                            🧂 加工
                        </button>
                    </td>
                </tr>
            `;
        });

        modalContent += `
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('modal-container').innerHTML = modalContent;
    }

    /**
     * 收取加工产品
     */
    collectProcessed(boardIndex) {
        const board = this.core.gameData.teaShop.processingBoards[boardIndex];

        if (board.state !== 'ready') {
            this.addDebugLog('❌ 加工尚未完成');
            return;
        }

        // 添加加工好的小料
        this.inventory.addItem(board.recipe, board.outputCount || 3, 'toppings');

        this.addDebugLog(`📦 收取小料: ${board.recipe} x${board.outputCount || 3}`);

        // 重置案板
        board.state = 'idle';
        board.recipe = null;
        board.startTime = null;
        board.duration = null;
        board.outputCount = null;

        this.renderBoards();
        this.updateInventoryDisplay();
    }

    /**
     * 渲染猫咪表格
     */
    renderCatsTable() {
        console.log('🐱 开始渲染猫咪表格');

        const catsTable = document.getElementById('cats-table');
        if (!catsTable) {
            console.log('❌ 找不到 cats-table 元素');
            return;
        }

        if (!this.core.initialized) {
            console.log('❌ 核心系统未初始化');
            return;
        }

        catsTable.innerHTML = '';

        const cats = this.core.gameData.teaShop.cats;
        console.log('🐱 猫咪数据:', cats);

        // 从实际数据中获取所有猫咪名字
        const catNames = Object.keys(cats.intimacy || {});
        console.log('🐱 发现的猫咪名字:', catNames);

        catNames.forEach(originalName => {
            const intimacy = cats.intimacy[originalName] || 0;
            const feedCount = cats.feedCount[originalName] || 0;
            const isCurrentCat = cats.currentCat === originalName;
            const displayName = this.getDisplayName(originalName);
            const isNamed = !!cats.customNames[originalName];

            console.log(`🐱 渲染猫咪 ${originalName}:`, {
                originalName: originalName,
                displayName: displayName,
                intimacy: intimacy,
                feedCount: feedCount,
                isCurrentCat: isCurrentCat,
                isNamed: isNamed
            });

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${displayName}${isNamed ? ` <small>(${originalName})</small>` : ''} ${isCurrentCat ? '(在场)' : ''}</td>
                <td>${intimacy}/5000</td>
                <td>${this.getCatStatusText(intimacy)}</td>
                <td>${feedCount}次</td>
                <td>${this.getCatActions(originalName, isCurrentCat, isNamed)}</td>
            `;
            catsTable.appendChild(row);
        });

        console.log('🐱 猫咪表格渲染完成，共', catNames.length, '只猫咪');
    }

    /**
     * 获取猫咪显示名字
     */
    getDisplayName(originalName) {
        const cats = this.core.gameData.teaShop.cats;
        return cats.customNames[originalName] || originalName;
    }

    /**
     * 获取猫咪状态文本
     */
    getCatStatusText(intimacy) {
        if (intimacy >= 5000) return '满级';
        if (intimacy >= 3000) return '深度亲密';
        if (intimacy >= 1500) return '亲密';
        if (intimacy >= 500) return '熟悉';
        return '陌生';
    }

    /**
     * 获取猫咪操作按钮
     */
    getCatActions(originalName, isCurrentCat, isNamed) {
        if (isCurrentCat) {
            return `
                <button class="action-btn" onclick="window.teaShopManager.feedCat('${originalName}')" style="margin-right: 5px;">喂小鱼干</button>
                <button class="action-btn" onclick="window.teaShopManager.feedCatWithTea('${originalName}')">喂茶饮</button>
            `;
        }

        if (isNamed) {
            return '<span style="color: #4CAF50;">可出战</span>';
        }

        return '未在场';
    }

    /**
     * 更新稻香村按钮状态
     */
    updateRiceVillageButton() {
        const button = document.getElementById('rice-village-btn');
        if (!button || !this.core.initialized) return;

        // 检查是否有猫咪达到3000亲密度
        const cats = this.core.gameData.teaShop.cats;
        const hasUnlockIntimacyCat = Object.values(cats.intimacy).some(intimacy => intimacy >= 3000);

        if (hasUnlockIntimacyCat) {
            button.disabled = false;
            button.textContent = '稻香村 (已解锁)';
            this.core.gameData.riceVillage.unlocked = true;
        } else {
            button.disabled = true;
            button.textContent = '稻香村 (需要猫咪亲密度3000)';
        }
    }

    /**
     * 启动更新循环
     */
    startUpdateLoop() {
        // 每秒更新一次进度和状态
        setInterval(() => {
            this.updateWorkspaceProgress();
            this.updatePlotGrowth();
            this.updateCustomerPatience();
        }, 1000);

        // 每1秒更新一次所有进度条（更平滑）
        setInterval(() => {
            const hasGrowingPlots = this.core.gameData.teaShop.plots.some(plot => plot.state === 'growing');
            if (hasGrowingPlots) {
                this.updatePlotProgressOnly();
            }
            // 更新湿度和肥沃度显示
            this.updatePlotConditionsOnly();

            // 更新工作区进度条
            this.updateWorkspaceProgressOnly();

            // 更新顾客耐心进度条
            this.updateCustomerProgressOnly();

            // 应用天气效果到田地
            this.applyWeatherEffectsToPlots();
        }, 1000);

        // 每5秒更新一次完整显示
        setInterval(() => {
            this.updateAllDisplays();
        }, 5000);
    }

    /**
     * 只更新种植进度，不重新渲染整个网格
     */
    updatePlotProgressOnly() {
        this.core.gameData.teaShop.plots.forEach((plot, index) => {
            if (plot.state === 'growing' && plot.stageStartTime && plot.totalGrowTime) {
                const elapsed = Date.now() - plot.stageStartTime;
                const progress = Math.min(100, (elapsed / plot.totalGrowTime) * 100);
                const remainingTime = Math.max(0, plot.totalGrowTime - elapsed);
                const remainingSeconds = Math.ceil(remainingTime / 1000);

                // 更新生长进度条（第三行的进度条）
                const growthProgressBar = document.querySelector(`#farm-grid .plot-card:nth-child(${index + 1}) .growth-progress .progress-fill`);
                const growthProgressText = document.querySelector(`#farm-grid .plot-card:nth-child(${index + 1}) .growth-progress .progress-text`);
                const timeText = document.querySelector(`#farm-grid .plot-card:nth-child(${index + 1}) .time-remaining`);

                if (growthProgressBar && growthProgressText) {
                    growthProgressBar.style.width = `${progress}%`;
                    growthProgressText.textContent = `${Math.round(progress)}%`;
                }

                if (timeText) {
                    timeText.textContent = remainingSeconds > 0 ? `剩余 ${remainingSeconds} 秒` : '已成熟';
                }

                // 更新状态文本
                const statusElement = document.querySelector(`#farm-grid .plot-card:nth-child(${index + 1}) .plot-status`);
                if (statusElement) {
                    statusElement.textContent = `种植中 - ${plot.plantType} (${Math.round(progress)}%)`;
                }
            }
        });
    }

    /**
     * 只更新湿度和肥沃度显示
     */
    updatePlotConditionsOnly() {
        this.core.gameData.teaShop.plots.forEach((plot, index) => {
            // 更新湿度进度条
            const moistureProgressBar = document.querySelector(`#farm-grid .plot-card:nth-child(${index + 1}) .moisture-progress .progress-fill`);
            const moistureProgressText = document.querySelector(`#farm-grid .plot-card:nth-child(${index + 1}) .moisture-progress .progress-text`);

            if (moistureProgressBar && moistureProgressText) {
                moistureProgressBar.style.width = `${plot.moisture}%`;
                moistureProgressText.textContent = `${plot.moisture}%`;
            }

            // 更新肥沃度进度条
            const fertilityProgressBar = document.querySelector(`#farm-grid .plot-card:nth-child(${index + 1}) .fertility-progress .progress-fill`);
            const fertilityProgressText = document.querySelector(`#farm-grid .plot-card:nth-child(${index + 1}) .fertility-progress .progress-text`);

            if (fertilityProgressBar && fertilityProgressText) {
                fertilityProgressBar.style.width = `${plot.fertility}%`;
                fertilityProgressText.textContent = `${plot.fertility}%`;
            }
        });
    }

    /**
     * 只更新工作区进度条
     */
    updateWorkspaceProgressOnly() {
        // 更新炉灶进度条
        this.core.gameData.teaShop.stoves.forEach((stove, index) => {
            if (stove.state === 'cooking' && stove.startTime && stove.duration) {
                const elapsed = Date.now() - stove.startTime;
                const progress = Math.min(100, (elapsed / stove.duration) * 100);
                const remainingTime = Math.max(0, stove.duration - elapsed);
                const remainingSeconds = Math.ceil(remainingTime / 1000);

                const progressBar = document.querySelector(`#stoves-table tr:nth-child(${index + 1}) .workspace-progress .progress-fill`);
                const progressText = document.querySelector(`#stoves-table tr:nth-child(${index + 1}) .workspace-progress .progress-text`);

                if (progressBar && progressText) {
                    progressBar.style.width = `${progress}%`;
                    progressText.textContent = `${Math.round(progress)}%`;
                }
            }
        });

        // 更新案板进度条
        this.core.gameData.teaShop.processingBoards.forEach((board, index) => {
            if (board.state === 'processing' && board.startTime && board.duration) {
                const elapsed = Date.now() - board.startTime;
                const progress = Math.min(100, (elapsed / board.duration) * 100);
                const remainingTime = Math.max(0, board.duration - elapsed);
                const remainingSeconds = Math.ceil(remainingTime / 1000);

                const progressBar = document.querySelector(`#boards-table tr:nth-child(${index + 1}) .workspace-progress .progress-fill`);
                const progressText = document.querySelector(`#boards-table tr:nth-child(${index + 1}) .workspace-progress .progress-text`);

                if (progressBar && progressText) {
                    progressBar.style.width = `${progress}%`;
                    progressText.textContent = `${Math.round(progress)}%`;
                }
            }
        });

        // 更新烧烤架进度条
        const grillSystem = this.core.gameData.teaShop.grillSystem;
        if (grillSystem.isGrilling && grillSystem.startTime && grillSystem.duration) {
            const elapsed = Date.now() - grillSystem.startTime;
            const progress = Math.min(100, (elapsed / grillSystem.duration) * 100);
            const remainingTime = Math.max(0, grillSystem.duration - elapsed);
            const remainingSeconds = Math.ceil(remainingTime / 1000);

            const progressBar = document.querySelector('#grill-table .grill-progress .progress-fill');
            const progressText = document.querySelector('#grill-table .grill-progress .progress-text');

            if (progressBar && progressText) {
                progressBar.style.width = `${progress}%`;
                progressText.textContent = `${Math.round(progress)}%`;
            }
        }
    }

    /**
     * 只更新顾客耐心进度条
     */
    updateCustomerProgressOnly() {
        const customer = this.core.gameData.teaShop.customer;

        if (customer.active && customer.arrivalTime) {
            const elapsed = Date.now() - customer.arrivalTime;
            const remainingPatience = customer.maxPatience - elapsed;
            const patiencePercent = Math.max(0, (remainingPatience / customer.maxPatience) * 100);

            const progressBar = document.querySelector('#customer-table .customer-patience .progress-fill');
            const progressText = document.querySelector('#customer-table .customer-patience .progress-text');

            if (progressBar && progressText) {
                const patienceColor = patiencePercent > 50 ? '#059669' : patiencePercent > 25 ? '#d97706' : '#dc2626';
                progressBar.style.width = `${patiencePercent}%`;
                progressBar.style.backgroundColor = patienceColor;
                progressText.textContent = `${Math.round(patiencePercent)}%`;
            }

            // 更新顾客的patience值
            customer.patience = remainingPatience;
        }
    }

    /**
     * 设置天气监听器
     */
    setupWeatherListener() {
        // 等待统一天气系统初始化
        const checkWeatherSystem = () => {
            if (this.core.weatherSystem && this.core.weatherSystem.initialized) {
                // 监听天气变化事件
                this.core.weatherSystem.on('weatherChanged', (data) => {
                    this.addDebugLog(`🌤️ 天气变化: ${data.oldWeather} → ${data.newWeather}, 第${data.currentDay}天`);
                });

                // 监听显示更新事件
                this.core.weatherSystem.on('displayUpdated', (data) => {
                    this.updateWeatherDisplay(data);
                });

                // 立即更新一次显示
                this.updateWeatherDisplay();

                console.log('🌤️ 茶铺天气监听器设置完成');
            } else {
                // 如果天气系统还没初始化，1秒后重试
                setTimeout(checkWeatherSystem, 1000);
            }
        };

        checkWeatherSystem();
    }

    /**
     * 更新天气显示
     */
    updateWeatherDisplay(data = null) {
        if (!this.core.weatherSystem || !this.core.weatherSystem.initialized) {
            return;
        }

        // 更新天气显示
        const weatherElement = document.getElementById('weather-display');
        if (weatherElement) {
            const weatherIcon = this.core.weatherSystem.getWeatherIcon();
            const seasonText = this.core.weatherSystem.getSeasonWeatherText();
            weatherElement.textContent = `${weatherIcon} ${seasonText}`;
        }

        // 更新游戏时间
        const gameTimeElement = document.getElementById('game-time');
        if (gameTimeElement) {
            const currentDay = this.core.weatherSystem.getCurrentDay();
            gameTimeElement.textContent = `第${currentDay}天`;
        }
    }

    /**
     * 应用天气效果到田地 - 使用统一天气系统
     */
    applyWeatherEffectsToPlots() {
        // 使用统一天气系统
        if (!this.core.weatherSystem || !this.core.weatherSystem.initialized) {
            return;
        }

        const currentWeather = this.core.weatherSystem.getCurrentWeather();

        this.core.gameData.teaShop.plots.forEach((plot, index) => {
            if (plot.state === 'growing') {
                // 按照旧游戏规律应用天气影响
                switch (currentWeather) {
                    case '下雨':
                        // 雨天增加湿度
                        plot.moisture = Math.min(100, plot.moisture + 0.5); // 每秒增加0.5%
                        break;
                    case '刮风':
                        // 刮风降低湿度
                        plot.moisture = Math.max(0, plot.moisture - 0.3); // 每秒减少0.3%
                        break;
                    case '下雪':
                        // 下雪增加湿度和肥沃度
                        plot.moisture = Math.min(100, plot.moisture + 0.4); // 每秒增加0.4%
                        plot.fertility = Math.min(100, plot.fertility + 0.2); // 每秒增加0.2%
                        break;
                    case '晴天':
                        // 晴天轻微消耗湿度
                        plot.moisture = Math.max(0, plot.moisture - 0.1); // 每秒减少0.1%
                        break;
                    case '阴天':
                        // 阴天无特殊影响
                        break;
                }
            }
        });
    }

    /**
     * 更新工作区进度
     */
    updateWorkspaceProgress() {
        if (!this.core.initialized) return;

        let needsUpdate = false;

        // 更新炉灶
        this.core.gameData.teaShop.stoves.forEach((stove, index) => {
            if (stove.state === 'cooking' && stove.startTime && stove.duration) {
                const elapsed = Date.now() - stove.startTime;
                if (elapsed >= stove.duration) {
                    stove.state = 'ready';
                    this.addDebugLog(`🍵 炉灶 #${index + 1} 制茶完成: ${stove.recipe}`);
                    needsUpdate = true;
                }
            }
        });

        // 更新案板
        this.core.gameData.teaShop.processingBoards.forEach((board, index) => {
            if (board.state === 'processing' && board.startTime && board.duration) {
                const elapsed = Date.now() - board.startTime;
                if (elapsed >= board.duration) {
                    board.state = 'ready';
                    this.addDebugLog(`🧂 案板 #${index + 1} 加工完成: ${board.recipe}`);
                    needsUpdate = true;
                }
            }
        });

        // 更新烤肉架
        const grillSystem = this.core.gameData.teaShop.grillSystem;
        if (grillSystem.isGrilling && grillSystem.startTime && grillSystem.duration) {
            const elapsed = Date.now() - grillSystem.startTime;
            if (elapsed >= grillSystem.duration) {
                this.addDebugLog(`🔥 烤肉完成: ${grillSystem.currentRecipe}`);
                // 注意：不要在这里改变状态，让collectGrilled方法来处理
                needsUpdate = true;
            }
        }

        // 如果有状态变化，更新显示
        if (needsUpdate) {
            this.renderStoves();
            this.renderBoards();
            this.renderGrill();
        }
    }

    /**
     * 添加调试日志
     */
    addDebugLog(message) {
        const timestamp = new Date().toLocaleTimeString();
        this.debugLogs.push(`[${timestamp}] ${message}`);
        
        // 保持最新的50条日志
        if (this.debugLogs.length > 50) {
            this.debugLogs.shift();
        }
        
        this.updateDebugDisplay();
    }

    /**
     * 更新调试显示
     */
    updateDebugDisplay() {
        const debugLog = document.getElementById('debug-log');
        if (debugLog) {
            debugLog.innerHTML = this.debugLogs.map(log => `<div>${log}</div>`).join('');
            debugLog.scrollTop = debugLog.scrollHeight;
        }
    }

    /**
     * 显示种植模态框
     */
    showPlantModal(plotIndex) {
        this.addDebugLog(`显示种植模态框 - 地块 #${plotIndex + 1}`);

        const seeds = this.inventory.getAllItems().seeds || {};
        const seedConfig = this.inventory.itemConfig.teaIngredients;

        let modalContent = `
            <div class="modal" id="plant-modal" style="display: block;">
                <div class="modal-content">
                    <div class="modal-header">
                        <span>选择种子 - 地块 #${plotIndex + 1}</span>
                        <button class="modal-close" onclick="teaShopManager.closePlantModal()">×</button>
                    </div>
                    <div class="modal-body">
                        <table class="inventory-table">
                            <thead>
                                <tr><th>种子名称</th><th>库存/价格</th><th>生长时间</th><th>操作</th></tr>
                            </thead>
                            <tbody>
        `;

        // 显示所有可用种子
        Object.keys(seedConfig).forEach(seedName => {
            const config = seedConfig[seedName];
            const ownedCount = seeds[seedName] || 0;
            const growTimeText = `${Math.round(config.growTime / 1000)}秒`;

            if (ownedCount > 0) {
                modalContent += `
                    <tr>
                        <td>${seedName}</td>
                        <td style="color: #059669;">库存: ${ownedCount}个</td>
                        <td>${growTimeText}</td>
                        <td><button class="action-btn" onclick="teaShopManager.plantSeed(${plotIndex}, '${seedName}')">种植</button></td>
                    </tr>
                `;
            } else {
                modalContent += `
                    <tr>
                        <td>${seedName}</td>
                        <td style="color: #dc2626;">价格: ${config.price}金币</td>
                        <td>${growTimeText}</td>
                        <td><button class="action-btn" onclick="teaShopManager.buyAndPlant(${plotIndex}, '${seedName}')">购买种植</button></td>
                    </tr>
                `;
            }
        });

        modalContent += `
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('modal-container').innerHTML = modalContent;
    }

    /**
     * 关闭种植模态框
     */
    closePlantModal() {
        document.getElementById('modal-container').innerHTML = '';
    }

    /**
     * 种植种子
     */
    plantSeed(plotIndex, seedName) {
        const plot = this.core.gameData.teaShop.plots[plotIndex];

        if (plot.state !== 'empty') {
            this.addDebugLog('❌ 地块不是空闲状态');
            return;
        }

        if (!this.inventory.hasItem(seedName, 1, 'seeds')) {
            this.addDebugLog('❌ 种子数量不足');
            return;
        }

        // 消耗种子
        this.inventory.removeItem(seedName, 1, 'seeds');

        // 开始种植
        const config = this.inventory.getItemConfig(seedName);
        if (!config) {
            this.addDebugLog('❌ 找不到种子配置');
            return;
        }

        plot.state = 'growing';
        plot.plantType = seedName;
        plot.growthStage = 0;
        plot.stageStartTime = Date.now();
        plot.totalGrowTime = config.growTime || 30000; // 默认30秒

        this.addDebugLog(`🌱 种植 ${seedName} 在地块 #${plotIndex + 1}，生长时间: ${Math.round(plot.totalGrowTime / 1000)}秒`);

        this.closePlantModal();
        this.renderFarmGrid();
        this.updateInventoryDisplay();
    }

    /**
     * 购买并种植
     */
    buyAndPlant(plotIndex, seedName) {
        const config = this.inventory.getItemConfig(seedName);
        const gameData = this.core.gameData;

        if (gameData.player.funds < config.price) {
            this.addDebugLog('❌ 金币不足');
            return;
        }

        // 扣除金币
        gameData.player.funds -= config.price;

        // 添加种子到库存
        this.inventory.addItem(seedName, 1, 'seeds');

        // 立即种植
        this.plantSeed(plotIndex, seedName);

        this.addDebugLog(`💰 购买并种植 ${seedName} (花费${config.price}金币)`);
        this.updateStatusDisplay();
    }

    /**
     * 显示制茶配方模态框
     */
    showTeaRecipeModal(stoveIndex) {
        this.addDebugLog(`显示制茶配方 - 炉灶 #${stoveIndex + 1}`);

        const recipes = this.core.gameData.teaShop.teaRecipes;

        let modalContent = `
            <div class="modal" id="tea-recipe-modal" style="display: block;">
                <div class="modal-content">
                    <div class="modal-header">
                        <span>🍵 选择茶饮配方 - 炉灶 #${stoveIndex + 1}</span>
                        <button class="modal-close" onclick="teaShopManager.closeTeaRecipeModal()">×</button>
                    </div>
                    <div class="modal-body">
                        <table class="inventory-table">
                            <thead>
                                <tr><th>配方名称</th><th>所需原料</th><th>状态</th><th>操作</th></tr>
                            </thead>
                            <tbody>
        `;

        Object.entries(recipes).forEach(([recipeName, ingredients]) => {
            const canMake = ingredients.every(ingredient =>
                this.inventory.hasItem(ingredient, 1, 'teaIngredients')
            );

            const ingredientsText = ingredients.join(' + ');
            const statusText = canMake ? '✅ 可制作' : '❌ 原料不足';
            const statusColor = canMake ? '#059669' : '#dc2626';

            modalContent += `
                <tr>
                    <td>${recipeName}</td>
                    <td>${ingredientsText}</td>
                    <td style="color: ${statusColor};">${statusText}</td>
                    <td>
                        <button class="action-btn" ${canMake ? '' : 'disabled'}
                                onclick="teaShopManager.startTeaMaking(${stoveIndex}, '${recipeName}')">
                            🍵 制作
                        </button>
                    </td>
                </tr>
            `;
        });

        modalContent += `
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('modal-container').innerHTML = modalContent;
    }

    /**
     * 关闭制茶配方模态框
     */
    closeTeaRecipeModal() {
        document.getElementById('modal-container').innerHTML = '';
    }

    /**
     * 开始制茶
     */
    startTeaMaking(stoveIndex, recipeName) {
        const stove = this.core.gameData.teaShop.stoves[stoveIndex];
        const recipe = this.core.gameData.teaShop.teaRecipes[recipeName];

        if (stove.state !== 'idle') {
            this.addDebugLog('❌ 炉灶正在使用中');
            return;
        }

        // 检查原料
        const hasAllIngredients = recipe.every(ingredient =>
            this.inventory.hasItem(ingredient, 1, 'teaIngredients')
        );

        if (!hasAllIngredients) {
            this.addDebugLog('❌ 原料不足');
            return;
        }

        // 消耗原料
        recipe.forEach(ingredient => {
            this.inventory.removeItem(ingredient, 1, 'teaIngredients');
        });

        // 开始制茶
        stove.state = 'cooking';
        stove.recipe = recipeName;
        stove.startTime = Date.now();
        stove.duration = 8000; // 8秒制茶时间

        this.addDebugLog(`🍵 开始制作 ${recipeName}`);

        this.closeTeaRecipeModal();
        this.renderStoves();
        this.updateInventoryDisplay();
    }

    /**
     * 收取茶饮
     */
    collectTea(stoveIndex) {
        const stove = this.core.gameData.teaShop.stoves[stoveIndex];

        if (stove.state !== 'ready') {
            this.addDebugLog('❌ 茶饮尚未制作完成');
            return;
        }

        // 添加制作好的茶饮
        const madeTea = {
            name: stove.recipe,
            timestamp: Date.now(),
            temperature: 'hot',
            basePrice: 15 // 基础价格
        };

        this.core.gameData.inventory.madeTeas.push(madeTea);

        this.addDebugLog(`📦 收取茶饮: ${stove.recipe}`);

        // 调试信息
        console.log('🔍 茶铺制茶调试信息:');
        console.log('- 新增茶饮:', madeTea);
        console.log('- 当前茶饮总数:', this.core.gameData.inventory.madeTeas.length);
        console.log('- 统一核心系统状态:', this.core.initialized);
        console.log('- 完整背包数据:', this.core.gameData.inventory);

        // 重置炉灶
        stove.state = 'idle';
        stove.recipe = null;
        stove.startTime = null;
        stove.duration = null;

        this.renderStoves();
        this.updateMadeTeaDisplay();

        // 检查提供物品类型的任务
        if (this.core.riceVillageManager) {
            this.core.riceVillageManager.checkProvideItemQuests();
        }

        // 保存数据到统一系统
        this.core.saveGameData();
    }

    /**
     * 显示烧烤模态框
     */
    showGrillModal() {
        this.addDebugLog('🔥 显示烧烤选择');

        const meats = this.inventory.getAllItems().meatIngredients || {};
        const grillConfig = {
            '兔肉': { time: 30000, price: 25 },
            '鸡肉': { time: 25000, price: 22 },
            '山羊肉': { time: 35000, price: 30 },
            '野猪肉': { time: 40000, price: 35 }
        };

        let modalContent = `
            <div class="modal" id="grill-modal" style="display: block;">
                <div class="modal-content">
                    <div class="modal-header">
                        <span>🔥 选择烧烤肉类</span>
                        <button class="modal-close" onclick="closeGrillModal()">×</button>
                    </div>
                    <div class="modal-body">
                        <table class="inventory-table">
                            <thead>
                                <tr><th>肉类名称</th><th>库存</th><th>烧烤时间</th><th>售价</th><th>操作</th></tr>
                            </thead>
                            <tbody>
        `;

        Object.entries(grillConfig).forEach(([meatName, config]) => {
            const ownedCount = meats[meatName] || 0;
            const timeText = `${Math.round(config.time / 1000)}秒`;
            const canGrill = ownedCount > 0;

            modalContent += `
                <tr>
                    <td>${meatName}</td>
                    <td>${ownedCount}个</td>
                    <td>${timeText}</td>
                    <td>${config.price}金币</td>
                    <td>
                        <button class="action-btn" ${canGrill ? '' : 'disabled'}
                                onclick="startGrilling('${meatName}')">
                            🔥 烧烤
                        </button>
                    </td>
                </tr>
            `;
        });

        modalContent += `
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('modal-container').innerHTML = modalContent;
    }

    /**
     * 关闭烧烤模态框
     */
    closeGrillModal() {
        document.getElementById('modal-container').innerHTML = '';
    }

    /**
     * 开始烧烤
     */
    startGrilling(meatName) {
        if (!this.core.gameData.teaShop.grillSystem.unlocked) {
            this.addDebugLog('❌ 烤肉架尚未解锁');
            return;
        }

        if (this.core.gameData.teaShop.grillSystem.isGrilling) {
            this.addDebugLog('❌ 烤肉架正在使用中');
            return;
        }

        if (!this.inventory.hasItem(meatName, 1, 'meatIngredients')) {
            this.addDebugLog('❌ 肉类数量不足');
            return;
        }

        // 获取烤制配置
        const grillConfig = {
            '兔肉': { time: 30000, price: 25 },
            '鸡肉': { time: 25000, price: 22 },
            '山羊肉': { time: 35000, price: 30 },
            '野猪肉': { time: 40000, price: 35 }
        };

        const config = grillConfig[meatName];
        if (!config) {
            this.addDebugLog('❌ 未知的肉类');
            return;
        }

        // 消耗肉类
        this.inventory.removeItem(meatName, 1, 'meatIngredients');

        // 开始烤制
        const grillSystem = this.core.gameData.teaShop.grillSystem;
        grillSystem.isGrilling = true;
        grillSystem.currentRecipe = `烤${meatName.replace('肉', '')}肉`;
        grillSystem.startTime = Date.now();
        grillSystem.duration = config.time;
        grillSystem.basePrice = config.price;

        this.addDebugLog(`🔥 开始烤制 ${meatName}，预计 ${Math.round(config.time / 1000)} 秒完成`);

        this.closeGrillModal();
        this.renderGrill();
        this.updateInventoryDisplay();
    }

    /**
     * 收取烤制食品
     */
    collectGrilled() {
        const grillSystem = this.core.gameData.teaShop.grillSystem;

        if (!grillSystem.isGrilling) {
            this.addDebugLog('❌ 没有正在烤制的食物');
            return;
        }

        // 检查是否完成
        if (grillSystem.startTime && grillSystem.duration) {
            const elapsed = Date.now() - grillSystem.startTime;
            if (elapsed < grillSystem.duration) {
                this.addDebugLog('❌ 烤制尚未完成');
                return;
            }
        }

        // 添加烤好的食物到茶饮列表（作为特殊食品）
        const grilledFood = {
            name: grillSystem.currentRecipe,
            timestamp: Date.now(),
            temperature: 'hot',
            basePrice: grillSystem.basePrice,
            isGrilled: true
        };

        this.core.gameData.inventory.madeTeas.push(grilledFood);

        this.addDebugLog(`📦 收取烤制食品: ${grillSystem.currentRecipe}`);

        // 重置烤肉架
        grillSystem.isGrilling = false;
        grillSystem.currentRecipe = null;
        grillSystem.startTime = null;
        grillSystem.duration = null;
        grillSystem.basePrice = null;

        this.renderGrill();
        this.updateMadeTeaDisplay();
    }

    /**
     * 喂食猫咪
     */
    feedCat(catName) {
        const cats = this.core.gameData.teaShop.cats;

        if (cats.currentCat !== catName) {
            this.addDebugLog('❌ 该猫咪不在场');
            return;
        }

        // 检查是否有小鱼干，没有则自动购买
        if (!this.inventory.hasItem('小鱼干', 1, 'specialItems')) {
            // 自动购买小鱼干
            const player = this.core.gameData.player;
            const fishPrice = 5; // 小鱼干价格5金币

            if (player.funds >= fishPrice) {
                player.funds -= fishPrice;
                this.inventory.addItem('小鱼干', 1, 'specialItems');
                this.addDebugLog(`💰 自动购买小鱼干，花费 ${fishPrice} 金币`);
                // 显示购买动画（上方）
                this.showFloatingMessage(`-${fishPrice} 金币`, 'cost', -40);
            } else {
                this.addDebugLog('❌ 金币不足，无法购买小鱼干');
                // 尝试使用茶饮喂食
                const madeTeas = this.core.gameData.inventory.madeTeas;
                if (madeTeas.length > 0) {
                    const tea = madeTeas.shift();
                    const intimacyGain = Math.floor(Math.random() * 21) + 10; // 10-30点亲密度
                    cats.intimacy[catName] = Math.min(5000, cats.intimacy[catName] + intimacyGain);
                    cats.feedCount[catName] = (cats.feedCount[catName] || 0) + 1;
                    this.addDebugLog(`🍵 用 ${tea.name} 喂食 ${catName}，亲密度 +${intimacyGain}`);

                    // 检查是否达到3000亲密度需要命名
                    this.checkAllCatsForNaming();

                    // 5000亲密度时不再解锁稻香村，只是满级状态

                    this.updateMadeTeaDisplay();
                } else {
                    this.addDebugLog('❌ 没有小鱼干或茶饮可以喂食');
                    return;
                }
            }
        }

        // 如果有小鱼干，使用小鱼干喂食
        if (this.inventory.hasItem('小鱼干', 1, 'specialItems')) {
            this.inventory.removeItem('小鱼干', 1, 'specialItems');

            const intimacyGain = Math.floor(Math.random() * 50) + 50; // 50-99点亲密度
            cats.intimacy[catName] = Math.min(5000, cats.intimacy[catName] + intimacyGain);
            cats.feedCount[catName] = (cats.feedCount[catName] || 0) + 1;

            this.addDebugLog(`🐟 用小鱼干喂食 ${catName}，亲密度 +${intimacyGain}`);

            // 显示亲密度增加动画（下方）
            this.showFloatingMessage(`亲密度 +${intimacyGain}`, 'success', 40);

            // 检查礼物里程碑
            this.checkCatGifts(catName);

            // 检查所有猫咪是否需要命名
            this.checkAllCatsForNaming();

            // 5000亲密度时不再解锁稻香村，只是满级状态
        }

        // 检查是否达到3000亲密度且需要命名
        this.checkAllCatsForNaming();

        this.renderCatsTable();
        this.updateRiceVillageButton();
        this.updateInventoryDisplay();
    }

    /**
     * 专门用茶饮喂食猫咪
     */
    feedCatWithTea(catName) {
        const cats = this.core.gameData.teaShop.cats;

        if (cats.currentCat !== catName) {
            this.addDebugLog('❌ 该猫咪不在场');
            return;
        }

        // 检查是否有茶饮
        const madeTeas = this.core.gameData.inventory.madeTeas;
        if (madeTeas.length === 0) {
            this.showFloatingMessage('没有茶饮可以喂食', 'error');
            return;
        }

        // 使用茶饮喂食
        const tea = madeTeas.shift();
        const intimacyGain = Math.floor(Math.random() * 21) + 10; // 10-30点亲密度
        cats.intimacy[catName] = Math.min(5000, cats.intimacy[catName] + intimacyGain);
        cats.feedCount[catName] = (cats.feedCount[catName] || 0) + 1;

        this.addDebugLog(`🍵 用 ${tea.name} 喂食 ${catName}，亲密度 +${intimacyGain}`);

        // 显示亲密度增加动画
        this.showFloatingMessage(`亲密度 +${intimacyGain}`, 'success');

        // 检查礼物里程碑
        this.checkCatGifts(catName);

        // 检查所有猫咪是否需要命名
        this.checkAllCatsForNaming();

        this.updateMadeTeaDisplay();
        this.renderCatsTable();
        this.updateRiceVillageButton();
        this.updateInventoryDisplay();
    }

    /**
     * 显示浮动动画消息
     */
    showFloatingMessage(message, type = 'success', offset = 0) {
        // 创建消息元素
        const messageElement = document.createElement('div');
        messageElement.className = `floating-message ${type}`;
        messageElement.textContent = message;

        // 根据偏移调整位置
        if (offset !== 0) {
            messageElement.style.top = `calc(50% + ${offset}px)`;
        }

        // 添加到页面
        document.body.appendChild(messageElement);

        // 2秒后自动移除
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 2000);
    }

    /**
     * 检查猫咪亲密度达到3000时的命名需求
     */
    checkAllCatsForNaming() {
        const cats = this.core.gameData.teaShop.cats;

        for (let originalName in cats.intimacy) {
            const intimacy = cats.intimacy[originalName] || 0;
            const hasTriggered = cats.hasTriggeredNaming[originalName];

            // 达到3000且未弹过命名窗口
            if (intimacy >= 3000 && !hasTriggered) {
                console.log(`🎉 ${originalName} 达到3000亲密度，触发命名！`);
                this.addDebugLog(`🎉 ${originalName} 的亲密度达到3000！可以给它起个名字了！`);

                // 解锁稻香村
                if (!this.core.gameData.riceVillage.unlocked) {
                    this.addDebugLog(`🎉 稻香村已解锁！`);
                    this.core.gameData.riceVillage.unlocked = true;
                    this.updateRiceVillageButton();
                }

                // 触发命名窗口
                if (typeof window.showCatNamingModal === 'function') {
                    window.showCatNamingModal(originalName); // 传递猫咪名字
                    cats.hasTriggeredNaming[originalName] = true;
                    this.core.saveGameData();
                } else {
                    console.log('🐱 命名窗口函数未找到');
                }

                break; // 一次只弹一个命名窗口
            }
        }
    }

    /**
     * 检查猫咪礼物里程碑
     */
    checkCatGifts(originalName) {
        const cats = this.core.gameData.teaShop.cats;
        const intimacy = cats.intimacy[originalName] || 0;

        // 初始化礼物状态
        if (!cats.giftStatus[originalName]) {
            cats.giftStatus[originalName] = {};
        }

        const giftStatus = cats.giftStatus[originalName];
        const milestones = [500, 1000, 1500, 3000, 4000, 5000];

        for (let milestone of milestones) {
            if (intimacy >= milestone && !giftStatus[milestone]) {
                this.giveCatGift(originalName, milestone);
                giftStatus[milestone] = true;
                this.core.saveGameData();
                break; // 一次只给一个礼物
            }
        }
    }

    /**
     * 发放猫咪礼物
     */
    giveCatGift(originalName, milestone) {
        const displayName = this.getDisplayName(originalName);
        let giftMessage = '';
        let giftItems = [];

        switch (milestone) {
            case 500:
                // 给1个原料
                const ingredient = this.getRandomIngredient();
                this.inventory.addItem(ingredient, 1, 'teaIngredients');
                giftMessage = `${displayName} 送给你 1个 ${ingredient}！`;
                giftItems = [`${ingredient} x1`];
                break;

            case 1000:
                // 给5个小鱼干
                this.inventory.addItem('小鱼干', 5, 'specialItems');
                giftMessage = `${displayName} 送给你 5个小鱼干！`;
                giftItems = ['小鱼干 x5'];
                break;

            case 1500:
                // 给5个原料
                const ingredients = [];
                for (let i = 0; i < 5; i++) {
                    const ingredient = this.getRandomIngredient();
                    this.inventory.addItem(ingredient, 1, 'teaIngredients');
                    ingredients.push(ingredient);
                }
                giftMessage = `${displayName} 送给你 5个原料！`;
                giftItems = ingredients.map(item => `${item} x1`);
                break;

            case 3000:
                // 神秘地图稻香村开启 + 命名（在命名函数中处理）
                giftMessage = `${displayName} 送给你神秘地图！稻香村已开启！`;
                giftItems = ['神秘地图：稻香村'];

                // 解锁稻香村
                if (!this.core.gameData.riceVillage.unlocked) {
                    this.core.gameData.riceVillage.unlocked = true;
                    this.updateRiceVillageButton();
                }
                break;

            case 4000:
                // 给1个烧烤架
                this.inventory.addItem('烧烤架', 1, 'equipment');
                giftMessage = `${displayName} 送给你 1个烧烤架！`;
                giftItems = ['烧烤架 x1'];
                break;

            case 5000:
                // 给10个原料 + 5个小料
                for (let i = 0; i < 10; i++) {
                    const ingredient = this.getRandomIngredient();
                    this.inventory.addItem(ingredient, 1, 'teaIngredients');
                }
                for (let i = 0; i < 5; i++) {
                    const topping = this.getRandomTopping();
                    this.inventory.addItem(topping, 1, 'toppings');
                }
                giftMessage = `${displayName} 送给你丰厚的礼物！10个原料 + 5个小料！`;
                giftItems = ['原料 x10', '小料 x5'];
                break;
        }

        // 显示礼物弹窗
        this.showGiftModal(displayName, milestone, giftMessage, giftItems);
        this.addDebugLog(`🎁 ${giftMessage}`);

        // 更新显示
        this.updateInventoryDisplay();
    }

    /**
     * 显示礼物弹窗
     */
    showGiftModal(catName, milestone, message, items) {
        const modalContent = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2000; display: flex; justify-content: center; align-items: center;">
                <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.3); max-width: 400px; text-align: center;">
                    <h3 style="margin-top: 0; color: #333;">🎁 ${catName} 的礼物</h3>
                    <p style="margin: 20px 0; line-height: 1.6; color: #666;">
                        亲密度达到 <strong>${milestone}</strong>！<br>
                        ${message}
                    </p>
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <strong>获得物品：</strong><br>
                        ${items.map(item => `• ${item}`).join('<br>')}
                    </div>
                    <button onclick="closeGiftModal()"
                            style="background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                        收下礼物
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalContent);
    }

    /**
     * 获取随机原料
     */
    getRandomIngredient() {
        const ingredients = ['茶叶', '乌梅', '山楂', '薄荷叶', '柠檬', '生姜'];
        return ingredients[Math.floor(Math.random() * ingredients.length)];
    }

    /**
     * 获取随机小料
     */
    getRandomTopping() {
        const toppings = ['红糖', '蜂蜜', '柠檬片', '姜丝', '干桂花'];
        return toppings[Math.floor(Math.random() * toppings.length)];
    }

    /**
     * 启动猫咪访问系统
     */
    startCatVisitSystem() {
        // 每30秒检查是否有猫咪来访
        setInterval(() => {
            this.checkCatVisit();
        }, 30000);

        // 每秒检查猫咪是否该离开
        setInterval(() => {
            this.updateCatVisit();
        }, 1000);

        this.addDebugLog('🐱 猫咪访问系统已启动');
        console.log('🐱 猫咪访问系统已启动 - 每30秒检查一次访问，每1秒检查离开');
    }

    /**
     * 检查是否有猫咪来访
     */
    checkCatVisit() {
        const cats = this.core.gameData.teaShop.cats;

        console.log('🔍 检查猫咪访问:', {
            currentCat: cats.currentCat,
            visitStartTime: cats.visitStartTime,
            hasActiveCat: cats.currentCat && cats.currentCat !== '等待猫咪到来'
        });

        // 如果已经有猫咪在场，不生成新的
        if (cats.currentCat && cats.currentCat !== '等待猫咪到来') {
            console.log('🐱 已有猫咪在场，跳过生成');
            return;
        }

        // 80%概率有猫咪来访
        const randomChance = Math.random();
        console.log('🎲 随机数:', randomChance, '是否来访:', randomChance < 0.8);

        if (randomChance < 0.8) {
            // 从实际存在的猫咪中随机选择
            const availableCats = Object.keys(cats.intimacy || {});
            if (availableCats.length === 0) {
                console.log('🐱 没有可访问的猫咪数据');
                return;
            }

            const randomCat = availableCats[Math.floor(Math.random() * availableCats.length)];

            // 设置访问猫咪
            cats.currentCat = randomCat;
            cats.visitStartTime = Date.now();
            cats.visitDuration = 10000; // 停留10秒

            console.log('🐱 猫咪来访:', randomCat, '(从', availableCats, '中选择)');
            this.addDebugLog(`🐱 ${randomCat} 来访了！停留10秒`);
            this.renderCatsTable();
        } else {
            console.log('🐱 这次没有猫咪来访');
        }
    }

    /**
     * 更新猫咪访问状态
     */
    updateCatVisit() {
        const cats = this.core.gameData.teaShop.cats;

        // 检查是否有猫咪在访问
        if (cats.currentCat && cats.currentCat !== '等待猫咪到来' && cats.visitStartTime) {
            const elapsed = Date.now() - cats.visitStartTime;

            // 如果超过停留时间，猫咪离开
            if (elapsed >= cats.visitDuration) {
                this.addDebugLog(`🐱 ${cats.currentCat} 离开了`);
                cats.currentCat = '等待猫咪到来';
                cats.visitStartTime = null;
                cats.visitDuration = null;
                this.renderCatsTable();
            }
        }
    }

    /**
     * 显示稻香村解锁弹窗
     */
    showRiceVillageUnlockModal(catName) {
        let modalContent = `
            <div class="modal" id="rice-village-unlock-modal" style="display: block;">
                <div class="modal-content">
                    <div class="modal-header">
                        <span>🎉 稻香村解锁！</span>
                    </div>
                    <div class="modal-body">
                        <div style="text-align: center; padding: 20px;">
                            <h3>恭喜！${catName} 的亲密度达到了满级！</h3>
                            <p>稻香村的神秘大门为你敞开了...</p>
                            <p>在那里，你将遇到新的冒险和挑战！</p>
                            <br>
                            <p>现在，请为你的猫咪伙伴起一个名字：</p>
                            <input type="text" id="cat-companion-name" placeholder="输入猫咪伙伴的名字"
                                   style="padding: 5px; margin: 10px; width: 200px;" maxlength="10">
                            <br><br>
                            <p>选择猫咪类型：</p>
                            <div style="margin: 10px;">
                                <label><input type="radio" name="cat-type" value="tank" checked> 坦克型 (+20血量, +1攻击/级)</label><br>
                                <label><input type="radio" name="cat-type" value="damage"> 输出型 (+3血量, +5攻击/级)</label>
                            </div>
                            <br>
                            <button class="action-btn" onclick="confirmCatCompanion()">确认并前往稻香村</button>
                            <button class="action-btn" onclick="confirmCatCompanion(false)">稍后再去</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('modal-container').innerHTML = modalContent;
    }

    /**
     * 更新背包显示
     */
    updateInventoryDisplay() {
        if (!this.core.initialized) return;

        const inventory = this.inventory.getAllItems();

        // 更新种子显示
        this.updateInventorySection('seeds', inventory.seeds || {});

        // 更新原料显示
        this.updateInventorySection('ingredients', inventory.teaIngredients || {});

        // 更新小料显示
        this.updateInventorySection('toppings', inventory.toppings || {});

        // 更新肉类显示
        this.updateInventorySection('meats', inventory.meatIngredients || {});
    }

    /**
     * 更新背包区域显示
     */
    updateInventorySection(sectionType, items) {
        const tableBody = document.getElementById(`${sectionType}-inventory`);
        if (!tableBody) return;

        tableBody.innerHTML = '';

        if (Object.keys(items).length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="4">暂无物品</td>';
            tableBody.appendChild(row);
            return;
        }

        Object.entries(items).forEach(([itemName, count]) => {
            const config = this.inventory.getItemConfig(itemName);
            const row = document.createElement('tr');

            switch (sectionType) {
                case 'seeds':
                    row.innerHTML = `
                        <td>${itemName}</td>
                        <td>${count}个</td>
                        <td>${config ? config.price + '金币' : '未知'}</td>
                        <td><button class="action-btn" onclick="teaShopManager.useItem('${itemName}', 'seeds')">使用</button></td>
                    `;
                    break;
                case 'ingredients':
                    row.innerHTML = `
                        <td>${itemName}</td>
                        <td>${count}个</td>
                        <td>制茶原料</td>
                        <td><button class="action-btn" onclick="teaShopManager.useItem('${itemName}', 'teaIngredients')">使用</button></td>
                    `;
                    break;
                case 'toppings':
                    row.innerHTML = `
                        <td>${itemName}</td>
                        <td>${count}个</td>
                        <td>${config && config.source ? '来自' + config.source : '购买获得'}</td>
                        <td><button class="action-btn" onclick="teaShopManager.useItem('${itemName}', 'toppings')">使用</button></td>
                    `;
                    break;
                case 'meats':
                    row.innerHTML = `
                        <td>${itemName}</td>
                        <td>${count}个</td>
                        <td>${config ? config.grillPrice + '金币' : '未知'}</td>
                        <td><button class="action-btn" onclick="teaShopManager.grillMeat('${itemName}')">烤制</button></td>
                    `;
                    break;
            }

            tableBody.appendChild(row);
        });
    }

    /**
     * 使用物品
     */
    useItem(itemName, category) {
        this.addDebugLog(`使用物品: ${itemName} (${category})`);
        // 这里可以根据物品类型实现不同的使用逻辑
    }

    /**
     * 烤制肉类
     */
    grillMeat(meatName) {
        this.addDebugLog(`🔥 烤制 ${meatName}`);

        if (!this.core.gameData.teaShop.grillSystem.unlocked) {
            this.addDebugLog('❌ 烤肉架尚未解锁');
            return;
        }

        if (this.core.gameData.teaShop.grillSystem.isGrilling) {
            this.addDebugLog('❌ 烤肉架正在使用中');
            return;
        }

        if (!this.inventory.hasItem(meatName, 1, 'meatIngredients')) {
            this.addDebugLog('❌ 肉类数量不足');
            return;
        }

        // 获取烤制配置
        const grillConfig = {
            '兔肉': { time: 30000, price: 25 },
            '鸡肉': { time: 25000, price: 22 },
            '山羊肉': { time: 35000, price: 30 },
            '野猪肉': { time: 40000, price: 35 }
        };

        const config = grillConfig[meatName];
        if (!config) {
            this.addDebugLog('❌ 未知的肉类');
            return;
        }

        // 消耗肉类
        this.inventory.removeItem(meatName, 1, 'meatIngredients');

        // 开始烤制
        const grillSystem = this.core.gameData.teaShop.grillSystem;
        grillSystem.isGrilling = true;
        grillSystem.currentRecipe = `烤${meatName.replace('肉', '')}肉`;
        grillSystem.startTime = Date.now();
        grillSystem.duration = config.time;
        grillSystem.basePrice = config.price;

        this.addDebugLog(`🔥 开始烤制 ${meatName}，预计 ${Math.round(config.time / 1000)} 秒完成`);

        this.renderGrill();
        this.updateInventoryDisplay();
    }

    /**
     * 收获地块
     */
    harvestPlot(plotIndex) {
        const plot = this.core.gameData.teaShop.plots[plotIndex];

        if (plot.state !== 'ready') {
            this.addDebugLog('❌ 作物尚未成熟');
            return;
        }

        // 收获作物
        const harvestCount = Math.floor(Math.random() * 3) + 2; // 2-4个
        this.inventory.addItem(plot.plantType, harvestCount, 'teaIngredients');

        this.addDebugLog(`🌾 收获 ${plot.plantType} x${harvestCount}`);

        // 重置地块
        plot.state = 'empty';
        plot.plantType = null;
        plot.growthStage = 0;
        plot.stageStartTime = 0;

        this.renderFarmGrid();
        this.updateInventoryDisplay();
    }

    /**
     * 浇水
     */
    waterPlot(plotIndex) {
        const plot = this.core.gameData.teaShop.plots[plotIndex];

        if (plot.moisture >= 100) {
            this.addDebugLog('💧 湿度已满');
            return;
        }

        plot.moisture = Math.min(100, plot.moisture + 30);
        this.addDebugLog(`💧 浇水 - 地块 #${plotIndex + 1} 湿度: ${plot.moisture}%`);

        // 立即更新湿度显示
        this.updatePlotConditionsOnly();
    }

    /**
     * 施肥
     */
    fertilizePlot(plotIndex) {
        const plot = this.core.gameData.teaShop.plots[plotIndex];

        if (plot.fertility >= 100) {
            this.addDebugLog('🌿 肥沃度已满');
            return;
        }

        plot.fertility = Math.min(100, plot.fertility + 25);
        this.addDebugLog(`🌿 施肥 - 地块 #${plotIndex + 1} 肥沃度: ${plot.fertility}%`);

        // 立即更新肥沃度显示
        this.updatePlotConditionsOnly();
    }
}

// 全局实例将在index.html中创建

// 调试面板控制
function toggleDebugPanel() {
    const panel = document.getElementById('debug-panel');
    const content = document.getElementById('debug-content');
    
    if (panel.classList.contains('expanded')) {
        panel.classList.remove('expanded');
        content.style.display = 'none';
        panel.innerHTML = '🛠';
    } else {
        panel.classList.add('expanded');
        content.style.display = 'block';
        panel.innerHTML = '';
        panel.appendChild(content);
    }
}

function clearDebugLog() {
    teaShopManager.debugLogs = [];
    teaShopManager.updateDebugDisplay();
}

// 快速测试函数
function quickTestGrill() {
    teaShopManager.addDebugLog('🔥 快速测试：解锁烤肉系统');
    teaShopManager.core.gameData.teaShop.grillSystem.unlocked = true;
    teaShopManager.inventory.addItem('兔肉', 5, 'meatIngredients');
    teaShopManager.renderWorkspaces();
    teaShopManager.updateInventoryDisplay();
}

function quickTestCat() {
    teaShopManager.addDebugLog('🐱 快速测试：猫咪来访');
    const cats = teaShopManager.core.gameData.teaShop.cats;
    cats.currentCat = '大橘猫';
    cats.intimacy['大橘猫'] = 4500; // 接近满级
    teaShopManager.inventory.addItem('小鱼干', 10, 'specialItems');
    teaShopManager.renderCatsTable();
    teaShopManager.updateInventoryDisplay();
}

function quickTestCustomer() {
    teaShopManager.addDebugLog('👥 快速测试：顾客到来');
    // 这里会在后续实现顾客系统时添加
}

function addTestItems() {
    teaShopManager.addDebugLog('📦 添加测试物品');
    const items = [
        ['五味子', 10, 'teaIngredients'],
        ['柠檬', 10, 'teaIngredients'],
        ['红糖', 20, 'toppings'],
        ['小鱼干', 15, 'specialItems'],
        // 添加种子用于测试种植
        ['五味子', 5, 'seeds'],
        ['柠檬', 5, 'seeds'],
        ['乌梅', 3, 'seeds'],
        ['山楂', 3, 'seeds']
    ];

    items.forEach(([name, count, category]) => {
        teaShopManager.inventory.addItem(name, count, category);
    });

    teaShopManager.updateInventoryDisplay();
}

function quickTestPlanting() {
    teaShopManager.addDebugLog('🌱 快速测试：种植系统');

    // 添加种子
    teaShopManager.inventory.addItem('五味子', 10, 'seeds');
    teaShopManager.inventory.addItem('柠檬', 10, 'seeds');

    // 自动在第一块地种植五味子（如果空闲）
    const plot1 = teaShopManager.core.gameData.teaShop.plots[0];
    if (plot1.state === 'empty') {
        teaShopManager.plantSeed(0, '五味子');
    }

    // 自动在第二块地种植柠檬（如果空闲）
    const plot2 = teaShopManager.core.gameData.teaShop.plots[1];
    if (plot2.state === 'empty') {
        teaShopManager.plantSeed(1, '柠檬');
    }

    teaShopManager.updateInventoryDisplay();
    teaShopManager.addDebugLog('🌱 已自动种植测试作物，请观察进度条');
}

function unlockRiceVillage() {
    teaShopManager.addDebugLog('🗝️ 强制解锁稻香村');
    teaShopManager.core.gameData.teaShop.cats.intimacy['大橘猫'] = 5000;
    teaShopManager.updateRiceVillageButton();
    teaShopManager.renderCatsTable();
}

function goToRiceVillage() {
    if (teaShopManager.core.gameData.riceVillage.unlocked) {
        teaShopManager.addDebugLog('🏮 前往稻香村');
        window.location.href = 'rice-village.html';
    }
}

// 顶部导航按钮功能
function showInventory() {
    teaShopManager.addDebugLog('🎒 显示完整背包');

    const inventory = teaShopManager.inventory.getAllItems();

    let modalContent = `
        <div class="modal" id="inventory-modal" style="display: block;">
            <div class="modal-content">
                <div class="modal-header">
                    <span>🎒 完整背包</span>
                    <button class="modal-close" onclick="closeInventoryModal()">×</button>
                </div>
                <div class="modal-body">
                    <div class="top-menu-bar">
                        <button class="menu-btn" onclick="showInventoryCategory('all')">📦 全部</button>
                        <button class="menu-btn" onclick="showInventoryCategory('seeds')">🌱 种子</button>
                        <button class="menu-btn" onclick="showInventoryCategory('ingredients')">🍃 原料</button>
                        <button class="menu-btn" onclick="showInventoryCategory('toppings')">🧂 小料</button>
                        <button class="menu-btn" onclick="showInventoryCategory('teas')">🍵 茶饮</button>
                        <button class="menu-btn" onclick="showInventoryCategory('meats')">🥩 肉类</button>
                    </div>
                    <div id="inventory-content">
                        ${generateInventoryContent('all', inventory)}
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('modal-container').innerHTML = modalContent;
}

function closeInventoryModal() {
    document.getElementById('modal-container').innerHTML = '';
}

function showInventoryCategory(category) {
    const inventory = teaShopManager.inventory.getAllItems();
    const content = generateInventoryContent(category, inventory);
    document.getElementById('inventory-content').innerHTML = content;
}

function generateInventoryContent(category, inventory) {
    let content = '<table class="inventory-table"><thead><tr><th>物品名称</th><th>数量</th><th>分类</th><th>操作</th></tr></thead><tbody>';

    const allItems = [];

    // 收集所有物品
    if (category === 'all' || category === 'seeds') {
        Object.entries(inventory.seeds || {}).forEach(([name, count]) => {
            allItems.push({ name, count, category: '种子', type: 'seeds' });
        });
    }

    if (category === 'all' || category === 'ingredients') {
        Object.entries(inventory.teaIngredients || {}).forEach(([name, count]) => {
            allItems.push({ name, count, category: '茶饮原料', type: 'teaIngredients' });
        });
    }

    if (category === 'all' || category === 'toppings') {
        Object.entries(inventory.toppings || {}).forEach(([name, count]) => {
            allItems.push({ name, count, category: '小料', type: 'toppings' });
        });
    }

    if (category === 'all' || category === 'teas') {
        (inventory.madeTeas || []).forEach((tea, index) => {
            allItems.push({ name: tea.name, count: 1, category: '制作茶饮', type: 'madeTeas', index });
        });
    }

    if (category === 'all' || category === 'meats') {
        Object.entries(inventory.meatIngredients || {}).forEach(([name, count]) => {
            allItems.push({ name, count, category: '肉类', type: 'meatIngredients' });
        });
    }

    // 特殊物品
    if (category === 'all') {
        Object.entries(inventory.specialItems || {}).forEach(([name, count]) => {
            allItems.push({ name, count, category: '特殊物品', type: 'specialItems' });
        });
        Object.entries(inventory.questItems || {}).forEach(([name, count]) => {
            allItems.push({ name, count, category: '任务物品', type: 'questItems' });
        });
    }

    if (allItems.length === 0) {
        content += '<tr><td colspan="4">该分类暂无物品</td></tr>';
    } else {
        allItems.forEach(item => {
            content += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.count}${item.type === 'madeTeas' ? '杯' : '个'}</td>
                    <td>${item.category}</td>
                    <td>
                        <button class="action-btn" onclick="useInventoryItem('${item.name}', '${item.type}')">使用</button>
                        ${item.type === 'madeTeas' ?
                            `<button class="action-btn" onclick="sellInventoryItem('${item.name}', '${item.type}')">出售</button>` :
                            ''
                        }
                    </td>
                </tr>
            `;
        });
    }

    content += '</tbody></table>';
    return content;
}

function useInventoryItem(itemName, itemType) {
    teaShopManager.addDebugLog(`使用物品: ${itemName} (${itemType})`);
    closeInventoryModal();
}

function sellInventoryItem(itemName, itemType) {
    if (itemType === 'madeTeas') {
        teaShopManager.sellTea(itemName);
        showInventoryCategory('teas'); // 刷新茶饮分类
    }
}

function showSettings() {
    teaShopManager.addDebugLog('⚙️ 显示设置');

    const settings = teaShopManager.core.gameData.settings;
    const stats = teaShopManager.core.getGameStats();

    let modalContent = `
        <div class="modal" id="settings-modal" style="display: block;">
            <div class="modal-content">
                <div class="modal-header">
                    <span>⚙️ 游戏设置</span>
                    <button class="modal-close" onclick="closeSettingsModal()">×</button>
                </div>
                <div class="modal-body">
                    <h4 style="margin-bottom: 10px;">游戏设置</h4>
                    <table class="inventory-table">
                        <tr>
                            <td>自动保存</td>
                            <td>
                                <button class="action-btn" onclick="toggleAutoSave()">
                                    ${settings.autoSave ? '✅ 已开启' : '❌ 已关闭'}
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td>保存间隔</td>
                            <td>${settings.autoSaveInterval / 1000}秒</td>
                        </tr>
                        <tr>
                            <td>调试模式</td>
                            <td>
                                <button class="action-btn" onclick="toggleDebugMode()">
                                    ${settings.debugMode ? '✅ 已开启' : '❌ 已关闭'}
                                </button>
                            </td>
                        </tr>
                    </table>

                    <h4 style="margin: 20px 0 10px 0;">游戏统计</h4>
                    <table class="inventory-table">
                        <tr><td>游戏版本</td><td>v2.0.0</td></tr>
                        <tr><td>玩家等级</td><td>${stats.playerLevel}级</td></tr>
                        <tr><td>当前金币</td><td>${stats.funds}🪙</td></tr>
                        <tr><td>服务顾客</td><td>${stats.servedCustomers}位</td></tr>
                        <tr><td>解锁配方</td><td>${stats.unlockedRecipes}个</td></tr>
                        <tr><td>完成任务</td><td>${stats.completedQuests}个</td></tr>
                        <tr><td>稻香村</td><td>${stats.riceVillageUnlocked ? '已解锁' : '未解锁'}</td></tr>
                    </table>

                    <h4 style="margin: 20px 0 10px 0;">数据管理</h4>
                    <div class="top-menu-bar">
                        <button class="menu-btn" onclick="manualSave()">💾 手动保存</button>
                        <button class="menu-btn" onclick="exportData()">📤 导出数据</button>
                        <button class="menu-btn" onclick="resetGameData()">🔄 重置游戏</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('modal-container').innerHTML = modalContent;
}

function closeSettingsModal() {
    document.getElementById('modal-container').innerHTML = '';
}

function toggleAutoSave() {
    const settings = teaShopManager.core.gameData.settings;
    settings.autoSave = !settings.autoSave;
    teaShopManager.core.startAutoSave();
    teaShopManager.addDebugLog(`自动保存已${settings.autoSave ? '开启' : '关闭'}`);
    showSettings(); // 刷新设置界面
}

function toggleDebugMode() {
    const settings = teaShopManager.core.gameData.settings;
    settings.debugMode = !settings.debugMode;
    teaShopManager.addDebugLog(`调试模式已${settings.debugMode ? '开启' : '关闭'}`);
    showSettings(); // 刷新设置界面
}

function manualSave() {
    teaShopManager.core.saveGameData();
    teaShopManager.addDebugLog('💾 手动保存完成');
}

function exportData() {
    const data = JSON.stringify(teaShopManager.core.getGameData(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tea_shop_data_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    teaShopManager.addDebugLog('📤 数据导出完成');
}

function resetGameData() {
    if (confirm('确定要重置所有游戏数据吗？此操作不可撤销！')) {
        teaShopManager.core.resetGameData();
        teaShopManager.addDebugLog('🔄 游戏数据已重置');
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
}

function showHelp() {
    teaShopManager.addDebugLog('❓ 显示帮助');

    let modalContent = `
        <div class="modal" id="help-modal" style="display: block;">
            <div class="modal-content">
                <div class="modal-header">
                    <span>❓ 游戏帮助</span>
                    <button class="modal-close" onclick="closeHelpModal()">×</button>
                </div>
                <div class="modal-body">
                    <h4>🍵 茶铺经营指南</h4>
                    <ul style="margin: 10px 0; padding-left: 20px; line-height: 1.6;">
                        <li><strong>种植系统</strong>：在2块地上种植26种茶饮原料，注意浇水施肥</li>
                        <li><strong>制茶系统</strong>：使用2个炉灶制作各种茶饮，8秒制作时间</li>
                        <li><strong>加工系统</strong>：使用2个案板加工小料，10-18秒加工时间</li>
                        <li><strong>顾客系统</strong>：服务随机顾客，VIP顾客给更多金币</li>
                        <li><strong>猫咪系统</strong>：喂食5只猫咪提升亲密度，满级解锁稻香村</li>
                        <li><strong>烤肉系统</strong>：解锁后可烤制各种肉类，25-40秒烤制时间</li>
                    </ul>

                    <h4>🏮 稻香村冒险指南</h4>
                    <ul style="margin: 10px 0; padding-left: 20px; line-height: 1.6;">
                        <li><strong>解锁条件</strong>：任意猫咪亲密度达到5000（满级）</li>
                        <li><strong>RPG战斗</strong>：与4种怪物战斗，获得经验和掉落物</li>
                        <li><strong>NPC任务</strong>：与6个NPC对话接受多阶段任务</li>
                        <li><strong>植物采集</strong>：采集4种植物，定时刷新</li>
                        <li><strong>装备系统</strong>：购买和装备武器防具提升属性</li>
                        <li><strong>猫咪伙伴</strong>：Tank/Damage两种类型协助战斗</li>
                    </ul>

                    <h4>🎮 快速操作</h4>
                    <ul style="margin: 10px 0; padding-left: 20px; line-height: 1.6;">
                        <li><strong>快速测试</strong>：使用页面上的测试按钮快速体验功能</li>
                        <li><strong>调试面板</strong>：点击右下角🛠图标查看系统日志</li>
                        <li><strong>数据同步</strong>：茶铺和稻香村数据完全同步</li>
                        <li><strong>自动保存</strong>：每30秒自动保存到浏览器本地</li>
                    </ul>

                    <h4>🔧 技术特色</h4>
                    <ul style="margin: 10px 0; padding-left: 20px; line-height: 1.6;">
                        <li><strong>统一数据</strong>：解决了原版数据冲突问题</li>
                        <li><strong>Win95风格</strong>：经典灰白界面，无图标设计</li>
                        <li><strong>响应式</strong>：支持桌面和移动设备</li>
                        <li><strong>模块化</strong>：易于扩展新功能和新地图</li>
                    </ul>
                </div>
            </div>
        </div>
    `;

    document.getElementById('modal-container').innerHTML = modalContent;
}

function closeHelpModal() {
    document.getElementById('modal-container').innerHTML = '';
}

// 种植相关函数 - 使用类方法
function showPlantModal(plotIndex) {
    teaShopManager.showPlantModal(plotIndex);
}

function closePlantModal() {
    teaShopManager.closePlantModal();
}

function plantSeed(plotIndex, seedName) {
    teaShopManager.plantSeed(plotIndex, seedName);
}

function buyAndPlant(plotIndex, seedName) {
    teaShopManager.buyAndPlant(plotIndex, seedName);
}

function harvestPlot(plotIndex) {
    teaShopManager.harvestPlot(plotIndex);
}

function waterPlot(plotIndex) {
    teaShopManager.waterPlot(plotIndex);
}

function fertilizePlot(plotIndex) {
    teaShopManager.fertilizePlot(plotIndex);
}

// 背包显示相关函数
function toggleInventorySection(sectionType) {
    const sections = ['seeds', 'ingredients', 'toppings', 'meats'];

    // 隐藏所有区域
    sections.forEach(section => {
        const element = document.getElementById(`${section}-section`);
        if (element) {
            element.classList.remove('active');
        }
    });

    // 显示选中的区域
    const targetSection = document.getElementById(`${sectionType}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
        teaShopManager.updateInventoryDisplay();
    }
}

// 更新背包显示的扩展方法
TeaShopManager.prototype.updateInventoryDisplay = function() {
    if (!this.core.initialized) return;

    const inventory = this.inventory.getAllItems();

    // 更新种子显示
    this.updateInventorySection('seeds', inventory.seeds || {});

    // 更新原料显示
    this.updateInventorySection('ingredients', inventory.teaIngredients || {});

    // 更新小料显示
    this.updateInventorySection('toppings', inventory.toppings || {});

    // 更新肉类显示
    this.updateInventorySection('meats', inventory.meatIngredients || {});
};

TeaShopManager.prototype.updateInventorySection = function(sectionType, items) {
    const tableBody = document.getElementById(`${sectionType}-inventory`);
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (Object.keys(items).length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="4">暂无物品</td>';
        tableBody.appendChild(row);
        return;
    }

    Object.entries(items).forEach(([itemName, count]) => {
        const config = this.inventory.getItemConfig(itemName);
        const row = document.createElement('tr');

        switch (sectionType) {
            case 'seeds':
                row.innerHTML = `
                    <td>${itemName}</td>
                    <td>${count}个</td>
                    <td>${config ? config.price + '金币' : '未知'}</td>
                    <td><button class="action-btn" onclick="teaShopManager.useItem('${itemName}', 'seeds')">使用</button></td>
                `;
                break;
            case 'ingredients':
                row.innerHTML = `
                    <td>${itemName}</td>
                    <td>${count}个</td>
                    <td>制茶原料</td>
                    <td><button class="action-btn" onclick="teaShopManager.useItem('${itemName}', 'teaIngredients')">使用</button></td>
                `;
                break;
            case 'toppings':
                row.innerHTML = `
                    <td>${itemName}</td>
                    <td>${count}个</td>
                    <td>${config && config.source ? '来自' + config.source : '购买获得'}</td>
                    <td><button class="action-btn" onclick="teaShopManager.useItem('${itemName}', 'toppings')">使用</button></td>
                `;
                break;
            case 'meats':
                row.innerHTML = `
                    <td>${itemName}</td>
                    <td>${count}个</td>
                    <td>${config ? config.grillPrice + '金币' : '未知'}</td>
                    <td><button class="action-btn" onclick="teaShopManager.grillMeat('${itemName}')">烤制</button></td>
                `;
                break;
        }

        tableBody.appendChild(row);
    });
};

// 制茶相关函数 - 使用类方法
function showTeaRecipeModal(stoveIndex) {
    teaShopManager.showTeaRecipeModal(stoveIndex);
}

function closeTeaRecipeModal() {
    teaShopManager.closeTeaRecipeModal();
}

function startTeaMaking(stoveIndex, recipeName) {
    teaShopManager.startTeaMaking(stoveIndex, recipeName);
}

function collectTea(stoveIndex) {
    teaShopManager.collectTea(stoveIndex);
}

// 案板加工相关函数
function showProcessingModal(boardIndex) {
    teaShopManager.showProcessingModal(boardIndex);
}

function closeProcessingModal() {
    document.getElementById('modal-container').innerHTML = '';
}

function startProcessing(boardIndex, productName) {
    const board = teaShopManager.core.gameData.teaShop.processingBoards[boardIndex];
    const processingRecipes = {
        '红糖': { source: '甘蔗', time: 10000, output: 3 },
        '薄荷叶': { source: '薄荷', time: 10000, output: 3 },
        '姜丝': { source: '生姜', time: 10000, output: 3 },
        '柚子丝': { source: '柚子', time: 10000, output: 3 },
        '银耳丝': { source: '银耳', time: 15000, output: 3 },
        '柠檬片': { source: '柠檬', time: 10000, output: 3 },
        '水蜜桃果肉': { source: '水蜜桃', time: 12000, output: 3 },
        '黄芪片': { source: '黄芪', time: 12000, output: 3 },
        '干桂花': { source: '桂花', time: 10000, output: 3 },
        '小圆子': { source: '糯米', time: 15000, output: 3 },
        '酒酿': { source: '米', time: 18000, output: 3 }
    };

    const recipe = processingRecipes[productName];

    if (board.state !== 'idle') {
        teaShopManager.addDebugLog('❌ 案板正在使用中');
        return;
    }

    if (!teaShopManager.inventory.hasItem(recipe.source, 1, 'teaIngredients')) {
        teaShopManager.addDebugLog('❌ 原料不足');
        return;
    }

    // 消耗原料
    teaShopManager.inventory.removeItem(recipe.source, 1, 'teaIngredients');

    // 开始加工
    board.state = 'processing';
    board.recipe = productName;
    board.startTime = Date.now();
    board.duration = recipe.time;
    board.outputCount = recipe.output;

    teaShopManager.addDebugLog(`🧂 开始加工 ${productName}`);

    closeProcessingModal();
    teaShopManager.renderBoards();
    teaShopManager.updateInventoryDisplay();
}

function collectProcessed(boardIndex) {
    teaShopManager.collectProcessed(boardIndex);
}

// 地块生长更新
TeaShopManager.prototype.updatePlotGrowth = function() {
    if (!this.core.initialized) return;

    let needsUpdate = false;

    this.core.gameData.teaShop.plots.forEach((plot, index) => {
        if (plot.state === 'growing' && plot.stageStartTime && plot.totalGrowTime) {
            const elapsed = Date.now() - plot.stageStartTime;

            if (elapsed >= plot.totalGrowTime) {
                plot.state = 'ready';
                this.addDebugLog(`🌾 地块 #${index + 1} 的 ${plot.plantType} 已成熟`);
                needsUpdate = true;
            }
        }

        // 自然消耗湿度和肥沃度（简化版本）
        if (plot.state === 'growing') {
            const minutesPassed = (Date.now() - plot.stageStartTime) / (1000 * 60);
            const baseMoistureDecay = 0.1; // 基础每分钟消耗0.1%湿度
            const baseFertilityDecay = 0.05; // 基础每分钟消耗0.05%肥沃度

            const moistureDecay = Math.floor(minutesPassed * baseMoistureDecay);
            const fertilityDecay = Math.floor(minutesPassed * baseFertilityDecay);

            const newMoisture = Math.max(0, plot.moisture - moistureDecay);
            const newFertility = Math.max(0, plot.fertility - fertilityDecay);

            if (newMoisture !== plot.moisture || newFertility !== plot.fertility) {
                plot.moisture = newMoisture;
                plot.fertility = newFertility;
                needsUpdate = true;
            }
        }
    });

    // 如果有变化，更新显示
    if (needsUpdate) {
        this.renderFarmGrid();
    }
};

// 顾客系统更新
TeaShopManager.prototype.updateCustomerPatience = function() {
    if (!this.core.initialized) return;

    const customer = this.core.gameData.teaShop.customer;

    if (customer.active && customer.arrivalTime) {
        const elapsed = Date.now() - customer.arrivalTime;
        const remainingPatience = customer.maxPatience - elapsed;

        if (remainingPatience <= 0) {
            this.addDebugLog(`😤 顾客 ${customer.name} 等待超时离开`);
            this.resetCustomer();
        } else {
            customer.patience = remainingPatience;
        }
    }

    // 随机生成新顾客
    if (!customer.active) {
        const lastCustomerTime = this.core.gameData.teaShop.lastCustomerTime || 0;
        const timeSinceLastCustomer = Date.now() - lastCustomerTime;

        if (timeSinceLastCustomer > 30000) { // 30秒后必定来新顾客
            this.generateNewCustomer(); // 100%概率生成顾客
        }
    }
};

TeaShopManager.prototype.generateNewCustomer = function() {
    const vipCustomerNames = ['池惊暮', '凌小路', '江飞飞', '江三', '江四', '池云旗', '江潮', '江敕封', '花花', '姬别情', '池九信', '狸怒'];
    
    const customer = this.core.gameData.teaShop.customer;
    
    // 70%普通顾客，30%VIP顾客
    const isVIP = Math.random() < 0.3;
    
    const wantsTopping = Math.random() < 0.8; // 80%概率要小料

    customer.active = true;
    customer.customerType = isVIP ? 'vip' : 'normal';
    customer.isVIP = isVIP; // 保持兼容性
    
    if (isVIP) {
        customer.name = vipCustomerNames[Math.floor(Math.random() * vipCustomerNames.length)];
    } else {
        customer.name = "普通顾客";
    }
    
    customer.orderType = wantsTopping ? 'tea_with_topping' : 'tea_only';
    customer.teaChoice = this.getRandomAvailableTea();
    customer.toppingChoice = wantsTopping ? this.getRandomAvailableTopping() : null;
    customer.arrivalTime = Date.now();
    customer.patience = isVIP ? 240000 : 120000; // VIP 4分钟，普通2分钟
    customer.maxPatience = customer.patience;

    // 订单需求
    customer.requirements = {
        needsTea: true,
        needsTopping: wantsTopping
    };

    // 订单进度
    customer.progress = {
        teaAdded: false,
        toppingAdded: false
    };

    this.core.gameData.teaShop.lastCustomerTime = Date.now();

    const orderDesc = customer.requirements.needsTopping
        ? `${customer.teaChoice} + ${customer.toppingChoice}`
        : `${customer.teaChoice} (无小料)`;
    this.addDebugLog(`👥 新顾客到来: ${customer.name} ${isVIP ? '(VIP)' : '(普通)'} - 想要 ${orderDesc}`);
    this.updateCustomerDisplay();
};

TeaShopManager.prototype.getRandomAvailableTea = function() {
    const availableRecipes = this.core.gameData.teaShop.unlockedRecipes;
    if (availableRecipes.length === 0) {
        console.log('⚠️ 没有解锁的配方，使用默认配方');
        return '绿茶'; // 默认配方
    }
    return availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
};

TeaShopManager.prototype.getRandomAvailableTopping = function() {
    const availableToppings = ['红糖', '蜂蜜', '柠檬片', '姜丝', '干桂花'];
    return availableToppings[Math.floor(Math.random() * availableToppings.length)];
};

// 检查茶饮状态
TeaShopManager.prototype.getTeaStatus = function(teaName, customer) {
    // 安全检查：确保customer和progress存在
    if (!customer || !customer.progress) {
        return { text: '等待顾客', disabled: true, style: 'background: #ccc; color: #666;' };
    }

    // 如果已经添加过茶饮
    if (customer.progress.teaAdded) {
        return { text: '已添加茶饮', disabled: true, style: 'background: #4CAF50; color: white;' };
    }

    // 检查配方是否解锁
    const unlockedRecipes = this.core.gameData.teaShop.unlockedRecipes || [];
    if (!teaName || !unlockedRecipes.includes(teaName)) {
        return { text: '配方未解锁', disabled: true, style: 'background: #f44336; color: white;' };
    }

    // 检查是否有制作好的茶饮
    const madeTeas = this.core.gameData.inventory.madeTeas;
    const hasTea = madeTeas.some(tea => tea.name === teaName);

    if (hasTea) {
        return { text: '添加茶饮', disabled: false, style: 'background: #2196F3; color: white;' };
    } else {
        return { text: '待制作', disabled: true, style: 'background: #ccc; color: #666;' };
    }
};

// 检查小料状态
TeaShopManager.prototype.getToppingStatus = function(toppingName, customer) {
    // 安全检查：确保customer、requirements和progress存在
    if (!customer || !customer.requirements || !customer.progress) {
        return { text: '等待顾客', disabled: true, style: 'background: #ccc; color: #666;' };
    }

    // 如果顾客不需要小料
    if (!customer.requirements.needsTopping) {
        return { text: '无需小料', disabled: true, style: 'background: #ccc; color: #666;' };
    }

    // 如果已经添加过小料
    if (customer.progress.toppingAdded) {
        return { text: '已添加小料', disabled: true, style: 'background: #4CAF50; color: white;' };
    }

    // 检查是否有加工好的小料
    const toppings = this.core.gameData.inventory.toppings || {};
    const hasTopping = toppingName && (toppings[toppingName] || 0) > 0;

    if (hasTopping) {
        return { text: '添加小料', disabled: false, style: 'background: #2196F3; color: white;' };
    } else {
        return { text: '待加工', disabled: true, style: 'background: #ccc; color: #666;' };
    }
};

// 检查订单是否完成
TeaShopManager.prototype.isOrderComplete = function(customer) {
    // 安全检查：确保customer、requirements和progress存在
    if (!customer || !customer.requirements || !customer.progress) {
        return false;
    }

    const teaComplete = !customer.requirements.needsTea || customer.progress.teaAdded;
    const toppingComplete = !customer.requirements.needsTopping || customer.progress.toppingAdded;

    return teaComplete && toppingComplete;
};

TeaShopManager.prototype.resetCustomer = function() {
    const customer = this.core.gameData.teaShop.customer;
    customer.active = false;
    customer.name = "等待顾客到来";
    customer.customerType = null;
    customer.isVIP = false;
    customer.orderType = null;
    customer.teaChoice = null;
    customer.toppingChoice = null;
    customer.arrivalTime = 0;
    customer.patience = 120000;
    customer.maxPatience = 120000;

    // 重置订单需求和进度
    customer.requirements = {
        needsTea: false,
        needsTopping: false
    };
    customer.progress = {
        teaAdded: false,
        toppingAdded: false
    };

    this.updateCustomerDisplay();
};

// 处理茶饮订单
TeaShopManager.prototype.handleTeaOrder = function(teaName) {
    const customer = this.core.gameData.teaShop.customer;

    if (!customer.active) {
        this.showFloatingMessage('没有顾客在等待', 'error');
        return;
    }

    // 检查是否已经添加过茶饮
    if (customer.progress.teaAdded) {
        this.showFloatingMessage('茶饮已添加', 'error');
        return;
    }

    // 检查是否有制作好的茶饮
    const madeTeas = this.core.gameData.inventory.madeTeas;
    const teaIndex = madeTeas.findIndex(tea => tea.name === teaName);

    if (teaIndex === -1) {
        this.showFloatingMessage('请先制作茶饮', 'error');
        return;
    }

    // 移除茶饮，标记为已添加
    madeTeas.splice(teaIndex, 1);
    customer.progress.teaAdded = true;

    this.showFloatingMessage('已添加茶饮', 'success');
    this.addDebugLog(`✅ 已添加茶饮: ${teaName}`);

    this.updateCustomerDisplay();
    this.updateMadeTeaDisplay();
};

// 处理小料订单
TeaShopManager.prototype.handleToppingOrder = function(toppingName) {
    const customer = this.core.gameData.teaShop.customer;

    if (!customer.active) {
        this.showFloatingMessage('没有顾客在等待', 'error');
        return;
    }

    // 检查顾客是否需要小料
    if (!customer.requirements.needsTopping) {
        this.showFloatingMessage('顾客不需要小料', 'error');
        return;
    }

    // 检查是否已经添加过小料
    if (customer.progress.toppingAdded) {
        this.showFloatingMessage('小料已添加', 'error');
        return;
    }

    // 检查是否有小料
    const toppings = this.core.gameData.inventory.toppings || {};
    if ((toppings[toppingName] || 0) <= 0) {
        this.showFloatingMessage('请先加工小料', 'error');
        return;
    }

    // 移除小料，标记为已添加
    toppings[toppingName]--;
    customer.progress.toppingAdded = true;

    this.showFloatingMessage('已添加小料', 'success');
    this.addDebugLog(`✅ 已添加小料: ${toppingName}`);

    this.updateCustomerDisplay();
    this.updateInventoryDisplay();
};

// 提交订单
TeaShopManager.prototype.submitOrder = function() {
    const customer = this.core.gameData.teaShop.customer;

    if (!customer.active) {
        this.showFloatingMessage('没有顾客在等待', 'error');
        return;
    }

    // 检查订单是否完成
    if (!this.isOrderComplete(customer)) {
        this.showFloatingMessage('订单未完成', 'error');
        return;
    }

    // 计算收入：普通顾客15金币，VIP顾客30金币
    const totalEarning = customer.customerType === 'vip' ? 30 : 15;

    // 增加金币
    this.core.gameData.player.funds += totalEarning;

    // 更新统计
    this.core.gameData.teaShop.servedCustomers++;

    // 只有VIP顾客才记录访问次数并检查解锁
    if (customer.customerType === 'vip') {
        const visits = this.core.gameData.teaShop.customerVisits;
        visits[customer.name] = (visits[customer.name] || 0) + 1;
        
        // VIP顾客解锁检查
        this.checkVipUnlock(customer.name, visits[customer.name]);
    }

    // 检查里程碑解锁
    this.checkMilestoneUnlock();

    // 显示金币动画
    this.showFloatingMessage(`+${totalEarning} 金币`, 'success');
    this.addDebugLog(`💰 服务完成：${customer.name}，获得 ${totalEarning} 金币`);

    // 重置顾客
    this.resetCustomer();
    this.updateStatusDisplay();
};

// 显示配方解锁动画
TeaShopManager.prototype.showRecipeUnlockAnimation = function(recipeName) {
    // 创建动画元素
    const animationDiv = document.createElement('div');
    animationDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #ffd700, #ffed4e, #ffd700);
        color: #8b4513;
        padding: 20px 30px;
        border-radius: 15px;
        font-size: 18px;
        font-weight: bold;
        box-shadow: 0 8px 25px rgba(255, 215, 0, 0.6);
        z-index: 10000;
        animation: unlockPulse 3s ease-in-out;
        text-align: center;
        border: 3px solid #ffa500;
    `;
    
    animationDiv.textContent = `🎉 解锁新配方：${recipeName}！`;
    
    // 添加CSS动画样式
    if (!document.getElementById('unlock-animation-style')) {
        const style = document.createElement('style');
        style.id = 'unlock-animation-style';
        style.textContent = `
            @keyframes unlockPulse {
                0% { 
                    opacity: 0; 
                    transform: translate(-50%, -50%) scale(0.5); 
                }
                20% { 
                    opacity: 1; 
                    transform: translate(-50%, -50%) scale(1.1); 
                }
                40% { 
                    transform: translate(-50%, -50%) scale(0.95); 
                }
                60% { 
                    transform: translate(-50%, -50%) scale(1.05); 
                }
                80% { 
                    transform: translate(-50%, -50%) scale(1); 
                }
                100% { 
                    opacity: 0; 
                    transform: translate(-50%, -50%) scale(1); 
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // 添加到页面
    document.body.appendChild(animationDiv);
    
    // 3秒后移除
    setTimeout(() => {
        if (animationDiv.parentNode) {
            animationDiv.parentNode.removeChild(animationDiv);
        }
    }, 3000);
};

TeaShopManager.prototype.updateCustomerDisplay = function() {
    const customerTable = document.getElementById('customer-table');
    if (!customerTable || !this.core.initialized) return;

    const customer = this.core.gameData.teaShop.customer;

    // 调试信息：检查顾客对象结构
    if (customer && customer.active) {
        console.log('🔍 顾客对象结构:', {
            active: customer.active,
            requirements: customer.requirements,
            progress: customer.progress,
            teaChoice: customer.teaChoice,
            toppingChoice: customer.toppingChoice
        });
    }

    customerTable.innerHTML = '';

    if (customer.active) {
        const patiencePercent = Math.max(0, (customer.patience / customer.maxPatience) * 100);
        const patienceColor = patiencePercent > 50 ? '#059669' : patiencePercent > 25 ? '#d97706' : '#dc2626';

        // 检查茶饮和小料状态
        const teaStatus = this.getTeaStatus(customer.teaChoice, customer);
        const toppingStatus = this.getToppingStatus(customer.toppingChoice, customer);

        // 显示名称：普通顾客显示"普通顾客"，VIP显示名字+⭐
        const displayName = customer.customerType === 'vip' ? `${customer.name} ⭐` : customer.name;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${displayName}</td>
            <td>
                <div style="margin-bottom: 8px;">
                    <strong>茶饮:</strong> ${customer.teaChoice}
                    <button class="action-btn" onclick="handleTeaOrder('${customer.teaChoice}')"
                            style="margin-left: 10px; font-size: 11px; padding: 3px 8px; ${teaStatus.style}"
                            ${teaStatus.disabled ? 'disabled' : ''}>
                        ${teaStatus.text}
                    </button>
                </div>
                ${customer.requirements.needsTopping ? `
                <div>
                    <strong>小料:</strong> ${customer.toppingChoice}
                    <button class="action-btn" onclick="handleToppingOrder('${customer.toppingChoice}')"
                            style="margin-left: 10px; font-size: 11px; padding: 3px 8px; ${toppingStatus.style}"
                            ${toppingStatus.disabled ? 'disabled' : ''}>
                        ${toppingStatus.text}
                    </button>
                </div>
                ` : `
                <div style="color: #666; font-style: italic;">
                    (无需小料)
                </div>
                `}
            </td>
            <td>
                <div class="progress-bar customer-patience">
                    <div class="progress-fill" style="width: ${patiencePercent}%; background-color: #6b7280;">
                        <div class="progress-text">${Math.round(patiencePercent)}%</div>
                    </div>
                </div>
            </td>
            <td>
                <button class="action-btn" onclick="submitOrder()"
                        ${this.isOrderComplete(customer) ? '' : 'disabled'}
                        style="background: ${this.isOrderComplete(customer) ? '#4CAF50' : '#ccc'}; color: white;">
                    提交服务
                </button>
                <br>
                <button class="action-btn" onclick="resetCustomer()" style="margin-top: 5px; font-size: 11px;">忽略</button>
            </td>
        `;
        customerTable.appendChild(row);
    } else {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="4">等待顾客到来...</td>';
        customerTable.appendChild(row);
    }
};

TeaShopManager.prototype.serveCustomer = function() {
    const customer = this.core.gameData.teaShop.customer;

    if (!customer.active) {
        this.addDebugLog('❌ 没有顾客在等待');
        return;
    }

    // 检查是否有对应的茶饮
    const madeTeas = this.core.gameData.inventory.madeTeas;
    const teaIndex = madeTeas.findIndex(tea => tea.name === customer.teaChoice);

    if (teaIndex === -1) {
        this.addDebugLog(`❌ 没有 ${customer.teaChoice}，无法服务顾客`);
        return;
    }

    // 移除茶饮
    madeTeas.splice(teaIndex, 1);

    // 计算收入
    const basePrice = customer.isVIP ? 25 : 20;
    const tip = Math.floor(Math.random() * 5) + 1;
    const totalEarning = basePrice + tip;

    this.core.gameData.player.funds += totalEarning;

    // 记录顾客访问
    const visits = this.core.gameData.teaShop.customerVisits;
    visits[customer.name] = (visits[customer.name] || 0) + 1;
    this.core.gameData.teaShop.servedCustomers++;

    this.addDebugLog(`🍵 服务顾客 ${customer.name}：${customer.teaChoice}，获得 ${totalEarning} 金币`);

    // 检查是否解锁新配方（仅保留用于兼容性，主要解锁逻辑在submitOrder中）
    if (customer.customerType === 'vip') {
        this.checkVipUnlock(customer.name, visits[customer.name]);
    }
    this.checkMilestoneUnlock();

    this.resetCustomer();
    this.updateStatusDisplay();
    this.updateMadeTeaDisplay();
};

// VIP顾客解锁检查：概率解锁+保底机制
TeaShopManager.prototype.checkVipUnlock = function(customerName, visitCount) {
    // 初始化VIP解锁记录
    if (!this.core.gameData.teaShop.vipUnlockAttempts) {
        this.core.gameData.teaShop.vipUnlockAttempts = {};
    }
    
    // VIP顾客解锁配方的逻辑（含概率和保底）
    const vipUnlocks = {
        '凌小路': { 
            recipe: '洛神玫瑰饮', 
            ingredients: ['洛神花', '玫瑰花', '山楂'],
            probability: 1.0, // 100%解锁
            guaranteed: 1
        },
        '花花': { 
            recipe: '桂圆红枣茶', 
            ingredients: ['桂圆', '红枣', '枸杞'],
            probability: 1.0, // 100%解锁
            guaranteed: 1
        },
        '江飞飞': { 
            recipe: '焦香大麦茶', 
            ingredients: ['大麦'],
            probability: 0.6, // 60%概率
            guaranteed: 3 // 第3次必定解锁
        },
        '江三': { 
            recipe: '三花决明茶', 
            ingredients: ['菊花', '金银花', '决明子', '枸杞'],
            probability: 0.5, // 50%概率
            guaranteed: 4 // 第4次必定解锁
        },
        '江四': { 
            recipe: '薄荷甘草凉茶', 
            ingredients: ['薄荷', '甘草'],
            probability: 0.5, // 50%概率
            guaranteed: 4 // 第4次必定解锁
        },
        '池云旗': { 
            recipe: '陈皮姜米茶', 
            ingredients: ['陈皮', '生姜'],
            probability: 0.4, // 40%概率
            guaranteed: 5 // 第5次必定解锁
        },
        '江潮': { 
            recipe: '冬瓜荷叶饮', 
            ingredients: ['冬瓜', '荷叶', '薏米'],
            probability: 0.3, // 30%概率
            guaranteed: 6 // 第6次必定解锁
        },
        '池惊暮': { 
            recipe: '古法酸梅汤', 
            ingredients: ['乌梅', '山楂', '陈皮', '甘草', '桂花'],
            probability: 0.4, // 40%概率
            guaranteed: 5 // 第5次必定解锁
        },
        '江敕封': { 
            recipe: '小吊梨汤', 
            ingredients: ['雪花梨', '银耳', '话梅', '枸杞'],
            probability: 0.25, // 25%概率
            guaranteed: 7 // 第7次必定解锁
        },
        // 神秘客户（预留接口）
        '姬别情': { 
            recipe: '神秘功能1', 
            ingredients: ['?'],
            probability: 0.0, // 暂不解锁
            guaranteed: 6
        },
        '池九信': { 
            recipe: '神秘功能2', 
            ingredients: ['?'],
            probability: 0.0, // 暂不解锁
            guaranteed: 6
        },
        '狸怒': { 
            recipe: '神秘功能3', 
            ingredients: ['?'],
            probability: 0.0, // 暂不解锁
            guaranteed: 6
        }
    };

    const unlock = vipUnlocks[customerName];
    if (!unlock) return;

    const recipes = this.core.gameData.teaShop.teaRecipes;
    const unlockedRecipes = this.core.gameData.teaShop.unlockedRecipes || [];

    // 如果已经解锁，跳过
    if (unlockedRecipes.includes(unlock.recipe)) return;

    // 神秘客户暂不解锁
    if (['姬别情', '池九信', '狸怒'].includes(customerName)) {
        this.addDebugLog(`🔮 神秘客户 ${customerName} 访问了 ${visitCount} 次（功能暂未开放）`);
        return;
    }

    // 记录尝试次数
    if (!this.core.gameData.teaShop.vipUnlockAttempts[customerName]) {
        this.core.gameData.teaShop.vipUnlockAttempts[customerName] = 0;
    }
    this.core.gameData.teaShop.vipUnlockAttempts[customerName]++;

    const attempts = this.core.gameData.teaShop.vipUnlockAttempts[customerName];

    // 检查是否达到保底次数
    const isGuaranteed = attempts >= unlock.guaranteed;
    
    // 检查概率解锁或保底解锁
    const shouldUnlock = isGuaranteed || Math.random() < unlock.probability;

    if (shouldUnlock) {
        recipes[unlock.recipe] = unlock.ingredients;
        if (!unlockedRecipes.includes(unlock.recipe)) {
            unlockedRecipes.push(unlock.recipe);
        }
        
        const unlockType = isGuaranteed ? '(保底解锁)' : '(概率解锁)';
        this.addDebugLog(`🎉 ${customerName} 解锁配方: ${unlock.recipe}！${unlockType}`);
        this.showRecipeUnlockAnimation(unlock.recipe);
        
        // 重置解锁尝试次数
        this.core.gameData.teaShop.vipUnlockAttempts[customerName] = 0;
    } else {
        this.addDebugLog(`🎲 ${customerName} 解锁尝试 ${attempts}/${unlock.guaranteed}（概率：${Math.round(unlock.probability * 100)}%）`);
    }
};

// 里程碑解锁检查
TeaShopManager.prototype.checkMilestoneUnlock = function() {
    const servedCount = this.core.gameData.teaShop.servedCustomers;
    const milestoneUnlocks = [
        { count: 30, recipe: '桑菊润燥茶', ingredients: ['桑叶', '杭白菊'] },
        { count: 60, recipe: '桂花酒酿饮', ingredients: ['桂花', '酒酿'] },
        { count: 90, recipe: '蜜桃乌龙冷萃', ingredients: ['水蜜桃', '乌龙茶包'] },
        { count: 120, recipe: '黄芪枸杞茶', ingredients: ['黄芪', '枸杞'] },
        { count: 150, recipe: '竹蔗茅根马蹄水', ingredients: ['甘蔗', '白茅根', '马蹄'] }
    ];

    milestoneUnlocks.forEach(unlock => {
        if (servedCount >= unlock.count) {
            const recipes = this.core.gameData.teaShop.teaRecipes;
            const unlockedRecipes = this.core.gameData.teaShop.unlockedRecipes || [];

            if (!unlockedRecipes.includes(unlock.recipe)) {
                recipes[unlock.recipe] = unlock.ingredients;
                unlockedRecipes.push(unlock.recipe);
                this.addDebugLog(`🎊 里程碑解锁新配方: ${unlock.recipe}！(服务${unlock.count}位顾客)`);
                this.showRecipeUnlockAnimation(unlock.recipe);
            }
        }
    });
};

// 制作好的茶饮显示
TeaShopManager.prototype.updateMadeTeaDisplay = function() {
    const madeTeaTable = document.getElementById('made-teas-table');
    if (!madeTeaTable || !this.core.initialized) return;

    const madeTeas = this.core.gameData.inventory.madeTeas;

    madeTeaTable.innerHTML = '';

    if (madeTeas.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="4">暂无制作好的茶饮</td>';
        madeTeaTable.appendChild(row);
        return;
    }

    // 按名称分组统计
    const teaGroups = {};
    madeTeas.forEach((tea, index) => {
        if (!teaGroups[tea.name]) {
            teaGroups[tea.name] = [];
        }
        teaGroups[tea.name].push({ ...tea, originalIndex: index });
    });

    Object.entries(teaGroups).forEach(([teaName, teas]) => {
        const latestTea = teas[teas.length - 1];
        const makeTime = new Date(latestTea.timestamp).toLocaleTimeString();

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${teaName}</td>
            <td>${teas.length}杯</td>
            <td>${makeTime}</td>
            <td>
                <button class="action-btn" onclick="console.log('🔍 出售按钮被点击:', '${teaName}'); sellTea('${teaName}')">出售</button>
            </td>
        `;
        madeTeaTable.appendChild(row);
    });
};

TeaShopManager.prototype.sellTea = function(teaName) {
    const madeTeas = this.core.gameData.inventory.madeTeas;
    const teaIndex = madeTeas.findIndex(tea => tea.name === teaName);

    if (teaIndex === -1) {
        this.addDebugLog(`❌ 没有 ${teaName} 可出售`);
        return;
    }

    const tea = madeTeas[teaIndex];
    const sellPrice = tea.basePrice || 15;

    // 移除茶饮
    madeTeas.splice(teaIndex, 1);

    // 获得金币
    this.core.gameData.player.funds += sellPrice;

    this.addDebugLog(`💰 出售 ${teaName}，获得 ${sellPrice} 金币`);

    // 显示出售成功动画
    this.showFloatingMessage(`+${sellPrice} 金币`, 'success');

    this.updateMadeTeaDisplay();
    this.updateStatusDisplay();
};

// 显示配方解锁状态
TeaShopManager.prototype.showRecipeUnlockStatus = function() {
    const gameData = this.core.gameData;
    const recipes = gameData.teaShop.teaRecipes;
    const unlockedRecipes = gameData.teaShop.unlockedRecipes || [];
    const visits = gameData.teaShop.customerVisits || {};
    const unlockAttempts = gameData.teaShop.vipUnlockAttempts || {};
    const servedCount = gameData.teaShop.servedCustomers || 0;

    // VIP解锁配置
    const vipUnlocks = {
        '凌小路': { 
            recipe: '洛神玫瑰饮', 
            probability: 100, 
            guaranteed: 1
        },
        '花花': { 
            recipe: '桂圆红枣茶', 
            probability: 100, 
            guaranteed: 1
        },
        '江飞飞': { 
            recipe: '焦香大麦茶', 
            probability: 60, 
            guaranteed: 3
        },
        '江三': { 
            recipe: '三花决明茶', 
            probability: 50, 
            guaranteed: 4
        },
        '江四': { 
            recipe: '薄荷甘草凉茶', 
            probability: 50, 
            guaranteed: 4
        },
        '池云旗': { 
            recipe: '陈皮姜米茶', 
            probability: 40, 
            guaranteed: 5
        },
        '江潮': { 
            recipe: '冬瓜荷叶饮', 
            probability: 30, 
            guaranteed: 6
        },
        '池惊暮': { 
            recipe: '古法酸梅汤', 
            probability: 40, 
            guaranteed: 5
        },
        '江敕封': { 
            recipe: '小吊梨汤', 
            probability: 25, 
            guaranteed: 7
        },
        // 神秘客户
        '姬别情': { 
            recipe: '神秘功能1', 
            probability: 0, 
            guaranteed: 6
        },
        '池九信': { 
            recipe: '神秘功能2', 
            probability: 0, 
            guaranteed: 6
        },
        '狸怒': { 
            recipe: '神秘功能3', 
            probability: 0, 
            guaranteed: 6
        }
    };

    // 里程碑解锁配置
    const milestoneUnlocks = [
        { count: 30, recipe: '桑菊润燥茶' },
        { count: 60, recipe: '桂花酒酿饮' },
        { count: 90, recipe: '蜜桃乌龙冷萃' },
        { count: 120, recipe: '黄芪枸杞茶' },
        { count: 150, recipe: '竹蔗茅根马蹄水' }
    ];

    // 创建VIP解锁状态表格
    let vipUnlockHtml = '';
    Object.entries(vipUnlocks).forEach(([customerName, unlock]) => {
        const visitCount = visits[customerName] || 0;
        const attempts = unlockAttempts[customerName] || 0;
        const isUnlocked = unlockedRecipes.includes(unlock.recipe);
        const isMystery = ['姬别情', '池九信', '狸怒'].includes(customerName);
        
        let statusHtml = '';
        if (isUnlocked) {
            statusHtml = '<span style="color: #374151; font-weight: 500;">已解锁</span>';
        } else if (isMystery) {
            statusHtml = '<span style="color: #9ca3af;">暂未开放</span>';
        } else {
            const progress = attempts > 0 ? `${attempts}/${unlock.guaranteed}` : '0/' + unlock.guaranteed;
            statusHtml = `<span style="color: #6b7280;">进行中 (${progress})</span>`;
        }

        vipUnlockHtml += `
            <tr>
                <td style="padding: 8px; border: 1px solid #e5e7eb; font-size: 12px; color: #374151;">${customerName}</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb; font-size: 12px; color: #374151;">${unlock.recipe}</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb; font-size: 12px; color: #374151; text-align: center;">${visitCount}次</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb; font-size: 12px; text-align: center;">${statusHtml}</td>
            </tr>
        `;
    });

    // 创建里程碑解锁状态表格
    let milestoneHtml = '';
    milestoneUnlocks.forEach(milestone => {
        const isUnlocked = unlockedRecipes.includes(milestone.recipe);
        const progress = Math.min(servedCount, milestone.count);
        
        let statusHtml = '';
        if (isUnlocked) {
            statusHtml = '<span style="color: #374151; font-weight: 500;">已解锁</span>';
        } else if (servedCount >= milestone.count) {
            statusHtml = '<span style="color: #6b7280;">待解锁</span>';
        } else {
            statusHtml = `<span style="color: #6b7280;">进行中 (${progress}/${milestone.count})</span>`;
        }

        milestoneHtml += `
            <tr>
                <td style="padding: 8px; border: 1px solid #e5e7eb; font-size: 12px; color: #374151;">${milestone.recipe}</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb; font-size: 12px; color: #374151; text-align: center;">${milestone.count}位顾客</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb; font-size: 12px; color: #374151; text-align: center;">${progress}/${milestone.count}</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb; font-size: 12px; text-align: center;">${statusHtml}</td>
            </tr>
        `;
    });

    // 创建模态框
    const modalContent = `
        <div id="recipe-unlock-modal" style="
            position: fixed; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%; 
            background: rgba(0,0,0,0.3); 
            z-index: 2000; 
            display: flex; 
            justify-content: center; 
            align-items: center;
        " onclick="window.closeRecipeUnlockStatus()">
            <div style="
                background: #ffffff; 
                border: 1px solid #e5e7eb;
                border-radius: 6px; 
                width: 90%; 
                max-width: 900px; 
                max-height: 80%; 
                overflow-y: auto; 
                padding: 20px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 12px;
                color: #374151;
            " onclick="event.stopPropagation()">
                <div style="
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center; 
                    margin-bottom: 20px;
                    border-bottom: 1px solid #e5e7eb;
                    padding-bottom: 15px;
                ">
                    <h2 style="margin: 0; color: #374151; font-size: 16px; font-weight: 500;">配方解锁状态</h2>
                    <div style="display: flex; gap: 8px;">
                        <button onclick="window.resetRecipeUnlockStatus()" style="
                            background: #ffffff; 
                            color: #374151; 
                            border: 1px solid #d1d5db; 
                            border-radius: 3px; 
                            padding: 6px 12px;
                            font-size: 12px; 
                            cursor: pointer;
                        ">重置</button>
                        <button onclick="window.closeRecipeUnlockStatus()" style="
                            background: #ffffff; 
                            color: #374151; 
                            border: 1px solid #d1d5db; 
                            border-radius: 3px; 
                            width: 28px; 
                            height: 28px; 
                            font-size: 16px; 
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        ">×</button>
                    </div>
                </div>

                <!-- 统计概览 -->
                <div style="
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    padding: 15px;
                    border-radius: 4px;
                    margin-bottom: 20px;
                ">
                    <div style="font-weight: 500; margin-bottom: 10px;">解锁统计</div>
                    <div style="display: flex; justify-content: space-around; flex-wrap: wrap; gap: 15px;">
                        <div>已解锁配方: ${unlockedRecipes.length} 个</div>
                        <div>总服务顾客: ${servedCount} 位</div>
                        <div>VIP顾客访问: ${Object.keys(visits).length} 种</div>
                    </div>
                </div>

                <!-- VIP顾客解锁 -->
                <div style="margin-bottom: 25px;">
                    <div style="font-weight: 500; margin-bottom: 10px; color: #374151;">VIP顾客解锁</div>
                    <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb;">
                        <thead>
                            <tr style="background: #f9fafb;">
                                <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left; font-size: 12px; font-weight: 500;">VIP顾客</th>
                                <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left; font-size: 12px; font-weight: 500;">解锁配方</th>
                                <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: center; font-size: 12px; font-weight: 500;">已访问</th>
                                <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: center; font-size: 12px; font-weight: 500;">状态</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${vipUnlockHtml}
                        </tbody>
                    </table>
                </div>

                <!-- 里程碑解锁 -->
                <div>
                    <div style="font-weight: 500; margin-bottom: 10px; color: #374151;">里程碑解锁</div>
                    <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb;">
                        <thead>
                            <tr style="background: #f9fafb;">
                                <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left; font-size: 12px; font-weight: 500;">配方名称</th>
                                <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: center; font-size: 12px; font-weight: 500;">解锁条件</th>
                                <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: center; font-size: 12px; font-weight: 500;">当前进度</th>
                                <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: center; font-size: 12px; font-weight: 500;">状态</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${milestoneHtml}
                        </tbody>
                    </table>
                </div>


            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalContent);
};

// 旧的serveTea函数已删除，使用新的订单系统

// 猫咪系统
function feedCat(catName) {
    // 直接调用茶铺管理器的喂猫方法，它已经包含了自动购买逻辑
    if (window.teaShopManager) {
        window.teaShopManager.feedCat(catName);
    } else {
        console.error('❌ teaShopManager 未初始化');
    }
}

function feedCatWithTea(catName) {
    // 用茶饮喂食猫咪
    if (window.teaShopManager) {
        window.teaShopManager.feedCatWithTea(catName);
    } else {
        console.error('❌ teaShopManager 未初始化');
    }
}

// 烤肉系统
TeaShopManager.prototype.getGrillProgress = function() {
    const grillSystem = this.core.gameData.teaShop.grillSystem;

    if (!grillSystem.isGrilling) return '等待中';

    if (grillSystem.startTime && grillSystem.duration) {
        const elapsed = Date.now() - grillSystem.startTime;
        const progress = Math.min(100, (elapsed / grillSystem.duration) * 100);
        const remainingTime = Math.max(0, grillSystem.duration - elapsed);
        const remainingSeconds = Math.ceil(remainingTime / 1000);

        return `
            <div class="progress-bar grill-progress">
                <div class="progress-fill" style="width: ${progress}%">
                    <div class="progress-text">${Math.round(progress)}%</div>
                </div>
            </div>
            <div style="font-size: 11px; color: #6b7280; margin-top: 2px;">
                ${remainingSeconds > 0 ? `剩余 ${remainingSeconds} 秒` : '已完成'}
            </div>
        `;
    }

    return '烤制中';
};

TeaShopManager.prototype.getGrillActions = function() {
    const grillSystem = this.core.gameData.teaShop.grillSystem;

    if (!grillSystem.unlocked) {
        return '需要解锁';
    }

    if (!grillSystem.isGrilling) {
        return '<button class="action-btn" onclick="showGrillModal()">🔥 开始烤制</button>';
    } else {
        // 检查是否完成
        if (grillSystem.startTime && grillSystem.duration) {
            const elapsed = Date.now() - grillSystem.startTime;
            if (elapsed >= grillSystem.duration) {
                return '<button class="action-btn" onclick="collectGrilled()">📦 收取</button>';
            }
        }
        return '烤制中...';
    }
};

function grillMeat(meatName) {
    teaShopManager.grillMeat(meatName);
}

// 烧烤架相关函数
function showGrillModal() {
    teaShopManager.showGrillModal();
}

function closeGrillModal() {
    teaShopManager.closeGrillModal();
}

function startGrilling(meatName) {
    teaShopManager.startGrilling(meatName);
}

function collectGrilled() {
    teaShopManager.collectGrilled();
}

// 猫咪喂食函数
function feedCat(catName) {
    teaShopManager.feedCat(catName);
}

// 制作茶饮相关函数
function sellTea(teaName) {
    if (window.teaShopManager) {
        window.teaShopManager.sellTea(teaName);
    } else {
        console.error('❌ teaShopManager 未初始化');
    }
}

// 旧的serveTea函数已删除

// 顾客服务函数
function handleTeaOrder(teaName) {
    if (window.teaShopManager) {
        window.teaShopManager.handleTeaOrder(teaName);
    }
}

function handleToppingOrder(toppingName) {
    if (window.teaShopManager) {
        window.teaShopManager.handleToppingOrder(toppingName);
    }
}

function submitOrder() {
    if (window.teaShopManager) {
        window.teaShopManager.submitOrder();
    }
}

function resetCustomer() {
    if (window.teaShopManager) {
        window.teaShopManager.resetCustomer();
    }
}

// 稻香村解锁相关函数
function confirmCatCompanion(goToRiceVillage = true) {
    const catName = document.getElementById('cat-companion-name').value.trim();
    const catType = document.querySelector('input[name="cat-type"]:checked').value;

    if (!catName) {
        alert('请为猫咪伙伴起一个名字！');
        return;
    }

    // 设置猫咪伙伴信息
    const riceVillageData = teaShopManager.core.gameData.riceVillage;
    const playerLevel = teaShopManager.core.gameData.player.level;

    riceVillageData.cat = {
        name: catName,
        type: catType,
        level: playerLevel,
        hp: catType === 'tank' ? 100 + (playerLevel - 1) * 20 : 100 + (playerLevel - 1) * 3,
        maxHp: catType === 'tank' ? 100 + (playerLevel - 1) * 20 : 100 + (playerLevel - 1) * 3,
        power: catType === 'tank' ? 10 + (playerLevel - 1) * 1 : 10 + (playerLevel - 1) * 5
    };

    // 标记已经起过名字
    riceVillageData.catNamed = true;

    teaShopManager.addDebugLog(`🐱 猫咪伙伴 ${catName} (${catType === 'tank' ? '坦克型' : '输出型'}) 加入了你的冒险！`);

    // 关闭弹窗
    document.getElementById('modal-container').innerHTML = '';

    // 更新稻香村按钮
    teaShopManager.updateRiceVillageButton();

    if (goToRiceVillage) {
        // 前往稻香村
        window.open('rice-village.html', '_blank');
    }
}

// 重复的方法已删除，使用上面的完整版本

// 其他UI函数已在上面实现

// 测试顾客系统功能
function testCustomerSystem() {
    console.log('🧪 开始测试顾客系统...');
    
    if (!window.teaShopManager) {
        console.error('❌ 茶铺管理器未找到');
        return;
    }
    
    const manager = window.teaShopManager;
    
    // 测试1：强制生成顾客
    console.log('📋 测试1：强制生成顾客');
    manager.generateNewCustomer();
    
    const customer = manager.core.gameData.teaShop.customer;
    
    if (!customer.active) {
        console.error('❌ 顾客生成失败');
        return;
    }
    
    console.log('✅ 顾客生成成功');
    console.log(`👤 顾客信息: ${customer.name} ${customer.isVIP ? '(VIP)' : '(普通)'}`);
    console.log(`🍵 要求茶饮: ${customer.teaChoice}`);
    console.log(`🧂 要求小料: ${customer.toppingChoice || '无'}`);
    console.log(`⏰ 耐心时间: ${customer.patience/1000}秒`);
    
    // 测试2：检查VIP概率
    console.log('\n📋 测试2：检查VIP概率（应该约为30%）');
    let vipCount = 0;
    const testCount = 100;
    
    for (let i = 0; i < testCount; i++) {
        manager.generateNewCustomer();
        if (manager.core.gameData.teaShop.customer.isVIP) {
            vipCount++;
        }
    }
    
    const vipRate = (vipCount / testCount) * 100;
    console.log(`🎯 生成${testCount}次顾客，VIP数量: ${vipCount} (${vipRate.toFixed(1)}%)`);
    
    if (vipRate >= 20 && vipRate <= 40) {
        console.log('✅ VIP概率测试通过（在合理范围内）');
    } else {
        console.log('❌ VIP概率测试可能有偏差（期望约30%）');
    }
    
    // 测试3：检查耐心时间
    console.log('\n📋 测试3：检查耐心时间（VIP 240秒，普通 120秒）');
    manager.generateNewCustomer();
    const currentCustomer = manager.core.gameData.teaShop.customer;
    const patience = currentCustomer.patience;
    const isVIP = currentCustomer.isVIP;
    const expectedPatience = isVIP ? 240000 : 120000;
    
    if (patience === expectedPatience) {
        console.log(`✅ 耐心时间测试通过: ${patience/1000}秒 (${isVIP ? 'VIP' : '普通'}顾客)`);
    } else {
        console.log(`❌ 耐心时间测试失败: ${patience/1000}秒 (期望${expectedPatience/1000}秒，${isVIP ? 'VIP' : '普通'}顾客)`);
    }
    
    console.log('\n🎉 顾客系统测试完成！');
    console.log('💡 提示：如果顾客仍然不显示，请检查HTML页面的customer-table元素是否存在');
    
    return {
        customerGenerated: customer.active,
        customerName: customer.name,
        isVIP: customer.isVIP,
        patience: customer.patience,
        vipRate: vipRate
    };
}

// 强制刷新顾客显示
function forceRefreshCustomer() {
    console.log('🔄 强制刷新顾客显示...');
    
    if (!window.teaShopManager) {
        console.error('❌ 茶铺管理器未找到');
        return;
    }
    
    const manager = window.teaShopManager;
    
    // 重置上次顾客时间，强制允许生成新顾客
    manager.core.gameData.teaShop.lastCustomerTime = 0;
    
    // 强制生成新顾客
    manager.generateNewCustomer();
    
    console.log('✅ 顾客显示已刷新');
}
