// ─────────────────────────────────────────────────────────────────────────────
// Giscus 設定
//
// 步驟：
//  1. 到 https://giscus.app 輸入你的 repo，取得以下四個值
//  2. 填入下方（或改用 .env.local 管理）
// ─────────────────────────────────────────────────────────────────────────────

const giscusConfig = {
  // GitHub repo：格式 "username/repo-name"
  repo: (process.env.NEXT_PUBLIC_GISCUS_REPO ?? 'yourname/yourrepo') as `${string}/${string}`,

  // Repo ID：從 giscus.app 取得（data-repo-id）
  repoId: process.env.NEXT_PUBLIC_GISCUS_REPO_ID ?? 'YOUR_REPO_ID',

  // Discussion 分類名稱（建議用 "Announcements" 或 "General"）
  category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY ?? 'General',

  // Category ID：從 giscus.app 取得（data-category-id）
  categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID ?? 'YOUR_CATEGORY_ID',
} as const

export default giscusConfig
