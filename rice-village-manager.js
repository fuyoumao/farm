// ===================================================================
// 🎮 稻香村管理器 v2.0 - 统一任务生命周期系统
// 
// 核心原则：只在玩家与NPC对话时判断任务完成
// 架构：分层设计，职责明确，易于维护
// ===================================================================

// ===== 第一区域：常量和配置 =====

const QUEST_TYPES = {
    KILL: 'kill',
    COLLECT: 'collect',
    PROVIDE_ITEM: 'provide_item'
};

// 怪物类型配置 - 按照重建指导文档的怪物分类系统
const MONSTER_TYPES = {
    SMALL_PASSIVE: {
        hpRange: [20, 30],
        attackRange: [1, 1],
        expRange: [5, 8],
        respawnTime: 3000,
        isActive: false // 被动攻击
    },
    MEDIUM_ACTIVE: {
        hpRange: [30, 100],
        attackRange: [5, 10],
        expRange: [10, 15],
        respawnTime: 3000,
        isActive: true // 主动攻击
    },
    LARGE_ACTIVE: {
        hpRange: [80, 200],
        attackRange: [10, 40],
        expRange: [18, 25],
        respawnTime: 3000,
        isActive: true // 主动攻击
    },
    BOSS_ACTIVE: {
        hpRange: [500, 800],
        attackRange: [40, 80],
        expRange: [50, 100],
        respawnTime: 3000,
        isActive: true // 主动攻击
    }
};

// 怪物配置 - 统一配置，按照重建指导文档
const MONSTER_CONFIGS = {
    '野兔': {
        name: '野兔',
        type: 'SMALL_PASSIVE',
        description: '温顺的小动物，不会主动攻击',
        drops: '兔肉(80%)'
    },
    '果子狸': {
        name: '果子狸',
        type: 'SMALL_PASSIVE',
        description: '灵活的小兽，性格温和',
        drops: '果子狸肉(70%)'
    },
    '野猪': {
        name: '野猪',
        type: 'MEDIUM_ACTIVE',
        description: '凶猛的野猪，会主动攻击',
        drops: '野猪肉(70%), 野猪牙(20%)'
    },
    '猴子': {
        name: '猴子',
        type: 'MEDIUM_ACTIVE',
        description: '机敏的猴子，会主动攻击',
        drops: '猴肉(60%)'
    },
    '山贼': {
        name: '山贼',
        type: 'LARGE_ACTIVE',
        description: '危险的敌人，极具攻击性',
        drops: '钱袋(50%), 破旧武器(30%)'
    },
    '可疑的山贼': {
        name: '可疑的山贼',
        type: 'LARGE_ACTIVE',
        description: '行为诡异的山贼，实力与普通山贼相当',
        drops: '钱袋(50%), 破旧武器(30%)'
    },
    '董虎': {
        name: '董虎',
        type: 'BOSS_ACTIVE',
        description: '山贼头目，董龙的弟弟，实力强悍',
        drops: '董虎战刀(100%), 钱袋(80%)',
        questRequired: true // 需要任务激活
    }
};

/**
 * 随机生成怪物属性 - 按照重建指导文档的怪物分类系统
 * @param {string} monsterName - 怪物名称
 * @returns {Object} 随机生成的怪物属性
 */
function generateMonsterStats(monsterName) {
    const config = MONSTER_CONFIGS[monsterName];
    if (!config) return null;

    const typeConfig = MONSTER_TYPES[config.type];
    if (!typeConfig) return null;

    // 在范围内随机生成属性
    const hp = Math.floor(Math.random() * (typeConfig.hpRange[1] - typeConfig.hpRange[0] + 1)) + typeConfig.hpRange[0];
    const attack = Math.floor(Math.random() * (typeConfig.attackRange[1] - typeConfig.attackRange[0] + 1)) + typeConfig.attackRange[0];
    const exp = Math.floor(Math.random() * (typeConfig.expRange[1] - typeConfig.expRange[0] + 1)) + typeConfig.expRange[0];

    return {
        hp: hp,
        maxHp: hp,
        attack: attack,
        exp: exp,
        isActive: typeConfig.isActive,
        respawnTime: typeConfig.respawnTime,
        description: config.description,
        drops: config.drops
    };
}

/**
 * 创建飘字动画 - 按照重建指导文档的战斗动画系统
 * @param {string} text - 显示文本
 * @param {string} color - 文字颜色
 * @param {string} targetName - 目标名称（怪物或植物），用于定位
 * @param {number} offsetIndex - 偏移索引，避免重叠
 */
function createFloatingText(text, color, targetName, offsetIndex = 0) {
    // 找到目标行的位置（先找怪物，再找植物）
    let targetRow = document.querySelector(`tr[data-monster="${targetName}"]`);
    if (!targetRow) {
        targetRow = document.querySelector(`tr[data-plant="${targetName}"]`);
    }
    if (!targetRow) return;

    const rect = targetRow.getBoundingClientRect();

    // 创建飘字元素
    const floatingText = document.createElement('div');
    floatingText.style.cssText = `
        position: fixed;
        left: ${rect.left + rect.width / 2}px;
        top: ${rect.top - (offsetIndex * BATTLE_ANIMATION.VERTICAL_OFFSET)}px;
        color: ${color};
        font-size: 16px;
        font-weight: bold;
        pointer-events: none;
        z-index: 9999;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        transform: translateX(-50%);
        transition: all ${BATTLE_ANIMATION.DURATION}ms ease-out;
        background: rgba(0,0,0,0.3);
        padding: 4px 8px;
        border-radius: 4px;
    `;
    floatingText.textContent = text;

    document.body.appendChild(floatingText);

    // 启动动画
    setTimeout(() => {
        floatingText.style.top = `${rect.top - 80 - (offsetIndex * BATTLE_ANIMATION.VERTICAL_OFFSET)}px`;
        floatingText.style.opacity = '0';
    }, 50);

    // 动画结束后移除元素
    setTimeout(() => {
        if (floatingText.parentNode) {
            floatingText.parentNode.removeChild(floatingText);
        }
    }, BATTLE_ANIMATION.DURATION);
}

/**
 * 计算怪物掉落物品 - 按照重建指导文档
 * @param {string} monsterName - 怪物名称
 * @returns {Array} 掉落的物品列表
 */
function calculateMonsterDrops(monsterName) {
    const config = MONSTER_CONFIGS[monsterName];
    if (!config || !config.drops) return [];

    const drops = [];
    const dropString = config.drops;

    // 解析掉落配置，如："兔肉(80%)"或"钱袋(50%), 破旧武器(30%)"
    const dropItems = dropString.split(',').map(item => item.trim());

    dropItems.forEach(item => {
        const match = item.match(/^(.+)\((\d+)%\)$/);
        if (match) {
            const itemName = match[1].trim();
            const dropRate = parseInt(match[2], 10);

            // 验证掉落率是有效数字
            if (!isNaN(dropRate) && dropRate >= 0 && dropRate <= 100) {
                // 随机判断是否掉落
                if (Math.random() * 100 < dropRate) {
                    drops.push(itemName);
                }
            } else {
                console.warn(`🔧 无效的掉落率: ${item} → 跳过`);
            }
        }
    });

    return drops;
}

/**
 * 判断植物是否为茶馆用植物 - 按照重建指导文档的植物分类系统
 * @param {string} plantName - 植物名称
 * @returns {boolean} 是否为茶馆用植物
 */
function isTeaShopPlant(plantName) {
    // 这里需要检查茶铺原料列表
    // 目前先硬编码，后续可以从茶铺系统动态获取
    const teaShopIngredients = [
        '山楂', '乌梅', '茶叶', '蜂蜜', '柠檬', '薄荷', '桂花', '玫瑰花'
        // 后续新地图NPC给出新配方时，这个列表会自动扩展
    ];

    return teaShopIngredients.includes(plantName);
}

/**
 * 获取植物采集配置 - 按照重建指导文档的植物分类系统
 * @param {string} plantName - 植物名称
 * @returns {Object} 植物配置信息
 */
function getPlantConfig(plantName) {
    const baseConfig = PLANT_CONFIGS[plantName];
    if (!baseConfig) return null;

    const isTeaShop = isTeaShopPlant(plantName);

    return {
        ...baseConfig,
        gatherTime: PLANT_TIMING.GATHER_TIME,
        refreshTime: isTeaShop ? PLANT_TIMING.TEASHOP_REFRESH : PLANT_TIMING.TASK_REFRESH,
        expReward: PLANT_TIMING.EXP_REWARD,
        isTeaShopPlant: isTeaShop,
        usage: isTeaShop ? '制茶原料' : '任务物品'
    };
}

const NPC_NAMES = {
    LIU_DAHAI: '刘大海',
    LIU_YANG: '刘洋',
    WANG_POPO: '王婆婆',
    SHAOXIA: '少侠',
    LI_FU: '李复',
    CHEN_YUE: '陈月',
    WANG_FU: '王富',
    QIU_YE_QING: '秋叶青',
    WEAPON_SHOP_OWNER: '武器铺老板'
};

const ERROR_MESSAGES = {
    SYSTEM_NOT_INITIALIZED: '系统未初始化',
    INVALID_NPC: '无效的NPC名称',
    QUEST_NOT_FOUND: '任务未找到'
};

// 战斗动画配置 - 按照重建指导文档
const BATTLE_ANIMATION = {
    DURATION: 2000,        // 动画持续时间2秒
    VERTICAL_OFFSET: 30,   // 垂直间隔30px
    EXP_COLOR: '#22c55e',  // 经验动画绿色
    DROP_COLOR: '#eab308'  // 掉落动画黄色
};

// 植物配置 - 统一配置，按照重建指导文档的植物分类系统
const PLANT_CONFIGS = {
    '止血草': {
        name: '止血草',
        description: '常见的药草，用于任务',
        category: 'teaIngredients'
    },
    '野菜': {
        name: '野菜',
        description: '山野蔬菜，用于任务',
        category: 'teaIngredients'
    },
    '山楂木': {
        name: '山楂木',
        description: '坚硬的木材，用于任务',
        category: 'teaIngredients'
    },
    '野花': {
        name: '野花',
        description: '美丽的野花，用于任务',
        category: 'questItems'
    },
    '山楂': {
        name: '山楂',
        description: '红色的小果，制茶原料',
        category: 'teaIngredients'
    },
    '乌梅': {
        name: '乌梅',
        description: '酸甜的果实，制茶原料',
        category: 'teaIngredients'
    }
};

// 植物采集时间配置 - 按照你的规定
const PLANT_TIMING = {
    GATHER_TIME: 8000,      // 统一采集时间8秒
    TASK_REFRESH: 3000,     // 任务用植物刷新3秒
    TEASHOP_REFRESH: 30000, // 茶馆用植物刷新30秒（山楂、乌梅等）
    EXP_REWARD: 2           // 统一经验奖励2点
};

// ===== 第二区域：类定义和初始化 =====

/**
 * 稻香村管理器类
 * @since v2.0 - 统一任务生命周期系统
 */
function RiceVillageManager(core) {
    this.core = core;
    this.currentDialogNPC = null;
    this.initialized = false;
}

/**
 * 初始化稻香村管理器
 * @returns {boolean} 初始化是否成功
 */
RiceVillageManager.prototype.initialize = function() {
    try {
        if (!this.core || !this.core.initialized) {
            console.error('[RiceVillage] 统一核心系统未初始化');
            return false;
        }

        // 初始化稻香村数据结构
        this._initializeRiceVillageData();

        // 验证统一背包系统数据完整性
        this._validateUnifiedInventory();

        // 初始化界面
        this._initializeUI();
        
        this.initialized = true;
        this.addDebugLog('🎮 稻香村管理器初始化完成');
        return true;

    } catch (error) {
        console.error('[RiceVillage] 初始化失败:', error);
        return false;
    }
};

/**
 * 验证统一背包系统
 * @private
 */
RiceVillageManager.prototype._validateUnifiedInventory = function() {
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
        console.warn('📦 统一背包系统未初始化，稻香村将无法正常添加物品');
    }
};

/**
 * 初始化稻香村数据结构
 * @private
 */
RiceVillageManager.prototype._initializeRiceVillageData = function() {
    const gameData = this.core.gameData;
    
    // 确保稻香村数据结构存在
    if (!gameData.riceVillage) {
        gameData.riceVillage = {};
    }
    
    // 初始化NPC数据
    if (!gameData.riceVillage.npcs) {
        gameData.riceVillage.npcs = {
            [NPC_NAMES.LIU_DAHAI]: { questStage: 0 },
            [NPC_NAMES.LIU_YANG]: { questStage: 0 },
            [NPC_NAMES.WANG_POPO]: { questStage: 0 },
            [NPC_NAMES.SHAOXIA]: { questStage: 0 },
            [NPC_NAMES.LI_FU]: { questStage: 0 },
            [NPC_NAMES.CHEN_YUE]: { questStage: 0 },
            [NPC_NAMES.QIU_YE_QING]: { questStage: 0 },
            [NPC_NAMES.WEAPON_SHOP_OWNER]: { questStage: 0 }
        };
    }
    
    // 兼容性检查：确保武器铺老板存在（为老存档添加）
    if (!gameData.riceVillage.npcs[NPC_NAMES.WEAPON_SHOP_OWNER]) {
        gameData.riceVillage.npcs[NPC_NAMES.WEAPON_SHOP_OWNER] = { questStage: 0 };
        console.log('🔧 兼容性更新：为老存档添加武器铺老板NPC');
    }
    
    // 初始化击杀计数
    if (!gameData.riceVillage.killCounts) {
        gameData.riceVillage.killCounts = {};
    }
    
    // 初始化任务数据
    if (!gameData.quests) {
        gameData.quests = {
            active: [],
            completed: [],
            progress: {} // 任务进度跟踪
        };
    }

    // 确保任务进度数据存在
    if (!gameData.quests.progress) {
        gameData.quests.progress = {};
    }
    
    // 初始化玩家角色数据
    if (!gameData.player.name) {
        gameData.player.characterCreated = false;
    } else {
        gameData.player.characterCreated = true;
    }
    
    // 初始化伙伴数据
    if (!gameData.player.partner) {
        gameData.player.partner = null;
    }
};

/**
 * 初始化界面
 * @private
 */
RiceVillageManager.prototype._initializeUI = function() {
    // 初始化时只做基础的界面设置，不调用需要系统验证的函数
    // 延迟渲染，确保系统完全初始化后再渲染
    setTimeout(() => {
        if (this.initialized) {
            this.renderNPCsTable();
            this.renderMonstersTable();
            this.renderPlantsTable();
            this.updateQuestDisplay();
            this.updatePlayerStatus();
            this.updatePlayerStats(); // 确保装备属性在初始化时正确应用
            
            // 检查是否已解锁扬州地图，如果是则显示按钮
            const gameData = this.core.gameData;
            if (gameData.unlockedMaps && gameData.unlockedMaps.includes('扬州')) {
                this.showYangzhouMapButton();
                console.log('🗺️ 检测到扬州已解锁，显示地图按钮');
            }
            
            // 旧的背包显示函数调用已删除，现在使用统一背包系统
        }
    }, 100);
};

/**
 * 系统验证
 * @returns {boolean} 系统是否可用
 * @private
 */
RiceVillageManager.prototype._validateSystem = function() {
    if (!this.core || !this.core.initialized || !this.initialized) {
        console.error('[RiceVillage] 系统未初始化');
        return false;
    }
    return true;
};

/**
 * 添加调试日志
 * @param {string} message - 日志消息
 */
RiceVillageManager.prototype.addDebugLog = function(message) {
    if (this.core && this.core.addDebugLog) {
        this.core.addDebugLog(message);
    } else {
        console.log('[RiceVillage]', message);
    }
};

// ===== 第三区域：角色创建和伙伴系统 =====

/**
 * 显示角色创建界面
 * @important 只在第一次与刘大海对话时调用
 */
RiceVillageManager.prototype.showCharacterCreation = function() {
    if (!this._validateSystem()) return;
    
    const player = this.core.gameData.player;
    if (player.characterCreated) {
        return; // 角色已创建
    }
    
    // 创建角色创建模态窗口
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>🎭 角色创建</h3>
            <div class="modal-body">
                <div class="form-group">
                    <label>请输入你的姓名：</label>
                    <input type="text" id="character-name" maxlength="10" placeholder="输入姓名">
                </div>
                <div class="form-group">
                    <label>选择性别：</label>
                    <select id="character-gender">
                        <option value="male">男</option>
                        <option value="female">女</option>
                    </select>
                </div>
            </div>
            <div class="modal-buttons">
                <button onclick="riceVillageManager.createCharacter()">确认创建</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.getElementById('character-name').focus();
};

/**
 * 创建角色
 */
RiceVillageManager.prototype.createCharacter = function() {
    const nameInput = document.getElementById('character-name');
    const genderSelect = document.getElementById('character-gender');
    
    if (!nameInput || !genderSelect) return;
    
    const name = nameInput.value.trim();
    const gender = genderSelect.value;
    
    if (!name) {
        alert('请输入姓名！');
        return;
    }
    
    // 保存角色数据
    const player = this.core.gameData.player;
    player.name = name;
    player.gender = gender; // 保存英文性别，与NPC对话判断一致
    player.characterCreated = true;

    // 确保新角色的基础数据正确
    player.level = 1;      // 新角色等级为1
    player.exp = 0;        // 新角色经验为0
    player.hp = 100;       // 新角色血量
    player.maxHp = 100;
    player.stamina = 100;  // 新角色体力
    player.maxStamina = 100;
    player.power = 5;      // 新角色攻击力
    
    // 🔧 确保stats系统正确初始化
    if (!player.stats) {
        player.stats = {
            hp: 100,
            maxHp: 100,
            stamina: 100,
            maxStamina: 100,
            power: 5,
            basePower: 5
        };
    }

    if (!player.funds) {
        player.funds = 1000; // 如果没有金币，给予初始金币
    }

    console.log('🎭 角色创建数据:', {
        name: player.name,
        gender: player.gender,
        characterCreated: player.characterCreated,
        level: player.level
    });

    // 关闭模态窗口
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }

    // 保存数据
    this.core.saveGameData();

    // 确保属性正确计算（包含升级加成）
    this.updatePlayerStats();
    
    // 立即更新界面显示
    this.updatePlayerStatus();

    this.addDebugLog(`🎭 角色创建完成: ${name} (${player.gender === 'male' ? '男' : '女'})`);

    // 继续刘大海的对话
    this.handleLiuDaHaiDialog();
};

/**
 * 显示伙伴选择界面
 * @important 按照重建指导文档：第三区域 - 角色创建和伙伴系统
 */
