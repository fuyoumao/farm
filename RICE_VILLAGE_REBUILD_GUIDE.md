
# 稻香村重建指导文档

## 概述
本文档用于指导稻香村游戏系统的重建工作，包含完整的NPC任务系统、怪物分类系统和植物采集系统。

## NPC任务系统

### 村长刘洋任务链（10个任务）

#### 任务1：清理野猪威胁
- **类型**: KILL
- **目标**: 击败5只野猪
- **描述**: 村外野猪成群，威胁村民安全，请帮忙清理
- **奖励**: 200经验 + 30金币

#### 任务2：收集村民口粮
- **类型**: COLLECT
- **目标**: 收集8个野菜
- **描述**: 村民缺少食物，请帮忙采集野菜补充口粮
- **奖励**: 180经验 + 25金币

#### 任务3：为巡逻队提供补给
- **类型**: PROVIDE_ITEM
- **目标**: 制作3壶茶饮
- **描述**: 巡逻队需要茶水补充体力，请制作茶饮
- **奖励**: 220经验 + 35金币

#### 任务4：收集防御材料
- **类型**: COLLECT
- **目标**: 收集5个山楂木
- **描述**: 村庄防御需要木材，请收集山楂木
- **奖励**: 250经验 + 40金币

#### 任务5：保卫村庄
- **类型**: KILL
- **目标**: 击败3只山贼
- **描述**: 山贼骚扰村民，请协助击退入侵者
- **奖励**: 300经验 + 50金币

#### 任务6：收集村民生活用品
- **类型**: COLLECT
- **目标**: 收集6个止血草
- **描述**: 村民需要止血草治疗外伤，请帮忙采集
- **奖励**: 200经验 + 30金币

#### 任务7：制作村民药茶
- **类型**: PROVIDE_ITEM
- **目标**: 制作2壶古法酸梅汤
- **描述**: 村民身体虚弱，需要古法酸梅汤调理身体
- **奖励**: 280经验 + 45金币

#### 任务8：村庄最终防务
- **类型**: KILL
- **目标**: 击败2只山贼
- **描述**: 山贼头目即将来袭，需要你协助最后的防御
- **奖励**: 350经验 + 60金币 + 村长佩剑（攻击力+8）

#### 任务9：击败山贼头目董虎（BOSS任务）
- **类型**: KILL
- **目标**: 击败董虎
- **解锁条件**:
  - 玩家等级 ≥ 10级
  - 拥有精致令牌
  - 完成前8个任务
- **描述**: 董虎带着残部想要报复村庄，必须阻止他
- **奖励**: 600经验 + 120金币 + 董虎战刀（攻击力+12）

#### 任务10：千叮万嘱老村长（最终任务）
- **类型**: PROVIDE_ITEM
- **目标**: 与王富对话
- **描述**: 前往驿站找车夫王富，准备前往扬州
- **奖励**: 300经验 + 80金币 + 村长的祝福（+10%经验获得，持续1小时）
- **解锁功能**: 扬州传送点

### 车夫王富NPC
- **职业**: 车夫
- **位置**: 驿站
- **功能**: 处理村长最终任务，开启扬州传送点
- **对话**: 安排马车前往扬州，解锁新地图

### 秋叶青NPC
- **职业**: 秋家大小姐
- **位置**: 稻香村
- **身份**: 长安来的秋家大小姐，跟随李复而来
- **功能**: 与李复互动任务链的关键NPC
- **背景**: 出身名门，从京畿随李复到稻香村，情感复杂

## 怪物分类系统

### **怪物类型分类**
#### **小型非主动攻击怪物**
- **代表**: 野兔、果子狸
- **血量范围**: 20-30
- **攻击力范围**: 1-1 (几乎不攻击)
- **经验范围**: 5-8
- **攻击模式**: 被动反击
- **重生时间**: 3秒

#### **中型主动攻击怪物**
- **代表**: 野猪、猴子
- **血量范围**: 30-100
- **攻击力范围**: 5-10
- **经验范围**: 10-15
- **攻击模式**: 主动先手攻击
- **重生时间**: 3秒

#### **大型主动攻击怪物**
- **代表**: 山贼、可疑的山贼
- **血量范围**: 80-200
- **攻击力范围**: 10-40
- **经验范围**: 18-25
- **攻击模式**: 主动先手攻击
- **重生时间**: 3秒

#### **BOSS级主动攻击怪物**
- **代表**: 董虎
- **血量范围**: 500-800
- **攻击力范围**: 40-80
- **经验范围**: 50-100
- **攻击模式**: 主动先手攻击
- **重生时间**: 3秒
- **特殊规则**: 只有激活对应任务时才能攻击

### **随机生成机制**
- **重生时随机**: 每次怪物重生都重新随机血量、攻击力、经验值
- **范围内随机**: 在对应类型的数值范围内随机生成
- **属性独立**: 血量、攻击力、经验值独立随机

### **攻击机制**
- **主动攻击型**: 玩家进入攻击时，怪物先手攻击玩家
- **被动攻击型**: 玩家攻击时，怪物被动反击

### **统一战斗流程**
1. **攻击发起**: 玩家点击攻击按钮
2. **进度显示**: 显示8秒攻击进度条（独立进度条，不互相干扰）
3. **伤害计算**: 玩家攻击力加上猫咪攻击力
4. **血量扣除**: 怪物血量减少，更新血量条显示
5. **击败判断**: 血量归零则怪物死亡
6. **奖励发放**: 获得经验、掉落物品、更新任务进度
7. **动画显示**: 经验获得和物品掉落的浮动文字动画
8. **怪物重生**: 3秒后重新生成随机属性的同种怪物

### **攻击进度条系统**
#### **独立进度条**
- **攻击时间**: 统一8秒攻击时间
- **独立管理**: 每个怪物的进度条独立运行，不互相干扰
- **唯一标识**: 使用怪物名称作为进度条ID，确保唯一性
- **并发支持**: 支持同时攻击多个怪物，进度条独立计算

#### **进度条实现规范**
- **HTML结构**: `<div id="progress-${monsterName}">` 确保唯一性
- **更新机制**: 使用独立的定时器，避免全局冲突
- **状态管理**: 每个怪物独立维护攻击状态
- **按钮控制**: 攻击期间禁用对应怪物的攻击按钮

### **战斗动画系统**
#### **飘字动画**
- **经验获得**: 击败怪物时显示"+X经验"飘起动画
- **物品掉落**: 有掉落时显示物品名称飘起动画
- **动画避让**: 多个动画块不重叠，自动错开位置
- **动画效果**: 从怪物位置向上飘起，渐隐消失
- **持续时间**: 2秒动画时间，确保用户能看清

#### **动画样式**
- **经验动画**: 绿色文字，"+X经验"格式
- **掉落动画**: 黄色文字，物品名称格式
- **位置错开**: 垂直间隔30px，避免重叠

## 植物采集系统

### **植物分类机制**
#### **任务用植物**
- **代表**: 止血草、野菜、山楂木、野花
- **判断标准**: 不在茶铺原料列表中的植物
- **采集时间**: 8秒进度条
- **刷新时间**: 3秒
- **用途**: 主要用于任务需求

#### **茶馆用植物**
- **判断标准**: 植物名称在茶铺原料中存在
- **采集时间**: 8秒进度条
- **刷新时间**: 30秒
- **用途**: 为玩家提供制茶原料便利
- **扩展性**: 新地图NPC给出新配方时自动支持新原料

### **统一配置系统**
- **动态判断**: 根据茶铺原料列表自动分类植物
- **统一时间**: 所有植物采集时间统一为8秒
- **差异化刷新**: 任务用3秒，茶馆用30秒
- **经验统一**: 所有植物采集获得2经验

## 任务激活攻击按钮规则

### **攻击按钮显示规则**
- **普通怪物**: 始终显示攻击按钮，玩家可随时攻击
- **BOSS怪物**: 只有在对应任务激活时才显示攻击按钮
- **实现方式**: 通过hasActiveQuestFromNPC()函数检查任务状态

### **BOSS怪物特殊规则**
#### **董虎**
- **激活条件**: 必须有村长刘洋的"击败山贼头目董虎"任务
- **检查方式**: hasActiveQuestFromNPC(NPC_NAMES.LIU_YANG, 'defeat_donghu')
- **按钮状态**: 无任务时按钮禁用，有任务时按钮可用

### **装备奖励系统**
#### **村长佩剑**
- **获得方式**: 完成村长第8个任务
- **属性**: 攻击力+8
- **类型**: 武器装备

#### **董虎战刀**
- **获得方式**: 击败BOSS董虎
- **属性**: 攻击力+12
- **类型**: 武器装备

### **地图扩展系统**
#### **扬州传送点**
- **解锁条件**: 完成村长最终任务
- **解锁方式**: 与车夫王富对话
- **功能**: 开启新地图传送功能

## 地图完成奖励系统

### **稻香村完成奖励**
#### **NPC转茶铺顾客系统**
- **触发条件**: 完成村长最终任务（与车夫王富对话）
- **转移NPC名单**:
  - 刘大海（武学教头）
  - 刘洋（村长）
  - 王婆婆（村民）
  - 少侠（武学弟子）
  - 李复（轻功师父）
  - 陈月（村民）
  - 王富（车夫）
  - 秋叶青（秋家大小姐）
  - 武器铺老板（武器商人）

#### **茶铺顾客类型扩展**
- **普通顾客**: 70%概率，显示"普通顾客"，不解锁配方
- **VIP顾客**: 20%概率，显示具体名字+⭐，可解锁配方
- **Named顾客**: 10%概率，显示稻香村NPC真实姓名，不解锁配方，有特殊对话

#### **Named顾客特殊机制**
- **外观标识**: 显示真实姓名，无⭐标记
- **对话内容**: 回忆稻香村的特殊对话
- **收益**: 与普通顾客相同（15金币）
- **耐心时间**: 与普通顾客相同（120秒）
- **配方解锁**: 不触发配方解锁机制

#### **村长特殊奖励配方**
- **配方名称**: 面茶
- **给予方式**: 完成村长最终任务时自动解锁
- **配方组成**: 黄米面 + 白芝麻 + 芝麻酱 + 胡椒粉
- **新增原料系统**:
  - **黄米种子**: 新增种植物，2金币，45秒生长时间
  - **黄米**: 种植黄米种子获得
  - **黄米面**: 黄米通过案板加工获得（15秒加工时间，产出3个）
  - **白芝麻**: 商店购买，价格4金币
  - **芝麻酱**: 商店购买，价格6金币
  - **胡椒粉**: 商店购买，价格5金币

### **扬州完成奖励（预留）**
#### **扬州NPC转茶铺顾客**
- **触发条件**: 完成扬州地图最终任务
- **转移机制**: 与稻香村相同，扬州NPC加入Named顾客池

