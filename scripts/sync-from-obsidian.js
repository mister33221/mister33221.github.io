#!/usr/bin/env node
/**
 * 從 Obsidian 500.Blog/ 同步 published: true 的文章到 content/posts/
 *
 * 使用方式：npm run sync
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const SOURCE = 'C:/Users/miste/Desktop/mine/Exobrain/500.Blog';
const TARGET = path.join(__dirname, '../content/posts');

// 確認來源資料夾存在
if (!fs.existsSync(SOURCE)) {
  console.error(`❌ 找不到 Obsidian 資料夾：${SOURCE}`);
  process.exit(1);
}

const files = fs.readdirSync(SOURCE).filter(f => f.endsWith('.md'));

if (files.length === 0) {
  console.log('500.Blog/ 裡沒有 .md 檔案，結束。');
  process.exit(0);
}

let synced = 0;
let skipped = 0;
let errors = 0;

for (const file of files) {
  try {
    const sourcePath = path.join(SOURCE, file);
    const content = fs.readFileSync(sourcePath, 'utf8');
    const { data } = matter(content);

    if (data.published !== true) {
      skipped++;
      continue;
    }

    const targetPath = path.join(TARGET, file);
    const isNew = !fs.existsSync(targetPath);

    fs.copyFileSync(sourcePath, targetPath);
    console.log(`${isNew ? '✅ 新增' : '🔄 更新'}: ${file}`);
    synced++;
  } catch (err) {
    console.error(`❌ 錯誤 ${file}: ${err.message}`);
    errors++;
  }
}

console.log('');
console.log(`同步完成：${synced} 篇已同步，${skipped} 篇草稿略過，${errors} 篇錯誤`);
if (synced > 0) {
  console.log('下一步：git add content/posts/ && git commit && git push');
}
