'use client'

export default function PrintButton() {
  const handlePrint = () => {
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print()
    } else {
      alert('請使用瀏覽器的「列印」功能（Ctrl+P / ⌘P），然後選擇「儲存為 PDF」。')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
      <button type="button" onClick={handlePrint} className="btn btn-outline">
        列印 / 匯出 PDF
      </button>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        點擊後於列印對話框選擇「另存為 PDF」
      </span>
    </div>
  )
}
