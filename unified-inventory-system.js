/**
 * 统一物品管理系统
 * 提供跨地图的统一背包操作接口
 */

class UnifiedInventorySystem {
    constructor(coreSystem) {
        this.core = coreSystem;
        this.listeners = new Map();
        
        // 物品配置数据
        this.itemConfig = {
            // 茶饮原料
            teaIngredients: {
                // 基础种子 (1金币, 30秒)
                '五味子': { price: 1, growTime: 30000, category: 'basic' },
                '乌梅': { price: 1, growTime: 30000, category: 'basic' },
                '山楂': { price: 1, growTime: 30000, category: 'basic' },
                '陈皮': { price: 1, growTime: 30000, category: 'basic' },
                '甘草': { price: 1, growTime: 30000, category: 'basic' },
                '桂花': { price: 1, growTime: 30000, category: 'basic' },
                '大麦': { price: 1, growTime: 30000, category: 'basic' },
                '菊花': { price: 1, growTime: 30000, category: 'basic' },
                '金银花': { price: 1, growTime: 30000, category: 'basic' },
                '决明子': { price: 1, growTime: 30000, category: 'basic' },
                '枸杞': { price: 1, growTime: 30000, category: 'basic' },
                '生姜': { price: 1, growTime: 30000, category: 'basic' },
                '桂圆': { price: 1, growTime: 30000, category: 'basic' },
                '红枣': { price: 1, growTime: 30000, category: 'basic' },
                '薄荷': { price: 1, growTime: 30000, category: 'basic' },
                '玫瑰花': { price: 1, growTime: 30000, category: 'basic' },
                '洛神花': { price: 1, growTime: 30000, category: 'basic' },
                '冬瓜': { price: 1, growTime: 30000, category: 'basic' },
                '荷叶': { price: 1, growTime: 30000, category: 'basic' },
                '薏米': { price: 1, growTime: 30000, category: 'basic' },
                '雪花梨': { price: 1, growTime: 30000, category: 'basic' },
                '话梅': { price: 1, growTime: 30000, category: 'basic' },
                '甘蔗': { price: 1, growTime: 30000, category: 'basic' },
                '柚子': { price: 1, growTime: 30000, category: 'basic' },
                '柠檬': { price: 1, growTime: 30000, category: 'basic' },
                '银耳': { price: 1, growTime: 30000, category: 'basic' },
                
                // 中级种子 (2金币)
                '桑叶': { price: 2, growTime: 45000, category: 'intermediate' },
                '杭白菊': { price: 2, growTime: 50000, category: 'intermediate' },
                '白茅根': { price: 2, growTime: 40000, category: 'intermediate' },
                '马蹄': { price: 2, growTime: 45000, category: 'intermediate' },
                '糯米': { price: 2, growTime: 50000, category: 'intermediate' },
                
                // 高级种子 (3金币)
                '水蜜桃': { price: 3, growTime: 60000, category: 'advanced' },
                '黄芪': { price: 3, growTime: 55000, category: 'advanced' },
                
                // 特殊种子
                '米': { price: 1, growTime: 40000, category: 'special' }
            },
            
            // 肉类原料
            meatIngredients: {
                '兔肉': { sellPrice: 8, grillTime: 30000, grillPrice: 25 },
                '果子狸肉': { sellPrice: 7, grillTime: 25000, grillPrice: 22 },
                '野猪肉': { sellPrice: 15, grillTime: 40000, grillPrice: 35 },
                '猴肉': { sellPrice: 10, grillTime: 30000, grillPrice: 28 },
                '鸡肉': { sellPrice: 7, grillTime: 25000, grillPrice: 22 },
                '山羊肉': { sellPrice: 12, grillTime: 35000, grillPrice: 30 }
            },
            
            // 小料
            toppings: {
                '红糖': { price: 2, processingTime: 10000, source: '甘蔗', output: 3 },
                '薄荷叶': { price: 2, processingTime: 10000, source: '薄荷', output: 3 },
                '姜丝': { price: 2, processingTime: 10000, source: '生姜', output: 3 },
                '柚子丝': { price: 2, processingTime: 10000, source: '柚子', output: 3 },
                '银耳丝': { price: 3, processingTime: 15000, source: '银耳', output: 3 },
                '柠檬片': { price: 2, processingTime: 10000, source: '柠檬', output: 3 },
                '水蜜桃果肉': { price: 4, processingTime: 12000, source: '水蜜桃', output: 3 },
                '黄芪片': { price: 4, processingTime: 12000, source: '黄芪', output: 3 },
                '干桂花': { price: 2, processingTime: 10000, source: '桂花', output: 3 },
                '小圆子': { price: 3, processingTime: 15000, source: '糯米', output: 3 },
                '酒酿': { price: 3, processingTime: 18000, source: '米', output: 3 },
                '蜂蜜': { price: 3, buyOnly: true },
                '冰糖': { price: 3, buyOnly: true },
                '乌龙茶包': { price: 4, buyOnly: true }
            },
            
            // 任务物品
            questItems: {
                '止血草': { description: '常见的药草，用于任务' },
                '野菜': { description: '野生蔬菜，村民的口粮' },
                '山楂木': { description: '坚硬的木材，用于建设' },
                '精致令牌': { description: '特殊的令牌，开启高级挑战' },
                '野兔': { description: '捕获的野兔，可以加工' },
                '兔毛': { description: '柔软的兔毛' },
                '兔皮': { description: '优质的兔皮' },
                '馒头': { description: '基础食物' }
            },

            // 特殊物品
            specialItems: {
                '小鱼干': { price: 5, huntingDrop: true },
                '地图': { questReward: true, description: '解锁山洞打猎' },
                '簪子': { sellPrice: 10, huntingDrop: true },
                '钱袋': { sellPrice: 5, monsterDrop: true },
                '破旧武器': { sellPrice: 3, monsterDrop: true },
                '野猪牙': { sellPrice: 8, monsterDrop: true },
                '董虎战刀': { type: 'weapon', attack: 12, questReward: true },
                '村长佩剑': { type: 'weapon', attack: 8, questReward: true },
                '村长皮甲': { type: 'armor', defense: 20, questReward: true }
            }
        };
    }
    
