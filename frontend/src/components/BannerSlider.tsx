'use client'

import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { Banner } from '@/lib/types'

export default function BannerSlider({ banners }: { banners: Banner[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, dragFree: false },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
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

  if (!banners.length) {
    return (
      <div className="w-full h-64 md:h-[560px] bg-warm-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white font-serif text-3xl md:text-6xl font-light tracking-wide mb-3">
            𝓣𝓻𝓪𝓷 𝓜𝓲𝓷𝓱 𝓣𝓻𝓪𝓷𝓰
          </p>
          <p className="text-warm-gray-600 label-luxury">
            Elegant · Refined · Timeless
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden group">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {banners.map((banner, i) => (
            <div key={banner.id} className="flex-none w-full relative">
              <img
                src={banner.url}
                alt={banner.title || 'Banner'}
                className="w-full h-64 md:h-[600px] object-cover"
                loading={i === 0 ? 'eager' : 'lazy'}
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              {/* Shimmer */}
              <div className="absolute inset-0 banner-shimmer pointer-events-none" />

              {/* Text */}
              {(banner.title || banner.subtitle) && (
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
                  {banner.title && (
                    <h2 className="banner-title text-white text-2xl md:text-6xl font-bold mb-3 drop-shadow-xl leading-tight tracking-tight">
                      {banner.title}
                    </h2>
                  )}
                  {banner.subtitle && (
                    <p className="banner-subtitle text-white/80 text-xs md:text-sm tracking-widest uppercase drop-shadow">
                      {banner.subtitle}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black text-white p-3 opacity-0 group-hover:opacity-100 transition-all duration-200"
        aria-label="Previous"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black text-white p-3 opacity-0 group-hover:opacity-100 transition-all duration-200"
        aria-label="Next"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={`transition-all duration-300 ${
                i === selectedIndex
                  ? 'bg-white w-6 h-1.5'
                  : 'bg-white/40 hover:bg-white/70 w-1.5 h-1.5'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