#### **扬州特殊奖励配方（预留）**
- **配方名称**: 待定
- **给予方式**: 完成扬州最终任务时自动解锁
- **新增原料**: 包含1-2种新种植物和2-3种商店购买物品

### **系统实现规范**
#### **数据结构扩展**
```javascript
// 在 unified-core-system.js 中扩展
gameData.teaShop.namedCustomers = []; // 存储已转移的NPC名单
gameData.teaShop.customerTypes = {
    normal: 0.7,    // 普通顾客70%
    vip: 0.2,       // VIP顾客20%
    named: 0.1      // Named顾客10%
};
```

#### **顾客生成逻辑修改**
```javascript
// 在 tea-shop-manager.js 中修改顾客生成函数
function generateCustomer() {
    const rand = Math.random();
    if (rand < 0.7) {
        // 生成普通顾客
        return { type: 'normal', name: '普通顾客' };
    } else if (rand < 0.9) {
        // 生成VIP顾客
        return { type: 'vip', name: selectRandomVIP() };
    } else {
        // 生成Named顾客（如果有已转移的NPC）
        const namedCustomers = gameData.teaShop.namedCustomers;
        if (namedCustomers.length > 0) {
            return { type: 'named', name: selectRandomNamed() };
        } else {
            // 如果没有Named顾客，回退到VIP
            return { type: 'vip', name: selectRandomVIP() };
        }
    }
}
```

#### **测试验证要求**
1. **NPC转移测试**: 完成村长最终任务后，验证Named顾客是否正确生成
2. **概率分布测试**: 验证三种顾客类型的生成概率是否符合规范
3. **面茶制作测试**: 验证完整的黄米种植→加工→制茶流程
4. **商店购买测试**: 验证新增商店物品的购买功能
5. **特殊对话测试**: 验证Named顾客的特殊对话内容

## 统一背包系统

### **核心设计理念**
- **跨地图统一**: 茶铺和稻香村完全共享同一个背包
- **自动分类管理**: 根据物品名称自动归类，无需手动指定
- **实时同步更新**: 任何地图的物品变化立即同步到所有界面
- **无限容量设计**: 不限制背包容量，专注游戏体验

### **物品分类体系**

#### **茶饮制作原料（teaIngredients）**
- **基础原料**: 五味子、柠檬等基础茶材
- **花类原料**: 洛神花、玫瑰花、菊花、金银花、桂花
- **果类原料**: 桂圆、红枣、枸杞、话梅、雪花梨、水蜜桃
- **草药原料**: 山楂、决明子、薄荷、甘草、陈皮、生姜、黄芪、何首乌、当归
- **谷物原料**: 大麦、薏米、糯米、米
- **蔬菜原料**: 冬瓜、荷叶
- **菌类原料**: 银耳、灵芝
- **特殊原料**: 龙井茶、普洱茶、人参、蜂蜜等高级材料

#### **肉类烧烤原料（meatIngredients）**
- **基础肉类**: 兔肉、鸡肉等常见肉类
- **高级肉类**: 山羊肉、野猪肉等稀有肉类
- **未来扩展**: 牛肉、羊肉、鱼肉、鹿肉（为后续地图预留）

#### **小料加工原料（toppingIngredients）**
- **可加工原料**: 甘蔗、柚子、柠檬等需要加工的原材料
- **成品小料**: 红糖、薄荷叶、姜丝等已加工完成的小料

#### **装备系统（equipment）**
- **武器装备**: 各种武器，每件装备有唯一ID和属性
- **护甲装备**: 各种防具，支持品质等级系统
- **饰品装备**: 未来扩展的饰品类装备

#### **任务物品（questItems）**
- **药草类**: 止血草等任务常用药草
- **蔬菜类**: 野菜等采集蔬菜
- **动物类**: 野兔等战斗获得的动物
- **材料类**: 兔毛、兔皮等加工材料
- **食物类**: 馒头等消耗品
- **特殊道具**: 精致令牌等剧情物品

#### **配方图纸（recipes）**
- **茶饮配方**: 各种茶饮的制作配方
- **烧烤配方**: 各种烤肉的制作配方
- **加工配方**: 小料加工的配方
- **未来配方**: 为后续烹饪系统预留

### **统一操作接口**

#### **添加物品**
- **函数**: `unifiedInventory.addItem(itemName, quantity)`
- **自动分类**: 系统自动判断物品应该放在哪个分类
- **自动保存**: 立即保存到统一存档系统
- **自动通知**: 触发界面更新事件

#### **移除物品**
- **函数**: `unifiedInventory.removeItem(itemName, quantity)`
- **数量检查**: 自动检查是否有足够数量
- **失败保护**: 数量不足时返回false，不执行操作

#### **查询物品**
- **数量查询**: `unifiedInventory.getItemCount(itemName)`
- **存在检查**: `unifiedInventory.hasItem(itemName, quantity)`
- **全部获取**: `unifiedInventory.getAllItems()`

## 统一任务类型系统扩展

### **PROVIDE_ITEM 任务类型处理规范**

统一任务生命周期系统中的 `PROVIDE_ITEM` 任务类型已扩展为**三种处理方式**，以支持不同类型的物品需求：

#### **任务类型分类**

**1. 任意茶饮任务** (`quest.target === '茶饮'`)
- **检查逻辑**: 统计 `madeTeas` 数组中的总数量
- **消耗机制**: 从 `madeTeas` 数组末尾依次移除指定数量
- **典型任务**: "为巡逻队提供补给 - 制作3壶茶饮"
- **数据位置**: `gameData.inventory.madeTeas`

**2. 特定茶饮任务** (`quest.target.includes('茶') || quest.target.includes('汤')`)
- **检查逻辑**: 在 `madeTeas` 数组中查找特定名称的茶饮
- **消耗机制**: 从 `madeTeas` 数组中移除指定名称和数量的茶饮
- **典型任务**: "制作村民药茶 - 制作2壶古法酸梅汤"
- **数据位置**: `gameData.inventory.madeTeas.filter(tea => tea.name === target)`

**3. 其他物品任务** (非茶饮类物品)
- **检查逻辑**: 使用统一背包系统 `unifiedInventory.getItemCount()`
- **消耗机制**: 使用统一背包系统 `unifiedInventory.removeItem()`
- **典型任务**: "为王婆婆送馒头 - 将馒头送给车夫王富"
- **数据位置**: 统一背包系统的各个分类中

#### **系统检查函数扩展**

**checkCompletableQuests函数更新**:
```javascript
case QUEST_TYPES.PROVIDE_ITEM:
    if (quest.target === '茶饮') {
        // 任意茶饮检查
        const madeTeas = inventory.madeTeas || [];
        return madeTeas.length >= quest.required;
    } else if (quest.target.includes('茶') || quest.target.includes('汤')) {
        // 特定茶饮检查
        const madeTeas = inventory.madeTeas || [];
        const specificTeas = madeTeas.filter(tea => tea.name === quest.target);
        return specificTeas.length >= quest.required;
    } else {
        // 其他物品检查（使用统一背包系统）
        return window.unifiedInventory.getItemCount(quest.target) >= quest.required;
    }
```

**consumeQuestItems函数更新**:
```javascript
case QUEST_TYPES.PROVIDE_ITEM:
    if (quest.target === '茶饮') {
        // 任意茶饮消耗
        const madeTeas = this.core.gameData.inventory.madeTeas || [];
        for (let i = 0; i < quest.required && madeTeas.length > 0; i++) {
            madeTeas.pop();
        }
    } else if (quest.target.includes('茶') || quest.target.includes('汤')) {
        // 特定茶饮消耗
        const madeTeas = this.core.gameData.inventory.madeTeas || [];
        let removedCount = 0;
        for (let i = madeTeas.length - 1; i >= 0 && removedCount < quest.required; i--) {
            if (madeTeas[i].name === quest.target) {
                madeTeas.splice(i, 1);
                removedCount++;
            }
        }
    } else {
        // 其他物品消耗（使用统一背包系统）
        window.unifiedInventory.removeItem(quest.target, quest.required);
    }
```

#### **扩展设计原则**

1. **向后兼容**: 原有的茶饮任务（任意茶饮和特定茶饮）保持完全兼容
2. **统一接口**: 其他物品统一使用 `unifiedInventory` 系统管理
3. **自动分类**: 系统根据物品名称自动判断处理方式
4. **扩展性**: 支持未来添加更多非茶饮类任务物品

#### **任务示例**

**茶饮类任务**：
- ✅ "为巡逻队提供补给" → target: "茶饮" → 任意茶饮处理
- ✅ "制作村民药茶" → target: "古法酸梅汤" → 特定茶饮处理

**其他物品任务**：
- ✅ "为王婆婆送馒头" → target: "馒头" → 统一背包系统处理
- ✅ 未来的"送信任务" → target: "信件" → 统一背包系统处理
- ✅ 未来的"上交材料" → target: "铁矿石" → 统一背包系统处理

### **系统优势**

1. **灵活性**: 支持茶饮制作系统和通用物品系统
2. **一致性**: 所有物品检查和消耗遵循统一规范
3. **可维护性**: 新增任务物品类型无需修改核心逻辑
4. **性能优化**: 避免重复的数据查找和转换

### **强制使用规范**

#### **禁止的操作**
- **禁止直接操作**: 任何系统都不得直接修改 `gameData.inventory`
- **禁止重复函数**: 不得创建类似 `addItemToInventory()` 的重复函数
- **禁止手动分类**: 不得手动指定物品分类，必须依赖自动分类

#### **强制使用规范**
- **唯一入口**: 所有物品操作必须通过 `unifiedInventory` 接口
- **统一命名**: 物品名称必须与分类映射表保持一致
- **事件触发**: 所有物品变化必须触发统一的更新事件

### **物品获得来源标准化**

#### **稻香村物品来源**
- **战斗掉落**: 所有怪物掉落物品统一使用 `unifiedInventory.addItem()`
- **植物采集**: 所有植物采集统一使用 `unifiedInventory.addItem()`
- **任务奖励**: NPC任务奖励统一使用 `unifiedInventory.addItem()`

#### **物品消耗标准化**
- **茶饮制作**: 统一使用 `unifiedInventory.removeItem()` 检查和消耗原料
- **烧烤制作**: 统一使用 `unifiedInventory.removeItem()` 检查和消耗原料
- **任务提交**: 统一使用 `unifiedInventory.removeItem()` 检查和消耗物品

## 统一数据管理系统

### **核心原则**
- **单一数据源**: 所有游戏数据统一存储在 `unifiedGameData`
- **禁止多源访问**: 严禁同时使用多个localStorage键值
- **统一保存机制**: 所有数据变更通过统一核心系统保存
- **数据一致性**: 确保茶铺和稻香村数据完全同步

