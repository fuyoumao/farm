/**
 * 扬州城管理器
 * 负责扬州城的所有游戏逻辑，包括NPC对话、任务系统、战斗系统等
 */

// 扬州城NPC名称常量
const YANGZHOU_NPC_NAMES = {
    YANGZHOU_DRIVER: '扬州车夫'
};

// 扬州城NPC配置
const YANGZHOU_NPC_CONFIGS = {
    '扬州车夫': {
        name: '扬州车夫',
        description: '负责运送旅客的车夫',
        maxQuestStage: 1,
        initialDialog: '欢迎来到扬州城！我是这里的车夫。',
        quests: [
            {
                id: 'yangzhou_welcome',
                name: '扬州城欢迎任务',
                description: '车夫的欢迎任务',
                type: 'talk',
                requirements: {},
                rewards: {
                    exp: 50,
                    gold: 20
                }
            }
        ]
    }
};

// 扬州城怪物配置
const YANGZHOU_MONSTER_CONFIGS = {
    '江贼': {
        name: '江贼',
        description: '在扬州城附近活动的水贼',
        drops: '银两、武器碎片',
        hp: 80,
        attack: 15,
        exp: 40,
        isActive: true
    }
};

// 扬州城植物配置
const YANGZHOU_PLANT_CONFIGS = {
    '茉莉花': {
        name: '茉莉花',
        description: '扬州特产的茉莉花',
        drops: '茉莉花',
        rarity: 'common'
    }
};

/**
 * 扬州城管理器类
 */
class YangzhouManager {
    constructor(core) {
        this.core = core;
        this.initialized = false;
        this.currentDialog = null;
    }

    /**
     * 初始化扬州城管理器
     */
    async initialize() {
        try {
            console.log('🏛️ 开始初始化扬州城管理器...');

            // 验证核心系统
            if (!this.core || !this.core.initialized) {
                throw new Error('核心系统未初始化');
            }

            // 初始化扬州城数据
            this.initializeYangzhouData();

            // 渲染界面
            this.renderAllTables();

            // 更新玩家状态显示
            this.updatePlayerStatus();

            // 启动定期更新
            this.startPeriodicUpdates();

            this.initialized = true;
            console.log('✅ 扬州城管理器初始化完成');

        } catch (error) {
            console.error('❌ 扬州城管理器初始化失败:', error);
            throw error;
        }
    }

    /**
     * 初始化扬州城数据
     */
    initializeYangzhouData() {
        const gameData = this.core.gameData;

        // 初始化扬州城数据结构
        if (!gameData.yangzhou) {
            gameData.yangzhou = {
                npcs: {},
                monsters: {},
                plants: {},
                questStages: {},
                killCounts: {},
                collectCounts: {}
            };
        }

        // 初始化NPC数据
        Object.keys(YANGZHOU_NPC_CONFIGS).forEach(npcName => {
            if (!gameData.yangzhou.npcs[npcName]) {
                gameData.yangzhou.npcs[npcName] = {
                    questStage: 0,
                    lastInteraction: null
                };
            }
        });

        console.log('✅ 扬州城数据初始化完成');
    }

    /**
     * 渲染所有表格
     */
    renderAllTables() {
        this.renderNPCsTable();
        this.renderMonstersTable();
        this.renderPlantsTable();
        this.updateQuestDisplay();
    }

    /**
     * 渲染NPC表格
     */
    renderNPCsTable() {
        const npcsContainer = document.getElementById('npcs-table');
        if (!npcsContainer) return;

        const gameData = this.core.gameData;
        let npcsHTML = '';

        Object.keys(YANGZHOU_NPC_CONFIGS).forEach(npcName => {
            const config = YANGZHOU_NPC_CONFIGS[npcName];
            const npcData = gameData.yangzhou.npcs[npcName] || { questStage: 0 };
            
            const status = npcData.questStage >= config.maxQuestStage ? '任务完成' : '可对话';
            
            npcsHTML += `
                <tr>
                    <td><strong>${npcName}</strong></td>
                    <td>${status}</td>
                    <td>${npcData.questStage}/${config.maxQuestStage}</td>
                    <td>
                        <button class="action-btn" onclick="talkToNPC('${npcName}')">对话</button>
                    </td>
                </tr>
            `;
        });

        npcsContainer.innerHTML = npcsHTML;
    }

    /**
     * 渲染怪物表格
     */
    renderMonstersTable() {
        const monstersContainer = document.getElementById('monsters-table');
        if (!monstersContainer) return;

        let monstersHTML = '';

        Object.keys(YANGZHOU_MONSTER_CONFIGS).forEach(monsterName => {
            const config = YANGZHOU_MONSTER_CONFIGS[monsterName];
            
            monstersHTML += `
                <tr data-monster="${monsterName}">
                    <td><strong>${monsterName}</strong></td>
                    <td>${config.description}</td>
                    <td>${config.drops}</td>
                    <td>
                        <div class="progress-bar" style="height: 16px;">
                            <div class="progress-fill" style="width: 100%; background-color: #9ca3af;"></div>
                            <div class="progress-text">${config.hp}/${config.hp}</div>
                        </div>
                    </td>
                    <td>
                        <button class="action-btn" onclick="attackMonster('${monsterName}')">攻击</button>
                    </td>
                </tr>
            `;
        });

        monstersContainer.innerHTML = monstersHTML;
    }

