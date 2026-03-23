'use client'

import { useEffect, useRef } from 'react'

type ParticleConfig = {
  count: number
  maxRadius: number
  maxOpacity: number
  speedMultiplier: number
}

const COLORS = ['#c4622d', '#b5a07a', '#e8956d', '#8f4a2a', '#d4794a']

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
  life: number
  maxLife: number
  color: string
  phase: number
}

function makeParticle(w: number, h: number, cfg: ParticleConfig): Particle {
  const maxLife = 120 + Math.random() * 180
  return {
    x: Math.random() * w,
    y: h + Math.random() * 20,
    vx: (Math.random() - 0.5) * 0.4,
    vy: -(0.3 + Math.random() * 0.9 * cfg.speedMultiplier),
    radius: 0.6 + Math.random() * (cfg.maxRadius - 0.6),
    opacity: 0,
    life: 0,
    maxLife,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    phase: Math.random() * Math.PI * 2,
  }
}

function getOpacity(life: number, maxLife: number, maxOpacity: number): number {
  const t = life / maxLife
  if (t < 0.15) return (t / 0.15) * maxOpacity
  if (t < 0.6)  return maxOpacity
  return ((1 - t) / 0.4) * maxOpacity
}

export type EmberVariant = 'hero' | 'footer' | 'logo' | 'article-nav'

const CONFIGS: Record<EmberVariant, ParticleConfig> = {
  hero:        { count: 20, maxRadius: 2,   maxOpacity: 0.7,  speedMultiplier: 1 },
  footer:      { count: 6,  maxRadius: 1.2, maxOpacity: 0.4,  speedMultiplier: 0.6 },
  logo:        { count: 2,  maxRadius: 1,   maxOpacity: 0.6,  speedMultiplier: 0.8 },
  'article-nav': { count: 8,  maxRadius: 1.6, maxOpacity: 0.35, speedMultiplier: 0.7 },
}

type Props = {
  variant: EmberVariant
  className?: string
  style?: React.CSSProperties
}

export default function EmberParticles({ variant, className, style }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef<number>(0)
  const pausedRef = useRef(false)

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cfg = CONFIGS[variant]

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      canvas.width  = parent.offsetWidth
      canvas.height = parent.offsetHeight
    }

    resize()
    window.addEventListener('resize', resize)

    // Init particles
    particlesRef.current = Array.from({ length: cfg.count }, () =>
      makeParticle(canvas.width, canvas.height, cfg)
    )
    // Stagger initial positions
    particlesRef.current.forEach((p, i) => {
      p.y = canvas.height - (i / cfg.count) * canvas.height
      p.life = Math.random() * p.maxLife
    })

    const frame = () => {
      if (pausedRef.current) {
        rafRef.current = requestAnimationFrame(frame)
        return
      }
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      particlesRef.current.forEach((p, i) => {
        p.life++
        if (p.life > p.maxLife || p.y < -10) {
          particlesRef.current[i] = makeParticle(w, h, cfg)
          return
        }

        // Drift x using sin wave
        p.x += p.vx + Math.sin(p.life * 0.04 + p.phase) * 0.3
        p.y += p.vy

        p.opacity = getOpacity(p.life, p.maxLife, cfg.maxOpacity)

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.opacity
        ctx.fill()
        ctx.globalAlpha = 1
      })

      rafRef.current = requestAnimationFrame(frame)
    }

    rafRef.current = requestAnimationFrame(frame)

    const handleVisibility = () => {
      pausedRef.current = document.hidden
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [variant])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', ...style }}
      aria-hidden="true"
    />
  )
}