RiceVillageManager.prototype.showPartnerSelection = function() {
    if (!this._validateSystem()) return;

    console.log('🐱 开始伙伴选择流程...');

    const availableCats = this.getAvailableCats();

    console.log('🐱 可选择的猫咪数量:', availableCats.length);

    if (availableCats.length === 0) {
        this.showDialog('系统', '没有符合条件的猫咪伙伴！\n\n条件：茶铺猫咪有名字且亲密度达到3000以上\n\n请先在茶铺培养猫咪的亲密度。', [
            { text: '确定', action: 'closeDialog' }
        ]);
        return;
    }

    // 按照重建指导文档：创建伙伴选择模态窗口
    let catsHTML = '';
    availableCats.forEach(cat => {
        catsHTML += `
            <div style="margin-bottom: 12px; padding: 10px; border: 1px solid #ddd; background: #f9f9f9;">
                <div style="font-weight: bold; margin-bottom: 5px;">${cat.avatar} ${cat.name}</div>
                <div style="font-size: 11px; color: #666; margin-bottom: 8px;">亲密度: ${cat.intimacy}</div>
                <div style="display: flex; gap: 8px;">
                    <button class="action-btn" onclick="riceVillageManager.selectPartner('${cat.id}', 'Tank')" style="font-size: 11px;">
                        Tank型 (+20血量/级)
                    </button>
                    <button class="action-btn" onclick="riceVillageManager.selectPartner('${cat.id}', 'Damage')" style="font-size: 11px;">
                        Damage型 (+5攻击/级)
                    </button>
                </div>
            </div>
        `;
    });

    console.log('🐱 创建伙伴选择模态窗口...');
    console.log('🐱 猫咪HTML:', catsHTML);

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="width: 400px;">
            <h3>🐱 选择伙伴</h3>
            <div style="margin-bottom: 15px; color: #666; font-size: 12px;">
                选择一只猫咪作为你的冒险伙伴：<br>
                <small>Tank型：+20血量，+1攻击力/级 | Damage型：+3血量，+5攻击力/级</small>
            </div>
            <div class="cats-list">
                ${catsHTML}
            </div>
            <div class="modal-buttons">
                <button onclick="document.querySelector('.modal-overlay').remove()">取消</button>
            </div>
        </div>
    `;

    console.log('🐱 添加模态窗口到页面...');
    document.body.appendChild(modal);

    console.log('🐱 模态窗口已添加，检查显示状态...');
    console.log('🐱 模态窗口元素:', modal);
    console.log('🐱 模态窗口样式:', window.getComputedStyle(modal));
};

/**
 * 获取可选择的猫咪列表
 * @returns {Array} 符合条件的猫咪列表
 * @important 按照重建指导文档：与茶铺数据集成
 */
RiceVillageManager.prototype.getAvailableCats = function() {
    // 按照重建指导文档：从统一核心系统获取茶铺数据
    const gameData = this.core.gameData;

    // 按照调试结果：数据在 gameData.teaShop.cats
    const catsData = gameData.teaShop?.cats;

    console.log('🐱 从 teaShop.cats 读取猫咪数据:', catsData);

    if (!catsData) {
        console.log('🐱 没有找到 teaShop.cats 数据');
        return [];
    }

    // 茶铺的猫咪名单
    const catNames = ['大橘猫', '狸花猫', '黑猫小手套', '小白猫', '大猫猫'];
    const availableCats = [];

    catNames.forEach(catName => {
        // 按照调试结果：亲密度在 catsData.intimacy[catName]
        const intimacy = catsData.intimacy?.[catName] || 0;

        console.log(`🐱 检查猫咪 ${catName}: 亲密度=${intimacy}`);

        if (intimacy >= 3000) {
            // 检查是否有自定义名字
            const customName = catsData.customNames?.[catName];
            const displayName = customName || catName;

            availableCats.push({
                id: catName,
                name: displayName,
                originalName: catName,
                intimacy: intimacy,
                avatar: '🐱' // 使用统一头像
            });
            console.log(`🐱 ✅ ${catName} (${displayName}) 符合条件 (亲密度: ${intimacy})`);
        } else {
            console.log(`🐱 ❌ ${catName} 不符合条件 (亲密度: ${intimacy}, 需要: 3000)`);
        }
    });

    console.log('🐱 最终可选择的猫咪:', availableCats);
    return availableCats;
};

/**
 * 选择伙伴
 * @param {string} catId - 猫咪ID
 * @param {string} type - 伙伴类型 (Tank/Damage)
 * @important 按照重建指导文档：第三区域 - 角色创建和伙伴系统
 */
RiceVillageManager.prototype.selectPartner = function(catId, type) {
    const availableCats = this.getAvailableCats();
    const selectedCat = availableCats.find(cat => cat.id === catId);

    console.log('🐱 选择伙伴:', { catId, type, selectedCat });

    if (!selectedCat) {
        this.showDialog('系统', '猫咪不存在！请重新选择。', [
            { text: '确定', action: 'closeDialog' }
        ]);
        return;
    }

    // 按照重建指导文档：随机血量100-300，攻击力10-30
    const randomHp = Math.floor(Math.random() * 201) + 100; // 100-300
    const randomAttack = Math.floor(Math.random() * 21) + 10; // 10-30

    console.log('🐱 生成随机属性:', { randomHp, randomAttack });

    // 按照重建指导文档：计算类型加成
    let hp = randomHp;
    let attack = randomAttack;

    if (type === 'Tank') {
        hp += 20;  // Tank型：+20血量
        attack += 1; // Tank型：+1攻击/级
        console.log('🐱 Tank型加成: +20血量, +1攻击');
    } else if (type === 'Damage') {
        hp += 3;   // Damage型：+3血量
        attack += 5; // Damage型：+5攻击/级
        console.log('🐱 Damage型加成: +3血量, +5攻击');
    }

    console.log('🐱 最终属性:', { hp, attack });

    // 保存伙伴数据到player.partner
    this.core.gameData.player.partner = {
        catId: catId,
        name: selectedCat.name,
        type: type,
        level: this.core.gameData.player.level || 1,
        hp: hp,
        maxHp: hp,
        attack: attack,
        isInjured: false
    };

    // 关闭模态窗口
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }

    // 保存数据
    this.core.saveGameData();

    // 确保属性正确计算（包含升级加成）
    this.updatePlayerStats();
    
    // 更新界面显示
    this.updatePlayerStatus();

    this.addDebugLog(`🐱 选择伙伴: ${selectedCat.name} (${type}型) HP:${hp} 攻击:${attack}`);

    // 使用对话窗体显示成功信息
    this.showDialog('系统', `成功选择伙伴：${selectedCat.name} (${type}型)\n\n血量: ${hp}\n攻击力: ${attack}\n\n现在可以与伙伴一起冒险了！`, [
        { text: '确定', action: 'closeDialog' }
    ]);
};

// ===== 第七区域：独立背包系统 =====

/**
 * 创建悬浮背包面板
 * @important 按照重建指导文档：独立背包系统，悬浮面板形式
 */
RiceVillageManager.prototype.createInventoryPanel = function() {
    if (!this._validateSystem()) return null;

    // 创建悬浮面板
    const panel = document.createElement('div');
    panel.id = 'inventory-panel';
    panel.className = 'floating-panel';
    panel.style.cssText = `
        position: fixed;
        right: 20px;
        bottom: 20px;
        width: 350px;
        max-height: 500px;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        resize: both;
        overflow: hidden;
    `;

    panel.innerHTML = `
        <style>
            #inventory-content::-webkit-scrollbar {
                width: 8px;
            }
            #inventory-content::-webkit-scrollbar-track {
                background: #f3f4f6;
                border-radius: 4px;
            }
            #inventory-content::-webkit-scrollbar-thumb {
                background: #9ca3af;
                border-radius: 4px;
            }
            #inventory-content::-webkit-scrollbar-thumb:hover {
                background: #6b7280;
            }
        </style>
        <div style="padding: 8px 12px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; cursor: move;" id="inventory-header">
            <span style="font-weight: bold; font-size: 12px;">📦 背包</span>
            <button onclick="riceVillageManager.closeInventory()" style="background: none; border: none; font-size: 16px; cursor: pointer; color: #6b7280;">×</button>
        </div>
        <div style="padding: 8px;">
            <div id="inventory-tabs" style="display: flex; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb;">
                <button class="inventory-tab active" onclick="riceVillageManager.showInventoryTab('teaIngredients')" style="flex: 1; padding: 4px 8px; border: none; background: #f3f4f6; font-size: 10px; cursor: pointer;">🍃原料</button>
                <button class="inventory-tab" onclick="riceVillageManager.showInventoryTab('madeTeas')" style="flex: 1; padding: 4px 8px; border: none; background: #e5e7eb; font-size: 10px; cursor: pointer;">🍵茶饮</button>
                <button class="inventory-tab" onclick="riceVillageManager.showInventoryTab('huntingItems')" style="flex: 1; padding: 4px 8px; border: none; background: #e5e7eb; font-size: 10px; cursor: pointer;">🥩肉类</button>
                <button class="inventory-tab" onclick="riceVillageManager.showInventoryTab('questItems')" style="flex: 1; padding: 4px 8px; border: none; background: #e5e7eb; font-size: 10px; cursor: pointer;">📋任务</button>
                <button class="inventory-tab" onclick="riceVillageManager.showInventoryTab('equipment')" style="flex: 1; padding: 4px 8px; border: none; background: #e5e7eb; font-size: 10px; cursor: pointer;">⚔️装备</button>
            </div>
            <div id="inventory-content" style="max-height: 350px; overflow-y: auto; font-size: 11px; scrollbar-width: auto; scrollbar-color: #9ca3af #f3f4f6;"></div>
        </div>
    `;

    // 添加拖拽功能
    this.makeDraggable(panel, panel.querySelector('#inventory-header'));

    return panel;
};

/**
 * 使元素可拖拽
 * @param {HTMLElement} element - 要拖拽的元素
 * @param {HTMLElement} handle - 拖拽手柄元素
 */
RiceVillageManager.prototype.makeDraggable = function(element, handle) {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    handle.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;

        if (e.target === handle) {
            isDragging = true;
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            element.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }
};

/**
 * 显示背包界面（悬浮面板）
 * @important 按照重建指导文档：使用统一背包系统
 */
RiceVillageManager.prototype.showInventory = function() {
    if (!this._validateSystem()) return;

    console.log('📦 开始显示悬浮背包面板...');

    // 检查是否已有背包面板
    const existingPanel = document.getElementById('inventory-panel');
    if (existingPanel) {
        console.log('📦 背包面板已存在，切换显示状态');
        if (existingPanel.style.display === 'none') {
            existingPanel.style.display = 'block';
            // 刷新显示
            this.refreshInventoryDisplay();
        } else {
            existingPanel.style.display = 'none';
        }
        return;
    }

    // 创建悬浮背包面板
    const panel = this.createInventoryPanel();
    if (!panel) {
        console.error('📦 创建背包面板失败');
        return;
    }

    console.log('📦 背包面板创建成功');

    // 添加到页面
    document.body.appendChild(panel);

    // 监听统一背包系统的物品变化事件
    this.setupInventoryEventListeners();

    // 默认显示原料标签
    setTimeout(() => {
        this.showInventoryTab('teaIngredients');
    }, 100);
};

/**
 * 显示背包标签内容
 * @param {string} category - 物品分类
 */
RiceVillageManager.prototype.showInventoryTab = function(category) {
    if (!this._validateSystem()) return;

    // 更新标签状态
    const tabs = document.querySelectorAll('.inventory-tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
        tab.style.background = '#e5e7eb';
    });

    // 找到对应的标签并激活
    tabs.forEach(tab => {
        if (tab.onclick && tab.onclick.toString().includes(category)) {
            tab.classList.add('active');
            tab.style.background = '#f3f4f6';
        }
    });

    // 显示对应分类的物品
    this.updateInventoryDisplay(category);
};

/**
 * 更新背包显示 - 使用统一背包系统
 * @param {string} category - 物品分类
 */
RiceVillageManager.prototype.updateInventoryDisplay = function(category) {
    const inventoryContent = document.getElementById('inventory-content');
    if (!inventoryContent) return;

    // 使用统一背包系统获取物品数据
    const inventorySystem = this.core.inventorySystem;
    if (!inventorySystem) {
        console.error('❌ 统一背包系统未初始化');
        return;
    }

    // 映射稻香村分类到统一背包系统分类
    const categoryMapping = {
        'teaIngredients': 'teaIngredients',
        'madeTeas': 'madeTeas',
        'huntingItems': 'meatIngredients',  // 关键修复：映射到正确的分类
        'questItems': 'questItems',
        'equipment': 'equipment'  // 添加装备分类映射
    };

    const unifiedCategory = categoryMapping[category] || category;
    const inventory = this.core.gameData.inventory;
    
    let itemsHTML = `<div class="inventory-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 8px; padding: 8px;">`;

    if (category === 'madeTeas') {
        // 茶饮特殊处理
        const madeTeas = inventory.madeTeas || [];
        if (madeTeas.length === 0) {
            itemsHTML += '<p style="grid-column: 1 / -1; text-align: center; color: #6b7280; font-size: 11px;">暂无茶饮</p>';
        } else {
            madeTeas.forEach((tea, index) => {
                itemsHTML += `
                    <div class="inventory-item" style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; padding: 8px; font-size: 10px; text-align: center;">
                        <div style="font-weight: bold; margin-bottom: 4px;">${tea.name}</div>
                        <div style="color: #6b7280; font-size: 9px;">${tea.temperature === 'hot' ? '🔥热饮' : '🧊冷饮'}</div>
                    </div>
                `;
            });
        }
    } else if (category === 'equipment') {
        // 装备特殊处理（数组形式）
        const equipmentItems = inventory.equipment || [];
        if (equipmentItems.length === 0) {
            itemsHTML += '<p style="grid-column: 1 / -1; text-align: center; color: #6b7280; font-size: 11px;">暂无装备</p>';
        } else {
            equipmentItems.forEach((equipment, index) => {
                // 根据装备类型设置图标
                let icon = '⚔️'; // 默认武器图标
                if (equipment.category === 'armor' || equipment.type === 'armor') {
                    icon = '🛡️';
                }
                
                // 获取装备属性
                const attack = equipment.attack || 0;
                const defense = equipment.defense || 0;
                const attributeText = attack > 0 ? `攻击+${attack}` : defense > 0 ? `防御+${defense}` : '无属性';
                
                // 检查是否已装备
                const playerEquipment = this.core.gameData.player.equipment;
                const equipmentType = equipment.category === 'armor' || equipment.type === 'armor' ? 'armor' : 'weapon';
                const isEquipped = playerEquipment[equipmentType] && String(playerEquipment[equipmentType].id) === String(equipment.id);
                
                const actionButton = isEquipped 
                    ? `<button onclick="riceVillageManager.unequipItem('${equipment.id}', '${equipmentType}')" style="margin-top: 4px; padding: 2px 6px; font-size: 8px; background: #ef4444; color: white; border: none; border-radius: 2px; cursor: pointer;">脱下</button>`
                    : `<button onclick="riceVillageManager.equipItem('${equipment.id}', '${equipmentType}')" style="margin-top: 4px; padding: 2px 6px; font-size: 8px; background: #059669; color: white; border: none; border-radius: 2px; cursor: pointer;">装备</button>`;
                
                itemsHTML += `
                    <div class="inventory-item" style="background: ${isEquipped ? '#fef3c7' : '#f9fafb'}; border: 1px solid ${isEquipped ? '#f59e0b' : '#e5e7eb'}; border-radius: 4px; padding: 8px; font-size: 10px; text-align: center;">
                        <div style="font-size: 16px; margin-bottom: 4px;">${icon}</div>
                        <div style="font-weight: bold; margin-bottom: 2px;">${equipment.name}</div>
                        <div style="color: #6b7280; font-size: 9px;">${attributeText}</div>
                        <div style="color: ${isEquipped ? '#f59e0b' : '#059669'}; font-size: 8px; margin-top: 2px;">${isEquipped ? '已装备' : '未装备'}</div>
                        ${actionButton}
                    </div>
                `;
            });
        }
    } else {
        // 使用统一背包系统获取物品
        const items = inventory[unifiedCategory] || {};
        const itemEntries = Object.entries(items).filter(([name, quantity]) => quantity > 0);
        
        if (itemEntries.length === 0) {
            itemsHTML += '<p style="grid-column: 1 / -1; text-align: center; color: #6b7280; font-size: 11px;">暂无物品</p>';
        } else {
            itemEntries.forEach(([itemName, quantity]) => {
                // 为不同类型的物品添加图标
                let icon = '📦';
                if (itemName.endsWith('肉')) icon = '🥩';
                else if (itemName.includes('草') || itemName.includes('药')) icon = '🌿';
                else if (itemName.includes('种子')) icon = '🌱';
                else if (itemName.includes('令牌')) icon = '🎯';
                
                itemsHTML += `
                    <div class="inventory-item" style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; padding: 8px; font-size: 10px; text-align: center;">
                        <div style="font-size: 16px; margin-bottom: 4px;">${icon}</div>
                        <div style="font-weight: bold; margin-bottom: 2px;">${itemName}</div>
                        <div style="color: #6b7280; font-size: 9px;">数量: ${quantity}</div>
                    </div>
                `;
            });
        }
    }

    itemsHTML += '</div>';
    inventoryContent.innerHTML = itemsHTML;
    
    console.log(`📦 更新稻香村背包显示: ${category} (${unifiedCategory})`);
};

/**
 * 关闭背包面板
 */
RiceVillageManager.prototype.closeInventory = function() {
    const panel = document.getElementById('inventory-panel');
    if (panel) {
        panel.remove();
        console.log('📦 稻香村背包面板已关闭');
    }
};

/**
 * 设置背包事件监听器
 */
RiceVillageManager.prototype.setupInventoryEventListeners = function() {
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

    console.log('📦 稻香村背包事件监听器已设置');
};

/**
 * 刷新背包显示
 */
RiceVillageManager.prototype.refreshInventoryDisplay = function() {
    const panel = document.getElementById('inventory-panel');
    if (!panel || panel.style.display === 'none') {
        return; // 背包面板不存在或未显示，无需刷新
    }

    // 获取当前激活的标签
    const activeTab = document.querySelector('.inventory-tab.active');
    if (!activeTab) {
        console.log('📦 无激活标签，默认显示原料');
        this.showInventoryTab('teaIngredients');
        return;
    }

    // 从onclick属性中提取分类名称
    const onclickStr = activeTab.onclick.toString();
    let currentCategory = 'teaIngredients';
    
    if (onclickStr.includes('teaIngredients')) {
        currentCategory = 'teaIngredients';
    } else if (onclickStr.includes('madeTeas')) {
        currentCategory = 'madeTeas';
    } else if (onclickStr.includes('huntingItems')) {
        currentCategory = 'huntingItems';
    } else if (onclickStr.includes('questItems')) {
        currentCategory = 'questItems';
    } else if (onclickStr.includes('equipment')) {
        currentCategory = 'equipment';
    }

    console.log('📦 刷新背包显示:', currentCategory);
    this.updateInventoryDisplay(currentCategory);
};

/**
 * 装备物品
 * @param {string} equipmentId - 装备ID
 * @param {string} equipmentType - 装备类型 (weapon | armor)
 */
RiceVillageManager.prototype.equipItem = function(equipmentId, equipmentType) {
    if (!this._validateSystem()) return;

    const inventory = this.core.gameData.inventory;
    const playerEquipment = this.core.gameData.player.equipment;
    
    // 查找要装备的物品
    console.log('🔍 查找装备:', equipmentId, '类型:', typeof equipmentId);
    console.log('📦 当前背包装备:', inventory.equipment.map(item => ({ id: item.id, name: item.name, idType: typeof item.id })));
    
    const equipment = inventory.equipment.find(item => String(item.id) === String(equipmentId));
    if (!equipment) {
        console.error('❌ 找不到装备:', equipmentId);
        console.error('📦 可用装备ID列表:', inventory.equipment.map(item => item.id));
        return;
    }

    // 如果已有同类型装备，先脱下
    if (playerEquipment[equipmentType]) {
        console.log(`🔄 替换现有装备: ${playerEquipment[equipmentType].name} → ${equipment.name}`);
    }

    // 装备新物品
    playerEquipment[equipmentType] = {
        id: equipment.id,
        name: equipment.name,
        attack: equipment.attack || 0,
        defense: equipment.defense || 0,
        category: equipment.category
    };

    // 更新玩家属性
    this.updatePlayerStats();

    console.log(`⚔️ 装备成功: ${equipment.name} (${equipmentType})`);
    
    // 刷新背包显示
    this.refreshInventoryDisplay();
    
    // 更新角色状态显示
    this.updatePlayerStatus();
};

/**
 * 脱下装备
 * @param {string} equipmentId - 装备ID
 * @param {string} equipmentType - 装备类型 (weapon | armor)
 */
RiceVillageManager.prototype.unequipItem = function(equipmentId, equipmentType) {
    if (!this._validateSystem()) return;

    const playerEquipment = this.core.gameData.player.equipment;
    
    // 检查是否确实装备了该物品
    if (!playerEquipment[equipmentType] || String(playerEquipment[equipmentType].id) !== String(equipmentId)) {
        console.error('❌ 该装备未装备:', equipmentId);
        return;
    }

    const equipmentName = playerEquipment[equipmentType].name;
    
    // 脱下装备
    playerEquipment[equipmentType] = null;

    // 更新玩家属性
    this.updatePlayerStats();

    console.log(`🎒 脱下装备: ${equipmentName} (${equipmentType})`);
    
    // 刷新背包显示
    this.refreshInventoryDisplay();
    
    // 更新角色状态显示
    this.updatePlayerStatus();
};

/**
 * 更新玩家属性（根据装备）
 */
RiceVillageManager.prototype.updatePlayerStats = function() {
    if (!this._validateSystem()) return;

    const player = this.core.gameData.player;
    const equipment = player.equipment;
    
    // 🔧 修复：总是根据等级重新计算基础攻击力，不依赖可能错误的存储值
    const calculatedBasePower = 5 + (player.level - 1) * 3;
    player.stats.basePower = calculatedBasePower; // 更新存储的基础攻击力
    player.stats.power = calculatedBasePower; // 设置当前攻击力为基础攻击力
    
    console.log(`⚔️ 基础攻击力计算: 等级${player.level} = 5基础 + ${(player.level - 1) * 3}升级加成 = ${calculatedBasePower}`);
    
    // 添加武器攻击力
    if (equipment.weapon) {
        player.stats.power += equipment.weapon.attack || 0;
        console.log(`⚔️ 武器加成: +${equipment.weapon.attack} 攻击力`);
    }
    
    // 计算基础血量（100基础 + 每级+5血量）
    const baseMaxHp = 100 + (player.level - 1) * 5;
    
    // 添加防具防御力（转换为血量加成）
    if (equipment.armor) {
        const defenseBonus = equipment.armor.defense || 0;
        player.stats.maxHp = baseMaxHp + defenseBonus;
        console.log(`🛡️ 血量计算: ${baseMaxHp}基础 + ${defenseBonus}防具 = ${player.stats.maxHp}`);
    } else {
        player.stats.maxHp = baseMaxHp; // 基础血量（包含升级加成）
        console.log(`🛡️ 血量计算: ${baseMaxHp}基础（无防具加成）`);
    }
    
    // 如果当前血量超过新的最大值，则设置为最大值
    if (player.stats.hp > player.stats.maxHp) {
        player.stats.hp = player.stats.maxHp;
    }
    
    console.log(`📊 玩家属性更新: 攻击力=${player.stats.power}, 血量=${player.stats.hp}/${player.stats.maxHp}`);
    
    // 🔧 关键修复：同步数据到兼容结构，确保显示系统能读取到正确数值
    player.power = player.stats.power;
    player.maxHp = player.stats.maxHp;

    // 🔧 重要：保持当前血量，不要覆盖（怪物攻击等会修改 player.hp）
    // 只在血量超过最大值时才调整
    if (player.hp > player.stats.maxHp) {
        player.hp = player.stats.maxHp;
        console.log(`🔧 血量超过上限，调整为: ${player.hp}/${player.maxHp}`);
    }
    
    console.log(`🔄 数据同步完成: player.power=${player.power}, player.hp=${player.hp}/${player.maxHp}`);
    
    // 触发属性更新事件（如果其他系统需要监听）
    if (this.core.inventorySystem) {
        this.core.inventorySystem.emit('playerStatsUpdated', {
            power: player.stats.power,
            hp: player.stats.hp,
            maxHp: player.stats.maxHp
        });
    }
};

// 旧的背包函数已删除，现在使用统一背包系统 unifiedInventory.addItem()

// 旧的背包消耗函数已删除，现在使用统一背包系统 unifiedInventory.removeItem()

// 旧的背包检查函数已删除，现在使用统一背包系统 unifiedInventory.getItemCount()

// 旧的背包显示函数已删除，现在使用统一背包系统的界面更新

// ===== 第四区域：统一任务生命周期系统 =====

/**
 * 统一任务检查函数 - 检查指定NPC是否有可提交任务
 * @param {string} npcName - NPC名称
 * @returns {Array} 可提交的任务列表
 * @since v2.0 - 统一任务生命周期系统
 * @important 只在NPC对话时调用，不在其他时候自动判断
 */
RiceVillageManager.prototype.checkCompletableQuests = function(npcName) {
    if (!this._validateSystem()) return [];

    const activeQuests = this.core.gameData.quests.active || [];
    const inventory = this.core.gameData.inventory;
    const questProgress = this.core.gameData.quests.progress || {};

    return activeQuests.filter(quest => {
        // 只检查指定NPC的活跃任务
        if (quest.npc !== npcName || quest.status !== 'active') {
            return false;
        }

        // 根据任务类型检查完成条件
        switch (quest.type) {
            case QUEST_TYPES.KILL:
                const progress = questProgress[quest.id];
                return progress && progress.current >= progress.required;

            case QUEST_TYPES.COLLECT:
                // 使用收集类任务的统一进度机制
                const collectProgressData = questProgress[quest.id];
                if (collectProgressData) {
                    // 检查数据完整性，修复缺失的baseAmount
                    if (collectProgressData.baseAmount === undefined) {
                        console.log(`🔧 修复收集任务检查数据: ${quest.id} 缺少baseAmount`);
                        collectProgressData.baseAmount = 0; // 默认为0
                    }

                    // 重新计算当前进度
                    const currentAmount = window.unifiedInventory ? window.unifiedInventory.getItemCount(quest.target) : 0;
                    const baseAmount = collectProgressData.baseAmount || 0;
                    const actualProgress = Math.max(0, currentAmount - baseAmount);
                    return actualProgress >= collectProgressData.required;
                } else {
                    // 兼容旧逻辑（如果没有进度数据）
                    const collectProgress = window.unifiedInventory ? window.unifiedInventory.getItemCount(quest.target) : 0;
                    return collectProgress >= quest.required;
                }

            case QUEST_TYPES.PROVIDE_ITEM:
                if (quest.target === '茶饮') {
                    // 任意茶饮
                    const madeTeas = inventory.madeTeas || [];
                    return madeTeas.length >= quest.required;
                } else if (quest.target.includes('茶') || quest.target.includes('汤')) {
                    // 特定茶饮
                    const madeTeas = inventory.madeTeas || [];
                    const specificTeas = madeTeas.filter(tea => tea.name === quest.target);
                    return specificTeas.length >= quest.required;
                } else if (quest.target.includes('对话') || (quest.target.includes('与') && quest.target.includes('对话'))) {
                    // 🔧 修复：特殊对话任务（如"与王富对话"）
                    // 这类任务不需要物品检查，通过对话完成
                    console.log(`🗣️ 对话任务 ${quest.target}: 通过对话完成，不检查物品`);
                    return false; // 让对话处理函数直接完成任务
                } else {
                    // 其他物品（如馒头）：使用统一背包系统检查
                    if (window.unifiedInventory) {
                        const currentAmount = window.unifiedInventory.getItemCount(quest.target);
                        console.log(`🔍 检查任务物品 ${quest.target}: 背包中有 ${currentAmount}，需要 ${quest.required}`);
                        return currentAmount >= quest.required;
                    } else {
                        console.error('❌ 统一背包系统未初始化，无法检查任务物品');
                        return false;
                    }
                }

            default:
                return false;
        }
    });
};

/**
 * 升级系统 - 按照重建指导文档完整实现
 */

/**
 * 获得经验值并检查升级
 * @param {number} amount - 经验值
 * @important 按照重建指导文档：完整的升级系统实现
 */
RiceVillageManager.prototype.gainExp = function(amount) {
    console.log(`🧪 [DEBUG] gainExp 开始: amount=${amount}`);

    if (!this._validateSystem()) {
        console.error(`🧪 [DEBUG] gainExp 失败: 系统验证失败`);
        return;
    }

    const player = this.core.gameData.player;

    // 调试：检查玩家数据完整性
    console.log(`🧪 [DEBUG] 玩家数据检查:`, {
        exp: player.exp,
        level: player.level,
        expType: typeof player.exp,
        levelType: typeof player.level
    });

    // 确保经验和等级有默认值，特别检查 NaN
    if (typeof player.exp !== 'number' || isNaN(player.exp) || player.exp === null || player.exp === undefined) {
        console.error(`🧪 [DEBUG] 检测到无效经验数据: ${player.exp} (类型: ${typeof player.exp}) → 强制修复为 0`);
        player.exp = 0;
    }
    if (typeof player.level !== 'number' || isNaN(player.level) || player.level === null || player.level === undefined) {
        console.error(`🧪 [DEBUG] 检测到无效等级数据: ${player.level} (类型: ${typeof player.level}) → 强制修复为 1`);
        player.level = 1;
    }

    console.log(`📈 获得经验: ${amount}，当前经验: ${player.exp}，当前等级: ${player.level}`);

    // 增加经验，再次检查 NaN
    const beforeExp = player.exp;
    player.exp += amount;

    // 如果结果是 NaN，强制修复
    if (isNaN(player.exp)) {
        console.error(`🧪 [DEBUG] 经验计算结果为 NaN！强制修复: ${beforeExp} + ${amount} → ${amount}`);
        player.exp = amount; // 直接设置为新增的经验值
    }

    console.log(`🧪 [DEBUG] 经验变化: ${beforeExp} + ${amount} = ${player.exp}`);

    // 检查升级 - 按照重建指导文档的公式
    let leveledUp = false;
    let upgradeCount = 0;
    console.log(`🧪 [DEBUG] 开始升级检查循环`);

    while (true) {
        const requiredExp = this.getExpRequiredForLevel(player.level);
        console.log(`🔍 升级检查: 当前经验${player.exp}，需要经验${requiredExp}`);
        console.log(`🧪 [DEBUG] 升级检查详情: level=${player.level}, exp=${player.exp}, required=${requiredExp}, canUpgrade=${player.exp >= requiredExp}`);

        if (player.exp >= requiredExp) {
            // 升级！
            const beforeLevel = player.level;
            const beforeExp = player.exp;

            player.exp -= requiredExp;
            player.level++;
            leveledUp = true;
            upgradeCount++;

            console.log(`🧪 [DEBUG] 升级成功: ${beforeLevel}级(${beforeExp}经验) → ${player.level}级(${player.exp}经验)`);

            // 防止无限循环
            if (upgradeCount > 10) {
                console.error(`🧪 [DEBUG] 升级循环异常，强制退出`);
                break;
            }

            // 按照重建指导文档：每级+5血量上限，+3基础攻击力
            // 🔧 修复：正确更新stats系统，确保与装备系统一致
            if (!player.stats) {
                player.stats = {
                    hp: player.hp || 100,
                    maxHp: player.maxHp || 100,
                    stamina: player.stamina || 100,
                    maxStamina: player.maxStamina || 100,
                    power: player.power || 5,
                    basePower: player.power || 5
                };
            }
            
            // 更新基础属性
            player.stats.basePower += 3;
            // 注意：不直接修改maxHp，让装备系统重新计算（包含升级+装备加成）
            
            // 兼容旧数据结构
            player.power = player.stats.basePower;

            console.log(`🎉 升级到${player.level}级！血量上限+5，攻击力+3`);

            // 检查等级上限
            if (player.level >= 130) {
                player.level = 130;
                player.exp = 0;
                console.log(`🏆 达到等级上限130级`);
                break;
            }
        } else {
            break;
        }
    }

    if (leveledUp) {
        // 显示升级提示
        this.showDialog('系统', `🎉 恭喜升级到${player.level}级！血量上限+5，攻击力+3！`, [
            { text: '确定', action: 'closeDialog' }
        ]);

        // 猫咪升级
        this.upgradeCat();
        
        // 🔧 升级后重新计算装备属性（包含升级加成）
        this.updatePlayerStats();
        
        // 🔧 升级回满血
        player.stats.hp = player.stats.maxHp;
        player.hp = player.stats.hp; // 兼容旧数据结构
    }

    // 更新显示
    console.log(`🧪 [DEBUG] 开始更新玩家状态显示`);
    this.updatePlayerStatus();

    // 保存数据
    console.log(`🧪 [DEBUG] 开始保存游戏数据`);
    this.core.saveGameData();

    console.log(`📈 经验处理完成: 等级${player.level}，经验${player.exp}`);
    console.log(`🧪 [DEBUG] gainExp 完成: 升级${upgradeCount}次, 最终状态 level=${player.level}, exp=${player.exp}`);
};

/**
 * 计算升级所需经验 - 按照重建指导文档公式
 * @param {number} level - 当前等级
 * @returns {number} 升级所需经验
 */
RiceVillageManager.prototype.getExpRequiredForLevel = function(level) {
    // 按照重建指导文档：50 + (level - 1) * 50
    return 50 + (level - 1) * 50;
};

/**
 * 猫咪升级系统 - 按照重建指导文档实现
 */
RiceVillageManager.prototype.upgradeCat = function() {
    if (!this._validateSystem()) return;

    const player = this.core.gameData.player;
    const partner = player.partner;

    if (!partner) {
        console.log('🐱 没有猫咪伙伴，跳过升级');
        return;
    }

    console.log(`🐱 猫咪升级: ${partner.name} 从${partner.level}级升级到${player.level}级`);

    // 如果猫咪还没有选择类型，显示选择界面
    if (!partner.type) {
        this.showCatTypeSelection();
        return;
    }

    // 计算需要升级的等级数
    const levelDiff = player.level - partner.level;

    for (let i = 0; i < levelDiff; i++) {
        if (partner.type === 'Tank') {
            // Tank型：每级+20血量，+1攻击力
            partner.maxHp += 20;
            partner.attack += 1;
        } else if (partner.type === 'Damage') {
            // Damage型：每级+3血量，+5攻击力
            partner.maxHp += 3;
            partner.attack += 5;
        }
    }

    // 同步等级并回满血
    partner.level = player.level;
    partner.hp = partner.maxHp;

    console.log(`🐱 ${partner.name} 升级完成: ${partner.type}型 ${partner.level}级 血量${partner.hp}/${partner.maxHp} 攻击${partner.attack}`);

    // 更新显示
    this.updatePlayerStatus();
};

/**
 * 更新任务进度 - 按照重建指导文档的任务进度跟踪系统
 * @param {string} type - 任务类型：'kill' 或 'collect'
 * @param {string} target - 目标对象（怪物名称或物品名称）
 * @param {number} amount - 增加的数量
 */
RiceVillageManager.prototype.updateQuestProgress = function(type, target, amount = 1) {
    if (!this._validateSystem()) return;

    const activeQuests = this.core.gameData.quests.active || [];
    const questProgress = this.core.gameData.quests.progress || {};

    console.log(`📈 更新任务进度: ${type} ${target} +${amount}`);
    console.log(`📋 当前活跃任务数量: ${activeQuests.length}`);

    // 调试：显示所有活跃任务
    activeQuests.forEach((quest, index) => {
        console.log(`📋 任务${index}: ${quest.name} | 类型:${quest.type} | 目标:${quest.target} | 状态:${quest.status}`);
    });

    // 查找所有相关的活跃任务
    activeQuests.forEach(quest => {
        console.log(`🔍 检查任务匹配: quest.type(${quest.type}) === type(${type}) && quest.target(${quest.target}) === target(${target}) && quest.status(${quest.status}) === 'active'`);
        if (quest.type === type && quest.target === target && quest.status === 'active') {
            // 确保任务进度记录存在
            if (!questProgress[quest.id]) {
                questProgress[quest.id] = {
                    type: quest.type,
                    target: quest.target,
                    current: 0,
                    required: quest.required
                };
            }

            // 更新进度
            questProgress[quest.id].current += amount;

            // 确保不超过要求数量
            if (questProgress[quest.id].current > questProgress[quest.id].required) {
                questProgress[quest.id].current = questProgress[quest.id].required;
            }

            console.log(`📊 任务 ${quest.id} 进度: ${questProgress[quest.id].current}/${questProgress[quest.id].required}`);
        }
    });

    // 更新任务显示
    this.updateQuestDisplay();

    // 保存数据
    this.core.saveGameData();
};

/**
 * 更新收集类任务进度 - 按照重建指导文档的收集类任务统一机制
 * @param {string} target - 目标物品名称
 */
RiceVillageManager.prototype.updateCollectQuestProgress = function(target) {
    if (!this._validateSystem()) return;

    const activeQuests = this.core.gameData.quests.active || [];
    const questProgress = this.core.gameData.quests.progress || {};
    const inventory = this.core.gameData.inventory;

    console.log(`📦 更新收集任务进度: ${target}`);

    // 查找所有相关的收集类活跃任务
    activeQuests.forEach(quest => {
        if (quest.type === QUEST_TYPES.COLLECT && quest.target === target && quest.status === 'active') {
            const progressData = questProgress[quest.id];
            if (progressData) {
                // 🔧 修复：根据物品分类正确获取背包中的物品数量
                let currentAmount = 0;
                
                // 使用统一背包系统的接口获取物品数量
                if (window.unifiedInventory) {
                    currentAmount = window.unifiedInventory.getItemCount(target);
                    console.log(`📦 通过统一背包系统获取 ${target} 数量: ${currentAmount}`);
                } else {
                    console.error('❌ 统一背包系统未初始化，无法获取物品数量');
                }

                // 计算任务进度 = 当前背包数量 - 接任务时的基础数量
                const newProgress = Math.max(0, currentAmount - progressData.baseAmount);
                progressData.current = newProgress;

                console.log(`📊 收集任务 ${quest.id} 进度更新: 背包${currentAmount} - 基础${progressData.baseAmount} = 进度${newProgress}/${progressData.required}`);
            }
        }
    });

    // 更新任务显示
    this.updateQuestDisplay();

    // 保存数据
    this.core.saveGameData();
};

/**
 * 显示猫咪类型选择界面 - 按照重建指导文档
 */
RiceVillageManager.prototype.showCatTypeSelection = function() {
    if (!this._validateSystem()) return;

    const partner = this.core.gameData.player.partner;
    if (!partner) return;

    console.log('🐱 显示猫咪类型选择界面');

    // 创建悬浮面板
    const panel = document.createElement('div');
    panel.id = 'cat-type-selection-panel';
    panel.className = 'floating-panel';
    panel.style.cssText = `
        position: fixed;
        right: 20px;
        bottom: 20px;
        width: 400px;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1001;
    `;

    panel.innerHTML = `
        <div style="padding: 8px 12px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: bold; font-size: 12px;">🐱 ${partner.name} 升级类型选择</span>
        </div>
        <div style="padding: 15px;">
            <div style="margin-bottom: 15px; font-size: 11px; color: #666;">
                选择你的猫咪伙伴的成长类型：
            </div>
            <div style="margin-bottom: 10px;">
                <button onclick="riceVillageManager.selectCatType('Tank')" style="width: 100%; padding: 8px; margin-bottom: 8px; background: #e5e7eb; border: 1px outset #d1d5db; font-size: 11px; cursor: pointer;">
                    <strong>Tank型</strong><br>
                    <small>每级 +20血量，+1攻击力<br>适合持久战斗</small>
                </button>
                <button onclick="riceVillageManager.selectCatType('Damage')" style="width: 100%; padding: 8px; background: #e5e7eb; border: 1px outset #d1d5db; font-size: 11px; cursor: pointer;">
                    <strong>Damage型</strong><br>
                    <small>每级 +3血量，+5攻击力<br>适合快速击败敌人</small>
                </button>
            </div>
            <div style="font-size: 10px; color: #999; text-align: center;">
                选择后无法更改，请慎重考虑
            </div>
        </div>
    `;

    document.body.appendChild(panel);
};

/**
 * 选择猫咪类型 - 按照重建指导文档
 * @param {string} type - 类型：'Tank' 或 'Damage'
 */
RiceVillageManager.prototype.selectCatType = function(type) {
    if (!this._validateSystem()) return;

    const partner = this.core.gameData.player.partner;
    if (!partner) return;

    console.log(`🐱 选择猫咪类型: ${type}`);

    // 设置类型
    partner.type = type;

    // 移除选择面板
    const panel = document.getElementById('cat-type-selection-panel');
    if (panel) {
        panel.remove();
    }

    // 显示确认信息
    this.showDialog('系统', `🐱 ${partner.name} 选择了${type}型成长路线！`, [
        { text: '确定', action: 'closeDialog' }
    ]);

    // 立即进行升级
    this.upgradeCat();
};

/**
 * 检查玩家是否已有指定NPC的任务
 * @param {string} npcName - NPC名称
 * @param {string} questId - 可选的特定任务ID
 * @returns {boolean|Object} 是否已有该NPC的任务，或返回特定任务对象
 */
RiceVillageManager.prototype.hasActiveQuestFromNPC = function(npcName, questId = null) {
    if (!this._validateSystem()) return false;

    const activeQuests = this.core.gameData.quests.active || [];

    if (questId) {
        // 查找特定任务
        return activeQuests.find(quest => quest.npc === npcName && quest.id === questId && quest.status === 'active');
    } else {
        // 检查是否有该NPC的任何任务
        return activeQuests.some(quest => quest.npc === npcName && quest.status === 'active');
    }
};

/**
 * 创建NPC任务
 * @param {string} npcName - NPC名称
 * @param {string} questId - 任务ID
 * @param {string} name - 任务名称
 * @param {string} description - 任务描述
 * @param {string} type - 任务类型
 * @param {string} target - 目标对象
 * @param {number} required - 需要数量
 * @param {Object} rewards - 奖励
 */
RiceVillageManager.prototype.createNPCQuest = function(npcName, questId, name, description, type, target, required, rewards) {
    if (!this._validateSystem()) return;

    const quest = {
        id: questId,
        npc: npcName,
        name: name,
        description: description,
        type: type,
        target: target,
        required: required,
        rewards: rewards,
        status: 'active',
        startTime: Date.now(),
        progress: 0
    };

    // 添加到活跃任务列表
    this.core.gameData.quests.active.push(quest);

    // 初始化任务进度 - 按照重建指导文档的统一机制
    if (quest.type === QUEST_TYPES.KILL) {
        // 击杀类任务：从0开始计数
        this.core.gameData.quests.progress[quest.id] = {
            type: quest.type,
            target: quest.target,
            current: 0,
            required: quest.required
        };
        console.log(`📋 初始化击杀任务进度: ${quest.id} - ${quest.target} 0/${quest.required}`);
    } else if (quest.type === QUEST_TYPES.COLLECT) {
        // 🔧 修复：收集类任务 - 通过统一背包系统记录基础数量
        let baseAmount = 0;
        
        // 使用统一背包系统的接口获取当前物品数量
        if (window.unifiedInventory) {
            baseAmount = window.unifiedInventory.getItemCount(quest.target);
            console.log(`📦 通过统一背包系统获取 ${quest.target} 基础数量: ${baseAmount}`);
        } else {
            console.error('❌ 统一背包系统未初始化，无法获取物品基础数量');
        }

        this.core.gameData.quests.progress[quest.id] = {
            type: quest.type,
            target: quest.target,
            baseAmount: baseAmount,
            current: 0,  // 初始进度为0
            required: quest.required
        };
        console.log(`📋 初始化收集任务进度: ${quest.id} - ${quest.target} 基础量${baseAmount}, 需要收集${quest.required}`);
    }

    // 保存数据
    this.core.saveGameData();

    // 更新任务显示
    this.updateQuestDisplay();

    // 更新NPC状态显示
    this.renderNPCsTable();

    this.addDebugLog(`📋 创建任务: ${name} (${npcName})`);
};

// ===== 第五区域：NPC对话系统 =====

/**
 * 与NPC对话的统一入口
 * @param {string} npcName - NPC名称
 */
RiceVillageManager.prototype.talkToNPC = function(npcName) {
    if (!this._validateSystem()) return;

    this.addDebugLog(`💬 与 ${npcName} 对话`);

    // 记录当前对话的NPC，用于统一任务提交
    this.currentDialogNPC = npcName;

    // 根据NPC处理不同的对话
    switch (npcName) {
        case NPC_NAMES.LIU_DAHAI:
            this.handleLiuDaHaiDialog();
            break;
        case NPC_NAMES.LIU_YANG:
            this.handleLiuYangDialog();
            break;
        case NPC_NAMES.WANG_POPO:
            this.handleWangPoPoDialog();
            break;
        case NPC_NAMES.SHAOXIA:
            this.handleShaoXiaDialog();
            break;
        case NPC_NAMES.LI_FU:
            this.handleLiFuDialog();
            break;
        case NPC_NAMES.CHEN_YUE:
            this.handleChenYueDialog();
            break;
        case NPC_NAMES.WANG_FU:
            this.handleWangFuDialog();
            break;
        case NPC_NAMES.QIU_YE_QING:
            this.handleQiuYeQingDialog();
            break;
        case NPC_NAMES.WEAPON_SHOP_OWNER:
            this.handleWeaponShopDialog();
            break;
        default:
            this.showDialog(npcName, '你好！');
            break;
    }
};

/**
 * 刘大海对话处理
 * @important 包含角色创建流程
 */
RiceVillageManager.prototype.handleLiuDaHaiDialog = function() {
    if (!this._validateSystem()) return;

    const player = this.core.gameData.player;
    const npc = this.core.gameData.riceVillage.npcs[NPC_NAMES.LIU_DAHAI];

    // 调试信息
    console.log('🔍 刘大海对话调试:');
    console.log('player.characterCreated:', player.characterCreated);
    console.log('player.name:', player.name);
    console.log('npc.questStage:', npc.questStage);

    // 检查是否需要创建角色
    if (!player.characterCreated) {
        console.log('🎭 触发角色创建');
        this.showCharacterCreation();
        return;
    }

    const genderTitle = player.gender === 'male' ? '小哥' : '小妹';

    // 使用统一任务检查函数
    const completableQuests = this.checkCompletableQuests(NPC_NAMES.LIU_DAHAI);

    if (completableQuests.length > 0) {
        // 有可提交的任务
        const quest = completableQuests[0];
        this.showDialog(NPC_NAMES.LIU_DAHAI, `${genderTitle}，太好了！你完成了"${quest.name}"任务。这是你的奖励！`, [
            { text: '提交任务', action: 'submit_quest_to_npc' },
            { text: '稍后再说', action: 'close_dialog' }
        ]);
        return;
    }

    // 检查是否已有刘大海的任务
    if (this.hasActiveQuestFromNPC(NPC_NAMES.LIU_DAHAI)) {
        this.showDialog(NPC_NAMES.LIU_DAHAI, `${genderTitle}，你的任务还在进行中，加油完成吧！`);
        return;
    }

    // 根据questStage发布新任务
    // 重要：questStage只在任务提交后推进，不在对话时推进
    switch (npc.questStage) {
        case 0:
            // 欢迎对话，发布第一个任务
            this.showDialog(NPC_NAMES.LIU_DAHAI, `${genderTitle} ${player.name}，欢迎来到稻香村！我是刘大海，负责村里的武学指导。听说你开茶铺，正好能帮助那位少侠。他需要一壶提神的茶来恢复体力，你能帮忙吗？`);
            this.createNPCQuest(NPC_NAMES.LIU_DAHAI, 'provide_tea', '为少侠提供茶饮', '为练武的少侠提供一壶提神茶饮', QUEST_TYPES.PROVIDE_ITEM, '茶饮', 1, { exp: 120, gold: 20 });
            // questStage保持0，等任务完成后才推进到1
            break;

        case 1:
            // 第二个任务
            this.showDialog(NPC_NAMES.LIU_DAHAI, `${genderTitle}，少侠需要练习实战。你去帮他击败3只野兔吧！虽然你是茶铺老板，但也要学些自卫技巧。`);
            this.createNPCQuest(NPC_NAMES.LIU_DAHAI, 'training_combat', '实战训练', '帮助少侠击败3只野兔，学习实战技巧', QUEST_TYPES.KILL, '野兔', 3, { exp: 150, gold: 30 });
            // questStage保持1，等任务完成后才推进到2
            break;

        case 2:
            // 第三个任务
            this.showDialog(NPC_NAMES.LIU_DAHAI, `${genderTitle}，少侠需要收集一些木材制作训练器具。你上山采茶时见过好木材吗？帮忙收集3个山楂木吧。`);
            this.createNPCQuest(NPC_NAMES.LIU_DAHAI, 'collect_wood', '收集训练材料', '协助少侠收集3个山楂木制作训练器具', QUEST_TYPES.COLLECT, '山楂木', 3, { exp: 100, gold: 25 });
            // questStage保持2，等任务完成后才推进到3
            break;

        case 3:
            // 第四个任务
            this.showDialog(NPC_NAMES.LIU_DAHAI, `${genderTitle}，少侠的体力恢复很重要。你能制作一些恢复体力的特制茶饮吗？古法酸梅汤最适合恢复体力。`);
            this.createNPCQuest(NPC_NAMES.LIU_DAHAI, 'recovery_tea', '制作恢复茶饮', '为少侠制作恢复体力的古法酸梅汤', QUEST_TYPES.PROVIDE_ITEM, '古法酸梅汤', 1, { exp: 180, gold: 35 });
            // questStage保持3，等任务完成后才推进到4
            break;

        case 4:
            // 第五个任务
            this.showDialog(NPC_NAMES.LIU_DAHAI, `${genderTitle}，最后的测试！你去帮少侠击败2只果子狸，检验武学成果。作为茶铺老板，你也要有自保能力！`);
            this.createNPCQuest(NPC_NAMES.LIU_DAHAI, 'final_test', '武学测试', '帮助少侠击败2只果子狸，完成武学测试', QUEST_TYPES.KILL, '果子狸', 2, { exp: 200, gold: 40 });
            // questStage保持4，等任务完成后才推进到5
            break;

        default:
            this.showDialog(NPC_NAMES.LIU_DAHAI, `${genderTitle}，你和少侠配合得很好！你的茶铺为武学训练提供了很大帮助。`);
            break;
    }
};

/**
 * 村长刘洋对话处理 - 完整的10个任务链
 */
RiceVillageManager.prototype.handleLiuYangDialog = function() {
    if (!this._validateSystem()) return;

    const player = this.core.gameData.player;
    if (!player.characterCreated) {
        this.showDialog(NPC_NAMES.LIU_YANG, '请先与刘大海完成角色创建。');
        return;
    }

    const genderTitle = player.gender === 'male' ? '小哥' : '小妹';
    const npcData = this.core.gameData.riceVillage.npcs[NPC_NAMES.LIU_YANG];

    // 检查是否有可提交的任务
    const completableQuests = this.checkCompletableQuests(NPC_NAMES.LIU_YANG);
    if (completableQuests.length > 0) {
        this.submitQuestToNPC(NPC_NAMES.LIU_YANG, completableQuests);
        return;
    }

    // 根据questStage分配任务
    switch (npcData.questStage) {
        case 0:
            // 第一个任务：清理野猪威胁
            this.showDialog(NPC_NAMES.LIU_YANG, `${genderTitle}，村外野猪成群，威胁村民安全。你能帮我们清理一下吗？`);
            this.createNPCQuest(NPC_NAMES.LIU_YANG, 'clear_boars', '清理野猪威胁', '村外野猪成群，威胁村民安全，请帮忙清理', QUEST_TYPES.KILL, '野猪', 5, { exp: 200, gold: 30 });
            break;
        case 1:
            // 第二个任务：收集村民口粮
            this.showDialog(NPC_NAMES.LIU_YANG, `${genderTitle}，村民缺少食物，请帮忙采集野菜补充口粮。`);
            this.createNPCQuest(NPC_NAMES.LIU_YANG, 'collect_food', '收集村民口粮', '村民缺少食物，请帮忙采集野菜补充口粮', QUEST_TYPES.COLLECT, '野菜', 8, { exp: 180, gold: 25 });
            break;
        case 2:
            // 第三个任务：为巡逻队提供补给
            this.showDialog(NPC_NAMES.LIU_YANG, `${genderTitle}，巡逻队需要茶水补充体力，请制作一些茶饮。`);
            this.createNPCQuest(NPC_NAMES.LIU_YANG, 'patrol_supply', '为巡逻队提供补给', '巡逻队需要茶水补充体力，请制作茶饮', QUEST_TYPES.PROVIDE_ITEM, '茶饮', 3, { exp: 220, gold: 35 });
            break;
        case 3:
            // 第四个任务：收集防御材料
            this.showDialog(NPC_NAMES.LIU_YANG, `${genderTitle}，村庄防御需要木材，请收集山楂木。`);
            this.createNPCQuest(NPC_NAMES.LIU_YANG, 'defense_materials', '收集防御材料', '村庄防御需要木材，请收集山楂木', QUEST_TYPES.COLLECT, '山楂木', 5, { exp: 250, gold: 40 });
            break;
        case 4:
            // 第五个任务：保卫村庄
            this.showDialog(NPC_NAMES.LIU_YANG, `${genderTitle}，山贼骚扰村民，请协助击退入侵者。`);
            this.createNPCQuest(NPC_NAMES.LIU_YANG, 'defend_village', '保卫村庄', '山贼骚扰村民，请协助击退入侵者', QUEST_TYPES.KILL, '山贼', 3, { exp: 300, gold: 50 });
            break;
        case 5:
            // 第六个任务：收集村民生活用品
            this.showDialog(NPC_NAMES.LIU_YANG, `${genderTitle}，村民需要止血草治疗外伤，请帮忙采集。`);
            this.createNPCQuest(NPC_NAMES.LIU_YANG, 'medical_supplies', '收集村民生活用品', '村民需要止血草治疗外伤，请帮忙采集', QUEST_TYPES.COLLECT, '止血草', 6, { exp: 200, gold: 30 });
            break;
        case 6:
            // 第七个任务：制作村民药茶
            this.showDialog(NPC_NAMES.LIU_YANG, `${genderTitle}，村民身体虚弱，需要古法酸梅汤调理身体。`);
            this.createNPCQuest(NPC_NAMES.LIU_YANG, 'healing_tea', '制作村民药茶', '村民身体虚弱，需要古法酸梅汤调理身体', QUEST_TYPES.PROVIDE_ITEM, '古法酸梅汤', 2, { exp: 280, gold: 45 });
            break;
        case 7:
            // 第八个任务：村庄最终防务（给装备奖励）
            this.showDialog(NPC_NAMES.LIU_YANG, `${genderTitle}，山贼头目即将来袭，需要你协助最后的防御准备。`);
            this.createNPCQuest(NPC_NAMES.LIU_YANG, 'final_defense', '村庄最终防务', '山贼头目即将来袭，需要你协助最后的防御', QUEST_TYPES.KILL, '山贼', 2, { exp: 350, gold: 60, equipment: { type: 'weapon', name: '村长佩剑', attack: 8 } });
            break;
        case 8:
            // 第九个任务：BOSS挑战（需要等级和精致令牌）
            if (player.level < 10) {
                this.showDialog(NPC_NAMES.LIU_YANG, `${genderTitle}，你的实力还不够强。等你达到10级再来找我吧。`);
                return;
            }

            // 使用统一背包系统检查精致令牌
            const hasToken = this.core.inventorySystem ? this.core.inventorySystem.hasItem('精致令牌', 1) : 
                     (window.unifiedInventory ? window.unifiedInventory.hasItem('精致令牌', 1) : false);
            if (!hasToken) {
                this.showDialog(NPC_NAMES.LIU_YANG, `${genderTitle}，你需要精致令牌才能接受这个挑战。去找王婆婆吧。`);
                return;
            }

            this.showDialog(NPC_NAMES.LIU_YANG, `${genderTitle}，董虎带着残部想要报复村庄！只有你能阻止他了！`);
            this.createNPCQuest(NPC_NAMES.LIU_YANG, 'defeat_donghu', '击败山贼头目董虎', '董虎带着残部想要报复村庄，必须阻止他', QUEST_TYPES.KILL, '董虎', 1, { exp: 600, gold: 120, equipment: { type: 'weapon', name: '董虎战刀', attack: 12 } });
            break;
        case 9:
            // 第十个任务：千叮万嘱老村长（最终任务）
            this.showDialog(NPC_NAMES.LIU_YANG, `${genderTitle}，董虎已除，稻香村终于太平了。你去驿站找车夫王富，他会安排马车送你前往扬州。记住，江湖险恶，多加小心！`);
            this.createNPCQuest(NPC_NAMES.LIU_YANG, 'farewell_village', '千叮万嘱老村长', '前往驿站找车夫王富，准备前往扬州', QUEST_TYPES.PROVIDE_ITEM, '与王富对话', 1, { exp: 300, gold: 80, buff: { name: '村长的祝福', effect: '+10%经验获得', duration: 3600000 } });
            break;
        default:
            this.showDialog(NPC_NAMES.LIU_YANG, `${genderTitle}，感谢你为稻香村所做的一切！愿你在江湖中一路平安。`);
    }
};

/**
 * 车夫王富对话处理 - 支持王婆婆馒头任务
 */
RiceVillageManager.prototype.handleWangFuDialog = function() {
    if (!this._validateSystem()) return;

    const player = this.core.gameData.player;
    if (!player.characterCreated) {
        this.showDialog(NPC_NAMES.WANG_FU, '请先与刘大海完成角色创建。');
        return;
    }

    const genderTitle = player.gender === 'male' ? '小哥' : '小妹';

    // 优先检查王婆婆的馒头任务
    const hasMantouQuest = this.hasActiveQuestFromNPC(NPC_NAMES.WANG_POPO, 'deliver_mantou');
    if (hasMantouQuest) {
        // 检查是否可以提交馒头任务
        const completableMantouQuests = this.checkCompletableQuests(NPC_NAMES.WANG_POPO);
        const mantouQuest = completableMantouQuests.find(q => q.id === 'deliver_mantou');
        
        if (mantouQuest) {
            this.showDialog(NPC_NAMES.WANG_FU, `${genderTitle}，这是王婆婆的馒头吧！她总是这么体贴，谢谢你帮忙送过来。`, [
                { text: '交给王富', action: 'submit_mantou_quest' },
                { text: '稍后再说', action: 'close_dialog' }
            ]);
            return;
        } else {
            this.showDialog(NPC_NAMES.WANG_FU, `${genderTitle}，我听说王婆婆要给我送馒头，你带了吗？`);
            return;
        }
    }

    // 检查是否有村长的最终任务
    const hasVillageFarewellQuest = this.hasActiveQuestFromNPC(NPC_NAMES.LIU_YANG, 'farewell_village');

    if (hasVillageFarewellQuest) {
        this.showDialog(NPC_NAMES.WANG_FU, `${genderTitle}，村长已经跟我说了。马车已经准备好，随时可以送你前往扬州！`);

        // 🔧 修复：直接完成村长的最终任务，不通过物品检查
        // 因为 'farewell_village' 任务的目标是 '与王富对话'，这不是实际物品
        const activeQuests = this.core.gameData.quests.active || [];
        const npc = this.core.gameData.riceVillage.npcs[NPC_NAMES.LIU_YANG];
        
        // 找到任务并直接完成
        const questIndex = activeQuests.findIndex(q => q.id === 'farewell_village' && q.npc === NPC_NAMES.LIU_YANG);
        if (questIndex > -1) {
            const quest = activeQuests[questIndex];
            
            // 完成任务
            quest.status = 'completed';
            this.addDebugLog(`✅ 任务完成: ${quest.name}`);
            
            // 给予奖励
            this.giveQuestRewards(quest);
            
            // 移动到已完成任务列表
            activeQuests.splice(questIndex, 1);
            if (!this.core.gameData.quests.completed) {
                this.core.gameData.quests.completed = [];
            }
            this.core.gameData.quests.completed.push(quest);
            
            // 推进NPC的questStage
            if (npc) {
                npc.questStage++;
                console.log(`📈 完成村长最终任务，questStage推进到: ${npc.questStage}`);
            }
            
            // 显示完成信息
            this.addDebugLog(`🎉 完成村长最终任务，获得 ${quest.rewards.exp} 经验, ${quest.rewards.gold} 金币`);
            
            // 解锁扬州传送点
            const gameData = this.core.gameData;
            gameData.unlockedMaps = gameData.unlockedMaps || [];
            if (!gameData.unlockedMaps.includes('扬州')) {
                gameData.unlockedMaps.push('扬州');
                this.addDebugLog('🗺️ 扬州传送点已解锁！');
                console.log('🗺️ 扬州传送点已解锁！');

                // 显示扬州地图按钮
                this.showYangzhouMapButton();
            }

            // 🎉 地图完成奖励系统：稻香村NPC转移到茶铺
            this.transferRiceVillageNPCsToTeaShop();

            // 🍜 村长特殊奖励：解锁面茶配方
            this.unlockFaceTeaRecipe();
            
            // 更新显示和保存数据
            this.updateQuestDisplay();
            this.updatePlayerStatus();
            this.renderNPCsTable();
            this.core.saveGameData();
        } else {
            console.error('❌ 未找到村长的 farewell_village 任务');
        }
    } else {
        this.showDialog(NPC_NAMES.WANG_FU, `${genderTitle}，我是车夫王富。如果村长安排的话，我可以送你去扬州。`);
    }
};

/**
 * 王婆婆对话处理 - 馒头任务系统
 */
RiceVillageManager.prototype.handleWangPoPoDialog = function() {
    if (!this._validateSystem()) return;

    const player = this.core.gameData.player;
    if (!player.characterCreated) {
        this.showDialog(NPC_NAMES.WANG_POPO, '请先与刘大海完成角色创建。');
        return;
    }

    const genderTitle = player.gender === 'male' ? '小哥' : '小妹';
    const npc = this.core.gameData.riceVillage.npcs[NPC_NAMES.WANG_POPO];

    // 使用统一任务检查函数
    const completableQuests = this.checkCompletableQuests(NPC_NAMES.WANG_POPO);

    if (completableQuests.length > 0) {
        // 有可提交的任务
        const quest = completableQuests[0];
        this.showDialog(NPC_NAMES.WANG_POPO, `${genderTitle}，太好了！你完成了"${quest.name}"任务。这是你的奖励！`, [
            { text: '提交任务', action: 'submit_quest_to_npc' },
            { text: '稍后再说', action: 'close_dialog' }
        ]);
        return;
    }

    // 检查是否已有王婆婆的任务
    if (this.hasActiveQuestFromNPC(NPC_NAMES.WANG_POPO)) {
        this.showDialog(NPC_NAMES.WANG_POPO, `${genderTitle}，你的任务还在进行中，记得把馒头交给王富哦！`);
        return;
    }

    // 根据questStage发布任务
    // 重要：questStage只在任务提交后推进，不在对话时推进
    switch (npc.questStage) {
        case 0:
            // 初次见面
            this.showDialog(NPC_NAMES.WANG_POPO, `你好，年轻人！我是王婆婆。村里的孩子们都很喜欢你的茶铺呢！`, [
                { text: '你好，王婆婆', action: 'advance_dialog_stage' }
            ]);
            // questStage保持0，等对话推进
            break;

        case 1:
            // 发布馒头任务
            this.showDialog(NPC_NAMES.WANG_POPO, `${genderTitle}，这个馒头给你，请帮我交给王富。他是个好人，总是帮村民们跑腿。`);
            
            // 创建馒头任务
            this.createNPCQuest(NPC_NAMES.WANG_POPO, 'deliver_mantou', '为王婆婆送馒头', '将王婆婆的馒头送给车夫王富', QUEST_TYPES.PROVIDE_ITEM, '馒头', 1, { exp: 150 });
            
            // 自动给玩家馒头
            if (this.core.inventorySystem) {
                this.core.inventorySystem.addItem('馒头', 1);
                this.addDebugLog('📦 获得任务物品: 馒头 x1');
                console.log('📦 王婆婆给予馒头任务物品');
            } else {
                console.error('❌ 统一背包系统未初始化');
            }
            
            // questStage保持1，等任务完成后才推进到2
            break;

        case 2:
            // 发布止血草采集任务
            this.showDialog(NPC_NAMES.WANG_POPO, `${genderTitle}，请帮我采集5个止血草。村里的老人们经常受伤，止血草对我们很重要。`);
            
            // 创建止血草采集任务
            this.createNPCQuest(NPC_NAMES.WANG_POPO, 'collect_zhixuecao', '采集止血草', '帮王婆婆采集5个止血草', QUEST_TYPES.COLLECT, '止血草', 5, { exp: 150 });
            
            this.addDebugLog('📋 王婆婆发布了止血草采集任务');
            console.log('📋 王婆婆发布止血草采集任务');
            
            // questStage保持2，等任务完成后才推进到3
            break;

        case 3:
            // 发布果子狸击杀任务
            this.showDialog(NPC_NAMES.WANG_POPO, `${genderTitle}，请帮我击败3只果子狸。它们总是偷吃村民的粮食，需要你来解决。`);
            
            // 创建果子狸击杀任务
            this.createNPCQuest(NPC_NAMES.WANG_POPO, 'kill_guozili', '击败果子狸', '帮王婆婆击败3只果子狸', QUEST_TYPES.KILL, '果子狸', 3, { exp: 200 });
            
            this.addDebugLog('📋 王婆婆发布了果子狸击杀任务');
            console.log('📋 王婆婆发布果子狸击杀任务');
            
            // questStage保持3，等任务完成后才推进到4
            break;

        case 4:
            // 发布猴子击杀任务
            this.showDialog(NPC_NAMES.WANG_POPO, `${genderTitle}，请帮我击败5只猴子。它们在山上捣乱，影响村民上山采药。`);
            
            // 创建猴子击杀任务
            this.createNPCQuest(NPC_NAMES.WANG_POPO, 'kill_houzi', '击败猴子', '帮王婆婆击败5只猴子', QUEST_TYPES.KILL, '猴子', 5, { exp: 250 });
            
            this.addDebugLog('📋 王婆婆发布了猴子击杀任务');
            console.log('📋 王婆婆发布猴子击杀任务');
            
            // questStage保持4，等任务完成后才推进到5
            break;

        case 5:
            // 发布山贼击杀任务（最终战斗任务）
            this.showDialog(NPC_NAMES.WANG_POPO, `${genderTitle}，最后的任务：请去村口击败5只山贼。他们威胁着我们村的安全！`);
            
            // 创建山贼击杀任务
            this.createNPCQuest(NPC_NAMES.WANG_POPO, 'kill_shanzei_final', '击败山贼', '帮王婆婆击败5只山贼', QUEST_TYPES.KILL, '山贼', 5, { exp: 300 });
            
            this.addDebugLog('📋 王婆婆发布了最终山贼击杀任务');
            console.log('📋 王婆婆发布最终山贼击杀任务');
            
            // questStage保持5，等任务完成后才推进到6
            break;

        case 6:
            // 所有任务完成，给予精致令牌
            this.showDialog(NPC_NAMES.WANG_POPO, `${genderTitle}，谢谢你完成了所有任务！你真是村里的大英雄。这是精致的令牌，请收下。`, [
                { text: '接受令牌', action: 'receive_final_reward' },
                { text: '稍后再说', action: 'close_dialog' }
            ]);
            break;

        default:
            this.showDialog(NPC_NAMES.WANG_POPO, `${genderTitle}，感谢你的帮助！有了精致令牌，你就能在村里获得更多机会了。`);
            break;
    }
};

/**
 * 少侠对话处理
 */
RiceVillageManager.prototype.handleShaoXiaDialog = function() {
    if (!this._validateSystem()) return;

    const player = this.core.gameData.player;
    if (!player.characterCreated) {
        this.showDialog(NPC_NAMES.SHAOXIA, '请先与刘大海完成角色创建。');
        return;
    }

    const genderTitle = player.gender === 'male' ? '兄弟' : '姐姐';
    this.showDialog(NPC_NAMES.SHAOXIA, `${genderTitle}，感谢你为我准备的茶饮！我的武功修炼进步很大。`);
};

/**
 * 李复对话处理
 */
RiceVillageManager.prototype.handleLiFuDialog = function() {
    if (!this._validateSystem()) return;

    const player = this.core.gameData.player;
    if (!player.characterCreated) {
        this.showDialog(NPC_NAMES.LI_FU, '请先与刘大海完成角色创建。');
        return;
    }

    const genderTitle = player.gender === 'male' ? '小哥' : '小妹';
    const npc = this.core.gameData.riceVillage.npcs[NPC_NAMES.LI_FU];

    // 优先检查秋叶青的对话任务
    const qiuyeqingDialogQuest = this.hasActiveQuestFromNPC(NPC_NAMES.QIU_YE_QING, 'nanzhi_nvr_xin');
    if (qiuyeqingDialogQuest) {
        // 完成秋叶青的难知女儿心任务
        this.showDialog(NPC_NAMES.LI_FU, '罢了，你先去吧，容我想想。', [
            { text: '传达秋叶青的话', action: 'complete_qiuyeqing_dialog_quest' },
            { text: '稍后再说', action: 'close_dialog' }
        ]);
        return;
    }

    // 使用统一任务检查函数
    const completableQuests = this.checkCompletableQuests(NPC_NAMES.LI_FU);

    if (completableQuests.length > 0) {
        // 有可提交的任务
        const quest = completableQuests[0];
        this.showDialog(NPC_NAMES.LI_FU, `${genderTitle}，你完成了"${quest.name}"任务。这是你的奖励。`, [
            { text: '提交任务', action: 'submit_quest_to_npc' },
            { text: '稍后再说', action: 'close_dialog' }
        ]);
        return;
    }

    // 检查是否已有李复的任务
    if (this.hasActiveQuestFromNPC(NPC_NAMES.LI_FU)) {
        this.showDialog(NPC_NAMES.LI_FU, `${genderTitle}，你的任务还在进行中。`);
        return;
    }

    // 根据questStage发布新任务
    // 重要：questStage只在任务提交后推进，不在对话时推进
    switch (npc.questStage) {
        case 0:
            // 第一个任务：青衣女子
            this.showDialog(NPC_NAMES.LI_FU, `${genderTitle}，小荷的死……不在棋局之中。究竟是何人所为？听说尸体是在瀑布之下发现的。这样看来，她或许看到了什么。你去小镜湖南岸大树下找一位青衣女子，问她今日见到对面的山崖发生了何事。`);
            this.createNPCQuest(NPC_NAMES.LI_FU, 'qingyinvzi', '青衣女子', '去找青衣女子，询问她今日见到对面山崖发生了何事', QUEST_TYPES.PROVIDE_ITEM, '与秋叶青对话', 1, { exp: 180, gold: 20 });
            // questStage保持0，等任务完成后才推进到1
            break;

        case 1:
            // 第四个任务：理解心意（采集野花）
            this.showDialog(NPC_NAMES.LI_FU, `${genderTitle}，她说这里没有胭脂水粉...算了，你去采些野花，我来想办法。`);
            this.createNPCQuest(NPC_NAMES.LI_FU, 'lijie_xinyi', '理解心意', '为秋叶青采集野花，理解她的心意', QUEST_TYPES.COLLECT, '野花', 8, { exp: 280, gold: 40 });
            // questStage保持1，等任务完成后才推进到2
            break;

        case 2:
            // 第九个任务：纪念小荷（采集野花祭奠）
            this.showDialog(NPC_NAMES.LI_FU, `${genderTitle}，小荷的事让我们都很难过。你去采集一些野花，让秋叶青拿去祭奠小荷吧。这样她的心情也会好一些。`);
            this.createNPCQuest(NPC_NAMES.LI_FU, 'jinian_xiaohe', '纪念小荷', '采集野花，让秋叶青去祭奠小荷', QUEST_TYPES.COLLECT, '野花', 6, { exp: 400, gold: 80 });
            // questStage保持2，等任务完成后才推进到3
            break;

        case 3:
            // 任务链完成，显示感谢对话
            this.showDialog(NPC_NAMES.LI_FU, `${genderTitle}，谢谢你的帮助。有了你的协助，我和秋叶青之间的误会也解开了。`);
            break;

        default:
            // 默认对话
            this.showDialog(NPC_NAMES.LI_FU, `${genderTitle}，我是李复，专精轻功。有机会可以教你一些轻功技巧。`);
            break;
    }
};

/**
 * 陈月对话处理
 */
RiceVillageManager.prototype.handleChenYueDialog = function() {
    if (!this._validateSystem()) return;

    const player = this.core.gameData.player;
    if (!player.characterCreated) {
        this.showDialog(NPC_NAMES.CHEN_YUE, '请先与刘大海完成角色创建。');
        return;
    }

    const genderTitle = player.gender === 'male' ? '小哥' : '小妹';
    this.showDialog(NPC_NAMES.CHEN_YUE, `${genderTitle}，我是陈月。村里有了你的茶铺，生活变得更有趣了。`);
};

/**
 * 🏪 武器铺老板对话处理 - 商店系统
 */
RiceVillageManager.prototype.handleWeaponShopDialog = function() {
    if (!this._validateSystem()) return;

    const player = this.core.gameData.player;
    if (!player.characterCreated) {
        this.showDialog(NPC_NAMES.WEAPON_SHOP_OWNER, '请先与刘大海完成角色创建。');
        return;
    }

    const genderTitle = player.gender === 'male' ? '少侠' : '姑娘';
    
    // 欢迎对话，显示商店选项
    this.showDialog(NPC_NAMES.WEAPON_SHOP_OWNER, `${genderTitle}，欢迎光临我的武器铺！我这里有各种武器装备，也收购一些稀有物品。你想要做什么？`, [
        { text: '购买装备', action: 'open_weapon_shop' },
        { text: '出售物品', action: 'open_sell_shop' },
        { text: '查看背包', action: 'show_inventory' },
        { text: '离开', action: 'close_dialog' }
    ]);
};

/**
 * 秋叶青对话处理
 */
RiceVillageManager.prototype.handleQiuYeQingDialog = function() {
    if (!this._validateSystem()) return;

    const player = this.core.gameData.player;
    if (!player.characterCreated) {
        this.showDialog(NPC_NAMES.QIU_YE_QING, '请先与刘大海完成角色创建。');
        return;
    }

    const genderTitle = player.gender === 'male' ? '小哥' : '小妹';
    const npc = this.core.gameData.riceVillage.npcs[NPC_NAMES.QIU_YE_QING];

    // 优先检查李复的对话任务
    const lifuDialogQuest = this.hasActiveQuestFromNPC(NPC_NAMES.LI_FU, 'qingyinvzi');
    if (lifuDialogQuest) {
        // 完成李复的青衣女子任务
        this.showDialog(NPC_NAMES.QIU_YE_QING, '本小姐可不是他的丫头，召之即来挥之即去。难道我这般待你竟不如一个乡下人么！', [
            { text: '询问山崖上的事', action: 'complete_lifu_dialog_quest' },
            { text: '稍后再说', action: 'close_dialog' }
        ]);
        return;
    }

    // 使用统一任务检查函数
    const completableQuests = this.checkCompletableQuests(NPC_NAMES.QIU_YE_QING);

    if (completableQuests.length > 0) {
        // 有可提交的任务
        const quest = completableQuests[0];
        this.showDialog(NPC_NAMES.QIU_YE_QING, `你完成了"${quest.name}"任务，这是你应得的。`, [
            { text: '提交任务', action: 'submit_quest_to_npc' },
            { text: '稍后再说', action: 'close_dialog' }
        ]);
        return;
    }

    // 检查是否已有秋叶青的任务
    if (this.hasActiveQuestFromNPC(NPC_NAMES.QIU_YE_QING)) {
        this.showDialog(NPC_NAMES.QIU_YE_QING, '你的任务还在进行中，快去完成吧。');
        return;
    }

    // 根据questStage发布新任务
    // 重要：questStage只在任务提交后推进，不在对话时推进
    switch (npc.questStage) {
        case 0:
            // 第二个任务：无耻之徒（击杀可疑的山贼）
            this.showDialog(NPC_NAMES.QIU_YE_QING, '你又是何人？李复他竟然叫你来问我话？我凭什么要告诉你？你若想我告诉你，去把下面那些毛手毛脚的可疑山贼给杀了，我便考虑要不要告诉你。否则免谈！');
            this.createNPCQuest(NPC_NAMES.QIU_YE_QING, 'wuchizhi_tu', '无耻之徒', '清理那些毛手毛脚的可疑山贼', QUEST_TYPES.KILL, '可疑的山贼', 6, { exp: 220, gold: 30 });
            // questStage保持0，等任务完成后才推进到1
            break;

        case 1:
            // 第三个任务：难知女儿心（传达消息给李复）
            this.showDialog(NPC_NAMES.QIU_YE_QING, '李复啊，李复，我从京畿随你到此，你对我不理不睬也罢了，今天竟让一个外人来拷问我。难道我这般待你竟不如一个乡下人么！少侠，你去告诉李复，不错，我是看到了什么！若想知道，自己来问我！否则自己想去！');
            this.createNPCQuest(NPC_NAMES.QIU_YE_QING, 'nanzhi_nvr_xin', '难知女儿心', '回到李复处传达秋叶青的话', QUEST_TYPES.PROVIDE_ITEM, '与李复对话', 1, { exp: 250, gold: 35 });
            // questStage保持1，等任务完成后才推进到2
            break;

        case 2:
            // 第五个任务：女儿家心思（制作茶水）
            this.showDialog(NPC_NAMES.QIU_YE_QING, '他终于明白了...你帮我制作3份茶水，我要好好打扮一下。');
            this.createNPCQuest(NPC_NAMES.QIU_YE_QING, 'nvr_jia_xinsi', '女儿家心思', '为秋叶青制作3份茶水', QUEST_TYPES.PROVIDE_ITEM, '茶饮', 3, { exp: 300, gold: 45 });
            // questStage保持2，等任务完成后才推进到3
            break;

        case 3:
            // 第七个任务：真相大白（击杀可疑的山贼）
            this.showDialog(NPC_NAMES.QIU_YE_QING, '现在我可以告诉你真相了。那日我在山崖上确实看到了可疑的身影，你去清理那些可疑的山贼，为小荷报仇！');
            this.createNPCQuest(NPC_NAMES.QIU_YE_QING, 'zhenxiang_dabai', '真相大白', '为小荷报仇，击败可疑的山贼', QUEST_TYPES.KILL, '可疑的山贼', 4, { exp: 350, gold: 60 });
            // questStage保持3，等任务完成后才推进到4
            break;

        case 4:
            // 任务链基本完成，显示感谢对话
            this.showDialog(NPC_NAMES.QIU_YE_QING, '谢谢你帮我和李复解决了这些问题。小荷的仇也报了，我的心情也好多了。');
            break;

        default:
            // 默认对话
            this.showDialog(NPC_NAMES.QIU_YE_QING, '我从长安秋家而来，跟随李复到此。这里是什么地方啊！什么都没有！');
            break;
    }
};

// ===== 第六区域：游戏核心功能（数据更新层）=====

/**
 * 攻击怪物 - 血量系统，进度条显示
 * @param {string} monsterName - 怪物名称
 * @important 只更新数据，不检查任务完成
 */
RiceVillageManager.prototype.attackMonster = function(monsterName) {
    if (!this._validateSystem()) return;

    // 初始化怪物数据
    if (!this.core.gameData.riceVillage.monsters) {
        this.core.gameData.riceVillage.monsters = {};
    }

    const monsters = this.core.gameData.riceVillage.monsters;

    // 使用统一的怪物配置
    const config = MONSTER_CONFIGS[monsterName];
    if (!config) return;

    // 初始化怪物状态 - 使用新的怪物分类系统
    if (!monsters[monsterName]) {
        const stats = generateMonsterStats(monsterName);
        monsters[monsterName] = {
            hp: stats.hp,
            maxHp: stats.maxHp,
            attack: stats.attack,
            exp: stats.exp,
            isActive: stats.isActive,
            lastAttackTime: 0,
            isRespawning: false
        };
        console.log(`🆕 生成新怪物: ${monsterName}`, monsters[monsterName]);
    }

    const monster = monsters[monsterName];

    // 检查怪物是否在重生中
    if (monster.isRespawning) {
        this.addDialogMessage('系统', `${monsterName}正在重生中，请稍候...`);
        return;
    }

    // 检查攻击冷却（防止过快攻击）
    const now = Date.now();
    if (now - monster.lastAttackTime < 1000) {
        return; // 1秒攻击冷却
    }

    monster.lastAttackTime = now;

    // 按照重建文档：显示独立的攻击进度条（8秒）
    this.showUnifiedAttackProgress(monsterName);

    // 8秒后攻击完成
    setTimeout(() => {
        // 按照重建指导文档：主动攻击型怪物先手攻击玩家
        const config = MONSTER_CONFIGS[monsterName];
        const typeConfig = MONSTER_TYPES[config.type];

        if (typeConfig.isActive && monster.hp > 0) {
            console.log(`⚔️ ${monsterName} 是主动攻击型，先手攻击玩家`);
            this.monsterAttackPlayer(monsterName, monster);
        }

        // 计算玩家+猫咪的总攻击力
        const player = this.core.gameData.player;
        const playerAttack = player.stats ? player.stats.power : (player.power || 5); // 玩家攻击力（包含装备加成）
        const catAttack = player.partner?.attack || 0; // 猫咪攻击力
        const totalDamage = playerAttack + catAttack;

        console.log(`⚔️ 攻击计算: 玩家攻击${playerAttack} + 猫咪攻击${catAttack} = 总伤害${totalDamage}`);
        console.log(`🎯 ${monsterName} 受到${totalDamage}点伤害，血量从${monster.hp}变为${monster.hp - totalDamage}`);

        // 造成伤害
        monster.hp -= totalDamage;

        // 更新血量显示
        this.updateMonsterHP(monsterName, monster.hp, monster.maxHp);

        if (monster.hp <= 0) {
            // 怪物被击败
            monster.hp = 0;
            console.log(`💀 ${monsterName} 被击败！血量归零`);

            // 更新任务进度 - 按照重建指导文档的新设计
            console.log(`🎯 击败 ${monsterName}，尝试更新任务进度`);
            console.log(`🔍 调用参数: type=${QUEST_TYPES.KILL}, target=${monsterName}, amount=1`);
            this.updateQuestProgress(QUEST_TYPES.KILL, monsterName, 1);

            // 保留全局击杀计数（用于调试）
            const killCounts = this.core.gameData.riceVillage.killCounts;
            killCounts[monsterName] = (killCounts[monsterName] || 0) + 1;

            // 给予经验奖励 - 使用新怪物系统的随机经验值
            let expReward = monster.exp;

            // 验证经验值，如果无效则重新生成
            if (typeof expReward !== 'number' || isNaN(expReward) || expReward <= 0) {
                console.warn(`🔧 怪物 ${monsterName} 经验值无效: ${expReward}，重新生成`);

                // 重新生成怪物属性
                const config = MONSTER_CONFIGS[monsterName];
                if (config) {
                    const typeConfig = MONSTER_TYPES[config.type];
                    if (typeConfig && typeConfig.expRange) {
                        expReward = Math.floor(Math.random() * (typeConfig.expRange[1] - typeConfig.expRange[0] + 1)) + typeConfig.expRange[0];
                        monster.exp = expReward; // 更新怪物数据
                        console.log(`🔧 重新生成经验值: ${expReward}`);
                    } else {
                        expReward = 10; // 备用默认值
                        console.warn(`🔧 使用备用经验值: ${expReward}`);
                    }
                } else {
                    expReward = 10; // 备用默认值
                    console.warn(`🔧 使用备用经验值: ${expReward}`);
                }
            }

            console.log(`🧪 [DEBUG] 击败怪物 ${monsterName}，准备给予 ${expReward} 经验`);
            this.gainExp(expReward);
            console.log(`🧪 [DEBUG] 击败怪物经验给予完成`);

            // 显示经验获得动画
            createFloatingText(`+${expReward}经验`, BATTLE_ANIMATION.EXP_COLOR, monsterName, 0);

            // 计算并显示掉落物品 - 使用统一背包系统
            const drops = calculateMonsterDrops(monsterName);
            drops.forEach((dropItem, index) => {
                // 使用统一背包系统添加物品（自动分类）
                if (this.core.inventorySystem) {
                    this.core.inventorySystem.addItem(dropItem, 1);
                    console.log(`📦 统一背包添加掉落物品: ${dropItem}`);
                } else {
                    console.error('❌ 统一背包系统未初始化');
                }

                // 显示掉落动画，错开位置
                createFloatingText(`+${dropItem}`, BATTLE_ANIMATION.DROP_COLOR, monsterName, index + 1);

                console.log(`🎁 ${monsterName} 掉落: ${dropItem}`);
            });

            this.addDebugLog(`💀 击败 ${monsterName}，获得 ${expReward} 经验${drops.length > 0 ? '，掉落: ' + drops.join(', ') : ''}`);

            // 3秒后复活并重新随机属性
            setTimeout(() => {
                console.log(`🔄 ${monsterName} 开始复活`);

                // 重新随机生成怪物属性
                const newStats = generateMonsterStats(monsterName);
                monster.hp = newStats.hp;
                monster.maxHp = newStats.maxHp;
                monster.attack = newStats.attack;
                monster.exp = newStats.exp;
                monster.isActive = newStats.isActive;
                monster.isRespawning = false;

                // 立即刷新血量条
                this.updateMonsterHP(monsterName, monster.hp, monster.maxHp);

                // 按照重建文档：使用新的统一战斗流程恢复按钮
                this.restoreUnifiedAttackButton(monsterName);

                // 刷新怪物表格显示
                this.renderMonstersTable();

                console.log(`✅ ${monsterName} 复活完成，新属性:`, {
                    hp: `${monster.hp}/${monster.maxHp}`,
                    attack: monster.attack,
                    exp: monster.exp,
                    isActive: monster.isActive
                });
            }, 3000); // 3秒后复活 - 按照你的规定

            // 更新界面显示
            this.updatePlayerStatus();
        } else {
            // 怪物没死，按钮恢复由进度条动画完成时自动处理
        }

        // 保存数据
        this.core.saveGameData();

        // 刷新怪物表格显示
        this.renderMonstersTable();
    }, 8000); // 8秒攻击时间

    // 立即更新界面显示
    this.updatePlayerStatus();
};

/**
 * 采集植物 - 进度条显示，刷新机制
 * @param {string} plantName - 植物名称
 * @important 只更新数据，不检查任务完成
 */
RiceVillageManager.prototype.gatherPlant = function(plantName) {
    if (!this._validateSystem()) return;

    // 初始化植物数据
    if (!this.core.gameData.riceVillage.plants) {
        this.core.gameData.riceVillage.plants = {};
    }

    const plants = this.core.gameData.riceVillage.plants;

    // 使用统一的植物配置系统
    const config = getPlantConfig(plantName);
    if (!config) return;

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
        this.addDialogMessage('系统', `${plantName}还在生长中，请稍候...`);
        return;
    }

    if (plant.isGathering) {
        this.addDialogMessage('系统', `正在采集${plantName}中...`);
        return;
    }

    console.log(`🌿 开始采集 ${plantName}，当前状态:`, plant);

    // 开始采集
    plant.isGathering = true;

    // 立即刷新植物表格显示采集状态
    this.renderPlantsTable();

    // 显示采集进度条
    this.showGatherProgress(plantName, config.gatherTime);

    // 采集完成
    setTimeout(() => {
        // 使用统一背包系统添加物品（自动分类）
        if (this.core.inventorySystem) {
            this.core.inventorySystem.addItem(plantName, 1);
            console.log(`📦 统一背包添加采集物品: ${plantName}`);
        } else {
            console.error('❌ 统一背包系统未初始化');
        }

        this.addDebugLog(`🌿 采集 ${plantName}`);

        // 按照重建指导文档：采集植物获得统一经验
        console.log(`🧪 [DEBUG] 采集植物 ${plantName}，准备给予 ${config.expReward} 经验`);
        this.gainExp(config.expReward);
        console.log(`🧪 [DEBUG] 采集植物经验给予完成`);

        // 显示经验获得动画
        createFloatingText(`+${config.expReward}经验`, BATTLE_ANIMATION.EXP_COLOR, plantName, 0);

        // 按照重建指导文档：更新收集类任务进度
        this.updateCollectQuestProgress(plantName);

        this.addDialogMessage('系统', `采集到${plantName}！获得${config.expReward}经验！如有任务请找NPC提交。`);

        // 设置植物不可用，开始刷新倒计时
        plant.available = false;
        plant.isGathering = false;
        plant.lastGatherTime = Date.now();

        this.startPlantRefresh(plantName, config.refreshTime);

        // 保存数据
        this.core.saveGameData();

        // 更新界面显示
        this.renderPlantsTable();

    }, config.gatherTime);

    // 重要：绝对不在这里检查任务完成
};

/**
 * 更新怪物血量显示
 * @param {string} monsterName - 怪物名称
 * @param {number} currentHp - 当前血量
 * @param {number} maxHp - 最大血量
 */
RiceVillageManager.prototype.updateMonsterHP = function(monsterName, currentHp, maxHp) {
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
};

/**
 * 显示采集进度条（参考旧系统结构）
 * @param {string} plantName - 植物名称
 * @param {number} gatherTime - 采集时间（毫秒）
 */
RiceVillageManager.prototype.showGatherProgress = function(plantName, gatherTime) {
    // 找到植物行的操作单元格
    const plantRow = document.querySelector(`[data-plant="${plantName}"]`);
    if (!plantRow) return;

    const actionCell = plantRow.cells[plantRow.cells.length - 1]; // 最后一个单元格

    // 使用与其他进度条一致的样式和颜色
    actionCell.innerHTML = `
        <div class="progress-bar" style="width: 100px; height: 16px; background: #ddd; border-radius: 4px; overflow: hidden; position: relative;">
            <div class="progress-fill" id="progress-${plantName}" style="width: 0%; height: 100%; background: #9ca3af; transition: width 0.1s;"></div>
            <div class="progress-text" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #333;">采集中...</div>
        </div>
    `;

    // 启动进度条动画
    this.startProgressAnimation(plantName, gatherTime);
};

/**
 * 启动采集进度条动画 - 按照重建文档规范
 * @param {string} plantName - 植物名称
 * @param {number} gatherTime - 采集时间（毫秒）
 */
RiceVillageManager.prototype.startProgressAnimation = function(plantName, gatherTime) {
    const progressFill = document.getElementById(`progress-${plantName}`);
    const progressText = progressFill ? progressFill.nextElementSibling : null;

    if (!progressFill || !progressText) {
        console.error(`找不到采集进度条元素: progress-${plantName}`);
        return;
    }

    let startTime = Date.now();

    // 使用独立的动画函数，避免全局冲突
    const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const percent = Math.min(100, (elapsed / gatherTime) * 100);

        progressFill.style.width = `${percent}%`;
        progressText.textContent = `采集中 ${Math.round(percent)}%`;

        if (percent < 100) {
            requestAnimationFrame(updateProgress);
        } else {
            // 采集完成，恢复按钮
            this.restoreGatherButton(plantName);
        }
    };

    updateProgress();
    console.log(`🌿 开始采集 ${plantName}，进度条ID: progress-${plantName}`);
};

/**
 * 恢复采集按钮 - 按照重建文档规范
 * @param {string} plantName - 植物名称
 */
RiceVillageManager.prototype.restoreGatherButton = function(plantName) {
    const plantRow = document.querySelector(`[data-plant="${plantName}"]`);
    if (!plantRow) return;

    const actionCell = plantRow.cells[plantRow.cells.length - 1];

    // 恢复采集按钮为禁用状态（因为植物正在生长）
    actionCell.innerHTML = `<button class="action-btn" disabled>生长中</button>`;

    console.log(`🌱 ${plantName} 采集按钮已恢复为生长状态`);
};

// 旧的进度条动画函数已删除，现在使用新的统一战斗流程

/**
 * 开始怪物重生倒计时
 * @param {string} monsterName - 怪物名称
 */
RiceVillageManager.prototype.startMonsterRespawn = function(monsterName) {
    const monsters = this.core.gameData.riceVillage.monsters;
    const monster = monsters[monsterName];

    monster.isRespawning = true;

    // 30秒后重生
    setTimeout(() => {
        monster.hp = monster.maxHp;
        monster.isRespawning = false;

        this.addDialogMessage('系统', `${monsterName}重新出现了！`);
        this.renderMonstersTable();

        // 移除血量条
        const progressId = `monster-hp-${monsterName}`;
        const progressContainer = document.getElementById(progressId);
        if (progressContainer && progressContainer.parentNode) {
            progressContainer.parentNode.removeChild(progressContainer);
        }

        this.core.saveGameData();
    }, 30000);
};

// 旧的攻击进度条显示函数已删除，现在使用新的统一战斗流程

// 旧的攻击进度条函数已删除，现在使用新的统一战斗流程

// ===== 新的统一战斗流程系统 =====

/**
 * 显示统一攻击进度条 - 按照重建文档规范
 * @param {string} monsterName - 怪物名称
 */
RiceVillageManager.prototype.showUnifiedAttackProgress = function(monsterName) {
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
};

/**
 * 启动统一攻击动画 - 按照重建文档规范
 * @param {string} monsterName - 怪物名称
 * @param {string} progressId - 进度条唯一ID
 * @param {number} duration - 持续时间（毫秒）
 */
RiceVillageManager.prototype.startUnifiedAttackAnimation = function(monsterName, progressId, duration) {
    const progressFill = document.getElementById(progressId);
    const progressText = progressFill ? progressFill.nextElementSibling : null;

    if (!progressFill || !progressText) {
        console.error(`找不到进度条元素: ${progressId}`);
        return;
    }

    let startTime = Date.now();

    // 使用独立的动画函数，避免全局冲突
    const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const percent = Math.min(100, (elapsed / duration) * 100);

        progressFill.style.width = `${percent}%`;
        progressText.textContent = `攻击中 ${Math.round(percent)}%`;

        if (percent < 100) {
            requestAnimationFrame(updateProgress);
        } else {
            // 攻击完成，恢复按钮
            this.restoreUnifiedAttackButton(monsterName);
        }
    };

    updateProgress();
    console.log(`⚔️ 开始攻击 ${monsterName}，进度条ID: ${progressId}`);
};

/**
 * 恢复统一攻击按钮 - 按照重建文档规范
 * @param {string} monsterName - 怪物名称
 */
RiceVillageManager.prototype.restoreUnifiedAttackButton = function(monsterName) {
    const monsterRow = document.querySelector(`[data-monster="${monsterName}"]`);
    if (!monsterRow) return;

    const actionCell = monsterRow.cells[monsterRow.cells.length - 1];

    // 检查董虎是否需要任务激活 - 按照重建指导文档规则
    let buttonDisabled = '';
    if (monsterName === '董虎') {
        const hasDonghuQuest = this.hasActiveQuestFromNPC(NPC_NAMES.LIU_YANG, 'defeat_donghu');
        if (!hasDonghuQuest) {
            buttonDisabled = 'disabled';
        }
    }

    // 恢复攻击按钮
    actionCell.innerHTML = `<button class="action-btn" ${buttonDisabled} onclick="riceVillageManager.attackMonster('${monsterName}')">攻击</button>`;

    console.log(`🔄 ${monsterName} 攻击按钮已恢复`);
};

/**
 * 开始植物刷新倒计时
 * @param {string} plantName - 植物名称
 * @param {number} refreshTime - 刷新时间（毫秒）
 */
RiceVillageManager.prototype.startPlantRefresh = function(plantName, refreshTime) {
    const plants = this.core.gameData.riceVillage.plants;
    const plant = plants[plantName];

    setTimeout(() => {
        // 确保植物状态完全重置
        plant.available = true;
        plant.isGathering = false;  // 确保不在采集状态

        this.addDialogMessage('系统', `${plantName}重新生长了！`);
        this.renderPlantsTable();

        this.core.saveGameData();

        console.log(`🌱 ${plantName} 刷新完成，状态重置:`, plant);
    }, refreshTime);
};

/**
 * 更新植物状态显示
 * @param {string} plantName - 植物名称
 * @param {string} status - 状态：'available', 'gathering', 'cooldown'
 */
RiceVillageManager.prototype.updatePlantStatus = function(plantName, status) {
    const statusElement = document.querySelector(`[data-plant-status="${plantName}"]`);
    if (statusElement) {
        switch (status) {
            case 'available':
                statusElement.textContent = '可采集';
                statusElement.className = 'resource-status resource-available';
                break;
            case 'gathering':
                statusElement.textContent = '采集中';
                statusElement.className = 'resource-status';
                break;
            case 'cooldown':
                statusElement.textContent = '生长中';
                statusElement.className = 'resource-status resource-cooldown';
                break;
        }
    }
};

// ===== 第八区域：界面更新系统 =====

/**
 * 更新任务显示
 */
RiceVillageManager.prototype.updateQuestDisplay = function() {
    const questsContainer = document.getElementById('active-quests');
    if (!questsContainer) {
        console.warn('任务显示容器未找到');
        return;
    }

    const activeQuests = this.core.gameData.quests.active || [];
    const questProgress = this.core.gameData.quests.progress || {};
    const inventory = this.core.gameData.inventory;

    let questsHTML = '';

    if (activeQuests.length === 0) {
        questsHTML += '<div style="color: #6b7280; font-size: 11px;">暂无进行中的任务</div>';
    } else {
        activeQuests.forEach(quest => {
            let progress = 0;
            let progressText = '';

            switch (quest.type) {
                case QUEST_TYPES.KILL:
                    const killProgressData = questProgress[quest.id];
                    if (killProgressData) {
                        progress = killProgressData.current;
                        progressText = `${progress}/${killProgressData.required}`;
                    } else {
                        progressText = `0/${quest.required}`;
                    }
                    break;
                case QUEST_TYPES.COLLECT:
                    // 使用收集类任务的统一进度机制
                    const collectProgressData = questProgress[quest.id];
                    console.log(`🔍 收集任务显示调试 ${quest.id}:`, {
                        questTarget: quest.target,
                        progressData: collectProgressData,
                        inventoryCount: window.unifiedInventory ? window.unifiedInventory.getItemCount(quest.target) : 0
                    });

                    if (collectProgressData) {
                        // 检查数据完整性，修复缺失的baseAmount
                        if (collectProgressData.baseAmount === undefined) {
                            console.log(`🔧 修复收集任务数据: ${quest.id} 缺少baseAmount`);
                            collectProgressData.baseAmount = 0; // 默认为0
                        }

                        // 🔧 修复：使用统一背包系统获取当前物品数量
                        const currentAmount = window.unifiedInventory ? window.unifiedInventory.getItemCount(quest.target) : 0;
                        const baseAmount = collectProgressData.baseAmount || 0;
                        progress = Math.max(0, currentAmount - baseAmount);
                        progressText = `${progress}/${collectProgressData.required}`;

                        console.log(`📊 收集进度计算: 当前${currentAmount} - 基础${baseAmount} = 进度${progress}`);
                    } else {
                        // 🔧 修复：兼容旧逻辑也使用统一背包系统
                        progress = window.unifiedInventory ? window.unifiedInventory.getItemCount(quest.target) : 0;
                        progressText = `${progress}/${quest.required}`;
                        console.log(`⚠️ 使用旧逻辑: ${progressText}`);
                    }
                    break;
                case QUEST_TYPES.PROVIDE_ITEM:
                    if (quest.target === '茶饮') {
                        progress = (inventory.madeTeas || []).length;
                    } else {
                        progress = (inventory.madeTeas || []).filter(tea => tea.name === quest.target).length;
                    }
                    progressText = `${progress}/${quest.required}`;
                    break;
            }

            const isCompleted = progress >= quest.required;
            const statusIcon = isCompleted ? '✅' : '⏳';

            questsHTML += `
                <div style="margin-bottom: 8px; padding: 6px; background: ${isCompleted ? '#e8f5e8' : '#f9f9f9'}; border: 1px solid #ddd; font-size: 11px;">
                    <div style="font-weight: bold; color: #333;">${statusIcon} ${quest.name}</div>
                    <div style="color: #666; margin: 2px 0;">${quest.description}</div>
                    <div style="color: #888;">进度: ${progressText} | 目标: ${quest.target} | 来源: ${quest.npc}</div>
                </div>
            `;
        });
    }

    questsContainer.innerHTML = questsHTML;
};

/**
 * 更新玩家状态显示
 */
RiceVillageManager.prototype.updatePlayerStatus = function() {
    const player = this.core.gameData.player;

    console.log('🔄 更新玩家状态:', player);

    // 更新角色名称
    const nameElement = document.getElementById('player-name');
    if (nameElement) {
        if (player.characterCreated && player.name) {
            nameElement.textContent = player.name;
        } else {
            nameElement.textContent = '未设置';
        }
    }

    // 更新性别
    const genderElement = document.getElementById('player-gender');
    if (genderElement) {
        if (player.characterCreated && player.gender) {
            // 显示时转换为中文
            const genderText = player.gender === 'male' ? '男' : '女';
            genderElement.textContent = genderText;
        } else {
            genderElement.textContent = '未设置';
        }
    }

    // 更新等级
    const levelElement = document.getElementById('player-level');
    if (levelElement) {
        console.log('🔍 当前玩家等级数据:', player.level);

        // 如果等级异常，重置为1
        if (!player.level || player.level < 1 || player.level > 100) {
            console.warn('⚠️ 检测到异常等级，重置为1');
            player.level = 1;
            this.core.saveGameData();
        }

        levelElement.textContent = `${player.level}级`;
    }

    // 更新经验 - 按照重建指导文档的公式
    const expElement = document.getElementById('player-exp');
    if (expElement) {
        const currentExp = player.exp || 0;
        const nextLevelExp = this.getExpRequiredForLevel(player.level || 1);
        expElement.textContent = `${currentExp}/${nextLevelExp}`;
    }

    // 🔧 强制重新计算属性，确保显示正确数值
    this.updatePlayerStats();
    
    // 更新血量（强制使用重新计算的正确数值）
    const hpTextElement = document.getElementById('player-hp-text');
    if (hpTextElement) {
        const currentHp = player.hp || 100;
        const maxHp = player.maxHp || 100;
        hpTextElement.textContent = `${currentHp}/${maxHp}`;
        console.log('🔍 更新血量显示:', `${currentHp}/${maxHp}`, '强制同步后');
    } else {
        // 备用：如果找不到新的血量文本元素，尝试旧的方式
        const hpElement = document.getElementById('player-hp');
        if (hpElement) {
            const currentHp = player.hp || 100;
            const maxHp = player.maxHp || 100;
            hpElement.textContent = `${currentHp}/${maxHp}`;
            console.log('🔍 更新血量显示（备用方式）:', `${currentHp}/${maxHp}`);
        }
    }

    // 更新体力
    const staminaElement = document.getElementById('player-stamina');
    if (staminaElement) {
        staminaElement.textContent = `${player.stamina || 100}/${player.maxStamina || 100}`;
    }

    // 更新攻击力（强制使用重新计算的正确数值）
    const powerElement = document.getElementById('player-power');
    if (powerElement) {
        const displayPower = player.power || 5;
        powerElement.textContent = displayPower;
        console.log('🔍 更新攻击力显示:', displayPower, '强制同步后');
    }

    // 更新金币
    const fundsElement = document.getElementById('player-funds');
    if (fundsElement) {
        fundsElement.textContent = `${player.funds || 1000} 🪙`;
    }

    // 按照重建指导文档：更新伙伴信息到正确的HTML元素
    const catNameElement = document.getElementById('cat-name');
    const catTypeElement = document.getElementById('cat-type');
    const catLevelElement = document.getElementById('cat-level');
    const catHpElement = document.getElementById('cat-hp');
    const catPowerElement = document.getElementById('cat-power');

    if (player.partner) {
        // 显示伙伴信息
        if (catNameElement) catNameElement.textContent = player.partner.name;
        if (catTypeElement) catTypeElement.textContent = `${player.partner.type}型`;
        if (catLevelElement) catLevelElement.textContent = `${player.partner.level}级`;
        if (catHpElement) catHpElement.textContent = `${player.partner.hp}/${player.partner.maxHp}`;
        if (catPowerElement) catPowerElement.textContent = player.partner.attack;

        console.log('🐱 更新伙伴显示:', {
            name: player.partner.name,
            type: player.partner.type,
            level: player.partner.level,
            hp: `${player.partner.hp}/${player.partner.maxHp}`,
            attack: player.partner.attack
        });
    } else {
        // 显示未选择状态
        if (catNameElement) catNameElement.textContent = '未选择伙伴';
        if (catTypeElement) catTypeElement.textContent = '-';
        if (catLevelElement) catLevelElement.textContent = '-';
        if (catHpElement) catHpElement.textContent = '-';
        if (catPowerElement) catPowerElement.textContent = '-';
    }
};

/**
 * 渲染NPC表格
 * @important 属于第八区域：界面更新系统
 */
RiceVillageManager.prototype.renderNPCsTable = function() {
    if (!this._validateSystem()) return;

    const npcsContainer = document.getElementById('npcs-table');
    if (!npcsContainer) return;

    const npcs = this.core.gameData.riceVillage.npcs;

    // NPC配置数据
    const npcConfigs = {
        [NPC_NAMES.LIU_DAHAI]: {
            name: '刘大海',
            job: '武学教头',
            description: '负责村里的武学指导'
        },
        [NPC_NAMES.LIU_YANG]: {
            name: '刘洋',
            job: '村长',
            description: '村庄的管理者'
        },
        [NPC_NAMES.WANG_POPO]: {
            name: '王婆婆',
            job: '村民',
            description: '慈祥的老婆婆'
        },
        [NPC_NAMES.SHAOXIA]: {
            name: '少侠',
            job: '武学弟子',
            description: '刘大海的徒弟'
        },
        [NPC_NAMES.LI_FU]: {
            name: '李复',
            job: '轻功师父',
            description: '轻功高手'
        },
        [NPC_NAMES.CHEN_YUE]: {
            name: '陈月',
            job: '村民',
            description: '普通村民'
        },
        [NPC_NAMES.WANG_FU]: {
            name: '王富',
            job: '车夫',
            description: '驿站车夫，负责运送旅客'
        },
        [NPC_NAMES.QIU_YE_QING]: {
            name: '秋叶青',
            job: '秋家大小姐',
            description: '长安来的秋家大小姐'
        },
        [NPC_NAMES.WEAPON_SHOP_OWNER]: {
            name: '武器铺老板',
            job: '武器商人',
            description: '经营武器装备买卖'
        }
    };

    let npcsHTML = '';

    Object.entries(npcConfigs).forEach(([npcName, config]) => {
        const npcData = npcs[npcName];
        const questStage = npcData ? npcData.questStage : 0;

        // 安全地检查任务状态（已经通过_validateSystem验证）
        let taskStatus = `阶段 ${questStage}`;

        try {
            // 检查是否有该NPC的活跃任务
            const hasActiveQuest = this.hasActiveQuestFromNPC(npcName);

            // 检查是否有可提交的任务
            const completableQuests = this.checkCompletableQuests(npcName);
            const hasCompletableQuest = completableQuests.length > 0;

            if (hasCompletableQuest) {
                taskStatus = '✅ 可提交';
            } else if (hasActiveQuest) {
                taskStatus = '⏳ 进行中';
            }
        } catch (error) {
            // 如果检查失败，使用默认状态
            console.warn(`检查NPC ${npcName} 任务状态失败:`, error);
        }

        npcsHTML += `
            <tr>
                <td><strong>${config.name}</strong><br><small>${config.description}</small></td>
                <td>${config.job}</td>
                <td>${taskStatus}</td>
                <td>
                    <button class="action-btn" onclick="talkToNPC('${npcName}')">对话</button>
                </td>
            </tr>
        `;
    });

    npcsContainer.innerHTML = npcsHTML;
};

/**
 * 渲染怪物表格
 * @important 属于第八区域：界面更新系统
 */
RiceVillageManager.prototype.renderMonstersTable = function() {
    if (!this._validateSystem()) return;

    const monstersContainer = document.getElementById('monsters-table');
    if (!monstersContainer) return;

    const killCounts = this.core.gameData.riceVillage.killCounts || {};

    // 使用统一的怪物配置 - 按照重建指导文档的怪物分类系统
    const monsterNames = ['野兔', '果子狸', '野猪', '猴子', '山贼', '可疑的山贼', '董虎'];

    let monstersHTML = '';

    monsterNames.forEach(monsterName => {
        const monsters = this.core.gameData.riceVillage.monsters || {};
        const monsterData = monsters[monsterName];
        const config = MONSTER_CONFIGS[monsterName];

        if (!config) return;

        let currentHp = 0;
        let maxHp = 0;
        let buttonDisabled = '';

        // 调试信息
        console.log(`🔍 ${monsterName} 渲染调试:`, {
            config: config,
            monsterData: monsterData,
            hasMonsterData: !!monsterData
        });

        if (monsterData) {
            // 使用存储的怪物数据
            currentHp = Math.max(0, monsterData.hp); // 不显示负数
            maxHp = monsterData.maxHp;
            console.log(`📊 ${monsterName} 使用存储数据: ${currentHp}/${maxHp}`);

            if (monsterData.isRespawning) {
                buttonDisabled = 'disabled';
            }
        } else {
            // 初始化新怪物数据
            const stats = generateMonsterStats(monsterName);
            monsters[monsterName] = {
                hp: stats.hp,
                maxHp: stats.maxHp,
                attack: stats.attack,
                exp: stats.exp,
                isActive: stats.isActive,
                isRespawning: false
            };
            currentHp = stats.hp;
            maxHp = stats.maxHp;
            console.log(`🆕 初始化怪物数据: ${monsterName}`, monsters[monsterName]);
        }

        // 检查董虎是否需要任务激活 - 按照重建指导文档规则
        if (monsterName === '董虎') {
            const donghuQuest = this.hasActiveQuestFromNPC(NPC_NAMES.LIU_YANG, 'defeat_donghu');
            const hasDonghuQuest = !!donghuQuest; // 转换为布尔值
            if (!hasDonghuQuest) {
                buttonDisabled = 'disabled';
                console.log(`🚫 董虎需要任务激活才能攻击，当前任务:`, donghuQuest);
            } else {
                console.log(`✅ 董虎任务已激活，可以攻击，任务:`, donghuQuest);
            }
        }

        monstersHTML += `
            <tr data-monster="${monsterName}">
                <td><strong>${monsterName}</strong></td>
                <td><small>${config.description}</small></td>
                <td><small>${config.drops}</small></td>
                <td id="monster-hp-${monsterName}">
                    <div class="progress-bar" style="height: 16px;">
                        <div class="progress-fill" style="width: ${maxHp > 0 ? (currentHp / maxHp) * 100 : 0}%; background-color: #9ca3af;"></div>
                        <div class="progress-text">${currentHp}/${maxHp}</div>
                    </div>
                </td>
                <td>
                    <button class="action-btn" onclick="attackMonster('${monsterName}')" ${buttonDisabled}>攻击</button>
                </td>
            </tr>
        `;
    });

    monstersContainer.innerHTML = monstersHTML;

    // 保存怪物数据（如果有新初始化的怪物）
    this.core.saveGameData();
};

/**
 * 渲染植物表格
 * @important 属于第八区域：界面更新系统
 */
RiceVillageManager.prototype.renderPlantsTable = function() {
    if (!this._validateSystem()) return;

    const plantsContainer = document.getElementById('plants-table');
    if (!plantsContainer) return;

    const inventory = this.core.gameData.inventory;

    // 使用统一的植物配置 - 按照重建指导文档的植物分类系统
    const plantNames = Object.keys(PLANT_CONFIGS);

    let plantsHTML = '';

    plantNames.forEach(plantName => {
        const config = getPlantConfig(plantName);
        if (!config) return;

        const ownedCount = inventory[config.category] ? (inventory[config.category][plantName] || 0) : 0;
        const plants = this.core.gameData.riceVillage.plants || {};
        const plantData = plants[plantName];

        let buttonDisabled = '';
        let buttonText = '采集';

        // 调试信息
        console.log(`🔍 ${plantName} 植物渲染调试:`, {
            config: config,
            plantData: plantData,
            hasPlantData: !!plantData
        });

        if (plantData) {
            // 🔧 修复矛盾状态：如果available=true但isGathering=true，强制修复
            if (plantData.available && plantData.isGathering) {
                console.log(`🚨 检测到 ${plantName} 状态矛盾，强制修复: available=true, isGathering=true`);
                plantData.isGathering = false;
                this.core.saveGameData(); // 立即保存修复
                console.log(`✅ ${plantName} 状态已修复为: available=true, isGathering=false`);
            }

            if (plantData.isGathering) {
                buttonText = '采集中...';
                buttonDisabled = 'disabled';
                console.log(`🌿 ${plantName} 状态: 采集中`);
            } else if (!plantData.available) {
                buttonText = '冷却中';
                buttonDisabled = 'disabled';
                console.log(`🌿 ${plantName} 状态: 冷却中`);
            } else {
                console.log(`🌿 ${plantName} 状态: 可采集`);
            }
        } else {
            console.log(`🌿 ${plantName} 状态: 新植物，可采集`);
        }

        plantsHTML += `
            <tr data-plant="${plantName}">
                <td><strong>${plantName}</strong></td>
                <td><small>${config.description}</small></td>
                <td><small>${config.usage} (拥有: ${ownedCount})</small></td>
                <td>
                    <button class="action-btn" onclick="gatherPlant('${plantName}')" ${buttonDisabled}>${buttonText}</button>
                </td>
            </tr>
        `;
    });

    plantsContainer.innerHTML = plantsHTML;
};

// ===== 第九区域：对话窗体系统 =====

/**
 * 创建对话窗体（页面底部固定窗体）
 * @important 按照重建指导文档：6行高度，自动滚动，底部固定
 */
RiceVillageManager.prototype.createDialogWindow = function() {
    const dialogWindow = document.getElementById('dialog-window');
    if (dialogWindow) {
        dialogWindow.style.display = 'block';
        document.body.classList.add('dialog-active');
    }
};

/**
 * 显示对话 - 按照重建指导文档：Win95风格模态弹窗
 * @param {string} npcName - NPC名称
 * @param {string} message - 对话内容
 * @param {Array} options - 对话选项
 */
RiceVillageManager.prototype.showDialog = function(npcName, message, options = []) {
    // 使用Win95风格模态弹窗
    this.showWin95Dialog(npcName, message, options);
};

/**
 * Win95风格对话弹窗 - 按照重建指导文档
 * @param {string} npcName - NPC名称
 * @param {string} message - 对话内容
 * @param {Array} options - 对话选项
 */
RiceVillageManager.prototype.showWin95Dialog = function(npcName, message, options = []) {
    // 创建Win95风格的模态弹窗
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(2px);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    const modal = document.createElement('div');
    modal.className = 'win95-modal';
    modal.style.cssText = `
        background: #c0c0c0;
        border: 2px outset #c0c0c0;
        box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
        min-width: 400px;
        max-width: 600px;
        font-family: 'MS Sans Serif', sans-serif;
        font-size: 12px;
    `;

    // 创建标题栏
    const header = document.createElement('div');
    header.style.cssText = `
        background: linear-gradient(90deg, #0080ff 0%, #0040c0 100%);
        color: white;
        padding: 4px 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: bold;
        font-size: 12px;
    `;
    header.innerHTML = `
        <span>💬 ${npcName}</span>
        <span style="cursor: pointer; padding: 0 4px;" onclick="this.closest('.modal-overlay').remove()">×</span>
    `;

    // 创建内容区域
    const content = document.createElement('div');
    content.style.cssText = `
        padding: 16px 20px;
        background: #c0c0c0;
        line-height: 1.6;
        color: #000000;
        min-height: 60px;
    `;
    content.innerHTML = message;

    // 创建按钮区域
    const buttons = document.createElement('div');
    buttons.style.cssText = `
        padding: 12px 16px;
        background: #c0c0c0;
        border-top: 1px solid #808080;
        display: flex;
        gap: 8px;
        justify-content: center;
    `;

    if (options.length > 0) {
        options.forEach(option => {
            const btn = document.createElement('button');
            btn.style.cssText = `
                background: #c0c0c0;
                border: 1px outset #c0c0c0;
                padding: 4px 16px;
                font-size: 11px;
                cursor: pointer;
                color: #000000;
                font-family: 'MS Sans Serif', sans-serif;
            `;
            btn.textContent = option.text;
            btn.onclick = () => {
                overlay.remove();
                this.handleDialogOption(option.action);
            };
            btn.onmousedown = () => btn.style.border = '1px inset #c0c0c0';
            btn.onmouseup = () => btn.style.border = '1px outset #c0c0c0';
            buttons.appendChild(btn);
        });
    } else {
        const btn = document.createElement('button');
        btn.style.cssText = `
            background: #c0c0c0;
            border: 1px outset #c0c0c0;
            padding: 4px 16px;
            font-size: 11px;
            cursor: pointer;
            color: #000000;
            font-family: 'MS Sans Serif', sans-serif;
        `;
        btn.textContent = '确定';
        btn.onclick = () => overlay.remove();
        btn.onmousedown = () => btn.style.border = '1px inset #c0c0c0';
        btn.onmouseup = () => btn.style.border = '1px outset #c0c0c0';
        buttons.appendChild(btn);
    }

    modal.appendChild(header);
    modal.appendChild(content);
    modal.appendChild(buttons);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
};

/**
 * 添加对话消息（自动换行）
 * @param {string} npcName - NPC名称
 * @param {string} message - 消息内容
 */
RiceVillageManager.prototype.addDialogMessage = function(npcName, message) {
    const dialogContent = document.getElementById('dialog-content');
    if (!dialogContent) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = 'dialog-message';
    messageDiv.innerHTML = `<span class="dialog-npc-name">${npcName}:</span> ${message}`;

    dialogContent.appendChild(messageDiv);

    // 自动滚动到底部
    dialogContent.scrollTop = dialogContent.scrollHeight;
};

/**
 * 显示对话选项
 * @param {Array} options - 对话选项数组
 */
RiceVillageManager.prototype.showDialogOptions = function(options = []) {
    const dialogOptions = document.getElementById('dialog-options');
    if (!dialogOptions) return;

    let optionsHTML = '';

    if (options.length > 0) {
        options.forEach(option => {
            optionsHTML += `<button class="dialog-option-btn" onclick="riceVillageManager.handleDialogOption('${option.action}')">${option.text}</button>`;
        });
    } else {
        optionsHTML = '<button class="dialog-option-btn" onclick="riceVillageManager.closeDialog()">确定</button>';
    }

    dialogOptions.innerHTML = optionsHTML;
};

/**
 * 清空对话窗体
 */
RiceVillageManager.prototype.clearDialogWindow = function() {
    const dialogContent = document.getElementById('dialog-content');
    const dialogOptions = document.getElementById('dialog-options');

    if (dialogContent) {
        dialogContent.innerHTML = '';
    }

    if (dialogOptions) {
        dialogOptions.innerHTML = '';
    }
};

/**
 * 处理对话选项
 * @param {string} action - 选项动作
 */
RiceVillageManager.prototype.handleDialogOption = function(action) {
    switch (action) {
        case 'submit_quest_to_npc':
            // 统一的NPC任务提交处理
            const currentNPC = this.currentDialogNPC;
            if (currentNPC) {
                this.submitQuestToNPC(currentNPC);
            }
            break;
        case 'advance_dialog_stage':
            // 推进对话阶段（用于多阶段对话）
            const dialogNPC = this.currentDialogNPC;
            if (dialogNPC) {
                const npc = this.core.gameData.riceVillage.npcs[dialogNPC];
                if (npc) {
                    npc.questStage++;
                    console.log(`📈 推进${dialogNPC}的对话阶段到: ${npc.questStage}`);
                    this.addDebugLog(`📈 推进${dialogNPC}的对话阶段到: ${npc.questStage}`);
                    
                    // 保存数据
                    this.core.saveGameData();
                    
                    // 关闭对话，然后重新开始对话（触发新阶段）
                    this.closeDialog();
                    setTimeout(() => {
                        this.talkToNPC(dialogNPC);
                    }, 100);
                }
            }
            break;
        case 'submit_mantou_quest':
            // 特殊处理：提交王婆婆的馒头任务给王富
            this.submitQuestToNPC(NPC_NAMES.WANG_POPO);
            this.addDebugLog('✅ 完成王婆婆的馒头任务');
            this.closeDialog();
            break;
        case 'complete_lifu_dialog_quest':
            // 特殊处理：完成李复的青衣女子对话任务
            const activeQuests = this.core.gameData.quests.active || [];
            const lifuNPC = this.core.gameData.riceVillage.npcs[NPC_NAMES.LI_FU];
            
            // 找到李复的青衣女子任务并直接完成
            const questIndex = activeQuests.findIndex(q => q.id === 'qingyinvzi' && q.npc === NPC_NAMES.LI_FU);
            if (questIndex > -1) {
                const quest = activeQuests[questIndex];
                
                // 完成任务
                quest.status = 'completed';
                this.addDebugLog(`✅ 任务完成: ${quest.name}`);
                
                // 给予奖励
                this.giveQuestRewards(quest);
                
                // 移动到已完成任务列表
                activeQuests.splice(questIndex, 1);
                if (!this.core.gameData.quests.completed) {
                    this.core.gameData.quests.completed = [];
                }
                this.core.gameData.quests.completed.push(quest);
                
                // 推进李复的questStage
                if (lifuNPC) {
                    lifuNPC.questStage++;
                    console.log(`📈 完成李复青衣女子任务，questStage推进到: ${lifuNPC.questStage}`);
                }
                
                // 显示完成信息
                this.addDebugLog(`🎉 完成李复青衣女子任务，获得 ${quest.rewards.exp} 经验, ${quest.rewards.gold} 金币`);
                
                // 更新显示和保存数据
                this.updateQuestDisplay();
                this.updatePlayerStatus();
                this.renderNPCsTable();
                this.core.saveGameData();
                
                // 显示秋叶青的回应
                this.showDialog(NPC_NAMES.QIU_YE_QING, '山崖上的事？我确实看到了一些东西...但你去告诉李复，若想知道，自己来问我！否则免谈！', [
                    { text: '明白了', action: 'close_dialog' }
                ]);
            } else {
                this.showDialog(NPC_NAMES.QIU_YE_QING, '你没有相关的任务。');
            }
            break;
        case 'complete_qiuyeqing_dialog_quest':
            // 特殊处理：完成秋叶青的难知女儿心对话任务
            const activeQuests2 = this.core.gameData.quests.active || [];
            const qiuyeqingNPC = this.core.gameData.riceVillage.npcs[NPC_NAMES.QIU_YE_QING];
            
            // 找到秋叶青的难知女儿心任务并直接完成
            const questIndex2 = activeQuests2.findIndex(q => q.id === 'nanzhi_nvr_xin' && q.npc === NPC_NAMES.QIU_YE_QING);
            if (questIndex2 > -1) {
                const quest = activeQuests2[questIndex2];
                
                // 完成任务
                quest.status = 'completed';
                this.addDebugLog(`✅ 任务完成: ${quest.name}`);
                
                // 给予奖励
                this.giveQuestRewards(quest);
                
                // 移动到已完成任务列表
                activeQuests2.splice(questIndex2, 1);
                if (!this.core.gameData.quests.completed) {
                    this.core.gameData.quests.completed = [];
                }
                this.core.gameData.quests.completed.push(quest);
                
                // 推进秋叶青的questStage
                if (qiuyeqingNPC) {
                    qiuyeqingNPC.questStage++;
                    console.log(`📈 完成秋叶青难知女儿心任务，questStage推进到: ${qiuyeqingNPC.questStage}`);
                }
                
                // 显示完成信息
                this.addDebugLog(`🎉 完成秋叶青难知女儿心任务，获得 ${quest.rewards.exp} 经验, ${quest.rewards.gold} 金币`);
                
                // 更新显示和保存数据
                this.updateQuestDisplay();
                this.updatePlayerStatus();
                this.renderNPCsTable();
                this.core.saveGameData();
                
                // 显示李复的回应并自动发布下一个任务
                this.showDialog(NPC_NAMES.LI_FU, '（李复微微叹了口气，却丝毫没有理会秋叶青的意思。）我明白她的心意了...', [
                    { text: '李复似乎有话要说', action: 'close_dialog_and_retalk_lifu' }
                ]);
            } else {
                this.showDialog(NPC_NAMES.LI_FU, '你没有相关的任务。');
            }
            break;
        case 'close_dialog_and_retalk_lifu':
            // 关闭对话并重新与李复对话，触发下一个任务
            this.closeDialog();
            setTimeout(() => {
                this.talkToNPC(NPC_NAMES.LI_FU);
            }, 500);
            break;
        case 'receive_final_reward':
            // 处理王婆婆最终奖励：精致令牌 + 300经验
            if (this.core.inventorySystem) {
                this.core.inventorySystem.addItem('精致令牌', 1);
                console.log('📦 获得关键物品：精致令牌');
                this.addDebugLog('📦 获得关键物品：精致令牌');
            } else {
                console.error('❌ 统一背包系统未初始化');
            }
            
            // 给予300经验
            this.gainExp(300);
            this.addDebugLog('🎉 获得300经验');
            
            // 推进王婆婆的questStage到最终状态
            const wangPoPoNPC = this.core.gameData.riceVillage.npcs[NPC_NAMES.WANG_POPO];
            if (wangPoPoNPC) {
                wangPoPoNPC.questStage = 7; // 设置为最终完成状态
                console.log('📈 王婆婆任务链全部完成，questStage推进到: 7');
                this.addDebugLog('🎯 王婆婆任务链全部完成！');
            }
            
            // 保存数据
            this.core.saveGameData();
            
            // 显示获得物品动画
            createFloatingText('获得精致令牌！', '#FFD700', NPC_NAMES.WANG_POPO, 0);
            createFloatingText('+300经验', '#00FF00', NPC_NAMES.WANG_POPO, 1);
            
            // 显示完成信息
            this.showDialog(NPC_NAMES.WANG_POPO, '恭喜你！你已经获得了精致令牌，这将为你在村里开启更多机会！', [
                { text: '谢谢王婆婆', action: 'close_dialog' }
            ]);
            break;
        case 'close_dialog':
            this.closeDialog();
            break;
        case 'open_weapon_shop':
            // 打开武器装备购买界面
            this.openWeaponShop();
            break;
        case 'open_sell_shop':
            // 打开物品出售界面
            this.openSellShop();
            break;
        case 'show_inventory':
            // 显示背包界面
            this.showInventory();
            break;
        default:
            this.closeDialog();
            break;
    }
};

/**
 * 关闭对话窗体
 */
RiceVillageManager.prototype.closeDialog = function() {
    const dialogWindow = document.getElementById('dialog-window');
    if (dialogWindow) {
        dialogWindow.style.display = 'none';
        document.body.classList.remove('dialog-active');
    }

    // 清空对话内容
    this.clearDialogWindow();
};

/**
 * 统一任务提交函数 - 处理任务提交和奖励发放
 * @param {string} npcName - NPC名称
 */
RiceVillageManager.prototype.submitQuestToNPC = function(npcName) {
    if (!this._validateSystem()) return;

    const activeQuests = this.core.gameData.quests.active || [];
    const npc = this.core.gameData.riceVillage.npcs[npcName];

    // 找到第一个可提交的任务
    const completableQuest = this.checkCompletableQuests(npcName)[0];

    if (!completableQuest) {
        this.showDialog(npcName, '你还没有完成任务要求。');
        return;
    }

    // 消耗物品（如果需要）
    this.consumeQuestItems(completableQuest);

    // 完成任务
    completableQuest.status = 'completed';
    this.addDebugLog(`✅ 任务完成: ${completableQuest.name}`);

    // 给予奖励
    this.giveQuestRewards(completableQuest);

    // 移动到已完成任务列表
    const activeIndex = activeQuests.indexOf(completableQuest);
    if (activeIndex > -1) {
        activeQuests.splice(activeIndex, 1);
    }

    if (!this.core.gameData.quests.completed) {
        this.core.gameData.quests.completed = [];
    }
    this.core.gameData.quests.completed.push(completableQuest);

    // 推进NPC的questStage
    npc.questStage++;

    this.showDialog(npcName, `太好了！任务完成了。这是你的奖励：经验 +${completableQuest.rewards.exp}，金币 +${completableQuest.rewards.gold}`);

    // 更新显示
    this.updateQuestDisplay();
    this.updatePlayerStatus();
    this.renderNPCsTable(); // 更新NPC状态显示
    this.renderMonstersTable(); // 更新怪物击杀计数
    this.renderPlantsTable(); // 更新植物拥有数量
    this.core.saveGameData();
};

/**
 * 消耗任务所需物品
 * @param {Object} quest - 任务对象
 */
RiceVillageManager.prototype.consumeQuestItems = function(quest) {
    switch (quest.type) {
        case QUEST_TYPES.COLLECT:
            // 收集任务：使用统一背包系统消耗对应物品
            if (this.core.inventorySystem) {
                this.core.inventorySystem.removeItem(quest.target, quest.required);
                console.log(`📦 统一背包消耗任务物品: ${quest.target} x${quest.required}`);
            } else {
                console.error('❌ 统一背包系统未初始化');
            }
            break;

        case QUEST_TYPES.PROVIDE_ITEM:
            if (quest.target === '茶饮') {
                // 特殊处理：茶饮任务，消耗madeTeas
                const madeTeas = this.core.gameData.inventory.madeTeas || [];
                for (let i = 0; i < quest.required && madeTeas.length > 0; i++) {
                    madeTeas.pop();
                }
                console.log(`🍵 消耗茶饮任务物品: ${quest.target} x${quest.required}`);
            } else if (quest.target.includes('茶') || quest.target.includes('汤')) {
                // 特定茶饮任务，消耗madeTeas中的指定茶饮
                const madeTeas = this.core.gameData.inventory.madeTeas || [];
                let removedCount = 0;
                for (let i = madeTeas.length - 1; i >= 0 && removedCount < quest.required; i--) {
                    if (madeTeas[i].name === quest.target) {
                        madeTeas.splice(i, 1);
                        removedCount++;
                    }
                }
                console.log(`🍵 消耗特定茶饮任务物品: ${quest.target} x${removedCount}`);
            } else {
                // 其他物品任务：使用统一背包系统消耗
                if (this.core.inventorySystem) {
                    this.core.inventorySystem.removeItem(quest.target, quest.required);
                    console.log(`📦 统一背包消耗任务物品: ${quest.target} x${quest.required}`);
                } else {
                    console.error('❌ 统一背包系统未初始化');
                }
            }
            break;

        case QUEST_TYPES.KILL:
            // 击杀任务：不消耗物品
            break;
    }
};

/**
 * 给予任务奖励
 * @param {Object} quest - 任务对象
 */
RiceVillageManager.prototype.giveQuestRewards = function(quest) {
    console.log(`🧪 [DEBUG] 开始给予任务奖励:`, quest.rewards);

    if (quest.rewards) {
        if (quest.rewards.exp) {
            // 使用完整的升级系统
            console.log(`🧪 [DEBUG] 任务 ${quest.name} 准备给予 ${quest.rewards.exp} 经验`);
            this.gainExp(quest.rewards.exp);
            console.log(`🧪 [DEBUG] 任务经验给予完成`);
            this.addDebugLog(`📈 获得经验: ${quest.rewards.exp}`);
        }
        if (quest.rewards.gold) {
            this.core.gameData.player.funds += quest.rewards.gold;
            this.addDebugLog(`💰 获得金币: ${quest.rewards.gold}`);
        }
    }
};

/**
 * 显示扬州地图按钮
 */
RiceVillageManager.prototype.showYangzhouMapButton = function() {
    // 检查是否已经存在按钮，避免重复创建
    const existingButton = document.getElementById('yangzhou-map-button');
    if (existingButton) {
        existingButton.style.display = 'block';
        return;
    }

    // 创建扬州地图按钮
    const yangzhouButton = document.createElement('div');
    yangzhouButton.id = 'yangzhou-map-button';
    yangzhouButton.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        background: linear-gradient(45deg, #4CAF50, #45a049);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 2px solid #fff;
        text-align: center;
        min-width: 160px;
        user-select: none;
        transition: all 0.3s ease;
    `;
    
    yangzhouButton.innerHTML = `
        <div style="font-size: 16px; margin-bottom: 4px;">🗺️</div>
        <div>扬州地图</div>
        <div style="font-size: 12px; color: #e8f5e8;">(已解锁)</div>
    `;
    
    // 添加悬停效果
    yangzhouButton.onmouseenter = function() {
        this.style.transform = 'scale(1.05)';
        this.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
    };
    
    yangzhouButton.onmouseleave = function() {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    };
    
    // 点击跳转到扬州地图
    yangzhouButton.onclick = function() {
        console.log('🗺️ 前往扬州地图');
        window.location.href = 'yangzhou-map.html';
    };
    
    // 添加到页面
    document.body.appendChild(yangzhouButton);
    
    console.log('🗺️ 扬州地图按钮已显示');
    this.addDebugLog('🗺️ 扬州地图按钮已显示');
};