    /**
     * 添加物品
     */
    addItem(itemName, quantity = 1, category = null) {
        if (!this.core.initialized) {
            console.error('核心系统未初始化');
            return false;
        }
        
        // 自动检测分类
        if (!category) {
            category = this.detectItemCategory(itemName);
        }
        
        const inventory = this.core.gameData.inventory;
        
        // 根据分类添加到对应位置
        switch (category) {
            case 'teaIngredients':
                inventory.teaIngredients[itemName] = (inventory.teaIngredients[itemName] || 0) + quantity;
                break;
            case 'meatIngredients':
                inventory.meatIngredients[itemName] = (inventory.meatIngredients[itemName] || 0) + quantity;
                break;
            case 'toppings':
                inventory.toppings[itemName] = (inventory.toppings[itemName] || 0) + quantity;
                break;
            case 'seeds':
                inventory.seeds[itemName] = (inventory.seeds[itemName] || 0) + quantity;
                break;
            case 'questItems':
                inventory.questItems[itemName] = (inventory.questItems[itemName] || 0) + quantity;
                break;
            case 'specialItems':
                inventory.specialItems[itemName] = (inventory.specialItems[itemName] || 0) + quantity;
                break;
            case 'equipment':
                inventory.equipment.push({
                    name: itemName,
                    id: Date.now() + Math.random(),
                    ...quantity // quantity在装备情况下是属性对象
                });
                break;
            default:
                // 默认放到特殊物品
                inventory.specialItems[itemName] = (inventory.specialItems[itemName] || 0) + quantity;
        }
        
        console.log(`📦 统一背包添加: ${itemName} x${quantity} → ${category}`);
        console.log(`📦 当前${itemName}总数: ${this.getItemCount(itemName)}`);
        this.emit('itemAdded', { itemName, quantity, category });

        return true;
    }
    