### **数据存储规范**

#### **唯一数据源**
- **统一键值**: 只使用 `localStorage.getItem('unifiedGameData')`
- **禁止访问**: 严禁访问 `localStorage.getItem('gameData')` 等旧键值
- **统一接口**: 所有数据访问通过 `unifiedGameState.data` 进行

#### **数据结构层次**
```
unifiedGameData
├── player (玩家数据)
│   ├── name, gender, level, exp
│   ├── stats (血量、攻击力等)
│   ├── equipment (装备)
│   └── partner (猫咪伙伴数据)
├── inventory (统一背包系统)
├── teaShop (茶铺系统数据)
│   ├── cats (猫咪系统)
│   ├── plots (种植系统)
│   └── stoves (工作台系统)
└── riceVillage (稻香村系统数据)
    ├── npcs (NPC系统)
    ├── monsters (怪物系统)
    └── plants (植物系统)
```

### **数据访问规范**

#### **正确的数据访问方式**
- **读取数据**: `this.core.gameData.player.name`
- **修改数据**: `this.core.gameData.player.level = 10`
- **保存数据**: `this.core.saveGameData()`

#### **禁止的数据访问方式**
- **禁止直接访问**: `localStorage.getItem('gameData')`
- **禁止多键值**: `localStorage.getItem('riceVillageData')`
- **禁止绕过系统**: 直接操作localStorage而不通过统一系统

### **数据同步机制**
- **实时同步**: 数据变更立即在所有地图间同步
- **自动保存**: 定期自动保存到localStorage
- **事件驱动**: 数据变更触发相关界面更新
- **错误恢复**: 数据异常时自动修复和重建

### **数据迁移处理**
- **自动迁移**: 系统启动时自动从旧数据迁移
- **一次性迁移**: 迁移完成后删除旧数据
- **兼容性处理**: 支持从多个旧版本数据迁移
- **数据验证**: 迁移后验证数据完整性

### **强制执行规范**

#### **代码审查要点**
- **检查localStorage访问**: 确保只使用统一键值
- **检查数据修改**: 确保通过统一接口修改
- **检查保存调用**: 确保调用统一保存方法
- **检查数据读取**: 确保从统一数据源读取

#### **违规行为处理**
- **立即修复**: 发现违规访问立即修复
- **统一重构**: 将违规代码重构为统一接口
- **测试验证**: 修复后必须测试数据一致性
- **文档更新**: 修复后更新相关文档

## 统一天气时间系统

### **核心设计理念**
- **跨地图统一**: 茶铺和稻香村完全共享同一套天气时间系统
- **自动变化**: 天气和时间自动推进，无需手动干预
- **季节循环**: 春夏秋冬四季循环，每季10天
- **显示一致**: 所有地图显示相同的天气、时间、季节信息

### **系统数据结构**
```javascript
// 统一天气时间数据 (存储在 unifiedGameData.weather)
weather: {
    currentDay: 1,                    // 当前游戏天数
    currentSeason: "春天",            // 当前季节
    currentWeather: "晴天",           // 当前天气
    daysInSeason: 0,                  // 当前季节已过天数
    weatherStartTime: Date.now(),     // 当前天气开始时间
    weatherDuration: 30000,           // 天气持续时间(30秒)
    daysPerSeason: 10,               // 每季节天数
    seasons: ["春天", "夏天", "秋天", "冬天"],
    weathers: ["晴天", "刮风", "下雨", "下雪", "阴天"]
}
```

### **天气变化规律**

#### **变化周期**
- **天气变化**: 每30秒(30000毫秒)自动变化一次
- **天数推进**: 每次天气变化，游戏天数+1
- **季节变化**: 每10天自动切换到下一季节

#### **天气限制规则**
- **冬天限制**: 冬天不能出现"下雨"天气
- **非冬天限制**: 非冬天不能出现"下雪"天气
- **连续性限制**: 不能连续出现相同天气
- **随机选择**: 在符合条件的天气中随机选择

#### **季节循环**
- **春天** → **夏天** → **秋天** → **冬天** → **春天** (循环)
- **天数重置**: 每次换季节时，当前季节天数重置为0

### **系统接口规范**

#### **初始化接口**
- **函数**: `unifiedWeatherSystem.initialize()`
- **功能**: 初始化天气时间系统，设置默认值
- **调用时机**: 游戏启动时调用一次

#### **更新接口**
- **函数**: `unifiedWeatherSystem.update()`
- **功能**: 检查并更新天气时间状态
- **调用频率**: 每秒调用一次(在游戏主循环中)

#### **获取信息接口**
- **当前天气**: `unifiedWeatherSystem.getCurrentWeather()`
- **当前季节**: `unifiedWeatherSystem.getCurrentSeason()`
- **当前天数**: `unifiedWeatherSystem.getCurrentDay()`
- **天气图标**: `unifiedWeatherSystem.getWeatherIcon()`

#### **显示更新接口**
- **函数**: `unifiedWeatherSystem.updateDisplay()`
- **功能**: 更新所有地图的天气时间显示
- **调用时机**: 天气或时间发生变化时自动调用

### **跨地图同步机制**

#### **数据统一**
- **单一数据源**: 所有天气时间数据存储在统一数据系统中
- **实时同步**: 任何地图的天气时间变化立即同步到所有地图
- **状态一致**: 确保茶铺和稻香村显示完全相同的信息

#### **显示同步**
- **统一格式**: 所有地图使用相同的显示格式和样式
- **自动更新**: 天气时间变化时自动更新所有地图的显示
- **事件驱动**: 通过事件系统通知各地图更新显示

### **界面显示规范**

#### **茶铺显示**
- **位置**: 左上角天气卡片
- **内容**: 天气图标 + "第X天" + 季节天气文字
- **格式**: "春天 · 晴天" + "第1天"

#### **稻香村显示**
- **位置**: 页面顶部信息栏
- **内容**: 天气图标 + "第X天" + 季节天气文字
- **格式**: 与茶铺保持一致

#### **天气图标映射**
- **晴天**: ☀️
- **刮风**: 💨
- **下雨**: 🌧️
- **下雪**: ❄️
- **阴天**: ☁️

### **系统集成要求**

#### **与茶铺系统集成**
- **田地影响**: 天气变化影响茶铺田地的湿度和肥沃度
- **种植系统**: 天气状态影响作物生长条件
- **显示更新**: 天气变化时更新茶铺界面显示

### **田地天气影响规范**

#### **天气对田地的影响效果**
- **下雨**: 湿度 +20% (一次性效果)
- **刮风**: 湿度 -10% (一次性效果)
- **下雪**: 湿度 +15%, 肥沃度 +10% (一次性效果)
- **晴天**: 无立即效果
- **阴天**: 无立即效果

#### **影响机制**
- **触发时机**: 天气变化时立即应用一次性效果
- **影响范围**: 所有非空田地（包括种植中和成熟的田地）
- **数值限制**: 湿度和肥沃度不超过100%，不低于0%
- **日志记录**: 天气影响田地时在控制台输出日志


#### **与稻香村系统集成**
- **纯显示**: 稻香村只显示天气时间信息，不影响游戏机制
- **同步显示**: 与茶铺显示完全同步
- **界面集成**: 集成到稻香村的信息显示区域

### **强制使用规范**

#### **禁止的操作**
- **禁止独立实现**: 任何地图不得独立实现天气时间系统
- **禁止直接修改**: 不得直接修改天气时间数据，必须通过统一接口
- **禁止重复显示**: 不得在同一地图重复显示天气时间信息

#### **强制使用接口**
- **数据访问**: 必须通过 `unifiedWeatherSystem` 接口访问
- **显示更新**: 必须使用统一的显示更新方法
- **事件监听**: 必须监听统一的天气时间变化事件

### **界面优化**
- **删除状态列**: 不显示植物状态信息
- **操作列**: "刷新时间"改为"操作"
- **进度条**: 8秒采集进度条显示

## 系统架构与初始化

### **系统架构概览**

#### **核心架构设计**
```
统一核心系统 (UnifiedCoreSystem)
├── 统一背包系统 (UnifiedInventorySystem)
├── 统一天气系统 (UnifiedWeatherSystem)
├── 茶铺管理器 (TeaShopManager)
└── 稻香村管理器 (RiceVillageManager)
```

#### **文件依赖关系**
```
1. unified-core-system.js (核心系统)
2. unified-inventory-system.js (背包系统)
3. unified-weather-system.js (天气系统)
4. tea-shop-manager.js (茶铺管理器)
5. rice-village-manager.js (稻香村管理器)
```

### **初始化流程规范**

#### **正确的脚本加载顺序**
HTML页面中必须按以下顺序加载脚本：
```html
<!-- 核心系统 - 必须最先加载 -->
<script src="unified-core-system.js"></script>
<!-- 依赖系统 - 按依赖关系加载 -->
<script src="unified-inventory-system.js"></script>
<script src="unified-weather-system.js"></script>
<!-- 管理器系统 - 最后加载 -->
<script src="rice-village-manager.js"></script>
```

#### **系统初始化时序**
1. **依赖检查阶段**
   - 检查 `UnifiedInventorySystem` 类是否已加载
   - 检查 `UnifiedWeatherSystem` 类是否已加载
   - 依赖缺失时每200ms重试，最多重试50次

2. **核心系统创建阶段**
   - 创建 `window.core = new UnifiedCoreSystem()`
   - 调用 `window.core.init()` 初始化核心系统

3. **核心系统初始化步骤**
   ```
   步骤1：加载游戏数据 → 从localStorage读取并合并数据
   步骤2：初始化背包系统 → 创建UnifiedInventorySystem实例
   步骤3：设置初始化标志 → this.initialized = true
   步骤4：初始化天气系统 → 创建并启动天气循环
   步骤5：启动自动保存 → 定期保存游戏数据
   ```

4. **页面管理器初始化阶段**
   - 等待DOM加载完成 (`DOMContentLoaded`)
   - 检查核心系统是否就绪 (`window.core.initialized`)
   - 创建对应的管理器实例 (如 `RiceVillageManager`)

#### **初始化成功标志**
系统正确初始化后，控制台应显示：
```
📦 统一背包系统类已加载并暴露到全局作用域
🚀 正在创建统一核心系统全局实例...
✅ 统一核心系统全局实例创建并初始化成功
🚀 初始化统一核心系统 v2.0.0
📁 步骤1：加载游戏数据...
✅ 步骤1完成：游戏数据加载成功
📦 步骤2：初始化背包系统...
✅ 步骤2完成：背包系统初始化成功
⚙️ 步骤3：设置初始化标志...
✅ 步骤3完成：核心系统基础初始化完成
🌤️ 步骤4：初始化天气系统...
✅ 步骤4完成：天气系统初始化成功
💾 步骤5：启动自动保存...
✅ 步骤5完成：自动保存启动成功
🎉 统一核心系统完整初始化完成！
🏮 稻香村页面DOM加载完成
✅ 核心系统已就绪
✅ 稻香村系统初始化成功！
🎯 现在可以使用任务诊断功能：fullTaskDiagnosis()
```