// ===== 第九区域：商店系统 =====

/**
 * 🏪 打开武器装备商店界面
 */
RiceVillageManager.prototype.openWeaponShop = function() {
    if (!this._validateSystem()) return;

    const player = this.core.gameData.player;
    const playerLevel = player.level;
    const playerFunds = player.funds;

    // 获取可购买的装备列表
    const shopItems = this.core.inventorySystem.getWeaponShopItems(playerLevel);

    let shopHTML = `
        <div class="shop-container">
            <div class="shop-header">
                <h3>武器装备商店</h3>
                <p>金币: ${playerFunds} | 等级: ${playerLevel}</p>
            </div>
            <div class="shop-categories">
    `;

    // 武器分类
    if (shopItems.weapons.length > 0) {
        shopHTML += `
            <div class="shop-category">
                <h4>武器</h4>
                <div class="items-grid">
        `;
        shopItems.weapons.forEach(weapon => {
            const canAfford = playerFunds >= weapon.price;
            const buttonClass = canAfford ? 'buy-btn' : 'buy-btn disabled';
            shopHTML += `
                <div class="shop-item">
                    <div class="item-info">
                        <strong>${weapon.name}</strong>
                        <div class="item-stats">攻击力: +${weapon.attack}</div>
                        <div class="item-desc">${weapon.description}</div>
                        <div class="item-price">价格: ${weapon.price} 金币</div>
                    </div>
                    <button class="${buttonClass}" onclick="riceVillageManager.buyWeaponShopItem('${weapon.name}', 'weapon')" ${!canAfford ? 'disabled' : ''}>
                        ${canAfford ? '购买' : '金币不足'}
                    </button>
                </div>
            `;
        });
        shopHTML += `</div></div>`;
    }

    // 防具分类
    if (shopItems.armor.length > 0) {
        shopHTML += `
            <div class="shop-category">
                <h4>防具</h4>
                <div class="items-grid">
        `;
        shopItems.armor.forEach(armor => {
            const canAfford = playerFunds >= armor.price;
            const buttonClass = canAfford ? 'buy-btn' : 'buy-btn disabled';
            shopHTML += `
                <div class="shop-item">
                    <div class="item-info">
                        <strong>${armor.name}</strong>
                        <div class="item-stats">防御力: +${armor.defense}</div>
                        <div class="item-desc">${armor.description}</div>
                        <div class="item-price">价格: ${armor.price} 金币</div>
                    </div>
                    <button class="${buttonClass}" onclick="riceVillageManager.buyWeaponShopItem('${armor.name}', 'weapon')" ${!canAfford ? 'disabled' : ''}>
                        ${canAfford ? '购买' : '金币不足'}
                    </button>
                </div>
            `;
        });
        shopHTML += `</div></div>`;
    }

    // 血瓶分类
    shopHTML += `
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
            <button class="${buttonClass}" onclick="riceVillageManager.buyHealthPotion()" ${!canAffordPotion ? 'disabled' : ''}>
                ${canAffordPotion ? '购买' : '金币不足'}
            </button>
        </div>
    `;

    shopHTML += `</div></div>`;

    shopHTML += `
            </div>
            <div class="shop-footer">
                <button class="close-btn" onclick="riceVillageManager.closeShop()">关闭商店</button>
                <button class="switch-btn" onclick="riceVillageManager.openSellShop()">切换到出售</button>
            </div>
        </div>
    `;

    this.showShopWindow(shopHTML);
};

