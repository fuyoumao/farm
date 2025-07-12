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

// 扬州城怪物类型定义
const YANGZHOU_MONSTER_TYPES = {
    SMALL_PASSIVE: {
        hpRange: [30, 50],
        attackRange: [5, 5],
        expRange: [30, 50],
        isActive: false
    },
    MEDIUM_ACTIVE: {
        hpRange: [60, 150],
        attackRange: [8, 15],
        expRange: [50, 70],
        isActive: true
    },
    LARGE_ACTIVE: {
        hpRange: [120, 300],
        attackRange: [18, 40],
        expRange: [70, 90],
        isActive: true
    },
    BOSS_ACTIVE: {
        hpRange: [800, 1200],
        attackRange: [50, 80],
        expRange: [200, 400],
        isActive: true
    }
};

// 扬州城怪物配置
const YANGZHOU_MONSTER_CONFIGS = {
    // 再来镇
    '隐元会密探': {
        name: '隐元会密探',
        description: '神秘组织的探子，人形怪物',
        type: 'LARGE_ACTIVE',
        drops: ['密探令牌', '银两', '情报卷轴'],
        dropRates: [40, 30, 15]
    },

    // 紫薇岗
    '猛虎': {
        name: '猛虎',
        description: '凶猛的老虎，攻击力极强',
        type: 'LARGE_ACTIVE',
        drops: ['虎肉', '虎皮', '虎骨'],
        dropRates: [60, 30, 10]
    },

    // 野猪林
    '野狼': {
        name: '野狼',
        description: '野性的狼群，主动攻击',
        type: 'MEDIUM_ACTIVE',
        drops: ['狼肉', '狼皮'],
        dropRates: [70, 20]
    },
    '野猪': {
        name: '野猪',
        description: '强壮的野猪，力量惊人',
        type: 'LARGE_ACTIVE',
        drops: ['野猪肉', '野猪牙'],
        dropRates: [70, 20]
    },
    '壮年野狼': {
        name: '壮年野狼',
        description: '成年的强壮野狼，经验丰富',
        type: 'LARGE_ACTIVE',
        drops: ['优质狼肉', '狼王牙'],
        dropRates: [60, 15]
    },

    // 水田区
    '大闸蟹': {
        name: '大闸蟹',
        description: '水田中的大螃蟹，被动防御',
        type: 'SMALL_PASSIVE',
        drops: ['蟹肉', '蟹壳'],
        dropRates: [80, 20]
    },
    '水蛇': {
        name: '水蛇',
        description: '水中的毒蛇，主动攻击',
        type: 'MEDIUM_ACTIVE',
        drops: ['蛇肉', '蛇胆'],
        dropRates: [60, 15]
    },

    // 城南树林
    '野兔': {
        name: '野兔',
        description: '胆小的野兔，被动逃跑',
        type: 'SMALL_PASSIVE',
        drops: ['兔肉'],
        dropRates: [80]
    },
    '山鸡': {
        name: '山鸡',
        description: '山林中的野鸡，被动防御',
        type: 'SMALL_PASSIVE',
        drops: ['鸡肉', '鸡毛'],
        dropRates: [75, 25]
    },

    // 运河沿岸
    '水贼': {
        name: '水贼',
        description: '运河上的强盗，人形怪物',
        type: 'LARGE_ACTIVE',
        drops: ['银两', '破旧武器'],
        dropRates: [50, 30]
    },

    // 龙剑岭/虎剑岭
    '山贼': {
        name: '山贼',
        description: '山中的强盗，人形怪物',
        type: 'LARGE_ACTIVE',
        drops: ['钱袋', '破旧武器', '山贼肉'],
        dropRates: [50, 30, 40]
    },

    // 东篱寨
    '山寨喽啰': {
        name: '山寨喽啰',
        description: '山寨的小兵，人形怪物',
        type: 'LARGE_ACTIVE',
        drops: ['银两', '山贼肉'],
        dropRates: [40, 50]
    },
    '寨主护卫': {
        name: '寨主护卫',
        description: '山寨头目的护卫，人形怪物',
        type: 'LARGE_ACTIVE',
        drops: ['银两', '护卫令牌'],
        dropRates: [60, 20]
    },
    '山寨头目': {
        name: '山寨头目',
        description: '山寨的首领，BOSS级敌人',
        type: 'BOSS_ACTIVE',
        drops: ['头目宝箱钥匙', '大量银两', '烧烤架'],
        dropRates: [100, 80, 100]
    }
};

// 扬州城植物配置
const YANGZHOU_PLANT_CONFIGS = {
    // 制茶用植物（30秒刷新）
    '金银花': {
        name: '金银花',
        description: '清香的金银花，制茶原料',
        category: 'teaIngredients',
        isTeaShopPlant: true
    },
    '枸杞': {
        name: '枸杞',
        description: '滋补的枸杞，制茶原料',
        category: 'teaIngredients',
        isTeaShopPlant: true
    },
    '生姜': {
        name: '生姜',
        description: '辛辣的生姜，制茶原料',
        category: 'teaIngredients',
        isTeaShopPlant: true
    },
    '荷叶': {
        name: '荷叶',
        description: '清香的荷叶，制茶原料',
        category: 'teaIngredients',
        isTeaShopPlant: true
    },
    '稻米': {
        name: '稻米',
        description: '优质稻米，制茶原料',
        category: 'teaIngredients',
        isTeaShopPlant: true
    },
    '山楂': {
        name: '山楂',
        description: '酸甜山楂，制茶原料',
        category: 'teaIngredients',
        isTeaShopPlant: true
    },

    // 任务用植物（3秒刷新）
    '小葱': {
        name: '小葱',
        description: '新鲜小葱，调料用',
        category: 'questItems',
        isTeaShopPlant: false
    },
    '蘑菇': {
        name: '蘑菇',
        description: '野生蘑菇，任务用',
        category: 'questItems',
        isTeaShopPlant: false
    },
    '浆果': {
        name: '浆果',
        description: '野生浆果，任务用',
        category: 'questItems',
        isTeaShopPlant: false
    },
    '杨树': {
        name: '杨树',
        description: '高大杨树，可获得木材',
        category: 'questItems',
        isTeaShopPlant: false,
        drops: '木材'
    },
    '芦苇': {
        name: '芦苇',
        description: '水边芦苇，任务用',
        category: 'questItems',
        isTeaShopPlant: false
    },
    '芍药': {
        name: '芍药',
        description: '美丽芍药，药材用',
        category: 'questItems',
        isTeaShopPlant: false
    },
    '紫薇': {
        name: '紫薇',
        description: '紫薇花，装饰材料',
        category: 'questItems',
        isTeaShopPlant: false
    }
};

// 植物采集时间配置
const YANGZHOU_PLANT_TIMING = {
    GATHER_TIME: 8000,      // 统一采集时间8秒
    TASK_REFRESH: 3000,     // 任务用植物刷新3秒
    TEASHOP_REFRESH: 30000, // 茶馆用植物刷新30秒
    EXP_REWARD: 50          // 统一经验奖励50点
};

/**
 * 扬州城管理器类
 */
