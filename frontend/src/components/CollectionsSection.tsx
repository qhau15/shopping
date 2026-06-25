'use client'

import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { Collection } from '@/lib/types'

export default function CollectionsSection({ collections }: { collections: Collection[] }) {
  const [emblaRef] = useEmblaCarousel(
    { loop: true, align: 'start', dragFree: true },
    [Autoplay({ delay: 3500, stopOnInteraction: false })]
  )

  if (!collections.length) return null

  const items = collections.length < 5
    ? [...collections, ...collections]
    : collections

  return (
    <section className="py-14">
      {/* Heading */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="flex items-center gap-8">
          <div className="rule flex-1" />
          <p className="label-luxury">Collections</p>
          <div className="rule flex-1" />
        </div>
      </div>

      {/* Slider */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-3 pl-6">
          {items.map((col, idx) => (
            <a
              key={`${col.id}-${idx}`}
              href={`#collection-${col.id}`}
              className="flex-none group w-44 md:w-56"
            >
              <div className="relative overflow-hidden">
                <div style={{ aspectRatio: '3/4' }}>
                  {col.cover_url ? (
                    <img
                      src={col.cover_url}
                      alt={col.name}
                      className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full bg-warm-gray-100 flex items-center justify-center">
                      <div className="w-10 h-10 border border-warm-gray-300" />
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-serif text-base font-light leading-snug">{col.name}</p>
                  {col.description && (
                    <p className="text-white/60 text-[10px] mt-1 line-clamp-2 font-sans tracking-wide">
                      {col.description}
                    </p>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
