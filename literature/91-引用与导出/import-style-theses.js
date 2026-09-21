// 在本机Zotero“工具 → 开发者 → Run JavaScript”中作为异步函数执行。
// 仅处理本批5篇硕士论文：先查重再创建条目/集合；不删除数据，不伪造全文附件。
const records = [
  { id: "LIT-0020", author: "吴浩宇", year: "2020", title: "三偏心蝶阀智能设计研究与分析", university: "西华大学", source: "https://pdf.hanspub.org/met20210300000_23047387.pdf", sourceNote: "正式期刊参考文献第4条明确标注硕士学位论文；学位论文原库记录和封面待复核。" },
  { id: "LIT-0021", author: "陈云飞", year: "2022", title: "基于机器学习的离心泵叶轮智能优化设计平台", university: "江苏大学", source: "https://xueshu.baidu.com/usercenter/paper/show?paperid=1g1g0tp0772e0t30qm0q0x80d5434221&site=xueshu_se", sourceNote: "百度学术学位论文索引标注硕士；学校与年份经https://xueb.git.edu.cn/oa/DArticle.aspx?id=202509031&type=view参考文献第16条交叉核对；原始万方条目和封面待复核。" },
  { id: "LIT-0022", author: "禹化宝", year: "2014", title: "基于案例汽车焊装夹具智能设计系统的研究与开发", university: "烟台大学", source: "https://www.hanspub.org/journal/PaperInformation?paperID=83349", sourceNote: "正式期刊参考文献第1条明确标注硕士学位论文；学位论文原库记录和封面待复核。" },
  { id: "LIT-0023", author: "刘晓健", year: "2016", title: "系列化随车起重机设计系统研究与开发", university: "华中科技大学", source: "https://pdf.hanspub.org/met20210300000_23047387.pdf", sourceNote: "正式期刊参考文献第5条明确标注硕士学位论文；学位论文原库记录和封面待复核。" },
  { id: "LIT-0024", author: "卢文轩", year: "2017", title: "基于规则推理和多层实例库的组合夹具设计系统开发", university: "南京航空航天大学", source: "https://www.hanspub.org/journal/PaperInformation?paperID=83349", sourceNote: "正式期刊参考文献第2条明确标注硕士学位论文；学位论文原库记录和封面待复核。" }
];
const libraryID = Zotero.Libraries.userLibraryID;
async function ensureCollection(name, parentID) {
  const matches = Zotero.Collections.getByLibrary(libraryID, true).filter(c => !c.deleted && c.name === name && (c.parentID || null) === (parentID || null));
  if (matches.length > 1) throw new Error(`集合重名，停止自动选择：${name}`);
  if (matches.length) return matches[0];
  const c = new Zotero.Collection();
  c.libraryID = libraryID;
  c.name = name;
  if (parentID) c.parentID = parentID;
  await c.saveTx();
  return c;
}
const root = await ensureCollection("大论文-双轴桨叶式混合机智能设计", null);
const intro = await ensureCollection("01 绪论", root.id);
const style = await ensureCollection("90 学位论文写作参考", intro.id);
const result = [];
for (const r of records) {
  const s = new Zotero.Search();
  s.libraryID = libraryID;
  s.addCondition("title", "is", r.title);
  const candidates = (await Zotero.Items.getAsync(await s.search())).filter(i => !i.deleted && i.isRegularItem());
  if (candidates.length > 1) throw new Error(`目标论文有多个同题条目，停止自动选择：${r.title}`);
  let item = candidates[0];
  const created = !item;
  if (created) {
    item = new Zotero.Item("thesis");
    item.libraryID = libraryID;
    item.setField("title", r.title);
    item.setCreators([{ lastName: r.author, fieldMode: 1, creatorType: "author" }]);
    item.setField("date", r.year);
    item.setField("university", r.university);
    item.setField("thesisType", "硕士学位论文");
    item.setField("language", "zh-CN");
    // URL保留为空：以下Source-Record是核验来源，不能冒充学位论文自身网址。
    item.setField("extra", [
      `LIT-ID: ${r.id}`,
      "Thesis-Primary: 第1章写作形式参考",
      `Thesis-Card: literature/01-绪论/90-学位论文写作参考/${r.id}_${r.author}${r.year}.md`,
      "Metadata-Status: 书目待原库及封面复核",
      "Fulltext-Status: 未下载，等待学校授权会话",
      `Source-Record: ${r.source}`,
      `Verification-Note: ${r.sourceNote}`
    ].join("\n"));
    item.addTag("状态/待读");
    item.addTag("来源/学位论文");
    item.addTag("对象/仅结构参考");
  }
  else if (item.getField("extra").includes(`LIT-ID: ${r.id}`)) {
    // 已建条目只更新本批管理的卡片路径，保留用户填写的其他元数据与阅读状态。
    const cardLine = `Thesis-Card: literature/01-绪论/90-学位论文写作参考/${r.id}_${r.author}${r.year}.md`;
    item.setField("extra", item.getField("extra").replace(/^Thesis-Card:.*$/m, cardLine));
  }
  item.addToCollection(style.id);
  await item.saveTx();
  result.push({ litID: r.id, key: item.key, title: item.getField("title"), created, attachmentCount: item.getAttachments().length });
}
return JSON.stringify({ success: true, collection: { id: style.id, key: style.key, name: style.name, parentID: style.parentID }, items: result }, null, 2);