    /**
     * 渲染植物表格
     */
    renderPlantsTable() {
        const plantsContainer = document.getElementById('plants-table');
        if (!plantsContainer) return;

        let plantsHTML = '';

        Object.keys(YANGZHOU_PLANT_CONFIGS).forEach(plantName => {
            const config = YANGZHOU_PLANT_CONFIGS[plantName];
            const collectCounts = this.core.gameData.yangzhou.collectCounts || {};
            const ownedCount = collectCounts[plantName] || 0;

            plantsHTML += `
                <tr>
                    <td><strong>${plantName}</strong></td>
                    <td>${config.description}</td>
                    <td>${config.drops}</td>
                    <td>${ownedCount}</td>
                    <td>
                        <button class="action-btn" onclick="collectPlant('${plantName}')">采集</button>
                    </td>
                </tr>
            `;
        });

        plantsContainer.innerHTML = plantsHTML;
    }

    /**
     * 更新任务显示
     */
    updateQuestDisplay() {
        const questDisplay = document.getElementById('quest-display');
        if (!questDisplay) return;

        const activeQuests = this.core.gameData.quests.active || [];
        
        if (activeQuests.length === 0) {
            questDisplay.innerHTML = `
                <div class="quest-item">
                    <div class="quest-name">暂无任务</div>
                    <div class="quest-description">请与NPC对话接取任务</div>
                </div>
            `;
        } else {
            let questsHTML = '';
            activeQuests.forEach(quest => {
                questsHTML += `
                    <div class="quest-item">
                        <div class="quest-name">${quest.name}</div>
                        <div class="quest-description">${quest.description}</div>
                        <div class="quest-npc">来源: ${quest.npc}</div>
                    </div>
                `;
            });
            questDisplay.innerHTML = questsHTML;
        }
    }

    /**
     * 更新玩家状态显示
     */
    updatePlayerStatus() {
        const player = this.core.gameData.player;
        
        // 更新各个状态元素
        const elements = {
            'player-name': player.name || '未知',
            'player-gender': player.gender || '未知',
            'player-level': player.level || 1,
            'player-exp': player.exp || 0,
            'player-funds': player.funds || 0,
            'player-attack': player.attack || 5,
            'current-partner': this.getCurrentPartnerName()
        };

        Object.keys(elements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = elements[id];
            }
        });

        // 更新天气显示
        this.updateWeatherDisplay();
    }

    /**
     * 更新天气显示
     */
    updateWeatherDisplay() {
        // 更新天气显示
        const seasonElement = document.getElementById('yangzhou-season-text');
        if (seasonElement) {
            if (this.core.gameData.weather) {
                const weather = this.core.gameData.weather;
                seasonElement.textContent = `扬州城 · ${weather.currentSeason} · ${weather.currentWeather}`;
            } else {
                seasonElement.textContent = '扬州城 · 晴天';
            }
        }

        // 更新天数显示
        const dayElement = document.getElementById('yangzhou-day-number');
        if (dayElement) {
            if (this.core.gameData.weather) {
                dayElement.textContent = this.core.gameData.weather.currentDay || 1;
            } else {
                dayElement.textContent = 1;
            }
        }
    }

    /**
     * 获取当前伙伴名称
     */
    getCurrentPartnerName() {
        const partner = this.core.gameData.player.currentPartner;
        return partner ? partner.name : '无';
    }

    /**
     * 与NPC对话
     */
    talkToNPC(npcName) {
        console.log(`[Yangzhou] 💬 与 ${npcName} 对话`);
        
        const config = YANGZHOU_NPC_CONFIGS[npcName];
        if (!config) {
            console.error(`未找到NPC配置: ${npcName}`);
            return;
        }

        // 显示对话框
        this.showDialog(npcName, config.initialDialog);
    }

    /**
     * 显示对话框
     */
    showDialog(npcName, message) {
        const dialogBox = document.getElementById('dialog-box');
        const npcNameElement = document.getElementById('dialog-npc-name');
        const messagesElement = document.getElementById('dialog-messages');

        if (dialogBox && npcNameElement && messagesElement) {
            npcNameElement.textContent = npcName;
            messagesElement.innerHTML = `<div class="dialog-message">${message}</div>`;
            dialogBox.style.display = 'block';
            
            this.currentDialog = { npc: npcName, message: message };
        }
    }

    /**
     * 处理对话动作
     */
    handleDialogAction() {
        if (this.currentDialog) {
            // 关闭对话框
            document.getElementById('dialog-box').style.display = 'none';
            this.currentDialog = null;
        }
    }

    /**
     * 显示伙伴选择界面
     */
    showPartnerSelection() {
        alert('伙伴选择功能开发中...');
    }

    /**
     * 攻击怪物
     */
    attackMonster(monsterName) {
        console.log(`[Yangzhou] ⚔️ 攻击 ${monsterName}`);
        alert(`攻击${monsterName}功能开发中...`);
    }

    /**
     * 采集植物
     */
    collectPlant(plantName) {
        console.log(`[Yangzhou] 🌿 采集 ${plantName}`);
        alert(`采集${plantName}功能开发中...`);
    }

    /**
     * 启动定期更新
     */
    startPeriodicUpdates() {
        // 每秒更新一次显示
        setInterval(() => {
            if (this.initialized) {
                this.updatePlayerStatus();
            }
        }, 1000);

        console.log('✅ 扬州城定期更新已启动');
    }
}

// 导出到全局
window.YangzhouManager = YangzhouManager;