/**
 * 购买血瓶
 */
RiceVillageManager.prototype.buyHealthPotion = function() {
    if (!this._validateSystem()) return;

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
    this.addDebugLog(`🛒 购买血瓶成功，花费${potionPrice}金币`);

    // 保存数据
    this.core.saveGameData();

    // 刷新商店界面
    this.openWeaponShop();

    // 更新玩家状态显示
    this.updatePlayerStatus();
};

/**
 * 使用血瓶
 */
RiceVillageManager.prototype.useHealthPotion = function() {
    if (!this._validateSystem()) return;

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
        alert('背包中没有血瓶！请到武器商店购买。');
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

    // 显示使用结果
    this.addDebugLog(`🧪 使用血瓶，恢复${actualHeal}点血量`);
};

/**
 * 🏪 打开物品出售界面
 */
RiceVillageManager.prototype.openSellShop = function() {
    if (!this._validateSystem()) return;

    const player = this.core.gameData.player;
    const playerFunds = player.funds;

    // 获取可出售的物品列表
    const sellableItems = this.core.inventorySystem.getSellableItems();

    let shopHTML = `
        <div class="shop-container">
            <div class="shop-header">
                <h3>物品出售</h3>
                <p>金币: ${playerFunds}</p>
            </div>
            <div class="sell-items">
    `;

    if (sellableItems.length === 0) {
        shopHTML += `
            <div class="no-items">
                <p>背包中没有可出售的物品</p>
            </div>
        `;
    } else {
        // 按分类组织物品
        const categorizedItems = {};
        sellableItems.forEach(item => {
            if (!categorizedItems[item.category]) {
                categorizedItems[item.category] = [];
            }
            categorizedItems[item.category].push(item);
        });

        // 显示每个分类的物品
        Object.entries(categorizedItems).forEach(([category, items]) => {
            shopHTML += `
                <div class="sell-category">
                    <h4>${category}</h4>
                    <div class="items-grid">
            `;
            
            items.forEach(item => {
                shopHTML += `
                    <div class="sell-item">
                        <div class="item-info">
                            <strong>${item.name}</strong>
                            <div class="item-count">拥有: ${item.count}</div>
                            <div class="item-price">单价: ${item.sellPrice} 金币</div>
                            <div class="item-total">全卖: ${item.sellPrice * item.count} 金币</div>
                        </div>
                        <div class="sell-actions">
                            <button class="sell-btn" onclick="riceVillageManager.sellItem('${item.name}', 1)">卖出 1个</button>
                            ${item.count > 1 ? `<button class="sell-all-btn" onclick="riceVillageManager.sellItem('${item.name}', ${item.count})">全部卖出</button>` : ''}
                        </div>
                    </div>
                `;
            });
            
            shopHTML += `</div></div>`;
        });
    }

    shopHTML += `
            </div>
            <div class="shop-footer">
                <button class="close-btn" onclick="riceVillageManager.closeShop()">关闭商店</button>
                <button class="switch-btn" onclick="riceVillageManager.openWeaponShop()">切换到购买</button>
            </div>
        </div>
    `;

    this.showShopWindow(shopHTML);
};