### **全局变量规范**

#### **标准全局变量**
- `window.core` - 统一核心系统实例 (唯一)
- `window.riceVillageManager` - 稻香村管理器实例
- `window.teaShopManager` - 茶铺管理器实例 (在茶铺页面)

#### **禁止使用的变量**
- `window.unifiedCoreSystem` - 已废弃，容易产生重复实例
- 任何局部作用域的核心系统实例
- 任何绕过统一系统的独立实例

### **故障排除流程**

#### **常见初始化错误**

**错误1：`UnifiedInventorySystem is not defined`**
- **原因**: `unified-inventory-system.js` 文件未正确暴露到全局作用域
- **解决**: 确保文件末尾有 `window.UnifiedInventorySystem = UnifiedInventorySystem;`
- **检查**: 在控制台运行 `typeof UnifiedInventorySystem` 应返回 "function"

**错误2：`核心系统存在: true, 核心系统已初始化: false`**
- **原因**: 核心系统创建了但初始化失败
- **解决**: 检查初始化日志，通常是依赖加载问题
- **排查**: 运行 `window.core.init()` 查看详细错误信息

**错误3：稻香村管理器一直重试初始化**
- **原因**: HTML页面检查的是错误的全局变量
- **解决**: 确保使用 `window.core` 而不是其他变量名
- **检查**: 确认 `window.core.initialized === true`

#### **手动初始化方法**
如果自动初始化失败，可以手动运行：
```javascript
// 强制重新初始化（清理并重新创建）
forceInitRiceVillage()

// 或者检查并初始化（保留现有数据）
checkAndInitRiceVillage()

// 或者手动初始化核心系统
initializeCore()
```

## 开发调试指南

### **调试工具概览**

系统提供了完整的调试工具集，所有工具都通过控制台命令使用：

#### **系统状态检查工具**
- `checkInitStatus()` - 检查所有系统的初始化状态
- `testInventorySystem()` - 测试背包系统基本功能
- `testWeatherDisplay()` - 测试天气系统显示

#### **任务系统诊断工具**
- `fullTaskDiagnosis()` - **推荐** 完整的任务系统诊断
- `diagnoseTasks()` - 基础任务系统状态检查
- `testCollectProgress()` - 测试采集任务进度更新
- `debugCollectProgress()` - 详细的采集过程调试

#### **背包系统测试工具**
- `testInventoryUnification()` - 测试背包系统统一性
- `testRiceVillageInventory()` - 测试稻香村背包功能

#### **天气系统调试工具**
- `debugWeather()` - 查看天气系统详细状态
- `forceWeatherChange()` - 强制触发天气变化
- `resetWeatherSystem()` - 重置天气系统

#### **系统初始化工具**
- `forceInitRiceVillage()` - 强制重新初始化稻香村系统
- `checkAndInitRiceVillage()` - 检查并初始化稻香村系统
- `initializeCore()` - 手动初始化核心系统

### **调试工作流程**

#### **新接手项目时的调试步骤**
1. **系统状态检查**
   ```javascript
   checkInitStatus()  // 查看系统整体状态
   ```

2. **如果系统未就绪**
   ```javascript
   forceInitRiceVillage()  // 强制重新初始化
   ```

3. **检查任务系统**
   ```javascript
   fullTaskDiagnosis()  // 完整诊断任务系统
   ```

#### **野菜收集任务问题调试**
1. **基础诊断**
   ```javascript
   fullTaskDiagnosis()  // 查看任务状态和背包数据
   ```

2. **测试采集进度**
   ```javascript
   testCollectProgress()  // 模拟采集并检查进度更新
   ```

3. **详细调试采集**
   ```javascript
   debugCollectProgress()  // 详细跟踪每一步采集过程
   ```

#### **背包系统问题调试**
1. **统一性检查**
   ```javascript
   testInventoryUnification()  // 检查是否所有管理器使用统一背包
   ```

2. **功能测试**
   ```javascript
   testInventorySystem()  // 测试添加、移除物品功能
   ```

### **常见问题诊断**

#### **任务进度不更新问题**
**调试步骤**：
1. 运行 `fullTaskDiagnosis()` 检查任务状态
2. 确认任务存在且状态为 "active"
3. 检查进度记录是否存在 (`progress` 字段)
4. 运行 `testCollectProgress()` 模拟采集过程
5. 如果模拟成功但实际失败，检查采集代码中的进度更新调用

**常见原因**：
- 任务进度更新函数未被调用
- 背包系统和任务系统数据不同步
- 任务进度计算逻辑错误

#### **背包物品不显示问题**
**调试步骤**：
1. 运行 `testInventoryUnification()` 检查统一性
2. 确认所有管理器使用同一个背包实例
3. 检查物品是否添加到正确的分类中
4. 确认界面更新函数是否被调用

#### **天气系统不工作问题**
**调试步骤**：
1. 运行 `debugWeather()` 查看天气系统状态
2. 运行 `forceWeatherChange()` 测试强制变化
3. 检查天气更新循环是否正常运行

### **日志分析指南**

#### **正常初始化日志特征**
- 所有步骤都有对应的 "✅ 步骤X完成" 日志
- 没有 "❌" 错误标志
- 最后显示 "🎉 统一核心系统完整初始化完成！"

#### **异常日志特征**
- 出现 "❌" 错误标志
- 某个步骤缺少 "✅ 完成" 日志
- 出现 "⏳ 等待依赖加载" 且长时间不成功
- 出现重试次数过多的日志

#### **调试日志使用技巧**
- 使用浏览器控制台的过滤功能筛选特定类型日志
- 关注时间戳，确认系统初始化顺序
- 保存关键错误日志用于问题分析

## 茶铺经营系统

### **顾客系统规范**

#### **基础配置**
- **顾客生成概率**: 100%（每30秒检查一次）
- **生成间隔**: 30秒冷却时间
- **顾客类型分布**:
  - **普通顾客**: 70%概率，显示"普通顾客"，不解锁配方
  - **VIP顾客**: 20%概率，显示具体名字+⭐，可解锁配方
  - **Named顾客**: 10%概率，显示稻香村NPC真实姓名，不解锁配方
- **耐心时间**: 普通顾客120秒，VIP顾客240秒，Named顾客120秒
- **收益机制**: 普通顾客15金币，VIP顾客30金币，Named顾客15金币
- **统计规则**: 所有顾客（普通+VIP+Named）都计入总服务人数

#### **Named顾客系统（地图完成奖励）**
- **解锁条件**: 完成稻香村村长最终任务
- **顾客来源**: 稻香村已完成任务的NPC
- **显示特征**: 真实姓名，无⭐标记，有特殊头衔
- **特殊对话**: 回忆稻香村冒险的专属对话内容
- **行为机制**: 与普通顾客相同，不触发配方解锁
- **扩展性**: 支持扬州等其他地图的NPC加入

#### **VIP顾客名单和解锁规则**
##### **主要VIP顾客（9位）**
1. **凌小路** - 解锁洛神玫瑰饮（访问1次，100%概率）
2. **花花** - 解锁桂圆红枣茶（访问1次，100%概率）
3. **江飞飞** - 解锁焦香大麦茶（访问2次，100%概率）
4. **江三** - 解锁三花决明茶（访问2次，100%概率）
5. **江四** - 解锁薄荷甘草凉茶（访问2次，100%概率）
6. **池云旗** - 解锁陈皮姜米茶（访问2次50%概率，第3次必定）
7. **江潮** - 解锁冬瓜荷叶饮（访问3次60%概率，第4次必定）
8. **池惊暮** - 解锁古法酸梅汤（访问2次30%概率，第3次必定）
9. **江敕封** - 解锁小吊梨汤（访问3次40%概率，第5次必定）

##### **神秘VIP顾客（3位）**
- **姬别情** - 访问6次解锁烧烤夹功能（预留接口）
- **池九信** - 访问6次解锁后山打猎功能（预留接口）
- **狸怒** - 访问6次解锁山洞打猎功能（预留接口）

#### **顾客系统核心机制**
- **普通顾客**: 从已解锁配方中随机选择茶饮，不触发配方解锁检查
- **VIP顾客**: 从已解锁配方中随机选择茶饮，服务完成后检查配方解锁
- **访问记录**: 只记录VIP顾客的个人访问次数，用于配方解锁判断
- **小料需求**: 所有顾客80%概率要小料，从固定小料列表中随机选择

#### **人数里程碑解锁配方**
基于总服务人数（普通顾客+VIP顾客）：
- **30人**: 桑菊润燥茶
- **60人**: 桂花酒酿饮
- **90人**: 蜜桃乌龙冷萃
- **120人**: 黄芪枸杞茶
- **150人**: 竹蔗茅根马蹄水

### **茶饮配方系统**

#### **完整配方列表（18个）**
1. **五味子饮** - 基础配方 - 成分：['五味子']
2. **柠檬茶** - 基础配方 - 成分：['柠檬']
3. **解暑茶** - 基础配方 - 成分：['甘草']
4. **洛神玫瑰饮** - 凌小路解锁 - 成分：['洛神花','玫瑰花','山楂']
5. **桂圆红枣茶** - 花花解锁 - 成分：['桂圆','红枣','枸杞']
6. **焦香大麦茶** - 江飞飞解锁 - 成分：['大麦']
7. **三花决明茶** - 江三解锁 - 成分：['菊花','金银花','决明子','枸杞']
8. **薄荷甘草凉茶** - 江四解锁 - 成分：['薄荷','甘草']
9. **陈皮姜米茶** - 池云旗解锁 - 成分：['陈皮','生姜']
10. **冬瓜荷叶饮** - 江潮解锁 - 成分：['冬瓜','荷叶','薏米']
11. **古法酸梅汤** - 池惊暮解锁 - 成分：['乌梅','山楂','陈皮','甘草','桂花']
12. **小吊梨汤** - 江敕封解锁 - 成分：['雪花梨','银耳','话梅','枸杞']
13. **桑菊润燥茶** - 30人解锁 - 成分：['桑叶','杭白菊']
14. **桂花酒酿饮** - 60人解锁 - 成分：['桂花','酒酿']
15. **蜜桃乌龙冷萃** - 90人解锁 - 成分：['水蜜桃','乌龙茶包']
16. **黄芪枸杞茶** - 120人解锁 - 成分：['黄芪','枸杞']
17. **竹蔗茅根马蹄水** - 150人解锁 - 成分：['甘蔗','白茅根','马蹄']
18. **面茶** - 稻香村村长奖励 - 成分：['黄米面','白芝麻','芝麻酱','胡椒粉']

