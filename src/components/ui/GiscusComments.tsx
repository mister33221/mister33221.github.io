'use client'

import Giscus from '@giscus/react'
import giscusConfig from '@/lib/giscus'
import styles from './GiscusComments.module.css'

type Props = {
  /** 傳入文章的 slug，讓每篇文章對應到獨立的 Discussion */
  term: string
}

export default function GiscusComments({ term }: Props) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.divider}>
        <span className={styles.dividerLabel}>留言</span>
      </div>
      <Giscus
        repo={giscusConfig.repo}
        repoId={giscusConfig.repoId}
        category={giscusConfig.category}
        categoryId={giscusConfig.categoryId}
        mapping="specific"   /* 用 term 精確對應，不依賴 URL */
        term={term}
        strict="1"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme="dark"
        lang="zh-TW"
        loading="lazy"
      />
    </div>
  )
}