/**
 * 购买武器商店物品
 * @param {string} itemName - 物品名称
 * @param {string} shopType - 商店类型
 */
RiceVillageManager.prototype.buyWeaponShopItem = function(itemName, shopType) {
    if (!this._validateSystem()) return;

    const result = this.core.inventorySystem.buyItem(itemName, 1, shopType);
    
    if (result.success) {
        this.addDebugLog(`🛒 购买成功: ${result.message}`);
        // 刷新商店界面
        this.openWeaponShop();
        // 更新玩家状态显示
        this.updatePlayerStatus();
    } else {
        this.addDebugLog(`❌ 购买失败: ${result.message}`);
        alert(result.message);
    }
};

/**
 * 出售物品
 * @param {string} itemName - 物品名称
 * @param {number} quantity - 出售数量
 */
RiceVillageManager.prototype.sellItem = function(itemName, quantity) {
    if (!this._validateSystem()) return;

    const result = this.core.inventorySystem.sellItem(itemName, quantity);
    
    if (result.success) {
        this.addDebugLog(`💰 出售成功: ${result.message}`);
        // 刷新出售界面
        this.openSellShop();
        // 更新玩家状态显示
        this.updatePlayerStatus();
    } else {
        this.addDebugLog(`❌ 出售失败: ${result.message}`);
        alert(result.message);
    }
};

