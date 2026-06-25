'use client'

import { useMemo } from 'react'

const prng = (seed: number) => ((seed * 9301 + 49297) % 233280) / 233280

export default function PetalEffect() {
  const petals = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => {
      const r = (n: number) => prng(i * 31 + n)
      return {
        id: i,
        left: 1 + r(1) * 97,
        delay: r(2) * 20,
        duration: 14 + r(3) * 14,
        width: 6 + r(4) * 8,
        height: 10 + r(5) * 11,
        drift: -110 + r(6) * 220,
        rotate: r(7) * 360,
        // Soft ivory/blush to not clash with B&W
        hue: 340 + r(8) * 20,
        opacity: 0.22 + r(9) * 0.25,
      }
    }), []
  )

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 8 }}
    >
      {petals.map((p) => (
        <span
          key={p.id}
          className="petal absolute"
          style={{
            left: `${p.left.toFixed(1)}%`,
            top: '-28px',
            width: `${p.width.toFixed(0)}px`,
            height: `${p.height.toFixed(0)}px`,
            animationDelay: `${p.delay.toFixed(2)}s`,
            animationDuration: `${p.duration.toFixed(1)}s`,
            '--petal-drift': `${p.drift.toFixed(0)}px`,
            transform: `rotate(${p.rotate.toFixed(0)}deg)`,
            opacity: p.opacity,
            background: `radial-gradient(ellipse at 38% 32%,
              hsl(${p.hue},60%,88%),
              hsl(${p.hue + 8},50%,78%))`,
            borderRadius: '50% 5% 50% 5%',
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