#### **地图奖励配方系统**
##### **稻香村奖励配方：面茶**
- **解锁条件**: 完成村长刘洋最终任务
- **解锁方式**: 与车夫王富对话完成任务时自动获得
- **配方特色**: 北方传统面茶，温暖香甜
- **新增原料链**:
  - **黄米种子** → **黄米** → **黄米面**（种植+加工）
  - **白芝麻**、**芝麻酱**、**胡椒粉**（商店购买）

##### **扬州奖励配方（预留）**
- **解锁条件**: 完成扬州地图最终任务
- **配方名称**: 待定
- **原料系统**: 包含新种植物和商店物品

### **小料加工系统**

#### **基础小料**
- **红糖** - 初始5个，可通过甘蔗加工获得（10秒，产出3个）
- **薄荷叶** - 初始5个，可通过薄荷加工获得（10秒，产出3个）
- **姜丝** - 初始5个，可通过生姜加工获得（10秒，产出3个）
- **柚子丝** - 初始5个，可通过柚子加工获得（10秒，产出3个）
- **银耳丝** - 初始5个，可通过银耳加工获得（15秒，产出3个）
- **柠檬片** - 初始5个，可通过柠檬加工获得（10秒，产出3个）
- **蜂蜜** - 初始5个，商店价格3铜板

#### **高级小料**
- **冰糖** - 初始0个，商店价格3铜板
- **乌龙茶包** - 初始0个，商店价格4铜板
- **水蜜桃果肉** - 通过水蜜桃加工获得（12秒，产出3个）
- **黄芪片** - 通过黄芪加工获得（12秒，产出3个）
- **干桂花** - 通过桂花加工获得（10秒，产出3个）
- **小圆子** - 通过糯米加工获得（15秒，产出3个）
- **酒酿** - 通过米加工获得（18秒，产出3个）

#### **地图奖励新增小料**
##### **稻香村新增加工原料**
- **黄米面** - 通过黄米加工获得（15秒，产出3个）
  - **原料来源**: 种植黄米种子获得黄米
  - **种植配置**: 黄米种子2金币，45秒生长时间
  - **加工特色**: 面茶专用原料，温暖香甜

##### **稻香村新增商店原料**
- **白芝麻** - 商店购买，价格4金币
- **芝麻酱** - 商店购买，价格6金币
- **胡椒粉** - 商店购买，价格5金币

#### **小料选择机制**
- **顾客要求**: 随机选择0-2个小料
- **多选支持**: 玩家可以添加0-2个小料到茶饮中
- **库存检查**: 只能添加有库存的小料

### **配方故事系统**

#### **故事结构**
每个配方解锁时都有对应的故事展示：
- **标题**: 故事标题
- **内容**: 完整的故事情节
- **效果**: 茶饮的功效描述

#### **故事示例**（缺失）
```javascript
"洛神玫瑰饮": {
    title: "朱砂",
    content: "凌小路袖中藏着一盏温热的洛神玫瑰饮。'疏肝解郁的，好好学学，飞飞来了就做给他。跟他说就说养颜的茶方子'挑眉笑时，眼底却映着刀光，袍角还沾着血。",
    effect: "疏肝解郁，美白养颜，活血调经，适合女子日常饮用。"
}
```

### **彩蛋系统**

#### **机器码生成**
- **格式**: 6位数字+6位字母的随机组合
- **更新**: 每次游戏启动时重新生成
- **用途**: 用于彩蛋码验证基础

#### **彩蛋码生成机制**
```javascript
// 顾客访问特定次数时生成彩蛋码
function generateEasterEggCode(customerName, visitCount) {
    const base = `${customerName}_${visitCount}_${gameData.machineCode}`;
    // 通过哈希算法生成唯一彩蛋码
    return hash + '-' + checksum;
}
```

#### **彩蛋码用途**
- **分享系统**: 玩家可以分享彩蛋码给游戏制作者领取奖励


### **猫咪系统**（从游戏里提取）（缺失）



### **烹饪系统**

#### **炉灶配置**
- **炉灶数量**: 2个
- **烹饪时间**: 20秒
- **温度系统**: 茶饮制作后有温度，需要20秒冷却

#### **加工台配置**  
- **加工时间**: 根据小料类型10-18秒不等
- **产出比例**: 1个原料产出3个小料
- **状态管理**: idle/processing状态切换

### **农田系统**

#### **基础配置**
- **农田数量**: 2块

- **湿润度**: 初始50，最低10
- **肥沃度**: 初始50，最低20

#### **种子系统**
- **基础种子**: 五味子、柠檬（初始各1个）
- **种子价格**: 1-3铜板不等
- **生长时间**: 30-60秒不等
- **收成**: 每块地收获对应材料

#### **特殊种子配置**
- **桑叶**: 价格2铜板，生长45秒
- **杭白菊**: 价格2铜板，生长50秒
- **水蜜桃**: 价格3铜板，生长60秒
- **黄芪**: 价格3铜板，生长55秒
- **白茅根**: 价格2铜板，生长40秒
- **马蹄**: 价格2铜板，生长45秒
- **糯米**: 价格2铜板，生长50秒
- **米**: 价格1铜板，生长40秒

### **天气季节系统**

#### **季节循环**
- **季节顺序**: 春天 → 夏天 → 秋天 → 冬天
- **天气类型**: 晴天、刮风、下雨、下雪、阴天
- **天气持续**: 每种天气持续2分钟
- **季节周期**: 每季节10天

#### **天气效果**
- **生长影响**: 不同天气对植物生长速度有影响
- **湿润度影响**: 下雨天自动补充土地湿润度
- **肥沃度消耗**: 根据天气调整肥沃度消耗速率

### **商店系统**

#### **可购买物品**
- **蜂蜜**: 3铜板
- **银耳**: 3铜板
- **红糖**: 2铜板
- **小鱼干**: 5铜板
- **冰糖**: 3铜板
- **乌龙茶包**: 4铜板


### **游戏数据初始化**

#### **基础数据**
```javascript
gameData = {
    // 游戏状态
    currentSeason: "春天",
    currentWeather: "晴天", 
    currentDay: 1,
    coins: 100,
    
    // 配方系统
    unlockedRecipes: ["五味子饮", "柠檬茶", "解暑茶"],
    customerVisits: {},
    servedCustomers: 0,
    
    // 背包系统
    seeds: {}, // 种子数量
    inventory: {}, // 材料库存
    toppings: {}, // 小料库存
    
    // 农田状态
    plots: [4个农田的状态],
    
    // 厨房设备
    stoves: [2个炉灶状态],
    processingBoard: {加工台状态},
    
    // 茶饮相关
    madeTeas: [],
    teaTemps: {},
    teaMakeTimes: {},
    
    // 顾客状态
    customer: {顾客信息},
    lastCustomerTime: 0,
    customerSpawnCooldown: 30000,
    
    // 猫咪系统
    cats: {猫咪相关数据}
};
```

### **统一背包系统扩展**

#### **茶铺特有分类**
在现有背包分类基础上，添加茶铺特有的分类：

- **小料成品（toppings）**: 加工完成的小料，如红糖、薄荷叶等
- **茶饮成品（beverages）**: 制作完成的茶饮
- **商店物品（shopItems）**: 可直接购买的特殊物品

#### **物品自动分类规则**
```javascript
// 自动分类函数
function categorizeItem(itemName) {
    // 茶饮原料分类
    if (TEA_INGREDIENTS.includes(itemName)) {
        return 'teaIngredients';
    }
    
    // 小料分类  
    if (TOPPING_ITEMS.includes(itemName)) {
        return 'toppings';
    }
    
    // 茶饮成品分类
    if (BEVERAGE_RECIPES.includes(itemName)) {
        return 'beverages';
    }
    
    // 默认分类
    return 'miscellaneous';
}
```

## 代码规范扩展

### **JS模块全局暴露规范**

#### **必须暴露的类**
每个独立的JS模块文件都必须在文件末尾将主要类暴露到全局作用域：

```javascript
// unified-inventory-system.js 末尾
window.UnifiedInventorySystem = UnifiedInventorySystem;
console.log('📦 统一背包系统类已加载并暴露到全局作用域');

// unified-weather-system.js 末尾  
window.UnifiedWeatherSystem = UnifiedWeatherSystem;
console.log('🌤️ 统一天气系统类已加载并暴露到全局作用域');

// rice-village-manager.js 末尾
window.RiceVillageManager = RiceVillageManager;
console.log('🏘️ 稻香村管理器类已加载并暴露到全局作用域');
```

#### **暴露规范**
- **命名一致性**: 全局变量名与类名完全一致
- **日志确认**: 必须添加加载确认日志，便于调试
- **文件末尾**: 暴露代码必须放在文件最末尾
- **一次性操作**: 每个类只暴露一次，避免重复

### **变量作用域规范**

#### **全局变量声明**
```javascript
// 正确：使用 var 声明全局管理器变量
var riceVillageManager;
var teaShopManager;

// 错误：使用 let 会产生作用域问题
let riceVillageManager = null;  // ❌ 禁止
```

#### **局部变量使用**
```javascript
// 在函数内部使用局部变量引用全局核心系统
function someFunction() {
    const core = window.core;  // ✅ 推荐
    if (!core || !core.initialized) {
        console.error('核心系统未就绪');
        return;
    }
    
    // 使用 core 进行操作
    const gameData = core.gameData;
}
```

#### **避免变量冲突**
- **禁止重复声明**: 不能在同一作用域多次声明同名变量
- **明确作用域**: 全局变量用 `var`，局部变量用 `const/let`
- **统一命名**: 全局核心系统始终使用 `window.core`

### **错误处理标准**

#### **分步骤错误处理**
所有复杂的初始化过程都必须分步骤处理，每步都有独立的错误处理：

```javascript
init() {
    try {
        console.log('📁 步骤1：加载游戏数据...');
        this.loadGameData();
        console.log('✅ 步骤1完成：游戏数据加载成功');
    } catch (error) {
        console.error('❌ 步骤1失败：游戏数据加载失败', error);
        console.error('❌ 错误详情:', error.stack);
        return;
    }
    
    try {
        console.log('📦 步骤2：初始化背包系统...');
        this.initializeInventory();
        console.log('✅ 步骤2完成：背包系统初始化成功');
    } catch (error) {
        console.error('❌ 步骤2失败：背包系统初始化失败', error);
        console.error('❌ 错误详情:', error.stack);
        return;
    }
}
```