    /**
     * 移除物品
     */
    removeItem(itemName, quantity = 1, category = null) {
        if (!this.core.initialized) {
            console.error('核心系统未初始化');
            return false;
        }
        
        if (!category) {
            category = this.detectItemCategory(itemName);
        }
        
        const inventory = this.core.gameData.inventory;
        let currentCount = 0;
        
        // 获取当前数量
        switch (category) {
            case 'teaIngredients':
                currentCount = inventory.teaIngredients[itemName] || 0;
                break;
            case 'meatIngredients':
                currentCount = inventory.meatIngredients[itemName] || 0;
                break;
            case 'toppings':
                currentCount = inventory.toppings[itemName] || 0;
                break;
            case 'seeds':
                currentCount = inventory.seeds[itemName] || 0;
                break;
            case 'questItems':
                currentCount = inventory.questItems[itemName] || 0;
                break;
            case 'specialItems':
                currentCount = inventory.specialItems[itemName] || 0;
                break;
            case 'equipment':
                // 装备特殊处理
                const equipIndex = inventory.equipment.findIndex(item => item.name === itemName);
                if (equipIndex >= 0) {
                    inventory.equipment.splice(equipIndex, 1);
                    this.emit('itemRemoved', { itemName, quantity: 1, category });
                    return true;
                }
                return false;
        }
        
        // 检查数量是否足够
        if (currentCount < quantity) {
            console.warn(`物品数量不足: ${itemName} (需要${quantity}, 拥有${currentCount})`);
            return false;
        }
        
        // 移除物品
        const newCount = currentCount - quantity;
        switch (category) {
            case 'teaIngredients':
                if (newCount <= 0) {
                    delete inventory.teaIngredients[itemName];
                } else {
                    inventory.teaIngredients[itemName] = newCount;
                }
                break;
            case 'meatIngredients':
                if (newCount <= 0) {
                    delete inventory.meatIngredients[itemName];
                } else {
                    inventory.meatIngredients[itemName] = newCount;
                }
                break;
            case 'toppings':
                if (newCount <= 0) {
                    delete inventory.toppings[itemName];
                } else {
                    inventory.toppings[itemName] = newCount;
                }
                break;
            case 'seeds':
                if (newCount <= 0) {
                    delete inventory.seeds[itemName];
                } else {
                    inventory.seeds[itemName] = newCount;
                }
                break;
            case 'questItems':
                if (newCount <= 0) {
                    delete inventory.questItems[itemName];
                } else {
                    inventory.questItems[itemName] = newCount;
                }
                break;
            case 'specialItems':
                if (newCount <= 0) {
                    delete inventory.specialItems[itemName];
                } else {
                    inventory.specialItems[itemName] = newCount;
                }
                break;
        }
        
        console.log(`移除物品: ${itemName} x${quantity} (${category})`);
        this.emit('itemRemoved', { itemName, quantity, category });
        
        return true;
    }
    
    /**
     * 获取物品数量
     */
    getItemCount(itemName, category = null) {
        if (!this.core.initialized) {
            return 0;
        }
        
        if (!category) {
            category = this.detectItemCategory(itemName);
        }
        
        const inventory = this.core.gameData.inventory;
        
        switch (category) {
            case 'teaIngredients':
                return inventory.teaIngredients[itemName] || 0;
            case 'meatIngredients':
                return inventory.meatIngredients[itemName] || 0;
            case 'toppings':
                return inventory.toppings[itemName] || 0;
            case 'seeds':
                return inventory.seeds[itemName] || 0;
            case 'questItems':
                return inventory.questItems[itemName] || 0;
            case 'specialItems':
                return inventory.specialItems[itemName] || 0;
            case 'equipment':
                return inventory.equipment.filter(item => item.name === itemName).length;
            default:
                // 如果分类未知，尝试在所有分类中查找
                return (inventory.teaIngredients[itemName] || 0) +
                       (inventory.meatIngredients[itemName] || 0) +
                       (inventory.toppings[itemName] || 0) +
                       (inventory.seeds[itemName] || 0) +
                       (inventory.questItems[itemName] || 0) +
                       (inventory.specialItems[itemName] || 0) +
                       (inventory.equipment.filter(item => item.name === itemName).length || 0);
        }
    }
    