class YangzhouManager {
    constructor(core) {
        this.core = core;
        this.initialized = false;
        this.currentDialog = null;
        this.currentMapType = 'yangzhou-city'; // 'yangzhou-city' 或 'yangzhou-outer'
        this.currentLocation = null; // 当前选择的外城地点
        this.outerLocationData = this.initializeOuterLocationData();
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

            // 验证统一背包系统数据完整性
            this.validateUnifiedInventory();

            // 验证经验系统可用性
            this.validateExpSystem();

            // 设置背包事件监听器
            this.setupInventoryEventListeners();

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
     * 初始化外城地点数据
     */
    initializeOuterLocationData() {
        return {
            'zailai-town': {
                name: '再来镇',
                npcs: ['张六爷（杂货商人）', '王老虎（武器商人）', '徐伟', '阳宝哥', '阿诛', '林老板（林记烟花铺子）', '叶小天', '陆仁甲（凌雪阁探子）'],
                monsters: ['隐元会密探'],
                plants: ['荷叶']
            },
            'ziweigang': {
                name: '紫薇岗',
                npcs: ['隐居药师', '采药人'],
                monsters: ['猛虎'],
                plants: ['芍药', '紫薇']
            },
            'yezhuilin': {
                name: '野猪林',
                npcs: [],
                monsters: ['野狼', '野猪', '壮年野狼'],
                plants: ['小葱', '生姜']
            },
            'kuangchang': {
                name: '矿场',
                npcs: ['矿工头目', '矿工'],
                monsters: [],
                plants: ['蘑菇']
            },
            'shuitian': {
                name: '水田区',
                npcs: [],
                monsters: ['大闸蟹', '水蛇'],
                plants: ['稻米']
            },
            'chengnan-forest': {
                name: '城南树林',
                npcs: [],
                monsters: ['野兔', '山鸡', '壮年野狼'],
                plants: ['山楂', '浆果', '杨树', '金银花', '枸杞']
            },
            'yunhe-shore': {
                name: '运河沿岸',
                npcs: [],
                monsters: ['水贼'],
                plants: ['芦苇']
            },

            'longjianling': {
                name: '龙剑岭',
                npcs: [],
                monsters: ['山贼'],
                plants: []
            },
            'hujianling': {
                name: '虎剑岭',
                npcs: [],
                monsters: ['山贼'],
                plants: []
            },
            'donglizhai': {
                name: '东篱寨',
                npcs: ['被困商人'],
                monsters: ['山寨喽啰', '寨主护卫', '山寨头目'],
                plants: []
            },
            'dongli-dock': {
                name: '东篱寨码头',
                npcs: ['码头守卫', '船工'],
                monsters: [],
                plants: []
            },
            'yangzhou-city': {
                name: '扬州城',
                npcs: ['扬州车夫'],
                monsters: [],
                plants: []
            },
            'fenghuang-island': {
                name: '凤凰岛',
                npcs: ['凤凰岛守护者'],
                monsters: ['凤凰幻影', '岛屿守卫'],
                plants: ['凤凰草', '仙桃']
            }
        };
    }

    /**
     * 生成随机怪物数值
     */
    generateMonsterStats(monsterName) {
        const config = YANGZHOU_MONSTER_CONFIGS[monsterName];
        if (!config) return null;

        const type = YANGZHOU_MONSTER_TYPES[config.type];
        if (!type) return null;

        return {
            hp: this.randomInRange(type.hpRange[0], type.hpRange[1]),
            maxHp: this.randomInRange(type.hpRange[0], type.hpRange[1]),
            attack: this.randomInRange(type.attackRange[0], type.attackRange[1]),
            exp: this.randomInRange(type.expRange[0], type.expRange[1]),
            isActive: type.isActive
        };
    }

    /**
     * 获取植物采集配置 - 按照重建指导文档的植物分类系统
     */
    getPlantConfig(plantName) {
        const baseConfig = YANGZHOU_PLANT_CONFIGS[plantName];
        if (!baseConfig) return null;

        const isTeaShop = baseConfig.isTeaShopPlant;

        return {
            ...baseConfig,
            gatherTime: YANGZHOU_PLANT_TIMING.GATHER_TIME,
            refreshTime: isTeaShop ? YANGZHOU_PLANT_TIMING.TEASHOP_REFRESH : YANGZHOU_PLANT_TIMING.TASK_REFRESH,
            expReward: YANGZHOU_PLANT_TIMING.EXP_REWARD,
            isTeaShopPlant: isTeaShop,
            usage: isTeaShop ? '制茶原料' : '任务物品'
        };
    }

    /**
     * 生成范围内随机数
     */
    randomInRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * 验证统一背包系统 - 按照稻香村标准
     */
    validateUnifiedInventory() {
        // 检查统一背包系统是否可用
        if (this.core.inventorySystem) {
            console.log('📦 统一背包系统已可用 (通过核心系统)');

            // 验证背包数据完整性
            if (this.core.inventorySystem.validateInventoryData) {
                const isValid = this.core.inventorySystem.validateInventoryData();
                console.log(`📦 背包数据验证结果: ${isValid ? '正常' : '已修复'}`);
            }

            // 显示背包统计信息
            if (this.core.inventorySystem.getInventoryStats) {
                const stats = this.core.inventorySystem.getInventoryStats();
                console.log('📦 背包统计:', stats);
            }
        } else if (window.unifiedInventory) {
            console.log('📦 统一背包系统已可用 (通过全局变量)');

            // 验证背包数据完整性
            if (window.unifiedInventory.validateInventoryData) {
                const isValid = window.unifiedInventory.validateInventoryData();
                console.log(`📦 背包数据验证结果: ${isValid ? '正常' : '已修复'}`);
            }

            // 显示背包统计信息
            if (window.unifiedInventory.getInventoryStats) {
                const stats = window.unifiedInventory.getInventoryStats();
                console.log('📦 背包统计:', stats);
            }
        } else {
            console.warn('📦 统一背包系统未初始化，扬州城将无法正常添加物品');
        }
    }

    /**
     * 验证经验系统可用性 - 确保可以使用稻香村的经验系统
     */
    validateExpSystem() {
        if (window.riceVillageManager && window.riceVillageManager.gainExp) {
            console.log('📈 稻香村经验系统已可用，扬州城将使用完整的升级系统');

            // 验证关键函数是否存在
            const requiredFunctions = ['gainExp', 'getExpRequiredForLevel', 'upgradeCat'];
            const missingFunctions = requiredFunctions.filter(func =>
                typeof window.riceVillageManager[func] !== 'function'
            );

            if (missingFunctions.length > 0) {
                console.warn('⚠️ 稻香村经验系统缺少函数:', missingFunctions);
            } else {
                console.log('✅ 稻香村经验系统功能完整');
            }
        } else {
            console.warn('⚠️ 稻香村经验系统未可用，扬州城将使用备用经验系统');
        }
    }

    /**
     * 设置背包事件监听器 - 按照稻香村标准
     */
    setupInventoryEventListeners() {
        if (!this.core.inventorySystem) {
            console.error('❌ 统一背包系统未初始化，无法设置事件监听器');
            return;
        }

        // 监听物品添加事件
        this.core.inventorySystem.on('itemAdded', (data) => {
            console.log('📦 监听到物品添加:', data.itemName, 'x' + data.quantity);
            this.refreshInventoryDisplay();
        });

        // 监听物品移除事件
        this.core.inventorySystem.on('itemRemoved', (data) => {
            console.log('📦 监听到物品移除:', data.itemName, 'x' + data.quantity);
            this.refreshInventoryDisplay();
        });

        console.log('📦 扬州城背包事件监听器已设置');
    }

    /**
     * 刷新背包显示
     */
    refreshInventoryDisplay() {
        // 刷新植物表格显示（更新拥有数量）
        if (this.currentMapType === 'yangzhou-outer' && this.currentLocation) {
            this.renderOuterLocationTables(this.currentLocation);
        } else {
            this.renderPlantsTable();
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
                collectCounts: {},
                currentMonsterStats: {} // 存储当前怪物的随机数值
            };
        }

        // 确保 currentMonsterStats 存在
        if (!gameData.yangzhou.currentMonsterStats) {
            gameData.yangzhou.currentMonsterStats = {};
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

        // 初始化怪物随机数值
        Object.keys(YANGZHOU_MONSTER_CONFIGS).forEach(monsterName => {
            if (!gameData.yangzhou.currentMonsterStats[monsterName]) {
                gameData.yangzhou.currentMonsterStats[monsterName] = this.generateMonsterStats(monsterName);
            }
        });

        // 初始化植物数据
        if (!gameData.yangzhou.plants) {
            gameData.yangzhou.plants = {};
        }

        Object.keys(YANGZHOU_PLANT_CONFIGS).forEach(plantName => {
            if (!gameData.yangzhou.plants[plantName]) {
                gameData.yangzhou.plants[plantName] = {
                    available: true,
                    lastGatherTime: 0,
                    isGathering: false
                };
            }
        });

        console.log('✅ 扬州城数据初始化完成');
    }

    /**
     * 渲染所有表格
     */
    renderAllTables() {
        if (this.currentMapType === 'yangzhou-city') {
            this.renderNPCsTable();
            this.renderMonstersTable();
            this.renderPlantsTable();
        } else if (this.currentMapType === 'yangzhou-outer' && this.currentLocation) {
            this.renderOuterLocationTables(this.currentLocation);
        }
        this.updateQuestDisplay();
    }

    /**
     * 渲染外城地点表格
     */
    renderOuterLocationTables(locationId) {
        const locationData = this.outerLocationData[locationId];
        if (!locationData) return;

        // 更新标题
        document.getElementById('npc-section-title').textContent = `NPC状态 - ${locationData.name}`;
        document.getElementById('monster-section-title').textContent = `怪物状态 - ${locationData.name}`;
        document.getElementById('plant-section-title').textContent = `植物状态 - ${locationData.name}`;

        // 渲染NPC表格
        this.renderOuterNPCsTable(locationData.npcs);

        // 渲染怪物表格
        this.renderOuterMonstersTable(locationData.monsters);

        // 渲染植物表格
        this.renderOuterPlantsTable(locationData.plants);
    }

    /**
     * 渲染外城NPC表格
     */
    renderOuterNPCsTable(npcs) {
        const npcsContainer = document.getElementById('npcs-table');
        if (!npcsContainer) return;

        let npcsHTML = '';
        if (npcs.length > 0) {
            npcs.forEach(npcName => {
                npcsHTML += `
                    <tr>
                        <td><strong>${npcName}</strong></td>
                        <td>可对话</td>
                        <td>0/1</td>
                        <td>
                            <button class="action-btn" onclick="talkToNPC('${npcName}')">对话</button>
                        </td>
                    </tr>
                `;
            });
        } else {
            npcsHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #666;">该地点暂无NPC</td>
                </tr>
            `;
        }

        npcsContainer.innerHTML = npcsHTML;
    }

    /**
     * 渲染外城怪物表格
     */
    renderOuterMonstersTable(monsters) {
        const monstersContainer = document.getElementById('monsters-table');
        if (!monstersContainer) return;

        let monstersHTML = '';
        if (monsters.length > 0) {
            monsters.forEach(monsterName => {
                const config = YANGZHOU_MONSTER_CONFIGS[monsterName];

                if (!config) {
                    console.warn(`怪物配置缺失: ${monsterName}`);
                    return;
                }

                // 确保数据结构存在
                if (!this.core.gameData.yangzhou.currentMonsterStats) {
                    this.core.gameData.yangzhou.currentMonsterStats = {};
                }

                let stats = this.core.gameData.yangzhou.currentMonsterStats[monsterName];

                // 如果没有数值，生成新的
                if (!stats) {
                    stats = this.generateMonsterStats(monsterName);
                    this.core.gameData.yangzhou.currentMonsterStats[monsterName] = stats;
                }

                const dropsText = config.drops.join(', ');

                monstersHTML += `
                    <tr data-monster="${monsterName}">
                        <td><strong>${monsterName}</strong></td>
                        <td><small>${config.description}</small></td>
                        <td><small>${dropsText}</small></td>
                        <td id="monster-hp-${monsterName}">
                            <div class="progress-bar" style="height: 16px;">
                                <div class="progress-fill" style="width: ${stats.maxHp > 0 ? (stats.hp / stats.maxHp) * 100 : 0}%; background-color: #9ca3af;"></div>
                                <div class="progress-text">${stats.hp}/${stats.maxHp}</div>
                            </div>
                        </td>
                        <td>
                            <button class="action-btn" onclick="attackMonster('${monsterName}')">攻击</button>
                        </td>
                    </tr>
                `;
            });
        } else {
            monstersHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: #666;">该地点暂无怪物</td>
                </tr>
            `;
        }

        monstersContainer.innerHTML = monstersHTML;
    }

    /**
     * 渲染外城植物表格
     */
    renderOuterPlantsTable(plants) {
        const plantsContainer = document.getElementById('plants-table');
        if (!plantsContainer) return;

        let plantsHTML = '';
        if (plants.length > 0) {
            plants.forEach(plantName => {
                const config = YANGZHOU_PLANT_CONFIGS[plantName];

                if (!config) {
                    console.warn(`植物配置缺失: ${plantName}`);
                    return;
                }

                // 确保植物数据存在
                if (!this.core.gameData.yangzhou.plants) {
                    this.core.gameData.yangzhou.plants = {};
                }

                let plant = this.core.gameData.yangzhou.plants[plantName];
                if (!plant) {
                    plant = {
                        available: true,
                        lastGatherTime: 0,
                        isGathering: false
                    };
                    this.core.gameData.yangzhou.plants[plantName] = plant;
                }

                // 获取背包中的数量（按照稻香村标准）
                let ownedCount = 0;
                const dropItem = config.drops || plantName;
                if (this.core.inventorySystem) {
                    ownedCount = this.core.inventorySystem.getItemCount(dropItem) || 0;
                } else if (window.unifiedInventory) {
                    ownedCount = window.unifiedInventory.getItemCount(dropItem) || 0;
                }

                const buttonDisabled = (!plant.available || plant.isGathering) ? 'disabled' : '';
                const buttonText = plant.isGathering ? '采集中...' : '采集';

                plantsHTML += `
                    <tr data-plant="${plantName}">
                        <td><strong>${plantName}</strong></td>
                        <td><small>${config.description}</small></td>
                        <td><small>${config.drops || plantName}</small></td>
                        <td>${ownedCount}</td>
                        <td>
                            <button class="action-btn" onclick="gatherPlant('${plantName}')" ${buttonDisabled}>${buttonText}</button>
                        </td>
                    </tr>
                `;
            });
        } else {
            plantsHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: #666;">该地点暂无植物</td>
                </tr>
            `;
        }

        plantsContainer.innerHTML = plantsHTML;
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

            // 确保数据结构存在
            if (!this.core.gameData.yangzhou.currentMonsterStats) {
                this.core.gameData.yangzhou.currentMonsterStats = {};
            }

            let stats = this.core.gameData.yangzhou.currentMonsterStats[monsterName];

            // 如果没有数值，生成新的
            if (!stats) {
                stats = this.generateMonsterStats(monsterName);
                this.core.gameData.yangzhou.currentMonsterStats[monsterName] = stats;
            }

            const dropsText = config.drops.join(', ');

            monstersHTML += `
                <tr data-monster="${monsterName}">
                    <td><strong>${monsterName}</strong></td>
                    <td><small>${config.description}</small></td>
                    <td><small>${dropsText}</small></td>
                    <td id="monster-hp-${monsterName}">
                        <div class="progress-bar" style="height: 16px;">
                            <div class="progress-fill" style="width: ${stats.maxHp > 0 ? (stats.hp / stats.maxHp) * 100 : 0}%; background-color: #9ca3af;"></div>
                            <div class="progress-text">${stats.hp}/${stats.maxHp}</div>
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

            // 确保植物数据存在
            if (!this.core.gameData.yangzhou.plants) {
                this.core.gameData.yangzhou.plants = {};
            }

            let plant = this.core.gameData.yangzhou.plants[plantName];
            if (!plant) {
                plant = {
                    available: true,
                    lastGatherTime: 0,
                    isGathering: false
                };
                this.core.gameData.yangzhou.plants[plantName] = plant;
            }

            // 获取背包中的数量（按照稻香村标准）
            let ownedCount = 0;
            const dropItem = config.drops || plantName;
            if (this.core.inventorySystem) {
                ownedCount = this.core.inventorySystem.getItemCount(dropItem) || 0;
            } else if (window.unifiedInventory) {
                ownedCount = window.unifiedInventory.getItemCount(dropItem) || 0;
            }

            const buttonDisabled = (!plant.available || plant.isGathering) ? 'disabled' : '';
            const buttonText = plant.isGathering ? '采集中...' : '采集';

            plantsHTML += `
                <tr data-plant="${plantName}">
                    <td><strong>${plantName}</strong></td>
                    <td><small>${config.description}</small></td>
                    <td><small>${config.drops || plantName}</small></td>
                    <td>${ownedCount}</td>
                    <td>
                        <button class="action-btn" onclick="gatherPlant('${plantName}')" ${buttonDisabled}>${buttonText}</button>
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

        // 更新玩家状态元素
        const playerElements = {
            'player-name': player.name || '未知',
            'player-gender': player.gender || '未知',
            'player-level': player.level || 1,
            'player-exp': player.exp || 0,
            'player-funds': player.funds || 0,
            'player-attack': player.attack || 5
        };

        Object.keys(playerElements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = playerElements[id];
            }
        });

        // 更新血量显示（新的血量栏结构）
        const hpTextElement = document.getElementById('player-hp-text');
        if (hpTextElement) {
            const currentHp = player.hp || 100;
            const maxHp = player.stats?.maxHp || player.maxHp || 100;
            hpTextElement.textContent = `${currentHp}/${maxHp}`;
            console.log('🔍 扬州城更新血量显示:', `${currentHp}/${maxHp}`);
        }

        // 更新伙伴状态显示
        this.updatePartnerStatus();

        // 更新天气显示
        this.updateWeatherDisplay();
    }

    /**
     * 更新伙伴状态显示
     */
    updatePartnerStatus() {
        const partner = this.core.gameData.player.partner;

        if (partner && partner.name) {
            // 有伙伴时显示详细信息
            const partnerElements = {
                'partner-name': partner.name,
                'partner-type': `${partner.type}型`,
                'partner-level': `${partner.level}级`,
                'partner-hp': `${partner.hp}/${partner.maxHp}`,
                'partner-attack': partner.attack,
                'partner-status': '已选择'
            };

            Object.keys(partnerElements).forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = partnerElements[id];
                }
            });
        } else {
            // 无伙伴时显示默认信息
            const defaultElements = {
                'partner-name': '无',
                'partner-type': '-',
                'partner-level': '-',
                'partner-hp': '-',
                'partner-attack': '-',
                'partner-status': '未选择'
            };

            Object.keys(defaultElements).forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = defaultElements[id];
                }
            });
        }
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
        const partner = this.core.gameData.player.partner;
        if (partner && partner.name) {
            return `${partner.name} (${partner.type}型 ${partner.level}级)`;
        }
        return '无';
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
        console.log('🐱 扬州城伙伴选择');

        const player = this.core.gameData.player;
        const currentPartner = player.partner;

        if (!currentPartner) {
            this.showDialog('系统', '你还没有选择伙伴！\n\n请先在稻香村选择一只猫咪作为伙伴。', [
                { text: '确定', action: 'closeDialog' }
            ]);
            return;
        }

        // 显示当前伙伴信息
        const partnerInfo = `
            当前伙伴：${currentPartner.name}
            类型：${currentPartner.type}型
            等级：${currentPartner.level}级
            血量：${currentPartner.hp}/${currentPartner.maxHp}
            攻击力：${currentPartner.attack}

            伙伴会在战斗中协助你攻击敌人！
        `;

        this.showDialog('伙伴信息', partnerInfo, [
            { text: '确定', action: 'closeDialog' }
        ]);
    }

    /**
     * 攻击怪物 - 使用统一的8秒攻击流程
     */
    attackMonster(monsterName) {
        console.log(`[Yangzhou] ⚔️ 攻击 ${monsterName}`);

        const config = YANGZHOU_MONSTER_CONFIGS[monsterName];

        if (!config) {
            console.error(`未找到怪物配置: ${monsterName}`);
            return;
        }

        // 确保数据结构存在
        if (!this.core.gameData.yangzhou.currentMonsterStats) {
            this.core.gameData.yangzhou.currentMonsterStats = {};
        }

        let stats = this.core.gameData.yangzhou.currentMonsterStats[monsterName];

        // 如果没有数值，生成新的
        if (!stats) {
            stats = this.generateMonsterStats(monsterName);
            this.core.gameData.yangzhou.currentMonsterStats[monsterName] = stats;
        }

        // 检查怪物是否正在被攻击
        if (stats.isBeingAttacked) {
            console.log(`${monsterName} 正在被攻击中...`);
            return;
        }

        // 标记怪物正在被攻击
        stats.isBeingAttacked = true;
        stats.lastAttackTime = Date.now();

        // 显示8秒攻击进度条
        this.showUnifiedAttackProgress(monsterName);

        // 8秒后攻击完成
        setTimeout(() => {
            // 按照重建指导文档：主动攻击型怪物先手攻击玩家
            const type = YANGZHOU_MONSTER_TYPES[config.type];

            if (type.isActive && stats.hp > 0) {
                console.log(`⚔️ ${monsterName} 是主动攻击型，先手攻击玩家`);
                this.monsterAttackPlayer(monsterName, stats);
            }

            // 计算玩家+猫咪的总攻击力
            const player = this.core.gameData.player;
            const playerAttack = player.stats ? player.stats.power : (player.power || 5);
            const catAttack = player.partner?.attack || 0;
            const totalDamage = playerAttack + catAttack;

            console.log(`⚔️ 攻击计算: 玩家攻击${playerAttack} + 猫咪攻击${catAttack} = 总伤害${totalDamage}`);
            console.log(`🎯 ${monsterName} 受到${totalDamage}点伤害，血量从${stats.hp}变为${stats.hp - totalDamage}`);

            // 造成伤害
            stats.hp -= totalDamage;

            // 更新血量显示
            this.updateMonsterHP(monsterName, stats.hp, stats.maxHp);

            if (stats.hp <= 0) {
                // 怪物被击败
                stats.hp = 0;
                console.log(`💀 ${monsterName} 被击败！血量归零`);

                // 给予经验奖励 - 使用扬州城的随机经验值
                let expReward = stats.exp;

                // 验证经验值，如果无效则重新生成
                if (typeof expReward !== 'number' || isNaN(expReward) || expReward <= 0) {
                    console.warn(`🔧 扬州城怪物 ${monsterName} 经验值无效: ${expReward}，重新生成`);

                    // 重新生成怪物属性
                    const type = YANGZHOU_MONSTER_TYPES[config.type];
                    if (type && type.expRange) {
                        expReward = Math.floor(Math.random() * (type.expRange[1] - type.expRange[0] + 1)) + type.expRange[0];
                        stats.exp = expReward; // 更新怪物数据
                        console.log(`🔧 重新生成经验值: ${expReward}`);
                    } else {
                        expReward = 30; // 备用默认值
                        console.warn(`🔧 使用备用经验值: ${expReward}`);
                    }
                }

                this.gainExp(expReward);

                // 显示经验获得动画
                createFloatingText(`+${expReward}经验`, BATTLE_ANIMATION.EXP_COLOR, monsterName, 0);

                // 计算并显示掉落物品
                const drops = this.calculateMonsterDrops(monsterName, config);
                drops.forEach((dropItem, index) => {
                    // 使用统一背包系统添加物品（按照稻香村标准）
                    if (this.core.inventorySystem) {
                        this.core.inventorySystem.addItem(dropItem, 1);
                        console.log(`📦 统一背包添加掉落物品: ${dropItem}`);
                    } else if (window.unifiedInventory) {
                        window.unifiedInventory.addItem(dropItem, 1);
                        console.log(`📦 统一背包添加掉落物品: ${dropItem}`);
                    } else {
                        console.error('❌ 统一背包系统未初始化');
                    }

                    // 显示掉落动画，错开位置
                    createFloatingText(`+${dropItem}`, BATTLE_ANIMATION.DROP_COLOR, monsterName, index + 1);

                    console.log(`🎁 ${monsterName} 掉落: ${dropItem}`);
                });

                console.log(`💀 击败 ${monsterName}，获得 ${expReward} 经验${drops.length > 0 ? '，掉落: ' + drops.join(', ') : ''}`);

                // 3秒后复活并重新随机属性
                setTimeout(() => {
                    console.log(`🔄 ${monsterName} 开始复活`);

                    // 重新随机生成怪物属性
                    const newStats = this.generateMonsterStats(monsterName);
                    this.core.gameData.yangzhou.currentMonsterStats[monsterName] = newStats;

                    // 立即刷新血量条
                    this.updateMonsterHP(monsterName, newStats.hp, newStats.maxHp);

                    // 恢复攻击按钮
                    this.restoreUnifiedAttackButton(monsterName);

                    // 刷新怪物表格显示
                    if (this.currentMapType === 'yangzhou-outer' && this.currentLocation) {
                        this.renderOuterLocationTables(this.currentLocation);
                    } else {
                        this.renderMonstersTable();
                    }

                    console.log(`✅ ${monsterName} 复活完成，新属性:`, {
                        hp: `${newStats.hp}/${newStats.maxHp}`,
                        attack: newStats.attack,
                        exp: newStats.exp,
                        isActive: newStats.isActive
                    });
                }, 3000); // 3秒后复活

            } else {
                // 怪物未死亡，恢复攻击按钮
                stats.isBeingAttacked = false;
                this.restoreUnifiedAttackButton(monsterName);
            }

            // 保存数据
            this.core.saveGameData();

        }, 8000); // 8秒攻击时间
    }

    /**
     * 计算怪物掉落物品 - 统一掉落系统
     */
    calculateMonsterDrops(monsterName, config) {
        const drops = [];

        config.drops.forEach((item, index) => {
            const dropRate = config.dropRates[index] || 0;
            if (Math.random() * 100 < dropRate) {
                drops.push(item);
            }
        });

        return drops;
    }

    /**
     * 更新怪物血量显示 - 统一血量条系统
     */
    updateMonsterHP(monsterName, currentHp, maxHp) {
        const hpCellId = `monster-hp-${monsterName}`;
        const hpCell = document.getElementById(hpCellId);

        if (hpCell) {
            // 确保血量不显示负数
            const displayHp = Math.max(0, currentHp);
            const hpPercent = Math.max(0, (displayHp / maxHp) * 100);

            // 灰色进度条
            hpCell.innerHTML = `
                <div class="progress-bar" style="height: 16px;">
                    <div class="progress-fill" style="width: ${hpPercent}%; background-color: #9ca3af;"></div>
                    <div class="progress-text">${displayHp}/${maxHp}</div>
                </div>
            `;
        }
    }

    /**
     * 显示统一攻击进度条 - 8秒攻击进度
     */
    showUnifiedAttackProgress(monsterName) {
        // 找到怪物行的操作单元格
        const monsterRow = document.querySelector(`[data-monster="${monsterName}"]`);
        if (!monsterRow) {
            console.error(`找不到怪物行: ${monsterName}`);
            return;
        }

        const actionCell = monsterRow.cells[monsterRow.cells.length - 1];

        // 按照重建文档：使用独立的进度条ID确保唯一性
        const progressId = `unified-progress-${monsterName}`;

        // 显示攻击进度条（灰色，与其他进度条一致）
        actionCell.innerHTML = `
            <div class="progress-bar" style="width: 100px; height: 16px; background: #ddd; border-radius: 4px; overflow: hidden; position: relative;">
                <div class="progress-fill" id="${progressId}" style="width: 0%; height: 100%; background: #9ca3af; transition: width 0.1s;"></div>
                <div class="progress-text" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #333;">攻击中...</div>
            </div>
        `;

        // 启动独立的进度条动画（8秒）
        this.startUnifiedAttackAnimation(monsterName, progressId, 8000);
    }

    /**
     * 启动统一攻击动画 - 8秒进度条动画
     */
    startUnifiedAttackAnimation(monsterName, progressId, duration) {
        const progressFill = document.getElementById(progressId);
        const progressText = progressFill ? progressFill.nextElementSibling : null;

        if (!progressFill || !progressText) {
            console.error(`找不到进度条元素: ${progressId}`);
            return;
        }

        const startTime = Date.now();
        const interval = 100; // 每100ms更新一次

        const updateProgress = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min((elapsed / duration) * 100, 100);

            progressFill.style.width = `${progress}%`;
            progressText.textContent = `攻击中... ${Math.floor(progress)}%`;

            if (progress < 100) {
                setTimeout(updateProgress, interval);
            }
        };

        updateProgress();
    }

    /**
     * 恢复统一攻击按钮 - 攻击完成后恢复按钮
     */
    restoreUnifiedAttackButton(monsterName) {
        const monsterRow = document.querySelector(`[data-monster="${monsterName}"]`);
        if (!monsterRow) return;

        const actionCell = monsterRow.cells[monsterRow.cells.length - 1];

        // 恢复攻击按钮
        actionCell.innerHTML = `<button class="action-btn" onclick="attackMonster('${monsterName}')">攻击</button>`;

        console.log(`🔄 ${monsterName} 攻击按钮已恢复`);
    }

    /**
     * 给予经验 - 复用稻香村的统一经验系统
     */
    gainExp(expAmount) {
        console.log(`[Yangzhou] 📈 获得经验: ${expAmount}`);

        // 优先使用稻香村的完整经验系统（包含升级、猫咪升级等）
        if (window.riceVillageManager && window.riceVillageManager.gainExp) {
            console.log(`📈 使用稻香村经验系统处理 ${expAmount} 经验`);

            // 记录升级前的等级
            const player = this.core.gameData.player;
            const beforeLevel = player.level || 1;
            const beforeExp = player.exp || 0;

            // 调用稻香村的完整经验系统
            window.riceVillageManager.gainExp(expAmount);

            // 记录升级后的状态
            const afterLevel = player.level || 1;
            const afterExp = player.exp || 0;

            console.log(`📈 经验处理完成: ${beforeLevel}级(${beforeExp}经验) → ${afterLevel}级(${afterExp}经验)`);

            // 如果升级了，显示额外信息
            if (afterLevel > beforeLevel) {
                console.log(`🎉 在扬州城升级了！${beforeLevel}级 → ${afterLevel}级`);
            }
        } else {
            console.warn('⚠️ 稻香村经验系统未可用，使用备用方案');
            // 备用方案：简单经验累加（不包含升级逻辑）
            const player = this.core.gameData.player;
            player.exp = (player.exp || 0) + expAmount;
            console.log(`📈 备用方案：经验累加到 ${player.exp}`);
        }
    }

    /**
     * 获取当前经验系统状态
     */
    getExpSystemStatus() {
        const player = this.core.gameData.player;
        const currentLevel = player.level || 1;
        const currentExp = player.exp || 0;

        let status = {
            level: currentLevel,
            exp: currentExp,
            systemType: 'unknown',
            nextLevelExp: 0,
            expToNext: 0
        };

        if (window.riceVillageManager && window.riceVillageManager.getExpRequiredForLevel) {
            status.systemType = 'unified';
            status.nextLevelExp = window.riceVillageManager.getExpRequiredForLevel(currentLevel);
            status.expToNext = Math.max(0, status.nextLevelExp - currentExp);
        } else {
            status.systemType = 'backup';
            status.nextLevelExp = 50 + (currentLevel - 1) * 50; // 备用公式
            status.expToNext = Math.max(0, status.nextLevelExp - currentExp);
        }

        return status;
    }

    /**
     * 采集植物 - 使用统一的8秒采集流程
     */
    gatherPlant(plantName) {
        console.log(`[Yangzhou] 🌿 采集 ${plantName}`);

        // 初始化植物数据
        if (!this.core.gameData.yangzhou.plants) {
            this.core.gameData.yangzhou.plants = {};
        }

        const plants = this.core.gameData.yangzhou.plants;

        // 使用统一的植物配置系统
        const config = this.getPlantConfig(plantName);
        if (!config) {
            console.error(`未找到植物配置: ${plantName}`);
            return;
        }

        // 初始化植物状态
        if (!plants[plantName]) {
            plants[plantName] = {
                available: true,
                lastGatherTime: 0,
                isGathering: false
            };
        }

        const plant = plants[plantName];

        // 检查植物是否可采集
        if (!plant.available) {
            console.log(`${plantName}还在生长中，请稍候...`);
            return;
        }

        if (plant.isGathering) {
            console.log(`正在采集${plantName}中...`);
            return;
        }

        // 开始采集
        plant.isGathering = true;
        const now = Date.now();

        // 显示8秒采集进度条
        this.showPlantGatherProgress(plantName);

        // 8秒后采集完成
        setTimeout(() => {
            console.log(`🌿 采集 ${plantName} 完成`);

            // 给予经验奖励
            this.gainExp(config.expReward);

            // 显示经验获得动画
            createFloatingText(`+${config.expReward}经验`, BATTLE_ANIMATION.EXP_COLOR, plantName, 0);

            // 添加物品到背包（按照稻香村标准）
            const dropItem = config.drops || plantName;
            if (this.core.inventorySystem) {
                this.core.inventorySystem.addItem(dropItem, 1);
                console.log(`📦 统一背包添加植物: ${dropItem}`);
            } else if (window.unifiedInventory) {
                window.unifiedInventory.addItem(dropItem, 1);
                console.log(`📦 统一背包添加植物: ${dropItem}`);
            } else {
                console.error('❌ 统一背包系统未初始化');
            }

            console.log(`🌿 采集到${plantName}！获得${config.expReward}经验！`);

            // 设置植物不可用，开始刷新倒计时
            plant.available = false;
            plant.isGathering = false;
            plant.lastGatherTime = Date.now();

            this.startPlantRefresh(plantName, config.refreshTime);

            // 保存数据
            this.core.saveGameData();

            // 更新界面显示
            if (this.currentMapType === 'yangzhou-outer' && this.currentLocation) {
                this.renderOuterLocationTables(this.currentLocation);
            } else {
                this.renderPlantsTable();
            }

        }, config.gatherTime);
    }

    /**
     * 显示植物采集进度条
     */
    showPlantGatherProgress(plantName) {
        // 找到植物行的操作单元格
        const plantRow = document.querySelector(`[data-plant="${plantName}"]`);
        if (!plantRow) {
            console.error(`找不到植物行: ${plantName}`);
            return;
        }

        const actionCell = plantRow.cells[plantRow.cells.length - 1];
        const progressId = `plant-progress-${plantName}`;

        // 显示采集进度条
        actionCell.innerHTML = `
            <div class="progress-bar" style="width: 100px; height: 16px; background: #ddd; border-radius: 4px; overflow: hidden; position: relative;">
                <div class="progress-fill" id="${progressId}" style="width: 0%; height: 100%; background: #9ca3af; transition: width 0.1s;"></div>
                <div class="progress-text" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #333;">采集中...</div>
            </div>
        `;

        // 启动进度条动画（8秒）
        this.startPlantGatherAnimation(plantName, progressId, 8000);
    }

    /**
     * 启动植物采集动画
     */
    startPlantGatherAnimation(plantName, progressId, duration) {
        const progressFill = document.getElementById(progressId);
        const progressText = progressFill ? progressFill.nextElementSibling : null;

        if (!progressFill || !progressText) {
            console.error(`找不到进度条元素: ${progressId}`);
            return;
        }

        const startTime = Date.now();
        const interval = 100; // 每100ms更新一次

        const updateProgress = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min((elapsed / duration) * 100, 100);

            progressFill.style.width = `${progress}%`;
            progressText.textContent = `采集中... ${Math.floor(progress)}%`;

            if (progress < 100) {
                setTimeout(updateProgress, interval);
            }
        };

        updateProgress();
    }

    /**
     * 开始植物刷新倒计时
     */
    startPlantRefresh(plantName, refreshTime) {
        const plants = this.core.gameData.yangzhou.plants;
        const plant = plants[plantName];

        setTimeout(() => {
            plant.available = true;
            console.log(`🌱 ${plantName} 重新生长完成`);

            // 恢复采集按钮
            this.restorePlantGatherButton(plantName);

            // 更新界面显示
            if (this.currentMapType === 'yangzhou-outer' && this.currentLocation) {
                this.renderOuterLocationTables(this.currentLocation);
            } else {
                this.renderPlantsTable();
            }

            this.core.saveGameData();
        }, refreshTime);
    }

    /**
     * 恢复植物采集按钮
     */
    restorePlantGatherButton(plantName) {
        const plantRow = document.querySelector(`[data-plant="${plantName}"]`);
        if (!plantRow) return;

        const actionCell = plantRow.cells[plantRow.cells.length - 1];

        // 恢复采集按钮
        actionCell.innerHTML = `<button class="action-btn" onclick="gatherPlant('${plantName}')">采集</button>`;

        console.log(`🔄 ${plantName} 采集按钮已恢复`);
    }

    /**
     * 验证系统状态 - 按照稻香村标准
     */
    validateSystem() {
        if (!this.core || !this.core.initialized) {
            console.error('❌ 核心系统未初始化');
            return false;
        }

        if (!this.core.inventorySystem && !window.unifiedInventory) {
            console.error('❌ 统一背包系统未初始化');
            return false;
        }

        return true;
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

    /**
     * 调试：测试经验系统
     */
    debugTestExpSystem() {
        console.log('🧪 开始测试扬州城经验系统...');

        const beforeStatus = this.getExpSystemStatus();
        console.log('📊 测试前状态:', beforeStatus);

        // 测试给予50经验
        console.log('🧪 测试给予50经验...');
        this.gainExp(50);

        const afterStatus = this.getExpSystemStatus();
        console.log('📊 测试后状态:', afterStatus);

        // 显示测试结果
        const levelChanged = afterStatus.level !== beforeStatus.level;
        console.log(`🧪 测试结果: ${levelChanged ? '升级了！' : '未升级'}`);

        return {
            before: beforeStatus,
            after: afterStatus,
            levelChanged: levelChanged
        };
    }

    /**
     * 怪物攻击玩家 - 按照重建指导文档实现
     */
    monsterAttackPlayer(monsterName, monster) {
        const player = this.core.gameData.player;

        // 计算怪物攻击力
        const monsterAttack = monster.attack || 1;

        // 计算玩家防御力（装备加成）
        const playerDefense = player.stats?.defense || 0;

        // 计算实际伤害（最少1点伤害）
        const damage = Math.max(1, monsterAttack - playerDefense);

        console.log(`🔥 ${monsterName} 攻击玩家: 攻击力${monsterAttack} - 防御力${playerDefense} = 伤害${damage}`);

        // 扣除玩家血量
        const beforeHp = player.hp;
        player.hp = Math.max(0, player.hp - damage);

        console.log(`💔 玩家受到${damage}点伤害，血量从${beforeHp}变为${player.hp}`);

        // 显示伤害飘字（在玩家状态区域）
        this.showPlayerDamageFloatingText(`-${damage}血量`);

        // 更新玩家状态显示
        this.updatePlayerStatus();

        // 检查玩家是否死亡
        if (player.hp <= 0) {
            console.log('💀 玩家血量归零！');
            this.handlePlayerDeath();
        }

        // 保存数据
        this.core.saveGameData();
    }

    /**
     * 处理玩家死亡
     */
    handlePlayerDeath() {
        const player = this.core.gameData.player;

        console.log('💀 玩家死亡处理');

        // 复活玩家（恢复一半血量）
        const maxHp = player.stats?.maxHp || 100;
        player.hp = Math.floor(maxHp / 2);

        // 显示死亡提示
        this.showDialog('死亡提示', [
            '你被怪物击败了！',
            `血量恢复到 ${player.hp}/${maxHp}`,
            '小心应对主动攻击型怪物！'
        ], [
            { text: '继续游戏', action: () => this.closeDialog() }
        ]);

        console.log(`🔄 玩家复活，血量恢复到 ${player.hp}/${maxHp}`);

        // 更新显示
        this.updatePlayerStatus();
        this.core.saveGameData();
    }

    /**
     * 显示玩家伤害飘字
     */
    showPlayerDamageFloatingText(text) {
        // 找到玩家状态区域
        const playerStatusElement = document.getElementById('player-status') ||
                                   document.querySelector('.player-info') ||
                                   document.querySelector('.status-panel');

        if (!playerStatusElement) {
            console.warn('未找到玩家状态元素，无法显示飘字');
            return;
        }

        const rect = playerStatusElement.getBoundingClientRect();

        // 创建飘字元素
        const floatingText = document.createElement('div');
        floatingText.style.cssText = `
            position: fixed;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top + rect.height / 2}px;
            color: #ff4444;
            font-size: 18px;
            font-weight: bold;
            pointer-events: none;
            z-index: 9999;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            transform: translateX(-50%);
            transition: all 1500ms ease-out;
            background: rgba(255,68,68,0.2);
            padding: 6px 12px;
            border-radius: 6px;
            border: 2px solid #ff4444;
        `;
        floatingText.textContent = text;

        document.body.appendChild(floatingText);

        // 动画效果
        setTimeout(() => {
            floatingText.style.top = `${rect.top - 50}px`;
            floatingText.style.opacity = '0';
        }, 100);

        // 1.5秒后移除
        setTimeout(() => {
            if (floatingText.parentNode) {
                floatingText.parentNode.removeChild(floatingText);
            }
        }, 1600);
    }

    /**
     * 打坐恢复功能 - 20秒回满血
     */
    startMeditation() {
        const player = this.core.gameData.player;
        const maxHp = player.stats?.maxHp || player.maxHp || 100;

        // 检查是否已经满血
        if (player.hp >= maxHp) {
            this.showDialog('打坐恢复', [
                '你的血量已经满了！',
                '无需打坐恢复。'
            ], [
                { text: '确定', action: () => this.closeDialog() }
            ]);
            return;
        }

        // 检查是否正在打坐
        if (this.isMeditating) {
            console.log('⚠️ 已在打坐中，无法重复打坐');
            return;
        }

        console.log('🧘 开始打坐恢复...');
        this.isMeditating = true;

        // 显示打坐进度
        this.showMeditationProgress();

        // 20秒后恢复满血
        setTimeout(() => {
            const beforeHp = player.hp;
            player.hp = maxHp;

            console.log(`🧘 打坐完成！血量从 ${beforeHp} 恢复到 ${player.hp}`);

            // 显示恢复提示
            this.showPlayerHealFloatingText(`+${maxHp - beforeHp}血量`);

            // 更新显示
            this.updatePlayerStatus();
            this.core.saveGameData();

            // 重置打坐状态
            this.isMeditating = false;

            // 显示完成对话
            this.showDialog('打坐恢复', [
                '打坐完成！',
                `血量已恢复到满值: ${player.hp}/${maxHp}`
            ], [
                { text: '确定', action: () => this.closeDialog() }
            ]);

        }, 20000); // 20秒
    }

    /**
     * 显示打坐进度
     */
    showMeditationProgress() {
        // 创建进度条容器
        const progressContainer = document.createElement('div');
        progressContainer.id = 'meditation-progress';
        progressContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 10000;
            text-align: center;
            min-width: 300px;
        `;

        progressContainer.innerHTML = `
            <div style="margin-bottom: 15px;">🧘 正在打坐恢复...</div>
            <div style="background: #333; border-radius: 10px; overflow: hidden; margin-bottom: 10px;">
                <div id="meditation-bar" style="background: linear-gradient(90deg, #4CAF50, #8BC34A); height: 20px; width: 0%; transition: width 0.1s;"></div>
            </div>
            <div id="meditation-time">剩余时间: 20秒</div>
            <button onclick="cancelMeditationYangzhou()" style="margin-top: 10px; padding: 5px 15px; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer;">取消打坐</button>
        `;

        document.body.appendChild(progressContainer);

        // 进度动画
        let timeLeft = 20;
        const progressBar = document.getElementById('meditation-bar');
        const timeDisplay = document.getElementById('meditation-time');

        const updateProgress = () => {
            if (!this.isMeditating) {
                // 打坐被取消，移除进度条
                if (progressContainer.parentNode) {
                    progressContainer.parentNode.removeChild(progressContainer);
                }
                return;
            }

            const progress = ((20 - timeLeft) / 20) * 100;
            progressBar.style.width = progress + '%';
            timeDisplay.textContent = `剩余时间: ${timeLeft}秒`;

            timeLeft--;

            if (timeLeft >= 0) {
                setTimeout(updateProgress, 1000);
            } else {
                // 打坐完成，移除进度条
                if (progressContainer.parentNode) {
                    progressContainer.parentNode.removeChild(progressContainer);
                }
            }
        };

        updateProgress();
    }

    /**
     * 取消打坐
     */
    cancelMeditation() {
        if (this.isMeditating) {
            this.isMeditating = false;
            console.log('🧘 打坐被取消');

            // 移除进度条
            const progressContainer = document.getElementById('meditation-progress');
            if (progressContainer && progressContainer.parentNode) {
                progressContainer.parentNode.removeChild(progressContainer);
            }
        }
    }

    /**
     * 显示玩家治疗飘字
     */
    showPlayerHealFloatingText(text) {
        // 找到玩家状态区域
        const playerStatusElement = document.getElementById('player-status') ||
                                   document.querySelector('.player-info') ||
                                   document.querySelector('.status-panel');

        if (!playerStatusElement) {
            console.warn('未找到玩家状态元素，无法显示飘字');
            return;
        }

        const rect = playerStatusElement.getBoundingClientRect();

        // 创建飘字元素
        const floatingText = document.createElement('div');
        floatingText.style.cssText = `
            position: fixed;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top + rect.height / 2}px;
            color: #4CAF50;
            font-size: 18px;
            font-weight: bold;
            pointer-events: none;
            z-index: 9999;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            transform: translateX(-50%);
            transition: all 1500ms ease-out;
            background: rgba(76,175,80,0.2);
            padding: 6px 12px;
            border-radius: 6px;
            border: 2px solid #4CAF50;
        `;
        floatingText.textContent = text;

        document.body.appendChild(floatingText);

        // 动画效果
        setTimeout(() => {
            floatingText.style.top = `${rect.top - 50}px`;
            floatingText.style.opacity = '0';
        }, 100);

        // 1.5秒后移除
        setTimeout(() => {
            if (floatingText.parentNode) {
                floatingText.parentNode.removeChild(floatingText);
            }
        }, 1600);
    }

    /**
     * 打开杂货铺（血瓶商店）
     */
    openGroceryShop() {
        const player = this.core.gameData.player;
        const playerFunds = player.funds || 0;

        let shopHTML = `
            <div class="shop-window">
                <div class="shop-header">
                    <h3>🏪 扬州杂货铺</h3>
                    <div class="player-funds">💰 金币: ${playerFunds}</div>
                </div>
                <div class="shop-content">
                    <div class="shop-category">
                        <h4>恢复道具</h4>
                        <div class="items-grid">
        `;

        // 血瓶物品
        const healthPotion = {
            name: '血瓶',
            description: '恢复150点血量的神奇药水',
            price: 30,
            healAmount: 150
        };

        const canAffordPotion = playerFunds >= healthPotion.price;
        const buttonClass = canAffordPotion ? 'buy-btn' : 'buy-btn disabled';

        shopHTML += `
            <div class="shop-item">
                <div class="item-info">
                    <strong>${healthPotion.name}</strong>
                    <div class="item-stats">恢复: +${healthPotion.healAmount} 血量</div>
                    <div class="item-desc">${healthPotion.description}</div>
                    <div class="item-price">价格: ${healthPotion.price} 金币</div>
                </div>
                <button class="${buttonClass}" onclick="yangzhouManager.buyHealthPotion()" ${!canAffordPotion ? 'disabled' : ''}>
                    ${canAffordPotion ? '购买' : '金币不足'}
                </button>
            </div>
        `;

        shopHTML += `
                        </div>
                    </div>
                </div>
                <div class="shop-footer">
                    <button class="close-btn" onclick="yangzhouManager.closeGroceryShop()">关闭商店</button>
                </div>
            </div>
        `;

        this.showShopWindow(shopHTML);
    }

    /**
     * 购买血瓶
     */
    buyHealthPotion() {
        const player = this.core.gameData.player;
        const potionPrice = 30;

        // 检查金币是否足够
        if (player.funds < potionPrice) {
            alert('金币不足！需要30金币购买血瓶。');
            return;
        }

        // 扣除金币
        player.funds -= potionPrice;

        // 添加血瓶到背包
        if (this.core.inventorySystem) {
            this.core.inventorySystem.addItem('血瓶', 1);
            console.log('📦 血瓶已添加到背包');
        }

        console.log(`🛒 购买血瓶成功，花费${potionPrice}金币`);

        // 保存数据
        this.core.saveGameData();

        // 刷新商店界面
        this.openGroceryShop();

        // 更新玩家状态显示
        this.updatePlayerStatus();
    }

    /**
     * 关闭杂货铺
     */
    closeGroceryShop() {
        const shopWindow = document.getElementById('shop-window');
        if (shopWindow && shopWindow.parentNode) {
            shopWindow.parentNode.removeChild(shopWindow);
        }
    }

    /**
     * 显示商店窗口
     */
    showShopWindow(content) {
        // 移除现有的商店窗口
        const existingShop = document.getElementById('shop-window');
        if (existingShop && existingShop.parentNode) {
            existingShop.parentNode.removeChild(existingShop);
        }

        // 创建新的商店窗口
        const shopWindow = document.createElement('div');
        shopWindow.id = 'shop-window';
        shopWindow.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border: 2px solid #333;
            border-radius: 10px;
            z-index: 10000;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;

        shopWindow.innerHTML = content;
        document.body.appendChild(shopWindow);

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .shop-window { font-family: Arial, sans-serif; }
            .shop-header { background: #f0f0f0; padding: 15px; border-bottom: 1px solid #ddd; text-align: center; }
            .shop-header h3 { margin: 0; color: #333; }
            .player-funds { margin-top: 5px; font-weight: bold; color: #666; }
            .shop-content { padding: 20px; }
            .shop-category { margin-bottom: 20px; }
            .shop-category h4 { margin: 0 0 10px 0; color: #555; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            .items-grid { display: grid; gap: 15px; }
            .shop-item { border: 1px solid #ddd; border-radius: 8px; padding: 15px; background: #fafafa; }
            .item-info strong { color: #333; font-size: 16px; }
            .item-stats { color: #4CAF50; font-weight: bold; margin: 5px 0; }
            .item-desc { color: #666; font-size: 14px; margin: 5px 0; }
            .item-price { color: #ff9800; font-weight: bold; margin: 5px 0; }
            .buy-btn { background: #4CAF50; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; margin-top: 10px; }
            .buy-btn:hover { background: #45a049; }
            .buy-btn.disabled { background: #ccc; cursor: not-allowed; }
            .shop-footer { background: #f0f0f0; padding: 15px; border-top: 1px solid #ddd; text-align: center; }
            .close-btn { background: #f44336; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
            .close-btn:hover { background: #da190b; }
        `;
        document.head.appendChild(style);
    }

    /**
     * 使用血瓶
     */
    useHealthPotion() {
        const player = this.core.gameData.player;
        const maxHp = player.stats?.maxHp || player.maxHp || 100;

        // 检查是否已经满血
        if (player.hp >= maxHp) {
            alert('你的血量已经满了！无需使用血瓶。');
            return;
        }

        // 检查背包中是否有血瓶
        const inventory = this.core.inventorySystem.getAllItems();
        const potionCount = inventory.questItems?.['血瓶'] || 0;

        if (potionCount <= 0) {
            alert('背包中没有血瓶！请到杂货铺购买。');
            return;
        }

        // 使用血瓶
        const beforeHp = player.hp;
        const healAmount = 150;
        player.hp = Math.min(maxHp, player.hp + healAmount);
        const actualHeal = player.hp - beforeHp;

        // 从背包中移除血瓶
        this.core.inventorySystem.removeItem('血瓶', 1);

        console.log(`🧪 使用血瓶：血量从 ${beforeHp} 恢复到 ${player.hp}（+${actualHeal}）`);

        // 显示恢复飘字
        this.showPlayerHealFloatingText(`+${actualHeal}血量`);

        // 更新显示
        this.updatePlayerStatus();
        this.core.saveGameData();
    }
}

// 导出到全局
window.YangzhouManager = YangzhouManager;
