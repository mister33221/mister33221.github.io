'use client'

export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="btn btn-outline">
      列印 / 匯出 PDF
    </button>
  )
}
