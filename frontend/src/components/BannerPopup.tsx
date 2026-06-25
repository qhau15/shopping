'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getBanners } from '@/lib/api'
import { Banner } from '@/lib/types'

const SESSION_KEY = 'banner_dismissed'

export default function BannerPopup() {
  const router = useRouter()
  const [banners, setBanners] = useState<Banner[]>([])
  const [visible, setVisible] = useState(false)
  const [index, setIndex] = useState(0)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return
    getBanners().then(all => {
      if (all.length === 0) return
      setBanners(all)
      const t = setTimeout(() => setVisible(true), 1000)
      return () => clearTimeout(t)
    })
  }, [])

  const close = () => {
    setClosing(true)
    sessionStorage.setItem(SESSION_KEY, '1')
    setTimeout(() => { setVisible(false); setClosing(false) }, 280)
  }

  const goToProducts = () => {
    close()
    router.push('/products')
  }

  if (!visible || banners.length === 0) return null

  const banner = banners[index]

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center transition-all duration-300 ${
        closing ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={close}
      />

      {/* Card */}
      <div
        className={`relative z-10 w-full sm:max-w-md mx-auto transition-all duration-300 ${
          closing ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'
        }`}
        style={{ animation: closing ? undefined : 'fadeInUp 0.35s cubic-bezier(0.16,1,0.3,1) both' }}
      >
        {/* Close button — outside card, top right */}
        <button
          onClick={close}
          className="absolute -top-10 right-2 text-white/70 hover:text-white flex items-center gap-1.5 text-xs tracking-widest uppercase transition-colors"
          aria-label="Đóng"
        >
          <span>Đóng</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image — clickable */}
        <button
          onClick={goToProducts}
          className="block w-full overflow-hidden group"
        >
          <img
            src={banner.url}
            alt={banner.title || 'Banner'}
            className="w-full object-cover max-h-[60vh] sm:max-h-[70vh] transition-transform duration-700 group-hover:scale-[1.02]"
          />
        </button>

        {/* Bottom bar */}
        {(banner.title || banner.subtitle) ? (
          <div className="bg-white px-6 py-4 flex items-center justify-between">
            <div>
              {banner.title && (
                <p className="font-semibold text-warm-black text-sm leading-snug">{banner.title}</p>
              )}
              {banner.subtitle && (
                <p className="text-warm-gray-400 text-xs mt-0.5 tracking-wide">{banner.subtitle}</p>
              )}
            </div>
            <button
              onClick={goToProducts}
              className="flex-none text-xs font-semibold text-warm-black border border-warm-black px-4 py-2 hover:bg-warm-black hover:text-white transition-colors tracking-widest uppercase ml-4"
            >
              Xem ngay
            </button>
          </div>
        ) : (
          <div className="bg-white px-6 py-3 flex justify-end">
            <button
              onClick={goToProducts}
              className="text-xs font-semibold text-warm-black border border-warm-black px-4 py-2 hover:bg-warm-black hover:text-white transition-colors tracking-widest uppercase"
            >
              Xem ngay
            </button>
          </div>
        )}

        {/* Dots — multiple banners */}
        {banners.length > 1 && (
          <div className="bg-white border-t border-warm-gray-100 flex items-center justify-center gap-2 py-2.5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === index ? 'bg-warm-black w-4 h-1.5' : 'bg-warm-gray-300 w-1.5 h-1.5'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
