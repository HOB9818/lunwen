# 引用与导出

本目录保存从 Zotero 导出的引用元数据，另保存明确标注核验状态的待导入批次。

- `references.bib`：Zotero 的 BibTeX 导出目标。当前为人工覆盖导出，不是自动同步文件。
- `import-queue.txt`：等待批量获取或转换元数据的 DOI、PMID、arXiv ID 队列。
- `create-zotero-collections.js`：在 Zotero“运行 JavaScript”窗口执行，一次建立与论文大纲一致的集合树；可重复运行。
- `chapter01-import.ris`、`chapter01-import.bib`：2026-09-15第一章的19篇待导入条目；元数据来源和未完成核验项见JSON及卡片，LIT-0015—LIT-0016待原刊复核；未写入Zotero，导入前按DOI或题名与作者去重。
- `chapter01-sources.json`：上述批次的元数据、正文位置、读取范围和边界记录；不是Zotero导出文件。
- 需要与其他文献管理软件交换时，可从 Zotero 导出 `references.ris`，导出后核对条目数量与 DOI。

当前本机未检测到 Better BibTeX。若以后安装并配置自动导出，应在本文件记录导出集合、格式、目标路径和测试日期。

引用元数据进入正文前，至少核对作者、题名、年份、期刊/学校、卷期页和 DOI。引用管理软件中的条目不天然等于正确条目。
