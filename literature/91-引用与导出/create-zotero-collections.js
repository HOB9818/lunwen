// 在 Zotero 中打开“工具 → 开发者 → 运行 JavaScript”，粘贴全文并运行。
// 脚本只创建缺失的集合，不删除、不移动、不重命名现有集合，可重复运行。

const libraryID = Zotero.Libraries.userLibraryID;

const collectionTree = [
  {
    name: "大论文-双轴桨叶式混合机智能设计",
    children: [
      { name: "00 待整理" },
      {
        name: "01 绪论",
        children: [
          { name: "01 研究背景与意义" },
          {
            name: "02 国内外研究现状",
            children: [
              { name: "01 双轴桨叶式混合机研究现状" },
              { name: "02 机械装备智能设计研究现状" }
            ]
          },
          {
            name: "03 主要研究内容与章节安排",
            children: [
              { name: "01 主要研究内容" },
              { name: "02 论文章节安排" }
            ]
          },
          { name: "04 本章小结" }
        ]
      },
      {
        name: "02 混合过程与性能分析",
        children: [
          { name: "01 结构与工作过程" },
          {
            name: "02 颗粒混合过程及关键参数影响",
            children: [
              { name: "01 颗粒运动与混合机理" },
              { name: "02 结构参数与运行参数的影响" }
            ]
          },
          {
            name: "03 性能指标及模型构建需求",
            children: [
              { name: "01 混合均匀度评价指标" },
              { name: "02 功率与产量评价指标" },
              { name: "03 三项性能模型的构建思路" }
            ]
          },
          { name: "04 本章小结" }
        ]
      },
      {
        name: "03 性能模型构建与验证",
        children: [
          {
            name: "01 性能模型构建基础",
            children: [
              { name: "01 设计变量与性能指标" },
              { name: "02 参数化几何模型" },
              { name: "03 几何参数提取与模型传递" },
              { name: "04 三项性能模型总体思路" }
            ]
          },
          {
            name: "02 混合均匀度代理模型",
            children: [
              { name: "01 离散元仿真" },
              { name: "02 拉丁超立方试验设计" },
              { name: "03 BP-RBF-GRNN模型" },
              { name: "04 代理模型对比与选择" },
              { name: "05 独立验证与响应分析" }
            ]
          },
          {
            name: "03 功率计算模型",
            children: [
              { name: "01 几何参数与功率关系" },
              { name: "02 模型推导与参数确定" },
              { name: "03 模型验证" }
            ]
          },
          {
            name: "04 产量计算模型",
            children: [
              { name: "01 有效容积与产量关系" },
              { name: "02 模型推导与参数确定" },
              { name: "03 模型验证" }
            ]
          },
          { name: "05 本章小结" }
        ]
      },
      {
        name: "04 参数寻优与综合评价",
        children: [
          {
            name: "01 参数寻优问题与总体策略",
            children: [
              { name: "01 设计变量及取值范围" },
              { name: "02 优化目标与约束条件" },
              { name: "03 参数寻优总体流程" }
            ]
          },
          {
            name: "02 多起点局部寻优与综合决策",
            children: [
              { name: "01 候选参数组合生成与筛选" },
              { name: "02 多起点选择与局部搜索" },
              { name: "03 综合评价体系" },
              { name: "04 TOPSIS综合排序" }
            ]
          },
          {
            name: "03 寻优结果与分析",
            children: [
              { name: "01 多起点局部寻优结果" },
              { name: "02 近优方案综合评价结果" },
              { name: "03 最终推荐参数及性能分析" }
            ]
          },
          { name: "04 本章小结" }
        ]
      },
      {
        name: "05 智能设计系统开发与验证",
        children: [
          {
            name: "01 系统总体构建",
            children: [
              { name: "01 系统功能需求" },
              { name: "02 总体架构与运行流程" }
            ]
          },
          {
            name: "02 智能设计知识库",
            children: [
              { name: "01 知识组成与分类" },
              { name: "02 参数及约束规则表达" },
              { name: "03 知识库存储与调用" }
            ]
          },
          {
            name: "03 系统功能开发",
            children: [
              { name: "01 开发环境与功能模块" },
              { name: "02 需求输入与知识匹配" },
              { name: "03 性能计算与参数寻优" },
              { name: "04 综合评价与结果展示" },
              { name: "05 参数化模型生成与预览" }
            ]
          },
          {
            name: "04 系统验证",
            children: [
              { name: "01 验证案例与设计要求" },
              { name: "02 系统运行过程" },
              { name: "03 设计结果与参数化模型验证" }
            ]
          },
          { name: "05 本章小结" }
        ]
      },
      {
        name: "06 总结与展望",
        children: [
          { name: "01 主要研究结论" },
          { name: "02 研究不足" },
          { name: "03 后续工作展望" }
        ]
      },
      { name: "90 跨章节方法与标准" }
    ]
  }
];

const created = [];
const existing = [];
const warnings = [];

function collectionsAt(parentID) {
  const normalizedParentID = parentID || null;
  return Zotero.Collections.getByLibrary(libraryID, true).filter(collection => {
    return !collection.deleted && (collection.parentID || null) === normalizedParentID;
  });
}

async function ensureCollection(node, parentID, parentPath) {
  const matches = collectionsAt(parentID).filter(collection => collection.name === node.name);
  const currentPath = parentPath ? `${parentPath} / ${node.name}` : node.name;
  let collectionID;

  if (matches.length) {
    collectionID = matches[0].id;
    existing.push(currentPath);
    if (matches.length > 1) {
      warnings.push(`同一层级发现 ${matches.length} 个同名集合：${currentPath}`);
    }
  }
  else {
    const collection = new Zotero.Collection();
    collection.libraryID = libraryID;
    collection.name = node.name;
    if (parentID) {
      collection.parentID = parentID;
    }
    collectionID = await collection.saveTx();
    created.push(currentPath);
  }

  for (const child of node.children || []) {
    await ensureCollection(child, collectionID, currentPath);
  }
}

for (const root of collectionTree) {
  await ensureCollection(root, null, "");
}

return JSON.stringify({
  success: true,
  createdCount: created.length,
  existingCount: existing.length,
  warningCount: warnings.length,
  created,
  warnings
}, null, 2);
