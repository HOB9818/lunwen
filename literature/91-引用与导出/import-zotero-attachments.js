// Zotero：工具 → 开发者 → Run JavaScript；勾选“作为异步函数执行”。
// 只给清单中的已有条目导入子附件，不创建文献条目、不移动原文、不触发云端同步。
// 后续批次先修改清单，核验源PDF，再运行；重复执行会复用同名已有附件。
const manifestPath = "C:\\Users\\Administrator\\Documents\\大论文 2\\literature\\91-引用与导出\\zotero-attachments-batch.json";
const batch = JSON.parse(await Zotero.File.getContentsAsync(manifestPath));
batch.audit_path = batch.audit_path.replaceAll('/', '\\');
for (const spec of batch.items) spec.file = spec.file.replaceAll('/', '\\');
const libraryID = Zotero.Libraries.userLibraryID;
const prepared = [];
for (const spec of batch.items) {
    const parent = await Zotero.Items.getByLibraryAndKeyAsync(libraryID, spec.parent_key);
    if (!parent || !parent.isRegularItem() || parent.deleted) throw new Error("无有效父条目：" + spec.id);
    if (parent.getField("title") !== spec.title) throw new Error("父条目题名不符：" + spec.id);
    if (!(await IOUtils.exists(spec.file))) throw new Error("源文件不存在：" + spec.id);
    const children = [];
    for (const id of parent.getAttachments()) children.push(await Zotero.Items.getAsync(id));
    const filename = Zotero.File.pathToFile(spec.file).leafName;
    const matching = children.filter(a => !a.deleted && a.attachmentFilename === filename);
    if (matching.length > 1) throw new Error("同名附件重复，需人工处理：" + spec.id);
    if (!matching.length && children.some(a => !a.deleted && a.attachmentContentType === "application/pdf")) {
        throw new Error("已有其他PDF，需核对后再关联：" + spec.id);
    }
    prepared.push({spec, parent, existing: matching[0]});
}
const results = [];
for (const entry of prepared) {
    const {spec, parent} = entry;
    const attachment = entry.existing || await Zotero.Attachments.importFromFile({
        file: spec.file, parentItemID: parent.id, title: "原文PDF", contentType: "application/pdf"
    });
    const path = await attachment.getFilePathAsync();
    if (!path || !(await IOUtils.exists(path)) || attachment.parentID !== parent.id) {
        throw new Error("附件回读失败：" + spec.id);
    }
    results.push({
        id: spec.id, parent_key: parent.key, attachment_key: attachment.key,
        title: parent.getField("title"), source_path: spec.file, zotero_path: path,
        content_type: attachment.attachmentContentType, link_mode: attachment.attachmentLinkMode,
        attachment_count: parent.getAttachments().length, file_exists: true,
        action: entry.existing ? "existing_reused" : "imported", expected_sha256: spec.sha256
    });
}
const audit = {batch_id: batch.batch_id, checked_at: new Date().toISOString(), scope: "Zotero本地子附件关联；云端同步未操作", results};
await Zotero.File.putContentsAsync(batch.audit_path, JSON.stringify(audit, null, 2));
return JSON.stringify(audit, null, 2);
