// ─────────────────────────────────────────────────────────────────────────────
// Giscus 設定
//
// 步驟：
//  1. 到 https://giscus.app 輸入你的 repo，取得以下四個值
//  2. 填入下方（或改用 .env.local 管理）
// ─────────────────────────────────────────────────────────────────────────────

const giscusConfig = {
  // GitHub repo：格式 "username/repo-name"
  repo: (process.env.NEXT_PUBLIC_GISCUS_REPO ?? 'mister33221/mister33221.github.io') as `${string}/${string}`,

  // Repo ID：從 giscus.app 取得（data-repo-id）
  repoId: process.env.NEXT_PUBLIC_GISCUS_REPO_ID ?? 'R_kgDOH2Fb0Q',

  // Discussion 分類名稱（建議用 "Announcements" 或 "General"）
  category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY ?? 'General',

  // Category ID：從 giscus.app 取得（data-category-id）
  categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID ?? 'DIC_kwDOH2Fb0c4C5Fs4',
} as const

export default giscusConfig