/**
 * 显示商店窗口
 * @param {string} content - 商店内容HTML
 */
RiceVillageManager.prototype.showShopWindow = function(content) {
    // 关闭对话窗口
    this.closeDialog();
    
    // 创建或更新商店窗口
    let shopWindow = document.getElementById('shop-window');
    if (!shopWindow) {
        shopWindow = document.createElement('div');
        shopWindow.id = 'shop-window';
        shopWindow.className = 'shop-window';
        document.body.appendChild(shopWindow);
    }
    
    shopWindow.innerHTML = content;
    shopWindow.style.display = 'block';
    document.body.classList.add('shop-active');
};

/**
 * 关闭商店窗口
 */
RiceVillageManager.prototype.closeShop = function() {
    const shopWindow = document.getElementById('shop-window');
    if (shopWindow) {
        shopWindow.style.display = 'none';
        document.body.classList.remove('shop-active');
    }
};

// ===== 第十区域：调试和工具函数 =====

// 全局变量 - 将由HTML页面按正确时序创建
var riceVillageManager;

// 全局函数：与NPC对话
function talkToNPC(npcName) {
    if (riceVillageManager) {
        riceVillageManager.talkToNPC(npcName);
    }
}

// 全局函数：显示背包
function showInventory() {
    if (riceVillageManager) {
        riceVillageManager.showInventory();
    }
}