    /**
     * 检查是否有足够的物品
     */
    hasItem(itemName, quantity = 1, category = null) {
        return this.getItemCount(itemName, category) >= quantity;
    }
    
    /**
     * 自动检测物品分类
     */
    detectItemCategory(itemName) {
        // 按照重建文档的分类体系检测
        if (this.itemConfig.teaIngredients[itemName]) return 'teaIngredients';
        if (this.itemConfig.meatIngredients[itemName]) return 'meatIngredients';
        if (this.itemConfig.toppings[itemName]) return 'toppings';
        if (this.itemConfig.questItems[itemName]) return 'questItems';
        if (this.itemConfig.specialItems[itemName]) return 'specialItems';

        // 种子检测 (以种子名称结尾)
        if (itemName.endsWith('种子')) {
            return 'seeds';
        }

        // 装备检测 (剑、甲、刀等)
        if (itemName.includes('剑') || itemName.includes('甲') || itemName.includes('刀') ||
            itemName.includes('链') || itemName.includes('盔') || itemName.includes('靴')) {
            return 'equipment';
        }

        // 肉类检测 (以肉结尾)
        if (itemName.endsWith('肉')) {
            return 'meatIngredients';
        }

        // 草药检测 (常见的草药名称)
        if (itemName.includes('草') || itemName.includes('药') || itemName.includes('菜')) {
            return 'questItems';
        }

        // 默认为特殊物品
        return 'specialItems';
    }
    
    /**
     * 获取所有物品（按分类）
     */
    getAllItems() {
        if (!this.core.initialized) {
            return {};
        }
        
        return this.core.gameData.inventory;
    }
    
    /**
     * 获取物品配置
     */
    getItemConfig(itemName) {
        for (const category in this.itemConfig) {
            if (this.itemConfig[category][itemName]) {
                return { ...this.itemConfig[category][itemName], category };
            }
        }
        return null;
    }
    
    /**
     * 验证背包数据完整性
     */
    validateInventoryData() {
        if (!this.core.initialized) {
            console.error('核心系统未初始化，无法验证背包数据');
            return false;
        }

        const inventory = this.core.gameData.inventory;

        // 确保所有必要的分类存在
        const requiredCategories = ['teaIngredients', 'meatIngredients', 'toppings', 'seeds', 'questItems', 'specialItems', 'equipment'];
        let hasErrors = false;

        requiredCategories.forEach(category => {
            if (!inventory[category]) {
                console.warn(`📦 修复缺失的背包分类: ${category}`);
                if (category === 'equipment') {
                    inventory[category] = [];
                } else {
                    inventory[category] = {};
                }
                hasErrors = true;
            }
        });

        if (hasErrors) {
            console.log('📦 背包数据已修复，保存中...');
            this.core.saveGameData();
        }

        return !hasErrors;
    }

    /**
     * 获取背包统计信息
     */
    getInventoryStats() {
        const inventory = this.core.gameData.inventory;
        const stats = {
            totalItems: 0,
            categories: {}
        };

        Object.keys(inventory).forEach(category => {
            if (category === 'equipment') {
                stats.categories[category] = inventory[category].length;
                stats.totalItems += inventory[category].length;
            } else {
                const categoryItems = Object.values(inventory[category] || {});
                const categoryCount = categoryItems.reduce((sum, count) => sum + count, 0);
                stats.categories[category] = categoryCount;
                stats.totalItems += categoryCount;
            }
        });

        return stats;
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
                    console.error(`物品系统事件处理器错误 [${event}]:`, error);
                }
            });
        }
    }
}

// ============================================================================
// 全局暴露
// ============================================================================

// 将类暴露到全局作用域，供其他脚本使用
window.UnifiedInventorySystem = UnifiedInventorySystem;

console.log('📦 统一背包系统类已加载并暴露到全局作用域');
