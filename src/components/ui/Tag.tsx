type TagVariant = 'default' | 'category' | 'culture' | 'mood' | 'active'

type Props = {
  label: string
  variant?: TagVariant
  onClick?: () => void
  className?: string
}

export default function Tag({ label, variant = 'default', onClick, className = '' }: Props) {
  const cls = [
    'tag',
    variant === 'category' ? 'tag-category' : '',
    variant === 'culture'  ? 'tag-culture'  : '',
    variant === 'mood'     ? 'tag-mood'     : '',
    variant === 'active'   ? 'active'       : '',
    className,
  ].filter(Boolean).join(' ')

  if (onClick) {
    return (
      <button className={cls} onClick={onClick} type="button">
        {label}
      </button>
    )
  }
  return <span className={cls}>{label}</span>
}