#### **错误日志标准**
- **错误级别**: 使用 `console.error` 输出错误信息
- **详细信息**: 同时输出错误对象和堆栈信息
- **步骤标识**: 明确标识哪个步骤出错
- **视觉标志**: 使用 "❌" 标志便于快速识别

#### **依赖检查错误处理**
```javascript
function checkDependencies() {
    const dependencies = [
        'UnifiedInventorySystem',
        'UnifiedWeatherSystem'
    ];
    
    for (const dep of dependencies) {
        if (typeof window[dep] === 'undefined') {
            console.log(`⏳ 等待依赖加载: ${dep}`);
            return { ready: false, missing: dep };
        }
    }
    
    return { ready: true, missing: null };
}
```

#### **重试机制规范**
- **重试次数限制**: 最多重试50次，避免无限循环
- **重试间隔**: 200ms间隔，平衡响应性和性能
- **失败处理**: 达到最大重试次数时提供备用方案
- **进度显示**: 显示重试次数，便于了解进度

### **调试输出规范**

#### **日志分类标准**
- **🚀** 系统启动和重要操作
- **✅** 操作成功完成
- **❌** 错误和失败
- **⏳** 等待和重试状态
- **🔧** 手动操作和修复
- **📦** 背包系统相关
- **🌤️** 天气系统相关
- **🏘️** 稻香村系统相关
- **🔍** 诊断和调试信息

#### **函数命名规范**
```javascript
// 诊断函数：以 diagnose 开头
diagnoseTasks()
fullTaskDiagnosis()

// 测试函数：以 test 开头  
testInventorySystem()
testCollectProgress()

// 调试函数：以 debug 开头
debugWeather()
debugCollectProgress()

// 检查函数：以 check 开头
checkInitStatus()
checkAndInitRiceVillage()
```

#### **返回值规范**
调试函数应该返回有用的诊断数据：
```javascript
return {
    activeTasks: activeQuests.length,
    vegetableCount: vegetableCount,
    vegetableQuests: vegetableQuests.length,
    hasQuestContainer: !!questsContainer,
    diagnosis: '诊断完成，请查看控制台详细信息'
};
```

### **代码审查检查项**

#### **初始化相关检查**
- [ ] 脚本加载顺序是否正确
- [ ] 类是否正确暴露到全局作用域
- [ ] 依赖检查是否完整
- [ ] 错误处理是否分步骤
- [ ] 重试机制是否合理

#### **数据访问检查**
- [ ] 是否通过统一核心系统访问数据
- [ ] 是否避免直接操作localStorage
- [ ] 变量作用域是否正确
- [ ] 是否避免创建重复实例

#### **调试功能检查**
- [ ] 是否提供充分的调试工具
- [ ] 日志输出是否规范
- [ ] 错误信息是否足够详细
- [ ] 是否有手动修复方案

## 茶铺系统代码实现规范

### **顾客系统代码规范**

#### **顾客数据结构标准**
```javascript
// 标准顾客对象结构
const customer = {
    active: boolean,           // 是否有顾客在场
    name: string,              // 顾客名称（普通="普通顾客"，VIP=具体名字，Named=NPC真实姓名）
    isVIP: boolean,            // 是否为VIP顾客
    customerType: string,      // 顾客类型："normal" | "vip" | "named"
    title: string,             // Named顾客的头衔（如"村长"、"武学教头"）
    specialDialog: string,     // Named顾客的特殊对话内容
    teaChoice: string,         // 要求的茶饮名称
    toppingChoice: string,     // 要求的小料（如果有）
    orderType: string,         // 订单类型："tea_only" | "tea_with_topping"
    arrivalTime: number,       // 到达时间戳
    patience: number,          // 剩余耐心时间（毫秒）
    maxPatience: number,       // 最大耐心时间
    requirements: {            // 订单需求
        needsTea: boolean,
        needsTopping: boolean
    },
    progress: {                // 订单进度
        teaAdded: boolean,
        toppingAdded: boolean
    }
};

// VIP顾客访问记录结构（只记录VIP）
const customerVisits = {
    "VIP顾客名称": number      // 访问次数
};
```

#### **顾客生成函数规范**
```javascript
function generateNewCustomer() {
    // 1. 每30秒100%概率生成顾客

    // 2. 随机决定顾客类型（70%普通，20%VIP，10%Named）
    const rand = Math.random();
    let customerType, customerName, title = null, specialDialog = null;

    if (rand < 0.7) {
        // 3a. 普通顾客：固定显示"普通顾客"
        customerType = "normal";
        customerName = "普通顾客";
    } else if (rand < 0.9) {
        // 3b. VIP顾客：从名单中随机选择
        customerType = "vip";
        const vipNames = ['池惊暮', '凌小路', '江飞飞', '江三', '江四', '池云旗', '江潮', '江敕封', '花花', '姬别情', '池九信', '狸怒'];
        customerName = vipNames[Math.floor(Math.random() * vipNames.length)];
    } else {
        // 3c. Named顾客：从已转移的NPC中随机选择
        customerType = "named";
        const namedCustomers = this.core.gameData.teaShop.namedCustomers;
        if (namedCustomers.length > 0) {
            const selectedNPC = namedCustomers[Math.floor(Math.random() * namedCustomers.length)];
            customerName = selectedNPC.name;
            title = selectedNPC.title;
            specialDialog = selectedNPC.specialDialog;
        } else {
            // 如果没有Named顾客，回退到VIP
            customerType = "vip";
            const vipNames = ['池惊暮', '凌小路', '江飞飞', '江三', '江四', '池云旗', '江潮', '江敕封', '花花', '姬别情', '池九信', '狸怒'];
            customerName = vipNames[Math.floor(Math.random() * vipNames.length)];
        }
    }

    // 4. 选择茶饮（从已解锁配方中选择）
    const availableRecipes = this.getAvailableRecipes();
    const teaChoice = this.selectRandomTea(availableRecipes);

    // 5. 决定是否要小料（80%概率）
    const wantsTopping = Math.random() < 0.8;
    const toppingChoice = wantsTopping ? this.selectRandomTopping() : null;

    // 6. 设置耐心时间
    const isVIP = customerType === "vip";
    const patience = isVIP ? 240000 : 120000; // VIP 4分钟，普通和Named 2分钟
    
    // 7. 创建顾客对象
    this.currentCustomer = {
        active: true,
        name: customerName,
        isVIP: isVIP,
        customerType: isVIP ? "vip" : "normal",
        teaChoice: teaChoice,
        toppingChoice: toppingChoice,
        orderType: wantsTopping ? 'tea_with_topping' : 'tea_only',
        arrivalTime: Date.now(),
        patience: patience,
        maxPatience: patience,
        requirements: {
            needsTea: true,
            needsTopping: wantsTopping
        },
        progress: {
            teaAdded: false,
            toppingAdded: false
        }
    };
    
    // 8. 更新显示
    this.updateCustomerDisplay();
}
```

#### **服务完成处理规范**
```javascript
function submitOrder() {
    const customer = this.currentCustomer;
    
    // 1. 计算收益（根据顾客类型）
    const earnings = customer.isVIP ? 30 : 15;
    this.gameData.player.funds += earnings;
    
    // 2. 更新总服务人数统计（所有顾客都计入）
    this.gameData.teaShop.servedCustomers++;
    
    // 3. 只对VIP顾客进行配方解锁检查
    if (customer.isVIP && customer.name !== "普通顾客") {
        // 更新VIP个人访问记录
        const visits = this.gameData.teaShop.customerVisits;
        visits[customer.name] = (visits[customer.name] || 0) + 1;
        
        // 检查VIP配方解锁
        this.checkVIPRecipeUnlock(customer.name, visits[customer.name]);
    }
    
    // 4. 检查人数里程碑解锁
    this.checkMilestoneUnlock(this.gameData.teaShop.servedCustomers);
    
    // 5. 重置顾客状态
    this.resetCustomer();
}
```

#### **VIP配方解锁检查规范**
```javascript
// VIP解锁规则配置
const vipUnlockRules = {
    "凌小路": { visits: 1, chance: 1.0, recipe: "洛神玫瑰饮" },
    "花花": { visits: 1, chance: 1.0, recipe: "桂圆红枣茶" },
    "江飞飞": { visits: 2, chance: 1.0, recipe: "焦香大麦茶" },
    "江三": { visits: 2, chance: 1.0, recipe: "三花决明茶" },
    "江四": { visits: 2, chance: 1.0, recipe: "薄荷甘草凉茶" },
    "池云旗": { visits: 2, chance: 0.5, guaranteedVisits: 3, recipe: "陈皮姜米茶" },
    "江潮": { visits: 3, chance: 0.6, guaranteedVisits: 4, recipe: "冬瓜荷叶饮" },
    "池惊暮": { visits: 2, chance: 0.3, guaranteedVisits: 3, recipe: "古法酸梅汤" },
    "江敕封": { visits: 3, chance: 0.4, guaranteedVisits: 5, recipe: "小吊梨汤" }
};

// 神秘顾客功能解锁（预留接口）
const mysteriousCustomers = {
    "姬别情": { visits: 6, unlocks: "烧烤夹功能" },
    "池九信": { visits: 6, unlocks: "后山打猎功能" },
    "狸怒": { visits: 6, unlocks: "山洞打猎功能" }
};

function checkVIPRecipeUnlock(customerName, visitCount) {
    const rule = vipUnlockRules[customerName];
    if (!rule) return;
    
    // 检查是否已解锁
    if (this.gameData.teaShop.unlockedRecipes.includes(rule.recipe)) return;
    
    // 检查解锁条件
    let shouldUnlock = false;
    
    if (rule.guaranteedVisits && visitCount >= rule.guaranteedVisits) {
        // 保底解锁
        shouldUnlock = true;
    } else if (visitCount >= rule.visits) {
        // 概率解锁
        shouldUnlock = Math.random() < rule.chance;
    }
    
    if (shouldUnlock) {
        this.unlockRecipe(rule.recipe);
        this.showRecipeUnlockAnimation(rule.recipe); // 显示解锁配方动画文字
        this.showRecipeUnlockStory(rule.recipe);
    }
    
    // 检查神秘顾客功能解锁（预留接口）
    const mysteriousRule = mysteriousCustomers[customerName];
    if (mysteriousRule && visitCount >= mysteriousRule.visits) {
        this.unlockMysteriousFeature(mysteriousRule.unlocks);
    }
}

// 人数里程碑解锁检查规范
function checkMilestoneUnlock(servedCustomers) {
    const milestoneUnlocks = {
        30: "桑菊润燥茶",
        60: "桂花酒酿饮", 
        90: "蜜桃乌龙冷萃",
        120: "黄芪枸杞茶",
        150: "竹蔗茅根马蹄水"
    };
    
    const recipe = milestoneUnlocks[servedCustomers];
    if (recipe && !this.gameData.teaShop.unlockedRecipes.includes(recipe)) {
        this.unlockRecipe(recipe);
        this.showRecipeUnlockAnimation(recipe); // 显示解锁配方动画文字
        this.showRecipeUnlockStory(recipe);
        this.addDebugLog(`🏆 里程碑达成！服务${servedCustomers}位顾客，解锁配方：${recipe}`);
    }
}
```

