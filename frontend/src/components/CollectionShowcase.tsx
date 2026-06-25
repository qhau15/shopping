'use client'

import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import Link from 'next/link'
import { Collection } from '@/lib/types'

export default function CollectionShowcase({ collections }: { collections: Collection[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 60 },
    [Autoplay({ delay: 5500, stopOnInteraction: false })]
  )

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo  = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaApi.on('select', onSelect)
    return () => { emblaApi.off('select', onSelect) }
  }, [emblaApi])

  /* ── empty state ─────────────────────────────────────── */
  if (!collections.length) {
    return (
      <div className="h-[calc(100vh-80px)] min-h-[520px] bg-warm-black flex flex-col items-center justify-center px-6 text-center">
        <p className="label-luxury text-white/30 mb-6 tracking-[0.5em]">Est. 2024</p>
        <h1 className="font-serif text-white text-5xl md:text-8xl font-light tracking-wide mb-8 leading-none">
          𝓣𝓻𝓪𝓷 𝓜𝓲𝓷𝓱 𝓣𝓻𝓪𝓷𝓰
        </h1>
        <p className="label-luxury text-white/30 mb-14">Elegant · Refined · Timeless</p>
        <Link href="/products" className="btn-primary">Shop Collection</Link>
      </div>
    )
  }

  /* ── carousel ────────────────────────────────────────── */
  return (
    <>
      <div className="relative h-[calc(100vh-80px)] min-h-[520px] overflow-hidden group/carousel">
        {/* Embla viewport */}
        <div className="overflow-hidden h-full" ref={emblaRef}>
          <div className="flex h-full touch-pan-y">
            {collections.map((col, i) => (
              <div key={col.id} className="flex-none w-full h-full relative overflow-hidden">
                {/* Background image with Ken Burns */}
                {col.cover_url ? (
                  <img
                    src={col.cover_url}
                    alt={col.name}
                    className="absolute inset-0 w-full h-full object-cover will-change-transform"
                    style={{
                      animation: `kenBurns 16s ease-in-out infinite alternate`,
                      animationDelay: `${i * -4}s`,
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-warm-gray-900" />
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/15" />

                {/* Text content */}
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 md:pb-28 px-8 text-center pointer-events-none">
                  <p className="label-luxury text-white/45 mb-4 tracking-[0.45em]">Collection</p>
                  <h2
                    className="font-serif text-white text-4xl md:text-6xl lg:text-7xl font-light tracking-wide leading-none mb-5"
                    style={{ textShadow: '0 2px 30px rgba(0,0,0,0.35)' }}
                  >
                    {col.name}
                  </h2>
                  {col.description && (
                    <p className="text-white/55 text-sm font-sans font-light max-w-md leading-relaxed mb-8">
                      {col.description}
                    </p>
                  )}
                  <Link
                    href={`/products?collection=${col.id}`}
                    className="label-luxury text-white/80 border-b border-white/30 pb-1 hover:text-white hover:border-white transition-colors duration-300 pointer-events-auto"
                  >
                    Explore →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Arrows — appear on hover */}
        {collections.length > 1 && (
          <>
            <button
              onClick={scrollPrev}
              aria-label="Previous"
              className="absolute left-5 top-1/2 -translate-y-1/2 bg-black/25 hover:bg-black/55 text-white p-3.5 transition-all duration-200 opacity-0 group-hover/carousel:opacity-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={scrollNext}
              aria-label="Next"
              className="absolute right-5 top-1/2 -translate-y-1/2 bg-black/25 hover:bg-black/55 text-white p-3.5 transition-all duration-200 opacity-0 group-hover/carousel:opacity-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Dot indicators */}
        {collections.length > 1 && (
          <div className="absolute bottom-9 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {collections.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                className={`transition-all duration-400 ${
                  i === selectedIndex
                    ? 'bg-white w-7 h-[3px]'
                    : 'bg-white/35 hover:bg-white/60 w-2 h-[3px]'
                }`}
              />
            ))}
          </div>
        )}

        {/* Shop All — bottom right */}
        <div className="absolute bottom-7 right-7">
          <Link href="/products" className="btn-primary bg-white/90 hover:bg-white text-warm-black text-[10px] px-7 py-3.5">
            Shop All
          </Link>
        </div>
      </div>
    </>
  )
}
