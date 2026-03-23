type Props = { rating: number; max?: number }

export default function RatingStars({ rating, max = 5 }: Props) {
  const stars: string[] = []
  for (let i = 1; i <= max; i++) {
    if (rating >= i) stars.push('★')
    else if (rating >= i - 0.5) stars.push('½')
    else stars.push('☆')
  }
  return (
    <span className="stars" aria-label={`評分 ${rating} / ${max}`} title={`${rating} / ${max}`}>
      {stars.map((s, i) => (
        <span key={i} style={s === '☆' ? { opacity: 0.3 } : undefined}>{s === '½' ? '★' : s}</span>
      ))}
      <span style={{ marginLeft: '0.35em', fontSize: '0.85em', opacity: 0.7 }}>{rating}</span>
    </span>
  )
}