#### **UI显示更新规范**
```javascript
function updateCustomerDisplay() {
    const customer = this.currentCustomer;
    
    if (customer.active) {
        // 进度条显示（统一灰色，不变色）
        const patiencePercent = Math.max(0, (customer.patience / customer.maxPatience) * 100);
        const progressBarStyle = `width: ${patiencePercent}%; background-color: #6b7280;`; // 统一灰色
        
        // 顾客名字显示
        const displayName = customer.isVIP ? `${customer.name} ⭐` : customer.name;
        
        // ... 其他UI更新逻辑
    }
}
```

### **配方解锁系统代码规范**

#### **解锁规则数据结构**
```javascript
// 配方解锁规则标准结构
const recipeUnlockRules = {
    "配方名称": {
        customer: string,        // 解锁顾客名称
        visitsRequired: number,  // 需要的访问次数
        chance: number,          // 解锁概率（0.0-1.0）
        guaranteedOnVisit: number // 必定解锁的访问次数
    }
};

// 示例
const recipeUnlockRules = {
    "陈皮姜米茶": {
        customer: "池云旗",
        visitsRequired: 2,
        chance: 0.5,
        guaranteedOnVisit: 3
    }
};
```

#### **解锁检查函数规范**
```javascript
function checkRecipeUnlock(customerName) {
    // 1. 获取访问记录
    const visits = this.customerVisits[customerName] || { count: 0 };
    
    // 2. 更新访问次数
    visits.count++;
    visits.lastVisit = Date.now();
    this.customerVisits[customerName] = visits;
    
    // 3. 检查所有相关配方
    Object.entries(this.recipeUnlockRules).forEach(([recipeName, rule]) => {
        if (rule.customer !== customerName) return;
        if (this.unlockedRecipes.includes(recipeName)) return;
        
        // 4. 检查解锁条件
        if (this.shouldUnlockRecipe(visits.count, rule)) {
            this.unlockRecipe(recipeName);
        }
    });
}

function shouldUnlockRecipe(visitCount, rule) {
    // 必定解锁检查
    if (visitCount >= rule.guaranteedOnVisit) {
        return true;
    }
    
    // 概率解锁检查
    if (visitCount >= rule.visitsRequired) {
        return Math.random() < rule.chance;
    }
    
    return false;
}
```

### **小料系统代码规范**

#### **小料数据结构标准**
```javascript
// 小料库存结构
const toppings = {
    "小料名称": number  // 库存数量
};

// 加工配方结构  
const processingRecipes = {
    "产出物名称": {
        ingredients: string[],  // 所需原料
        time: number,          // 加工时间（毫秒）
        output: number         // 产出数量
    }
};