// 全局函数：选择伙伴
function showPartnerSelection() {
    if (riceVillageManager) {
        riceVillageManager.showPartnerSelection();
    }
}

// 全局函数：攻击怪物
function attackMonster(monsterName) {
    if (riceVillageManager) {
        riceVillageManager.attackMonster(monsterName);
    }
}

// 全局函数：采集植物
function gatherPlant(plantName) {
    if (riceVillageManager) {
        riceVillageManager.gatherPlant(plantName);
    }
}

// 调试函数：NPC状态
function debugNPCStatus() {
    if (riceVillageManager && riceVillageManager._validateSystem()) {
        const npcs = riceVillageManager.core.gameData.riceVillage.npcs;
        let debugInfo = 'NPC状态调试:\n';
        Object.entries(npcs).forEach(([name, data]) => {
            debugInfo += `${name}: questStage=${data.questStage}\n`;
        });
        alert(debugInfo);
    }
}

// 调试函数：装备状态
function debugEquipmentStatus() {
    if (riceVillageManager && riceVillageManager._validateSystem()) {
        const gameData = riceVillageManager.core.gameData;
        const inventory = gameData.inventory;
        const playerEquipment = gameData.player.equipment;
        
        let debugInfo = '🎒 装备状态调试:\n\n';
        
        debugInfo += '📦 背包中的装备:\n';
        const equipmentItems = inventory.equipment || [];
        if (equipmentItems.length === 0) {
            debugInfo += '  暂无装备\n';
        } else {
            equipmentItems.forEach((item, index) => {
                debugInfo += `  ${index + 1}. ${item.name} (ID: ${item.id})\n`;
                debugInfo += `     攻击: ${item.attack || 0}, 防御: ${item.defense || 0}\n`;
                debugInfo += `     类别: ${item.category || item.type || '未知'}\n`;
            });
        }
        
        debugInfo += '\n⚔️ 当前装备的物品:\n';
        debugInfo += `  武器: ${playerEquipment.weapon ? playerEquipment.weapon.name : '无'}\n`;
        debugInfo += `  防具: ${playerEquipment.armor ? playerEquipment.armor.name : '无'}\n`;
        
        debugInfo += '\n📊 玩家属性:\n';
        debugInfo += `  基础攻击力: ${gameData.player.stats.basePower || 5}\n`;
        debugInfo += `  当前攻击力: ${gameData.player.stats.power || 5}\n`;
        debugInfo += `  血量: ${gameData.player.stats.hp}/${gameData.player.stats.maxHp}\n`;
        
        alert(debugInfo);
        console.log('🎒 装备详细数据:', {
            inventoryEquipment: equipmentItems,
            playerEquipment: playerEquipment,
            playerStats: gameData.player.stats
        });
    }
}