// 示例
const processingRecipes = {
    "红糖": {
        ingredients: ["甘蔗"],
        time: 10000,
        output: 3
    }
};
```

#### **小料选择函数规范**
```javascript
function selectRandomToppings() {
    const availableToppings = [
        "红糖", "薄荷叶", "姜丝", "柚子丝", "银耳丝", 
        "柠檬片", "蜂蜜", "冰糖", "乌龙茶包"
    ];
    
    // 随机选择0-2个小料
    const numToppings = Math.floor(Math.random() * 3);
    const selectedToppings = [];
    
    for (let i = 0; i < numToppings; i++) {
        const randomTopping = availableToppings[
            Math.floor(Math.random() * availableToppings.length)
        ];
        
        // 避免重复选择
        if (!selectedToppings.includes(randomTopping)) {
            selectedToppings.push(randomTopping);
        }
    }
    
    return selectedToppings;
}
```

### **配方故事系统代码规范**

#### **故事数据结构标准**
```javascript
// 配方故事结构
const recipeStories = {
    "配方名称": {
        title: string,    // 故事标题
        content: string,  // 故事内容
        effect: string    // 茶饮功效描述
    }
};
```

#### **故事展示函数规范**
```javascript
function showRecipeUnlockStory(recipeName) {
    const story = this.recipeStories[recipeName];
    if (!story) return;
    
    // 创建故事展示面板
    const panel = this.createStoryPanel();
    
    panel.innerHTML = `
        <div class="story-header">
            <h3>🍵 ${recipeName}</h3>
            <h4>${story.title}</h4>
        </div>
        <div class="story-content">
            <p>${story.content}</p>
        </div>
        <div class="story-effect">
            <strong>功效：</strong>${story.effect}
        </div>
        <button class="close-story-btn">确定</button>
    `;
    
    // 添加关闭事件
    panel.querySelector('.close-story-btn').addEventListener('click', () => {
        this.closeStoryPanel(panel);
    });
    
    // 显示面板
    document.body.appendChild(panel);
}
```

#### **配方解锁动画文字规范**
```javascript
function showRecipeUnlockAnimation(recipeName) {
    // 创建动画文字元素
    const animationText = document.createElement('div');
    animationText.className = 'recipe-unlock-animation';
    animationText.textContent = `🎉 解锁新配方：${recipeName}！`;
    
    // 设置动画样式
    animationText.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(45deg, #FFD700, #FFA500);
        color: #000;
        padding: 20px 30px;
        border-radius: 15px;
        font-size: 18px;
        font-weight: bold;
        text-align: center;
        box-shadow: 0 8px 32px rgba(255, 215, 0, 0.4);
        z-index: 9999;
        opacity: 0;
        animation: recipeUnlockPop 3s ease-out forwards;
    `;
    
    // 添加CSS动画关键帧（如果不存在）
    if (!document.querySelector('#recipe-unlock-keyframes')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'recipe-unlock-keyframes';
        styleSheet.textContent = `
            @keyframes recipeUnlockPop {
                0% { 
                    opacity: 0; 
                    transform: translate(-50%, -50%) scale(0.5); 
                }
                20% { 
                    opacity: 1; 
                    transform: translate(-50%, -50%) scale(1.1); 
                }
                40% { 
                    transform: translate(-50%, -50%) scale(1); 
                }
                80% { 
                    opacity: 1; 
                    transform: translate(-50%, -50%) scale(1); 
                }
                100% { 
                    opacity: 0; 
                    transform: translate(-50%, -50%) scale(0.8); 
                }
            }
        `;
        document.head.appendChild(styleSheet);
    }
    
    // 添加到页面
    document.body.appendChild(animationText);
    
    // 3秒后自动移除
    setTimeout(() => {
        if (animationText.parentNode) {
            animationText.parentNode.removeChild(animationText);
        }
    }, 3000);
    
    // 记录解锁日志
    this.addDebugLog(`🎉 解锁新配方: ${recipeName}！`);
}
```

### **彩蛋系统代码规范**

#### **机器码生成规范**
```javascript
function generateMachineCode() {
    // 生成6位数字 + 6位字母的机器码
    const numbers = Math.random().toString().substr(2, 6);
    const letters = Math.random().toString(36).substr(2, 6).toUpperCase();
    
    return numbers + letters;
}
```

#### **彩蛋码生成规范**
```javascript
function generateEasterEggCode(customerName, visitCount) {
    const machineCode = this.gameData.machineCode;
    const base = `${customerName}_${visitCount}_${machineCode}`;
    
    // 使用简单哈希算法
    let hash = 0;
    for (let i = 0; i < base.length; i++) {
        const char = base.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 转换为32位整数
    }
    
    // 生成校验和
    const checksum = Math.abs(hash % 1000).toString().padStart(3, '0');
    const code = Math.abs(hash).toString(16).substr(0, 6).toUpperCase();
    
    return `${code}-${checksum}`;
}
```

### **统一接口调用规范**

#### **背包系统接口调用**
```javascript
// 正确：使用统一背包接口
const count = window.unifiedInventory.getItemCount(itemName);
window.unifiedInventory.addItem(itemName, quantity, category);
window.unifiedInventory.removeItem(itemName, quantity);

// 错误：直接访问底层数据
const count = this.gameData.inventory[itemName]; // ❌ 禁止
```

#### **核心系统访问规范**
```javascript
// 正确：通过核心系统访问数据
const core = window.core;
if (!core || !core.initialized) {
    console.error('核心系统未就绪');
    return;
}

const gameData = core.gameData;
const inventory = core.inventorySystem;

// 错误：直接访问全局变量
const gameData = window.gameData; // ❌ 禁止
```

### **事件处理规范**

#### **顾客服务事件处理**
```javascript
function serveCustomer(teaIndex) {
    try {
        // 1. 验证参数
        if (!this.validateServeParams(teaIndex)) return;
        
        // 2. 检查顾客状态
        if (!this.currentCustomer || !this.currentCustomer.active) {
            throw new Error('没有活跃顾客');
        }
        
        // 3. 获取茶饮
        const tea = this.madeTeas[teaIndex];
        if (!tea) {
            throw new Error('茶饮不存在');
        }
        
        // 4. 验证茶饮匹配
        if (!this.validateTeaMatch(tea)) return;
        
        // 5. 处理服务逻辑
        this.processCustomerService(tea, teaIndex);
        
        // 6. 更新游戏状态
        this.updateGameState();
        
    } catch (error) {
        console.error('❌ 服务顾客失败:', error);
        this.showErrorMessage('服务失败：' + error.message);
    }
}
```

### **时间管理规范**

#### **定时器管理标准**
```javascript
class TimerManager {
    constructor() {
        this.timers = new Map();
    }
    
    // 创建定时器
    createTimer(id, callback, interval) {
        if (this.timers.has(id)) {
            this.clearTimer(id);
        }
        
        const timer = setInterval(callback, interval);
        this.timers.set(id, timer);
        return timer;
    }
    
    // 清除定时器
    clearTimer(id) {
        const timer = this.timers.get(id);
        if (timer) {
            clearInterval(timer);
            this.timers.delete(id);
        }
    }
    
    // 清除所有定时器
    clearAllTimers() {
        this.timers.forEach(timer => clearInterval(timer));
        this.timers.clear();
    }
}
```

### **代码审查检查项（茶铺专用）**

#### **顾客系统检查**
- [ ] 顾客生成概率是否为100%（每30秒必定生成）
- [ ] 顾客类型分布是否正确（70%普通，30%VIP）
- [ ] 普通顾客显示是否为"普通顾客"
- [ ] VIP顾客显示是否为具体名字+⭐
- [ ] 普通顾客耐心时间是否正确（120秒）
- [ ] VIP顾客耐心时间是否正确（240秒）
- [ ] 收益机制是否正确（普通15金币，VIP30金币）
- [ ] 只有VIP顾客是否会触发配方解锁检查
- [ ] 所有顾客是否都计入总服务人数统计
- [ ] 进度条是否使用统一灰色（不变色）

#### **配方系统检查**
- [ ] 配方解锁逻辑是否包含概率机制
- [ ] 必定解锁机制是否正确实现
- [ ] 配方成分是否完整定义
- [ ] VIP解锁配方时是否显示动画文字提示
- [ ] 人数里程碑解锁配方时是否显示动画文字提示
- [ ] 故事展示是否正确触发

#### **小料系统检查**
- [ ] 小料选择是否支持0-2个
- [ ] 加工时间和产出比例是否正确
- [ ] 库存检查是否完整

#### **数据一致性检查**
- [ ] 是否使用统一背包接口
- [ ] 是否避免直接修改底层数据
- [ ] 事件处理是否有完整错误处理
- [ ] 定时器是否正确管理和清理

## 地图完成奖励系统实施计划

### **实施阶段规划**

#### **阶段1: 数据结构扩展**
**目标**: 为Named顾客系统和面茶配方准备数据基础

**步骤1.1: 扩展统一核心系统数据结构**
- 文件: `unified-core-system.js`
- 修改位置: `gameData.teaShop` 对象
- 新增字段:
  ```javascript
  namedCustomers: [],           // 存储已转移的NPC名单
  customerTypes: {              // 顾客类型概率配置
      normal: 0.7,              // 普通顾客70%
      vip: 0.2,                 // VIP顾客20%
      named: 0.1                // Named顾客10%
  }
  ```

**步骤1.2: 扩展物品配置系统**
- 文件: `unified-inventory-system.js`
- 修改位置: `itemConfig.teaIngredients`
- 新增物品:
  ```javascript
  '黄米': { price: 2, growTime: 45000, category: 'grain' },
  '黄米面': { price: 3, processingTime: 15000, source: '黄米', output: 3 },
  '白芝麻': { price: 4, buyOnly: true },
  '芝麻酱': { price: 6, buyOnly: true },
  '胡椒粉': { price: 5, buyOnly: true }
  ```

**步骤1.3: 扩展茶饮配方系统**
- 文件: `unified-core-system.js`
- 修改位置: `gameData.teaShop.teaRecipes`
- 新增配方:
  ```javascript
  '面茶': ['黄米面', '白芝麻', '芝麻酱', '胡椒粉']
  ```

**测试验证**:
- 运行 `checkInitStatus()` 验证数据结构正确加载
- 检查新增字段是否存在于游戏数据中
- 验证物品配置是否正确读取

#### **阶段2: NPC转移机制实现**
**目标**: 实现稻香村NPC转为茶铺Named顾客的核心机制

**步骤2.1: 修改车夫王富对话处理**
- 文件: `rice-village-manager.js`
- 修改函数: `handleWangFuDialog()`
- 在任务完成后添加NPC转移逻辑:
  ```javascript
  // 转移稻香村NPC到茶铺
  const riceVillageNPCs = [
      { name: '刘大海', title: '武学教头', specialDialog: '还记得在稻香村的武学训练吗？' },
      { name: '刘洋', title: '村长', specialDialog: '感谢你为稻香村所做的一切！' },
      { name: '王婆婆', title: '村民', specialDialog: '那些美好的稻香村时光...' },
      // ... 其他NPC
  ];

  this.core.gameData.teaShop.namedCustomers = riceVillageNPCs;
  this.addDebugLog('🏮 稻香村NPC已转移到茶铺，成为Named顾客');
  ```

**步骤2.2: 添加面茶配方解锁**
- 在同一函数中添加配方解锁:
  ```javascript
  // 解锁面茶配方
  const teaRecipes = this.core.gameData.teaShop.teaRecipes;
  const unlockedRecipes = this.core.gameData.teaShop.unlockedRecipes;

  if (!teaRecipes['面茶']) {
      teaRecipes['面茶'] = ['黄米面', '白芝麻', '芝麻酱', '胡椒粉'];
  }

  if (!unlockedRecipes.includes('面茶')) {
      unlockedRecipes.push('面茶');
      this.addDebugLog('🍜 村长奖励：解锁面茶配方！');
  }
  ```

**测试验证**:
- 完成村长最终任务，验证NPC是否正确转移
- 检查面茶配方是否正确解锁
- 验证数据是否正确保存

#### **阶段3: 顾客生成系统修改**
**目标**: 修改茶铺顾客生成逻辑，支持三种顾客类型

**步骤3.1: 修改顾客生成函数**
- 文件: `tea-shop-manager.js`
- 修改函数: `generateNewCustomer()`
- 实现三种顾客类型的概率分布:
  ```javascript
  // 随机决定顾客类型
  const rand = Math.random();
  let customerType, customerName, title = null, specialDialog = null;

  if (rand < 0.7) {
      // 普通顾客
      customerType = "normal";
      customerName = "普通顾客";
  } else if (rand < 0.9) {
      // VIP顾客
      customerType = "vip";
      const vipNames = ['池惊暮', '凌小路', '江飞飞', '江三', '江四', '池云旗', '江潮', '江敕封', '花花', '姬别情', '池九信', '狸怒'];
      customerName = vipNames[Math.floor(Math.random() * vipNames.length)];
  } else {
      // Named顾客
      customerType = "named";
      const namedCustomers = this.core.gameData.teaShop.namedCustomers;
      if (namedCustomers.length > 0) {
          const selectedNPC = namedCustomers[Math.floor(Math.random() * namedCustomers.length)];
          customerName = selectedNPC.name;
          title = selectedNPC.title;
          specialDialog = selectedNPC.specialDialog;
      } else {
          // 回退到VIP
          customerType = "vip";
          const vipNames = ['池惊暮', '凌小路', '江飞飞', '江三', '江四', '池云旗', '江潮', '江敕封', '花花', '姬别情', '池九信', '狸怒'];
          customerName = vipNames[Math.floor(Math.random() * vipNames.length)];
      }
  }
  ```

**步骤3.2: 修改顾客显示逻辑**
- 修改顾客显示函数，支持Named顾客的特殊显示:
  ```javascript
  // Named顾客显示格式：真实姓名 + 头衔，无⭐标记
  const displayName = customer.customerType === 'named'
      ? `${customer.name}（${customer.title}）`
      : customer.isVIP
          ? `${customer.name} ⭐`
          : customer.name;
  ```

**测试验证**:
- 生成多个顾客，验证三种类型的概率分布
- 检查Named顾客是否正确显示头衔
- 验证Named顾客不触发配方解锁

#### **阶段4: 面茶制作系统实现**
**目标**: 实现完整的黄米种植→加工→制茶流程

**步骤4.1: 添加黄米种植支持**
- 文件: `tea-shop-manager.js`
- 修改种植模态框，添加黄米种子选项
- 验证黄米种植和收获功能

**步骤4.2: 添加黄米面加工支持**
- 修改加工模态框，添加黄米面加工选项
- 实现黄米→黄米面的加工流程

**步骤4.3: 添加商店购买支持**
- 文件: `unified-inventory-system.js`
- 确保白芝麻、芝麻酱、胡椒粉可以在商店购买

**步骤4.4: 验证面茶制作**
- 测试完整的面茶制作流程
- 验证所有原料的获取和消耗

**测试验证**:
- 种植黄米种子，验证生长和收获
- 加工黄米获得黄米面
- 购买商店原料
- 制作面茶并验证成功

### **测试计划**

#### **单元测试**
1. **数据结构测试**
   ```javascript
   // 测试新增数据字段
   function testDataStructure() {
       const core = window.core;
       console.assert(Array.isArray(core.gameData.teaShop.namedCustomers), 'namedCustomers应该是数组');
       console.assert(typeof core.gameData.teaShop.customerTypes === 'object', 'customerTypes应该是对象');
       console.log('✅ 数据结构测试通过');
   }
   ```

2. **NPC转移测试**
   ```javascript
   // 测试NPC转移功能
   function testNPCTransfer() {
       // 模拟完成村长最终任务
       // 验证namedCustomers数组是否正确填充
       // 验证面茶配方是否解锁
   }
   ```

3. **顾客生成测试**
   ```javascript
   // 测试顾客类型概率分布
   function testCustomerGeneration() {
       const results = { normal: 0, vip: 0, named: 0 };
       for (let i = 0; i < 1000; i++) {
           // 生成顾客并统计类型
       }
       // 验证概率分布是否接近70%/20%/10%
   }
   ```

#### **集成测试**
1. **完整流程测试**
   - 从稻香村任务开始
   - 完成村长最终任务
   - 验证NPC转移和配方解锁
   - 测试Named顾客生成
   - 测试面茶制作流程

2. **兼容性测试**
   - 验证与现有VIP顾客系统的兼容性
   - 测试配方解锁机制不受影响
   - 验证数据保存和加载正常

#### **用户验收测试**
1. **功能完整性**
   - [ ] 完成村长最终任务后，Named顾客正确出现
   - [ ] Named顾客显示真实姓名和头衔
   - [ ] Named顾客有特殊对话内容
   - [ ] 面茶配方正确解锁
   - [ ] 黄米种植→加工→制茶流程完整

2. **用户体验**
   - [ ] 顾客类型分布感觉自然
   - [ ] Named顾客的特殊对话有意义
   - [ ] 面茶制作流程直观易懂
   - [ ] 系统性能无明显影响

### **风险评估与应对**

#### **技术风险**
1. **数据兼容性风险**
   - 风险：新数据结构可能与现有存档不兼容
   - 应对：添加数据迁移逻辑，确保向后兼容

2. **性能风险**
   - 风险：Named顾客增加系统复杂度
   - 应对：优化顾客生成算法，避免性能瓶颈

#### **功能风险**
1. **概率分布风险**
   - 风险：顾客类型分布可能不符合预期
   - 应对：提供调试工具监控概率分布

2. **配方平衡风险**
   - 风险：面茶配方可能过于复杂或简单
   - 应对：根据测试反馈调整原料配置

### **部署计划**

#### **分阶段部署**
1. **第一阶段**：数据结构扩展（低风险）
2. **第二阶段**：NPC转移机制（中风险）
3. **第三阶段**：顾客生成修改（中风险）
4. **第四阶段**：面茶制作系统（高风险）

#### **回滚计划**
- 每个阶段完成后创建备份点
- 提供快速回滚到上一个稳定版本的机制
- 保留详细的变更日志用于问题排查