// 修复装备ID的函数
function fixEquipmentIds() {
    if (riceVillageManager && riceVillageManager._validateSystem()) {
        const gameData = riceVillageManager.core.gameData;
        const inventory = gameData.inventory;
        
        console.log('🔧 开始修复装备ID...');
        
        let fixedCount = 0;
        if (inventory.equipment && inventory.equipment.length > 0) {
            inventory.equipment.forEach((item, index) => {
                if (typeof item.id === 'number' && item.id % 1 !== 0) {
                    // 如果ID是浮点数，转换为整数
                    const oldId = item.id;
                    item.id = Math.floor(item.id);
                    console.log(`🔧 修复装备 ${item.name}: ${oldId} → ${item.id}`);
                    fixedCount++;
                }
            });
        }
        
        // 保存修复后的数据
        if (fixedCount > 0) {
            riceVillageManager.core.saveGameData();
            alert(`✅ 已修复 ${fixedCount} 个装备的ID，请重新打开背包查看装备`);
        } else {
            alert('✅ 装备ID无需修复');
        }
    }
}

// 手动刷新状态显示
function refreshPlayerStatus() {
    if (riceVillageManager && riceVillageManager._validateSystem()) {
        console.log('🔄 手动刷新玩家状态显示...');
        riceVillageManager.updatePlayerStats(); // 重新计算装备加成
        riceVillageManager.updatePlayerStatus(); // 刷新界面显示
        alert('✅ 状态已刷新，请查看角色状态表格');
    }
}

// 快速检查攻击力计算
function debugPowerCalculation() {
    if (riceVillageManager && riceVillageManager._validateSystem()) {
        const player = riceVillageManager.core.gameData.player;
        const level = player.level || 1;
        const expectedBasePower = 5 + (level - 1) * 3;
        
        console.log('🔍 攻击力数据分析:');
        console.log(`等级: ${level}`);
        console.log(`预期基础攻击力: ${expectedBasePower} = 5基础 + ${(level - 1) * 3}升级加成`);
        console.log(`实际存储的basePower: ${player.stats?.basePower}`);
        console.log(`实际显示的power: ${player.stats?.power}`);
        console.log(`兼容结构的power: ${player.power}`);
        
        // 强制重新计算并更新
        riceVillageManager.updatePlayerStats();
        riceVillageManager.updatePlayerStatus();
        
        alert(`🔍 攻击力检查：\n等级: ${level}\n预期基础攻击力: ${expectedBasePower}\n实际攻击力: ${player.stats?.power}\n已强制重新计算！`);
    }
}

// 🔧 一键修复所有数值显示问题
function fixAllPlayerData() {
    if (riceVillageManager && riceVillageManager._validateSystem()) {
        const player = riceVillageManager.core.gameData.player;
        const level = player.level || 1;
        
        console.log('🚀 开始一键修复所有数值问题...');
        
        // 1. 确保stats系统存在
        if (!player.stats) {
            player.stats = {
                hp: player.hp || 100,
                maxHp: player.maxHp || 100,
                stamina: player.stamina || 100,
                maxStamina: player.maxStamina || 100,
                power: 5,
                basePower: 5
            };
        }
        
        // 2. 强制重新计算所有基础属性
        const correctBasePower = 5 + (level - 1) * 3;
        const correctBaseMaxHp = 100 + (level - 1) * 5;
        
        player.stats.basePower = correctBasePower;
        player.stats.maxHp = correctBaseMaxHp;
        player.stats.power = correctBasePower;
        player.stats.hp = Math.min(player.stats.hp || correctBaseMaxHp, correctBaseMaxHp);
        
        // 3. 同步到兼容数据结构
        player.power = correctBasePower;
        player.maxHp = correctBaseMaxHp;
        player.hp = player.stats.hp;
        
        console.log('✅ 基础属性修复完成:', {
            level: level,
            basePower: correctBasePower,
            baseMaxHp: correctBaseMaxHp
        });
        
        // 4. 重新计算装备加成
        riceVillageManager.updatePlayerStats();
        
        // 5. 保存数据
        riceVillageManager.core.saveGameData();
        
        // 6. 强制刷新显示
        riceVillageManager.updatePlayerStatus();
        
        console.log('🎉 修复完成，最终数值:', {
            显示攻击力: player.power,
            显示血量: `${player.hp}/${player.maxHp}`,
            stats攻击力: player.stats.power,
            stats血量: `${player.stats.hp}/${player.stats.maxHp}`
        });
        
        alert(`🎉 一键修复完成！\n\n等级: ${level}\n攻击力: ${player.power}\n血量: ${player.hp}/${player.maxHp}\n\n数值显示已完全正常！`);
    }
}

// 修复存档数据，确保升级系统正确生效
function fixPlayerStatsSystem() {
    if (riceVillageManager && riceVillageManager._validateSystem()) {
        const player = riceVillageManager.core.gameData.player;
        
        console.log('🔧 开始修复玩家属性系统...');
        console.log('🔍 修复前数据:', {
            level: player.level,
            power: player.power,
            maxHp: player.maxHp,
            stats: player.stats
        });
        
        // 确保stats系统存在
        if (!player.stats) {
            player.stats = {
                hp: player.hp || 100,
                maxHp: player.maxHp || 100,
                stamina: player.stamina || 100,
                maxStamina: player.maxStamina || 100,
                power: player.power || 5,
                basePower: 5 // 1级基础攻击力
            };
        }
        
        // 🔧 修复：确保basePower被正确初始化（防止为0或undefined）
        if (!player.stats.basePower || player.stats.basePower < 5) {
            player.stats.basePower = 5; // 至少1级的基础攻击力
        }
        
        // 根据当前等级重新计算基础属性
        const level = player.level || 1;
        const calculatedBasePower = 5 + (level - 1) * 3; // 每级+3攻击力
        player.stats.basePower = calculatedBasePower;
        console.log(`⚔️ 重新计算基础攻击力: 等级${level} = 5基础 + ${(level - 1) * 3}升级加成 = ${calculatedBasePower}`);
        // 注意：血量通过装备系统计算，确保包含装备加成
        
        // 确保当前血量不超过最大血量
        if (player.stats.hp > player.stats.maxHp) {
            player.stats.hp = player.stats.maxHp;
        }
        
        // 兼容旧数据结构
        player.power = player.stats.basePower;
        player.maxHp = player.stats.maxHp;
        player.hp = player.stats.hp;
        
        console.log('✅ 修复后数据:', {
            level: player.level,
            power: player.power,
            maxHp: player.maxHp,
            stats: player.stats
        });
        
        // 重新计算装备加成（包含血量）
        riceVillageManager.updatePlayerStats();
        
        // 确保血量数据一致性
        if (player.stats.hp > player.stats.maxHp) {
            player.stats.hp = player.stats.maxHp;
        }
        player.hp = player.stats.hp;
        player.maxHp = player.stats.maxHp;
        
        // 保存修复后的数据
        riceVillageManager.core.saveGameData();
        
        // 刷新显示
        riceVillageManager.updatePlayerStatus();
        
        const expectedMaxHp = 100 + (level - 1) * 5;
        const expectedBasePower = 5 + (level - 1) * 3;
        alert(`✅ 升级系统修复完成！\n\n等级: ${level}\n基础攻击力: ${player.stats.basePower}（应该是${expectedBasePower}）\n显示攻击力: ${player.power}（基础 + 装备加成）\n血量: ${player.stats.hp}/${player.stats.maxHp}（${expectedMaxHp}基础 + 装备加成）\n\n✅ 攻击力计算逻辑已修复！`);
    }
}

// 调试函数：当前任务
function debugCurrentQuests() {
    if (riceVillageManager && riceVillageManager._validateSystem()) {
        const activeQuests = riceVillageManager.core.gameData.quests.active || [];
        let debugInfo = '当前任务调试:\n';
        if (activeQuests.length === 0) {
            debugInfo += '没有活跃任务\n';
        } else {
            activeQuests.forEach(quest => {
                debugInfo += `${quest.name} (${quest.npc}) - ${quest.status}\n`;
            });
        }
        alert(debugInfo);
    }
}

// 调试函数：重置击杀数据
function resetKillData() {
    if (riceVillageManager && riceVillageManager._validateSystem()) {
        if (confirm('确定要重置击杀数据吗？')) {
            riceVillageManager.core.gameData.riceVillage.killCounts = {};
            riceVillageManager.core.saveGameData();
            riceVillageManager.updateQuestDisplay();
            alert('击杀数据已重置');
        }
    }
}

// 调试函数：检查茶铺数据同步
function debugTeaShopData() {
    if (riceVillageManager && riceVillageManager._validateSystem()) {
        const gameData = riceVillageManager.core.gameData;

        console.log('🔍 调试茶铺数据同步:');
        console.log('gameData.teaShop:', gameData.teaShop);
        console.log('gameData.cats:', gameData.cats);

        // ✅ 按照重建文档：只使用统一数据系统
        console.log('🔍 当前统一数据中的猫咪系统:', gameData.teaShop?.cats);
        console.log('🔍 当前玩家伙伴数据:', gameData.player?.partner);

        alert('茶铺数据调试信息已输出到控制台');
    }
}

// 调试函数：重置所有任务和NPC状态
function resetAllQuests() {
    if (riceVillageManager && riceVillageManager._validateSystem()) {
        if (confirm('确定要重置所有任务和NPC状态吗？这将清空所有进度！')) {
            // 重置所有NPC的questStage到0
            const npcs = riceVillageManager.core.gameData.riceVillage.npcs;
            Object.keys(npcs).forEach(npcName => {
                npcs[npcName].questStage = 0;
            });

            // 清空所有任务
            riceVillageManager.core.gameData.quests = {
                active: [],
                completed: []
            };

            // 重置角色创建状态和基础数据
            const player = riceVillageManager.core.gameData.player;
            player.characterCreated = false;
            player.name = '';
            player.gender = '';
            player.level = 1;  // 重置等级为1
            player.exp = 0;    // 重置经验为0
            player.funds = 1000; // 重置金币为初始值

            console.log('🔄 重置玩家数据:', {
                level: player.level,
                exp: player.exp,
                funds: player.funds,
                characterCreated: player.characterCreated
            });

            riceVillageManager.core.saveGameData();
            riceVillageManager.updateQuestDisplay();
            riceVillageManager.updatePlayerStatus(); // 立即更新玩家状态显示
            riceVillageManager.renderNPCsTable();

            alert('所有任务和NPC状态已重置！玩家数据已重置为初始状态。请重新与刘大海对话开始游戏。');
        }
    }
}

// 完全重置游戏数据 - 从头开始
function resetAllGameData() {
    if (!riceVillageManager || !riceVillageManager._validateSystem()) {
        alert('稻香村管理器未初始化！');
        return;
    }

    if (confirm('⚠️ 警告：这将清空所有游戏数据！\n\n包括：\n- 角色信息（姓名、性别、等级）\n- 所有任务进度\n- NPC对话状态\n- 宠物/伙伴数据\n- 背包物品\n- 怪物状态\n\n确定要完全重置吗？')) {
        if (confirm('🚨 最后确认：真的要删除所有数据从头开始吗？\n\n此操作不可撤销！')) {
            console.log('🔄 开始完全重置游戏数据...');

            // 重置玩家数据
            const gameData = riceVillageManager.core.gameData;
            gameData.player = {
                characterCreated: false,
                name: '',
                gender: '',
                level: 1,
                exp: 0,
                hp: 100,
                maxHp: 100,
                stamina: 100,
                maxStamina: 100,
                power: 5,
                funds: 1000,
                partner: null
            };

            // 重置所有NPC状态
            gameData.riceVillage.npcs = {
                '刘大海': { questStage: 0 },
                '刘洋': { questStage: 0 },
                '王婆婆': { questStage: 0 },
                '少侠': { questStage: 0 },
                '李复': { questStage: 0 },
                '陈月': { questStage: 0 }
            };

            // 清空所有任务
            gameData.quests = {
                active: [],
                completed: [],
                progress: {}
            };

            // 重置击杀计数
            gameData.riceVillage.killCounts = {};

            // 重置怪物状态
            gameData.riceVillage.monsters = {};

            // 重置植物状态
            gameData.riceVillage.plants = {};

            // 清空背包
            gameData.inventory = {
                teaIngredients: {},
                madeTeas: [],
                materials: {}
            };

            // 重置茶铺相关数据（如果有的话）
            if (gameData.teaShop) {
                gameData.teaShop = {};
            }
            if (gameData.cats) {
                gameData.cats = {};
            }

            // 保存重置后的数据
            riceVillageManager.core.saveGameData();

            // 更新所有界面显示
            riceVillageManager.updateQuestDisplay();
            riceVillageManager.updatePlayerStatus();
            riceVillageManager.renderNPCsTable();
            riceVillageManager.renderMonstersTable();
            riceVillageManager.renderPlantsTable();

            console.log('✅ 游戏数据完全重置完成');
            alert('✅ 游戏数据已完全重置！\n\n现在可以重新开始游戏：\n1. 与刘大海对话创建角色\n2. 选择性别和姓名\n3. 开始全新的冒险！');
        }
    }
}

// 调试函数：任务系统调试（HTML中调用）
function debugQuests() {
    if (!riceVillageManager || !riceVillageManager._validateSystem()) {
        alert('稻香村管理器未初始化！');
        return;
    }

    const quests = riceVillageManager.core.gameData.quests;
    const killCounts = riceVillageManager.core.gameData.riceVillage.killCounts;

    console.log('🔍 === 任务系统调试信息 ===');
    console.log('活跃任务:', quests.active);
    console.log('已完成任务:', quests.completed);
    console.log('任务进度:', quests.progress);
    console.log('击杀计数:', killCounts);

    let debugInfo = '任务系统调试:\n';
    debugInfo += `活跃任务: ${quests.active?.length || 0} 个\n`;
    debugInfo += `已完成任务: ${quests.completed?.length || 0} 个\n`;
    debugInfo += `击杀计数: ${Object.keys(killCounts || {}).length} 种怪物\n`;

    alert(debugInfo);
}

/**
 * 🎉 地图完成奖励系统：稻香村NPC转移到茶铺
 * 根据重建指导文档实现
 */
RiceVillageManager.prototype.transferRiceVillageNPCsToTeaShop = function() {
    if (!this._validateSystem()) return;

    console.log('🏮 开始转移稻香村NPC到茶铺...');

    // 稻香村NPC名单（根据重建指导文档）
    const riceVillageNPCs = [
        { name: '刘大海', title: '武学教头', specialDialog: '还记得在稻香村的武学训练吗？那些日子真是充实啊！' },
        { name: '刘洋', title: '村长', specialDialog: '感谢你为稻香村所做的一切！现在村子很平静，我也能安心了。' },
        { name: '王婆婆', title: '村民', specialDialog: '那些美好的稻香村时光...我还记得给你做的馒头呢！' },
        { name: '少侠', title: '武学弟子', specialDialog: '师父说你的武艺进步很快，真是令人敬佩！' },
        { name: '李复', title: '轻功师父', specialDialog: '你的轻功已经炉火纯青，青出于蓝而胜于蓝啊！' },
        { name: '陈月', title: '村民', specialDialog: '稻香村现在很安全，多亏了你的帮助！' },
        { name: '王富', title: '车夫', specialDialog: '那次送你去扬州的路上，你说的话我还记得呢！' },
        { name: '秋叶青', title: '秋家大小姐', specialDialog: '江湖路远，但友谊长存。很高兴能在这里再次见到你！' },
        { name: '武器铺老板', title: '武器商人', specialDialog: '你用过的那些武器，现在都成了店里的传说呢！' }
    ];

    // 将NPC添加到茶铺的Named顾客系统
    const gameData = this.core.gameData;
    if (!gameData.teaShop.namedCustomers) {
        gameData.teaShop.namedCustomers = [];
    }

    // 检查是否已经转移过（避免重复转移）
    if (gameData.teaShop.namedCustomers.length > 0) {
        console.log('🏮 稻香村NPC已经转移过，跳过重复转移');
        return;
    }

    // 转移所有NPC
    gameData.teaShop.namedCustomers = [...riceVillageNPCs];

    this.addDebugLog('🏮 稻香村NPC已转移到茶铺，成为Named顾客');
    console.log('🏮 转移的NPC列表:', riceVillageNPCs.map(npc => npc.name).join(', '));

    // 保存数据
    this.core.saveGameData();

    console.log('🎉 稻香村NPC转移完成！');
};

/**
 * 🍜 村长特殊奖励：解锁面茶配方
 * 根据重建指导文档实现
 */
RiceVillageManager.prototype.unlockFaceTeaRecipe = function() {
    if (!this._validateSystem()) return;

    console.log('🍜 开始解锁面茶配方...');

    const gameData = this.core.gameData;
    const teaRecipes = gameData.teaShop.teaRecipes;
    const unlockedRecipes = gameData.teaShop.unlockedRecipes;

    // 检查面茶配方是否已存在
    if (!teaRecipes['面茶']) {
        console.error('❌ 面茶配方未在系统中定义');
        return;
    }

    // 检查是否已经解锁
    if (unlockedRecipes.includes('面茶')) {
        console.log('🍜 面茶配方已经解锁，跳过重复解锁');
        return;
    }

    // 解锁面茶配方
    unlockedRecipes.push('面茶');

    this.addDebugLog('🍜 村长奖励：解锁面茶配方！');
    console.log('🍜 面茶配方组成:', teaRecipes['面茶']);

    // 显示解锁提示
    this.showDialog('村长刘洋', '🍜 这是我们稻香村的传统面茶配方，是我祖传的秘方！\n\n配方：黄米面 + 白芝麻 + 芝麻酱 + 胡椒粉\n\n黄米需要种植黄米种子获得，然后加工成黄米面。其他原料可以在商店购买。', [
        { text: '感谢村长！', action: 'closeDialog' }
    ]);

    // 保存数据
    this.core.saveGameData();

    console.log('🎉 面茶配方解锁完成！');
};

/**
 * 调试：测试经验系统
 */
RiceVillageManager.prototype.debugTestExpSystem = function() {
    console.log('🧪 ==================== 经验系统测试开始 ====================');

    const player = this.core.gameData.player;

    // 显示测试前状态
    console.log('🧪 [测试前状态]', {
        level: player.level,
        exp: player.exp,
        expType: typeof player.exp,
        levelType: typeof player.level,
        hp: player.hp,
        power: player.power
    });

    // 测试1：给予少量经验
    console.log('🧪 [测试1] 给予10经验...');
    this.gainExp(10);

    // 测试2：给予中等经验
    console.log('🧪 [测试2] 给予50经验...');
    this.gainExp(50);

    // 测试3：给予大量经验（可能升级）
    console.log('🧪 [测试3] 给予100经验...');
    this.gainExp(100);

    // 显示测试后状态
    console.log('🧪 [测试后状态]', {
        level: player.level,
        exp: player.exp,
        hp: player.hp,
        power: player.power
    });

    console.log('🧪 ==================== 经验系统测试完成 ====================');

    return {
        level: player.level,
        exp: player.exp,
        hp: player.hp,
        power: player.power
    };
};

/**
 * 调试：显示当前经验状态
 */
RiceVillageManager.prototype.debugExpStatus = function() {
    const player = this.core.gameData.player;
    const currentLevel = player.level || 1;
    const currentExp = player.exp || 0;
    const requiredExp = this.getExpRequiredForLevel(currentLevel);
    const expToNext = Math.max(0, requiredExp - currentExp);

    const status = {
        level: currentLevel,
        exp: currentExp,
        requiredExp: requiredExp,
        expToNext: expToNext,
        progress: `${currentExp}/${requiredExp}`,
        percentage: Math.floor((currentExp / requiredExp) * 100)
    };

    console.log('📊 当前经验状态:', status);
    return status;
};

/**
 * 怪物攻击玩家 - 按照重建指导文档实现
 */
RiceVillageManager.prototype.monsterAttackPlayer = function(monsterName, monster) {
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
};

/**
 * 处理玩家死亡
 */
RiceVillageManager.prototype.handlePlayerDeath = function() {
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
};

/**
 * 显示玩家伤害飘字
 */
RiceVillageManager.prototype.showPlayerDamageFloatingText = function(text) {
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
};

/**
 * 打坐恢复功能 - 20秒回满血
 */
RiceVillageManager.prototype.startMeditation = function() {
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
};

/**
 * 显示打坐进度
 */
RiceVillageManager.prototype.showMeditationProgress = function() {
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
        <button onclick="cancelMeditation()" style="margin-top: 10px; padding: 5px 15px; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer;">取消打坐</button>
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
};

/**
 * 取消打坐
 */
RiceVillageManager.prototype.cancelMeditation = function() {
    if (this.isMeditating) {
        this.isMeditating = false;
        console.log('🧘 打坐被取消');

        // 移除进度条
        const progressContainer = document.getElementById('meditation-progress');
        if (progressContainer && progressContainer.parentNode) {
            progressContainer.parentNode.removeChild(progressContainer);
        }
    }
};

/**
 * 显示玩家治疗飘字
 */
RiceVillageManager.prototype.showPlayerHealFloatingText = function(text) {
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
};

// 全局取消打坐函数
window.cancelMeditation = function() {
    if (window.riceVillageManager) {
        window.riceVillageManager.cancelMeditation();
    }
};

// 稻香村管理器实例将由HTML页面按正确时序创建
