export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BannerPopup from '@/components/BannerPopup'
import { getCollections } from '@/lib/api'

export default async function HomePage() {
  const all = await getCollections().catch(() => [])
  const collections = all.slice(0, 3)

  return (
    <>
      <Navbar />
      <BannerPopup />
      <main>

        {/* ── Brand hero ─────────────────────────────────────── */}
        <section className="h-[68vh] min-h-[420px] bg-warm-black flex flex-col items-center justify-center text-center px-6">
          <p className="label-luxury text-white/25 mb-8 tracking-[0.55em]">Est. 2024</p>
          <h1
            className="font-serif text-white font-light leading-none tracking-wide mb-6"
            style={{ fontSize: 'clamp(2.2rem, 8vw, 6.5rem)' }}
          >
            𝓣𝓻𝓪𝓷 𝓜𝓲𝓷𝓱 𝓣𝓻𝓪𝓷𝓰
          </h1>
          <div className="flex items-center gap-5 mb-10">
            <span className="h-px w-12 bg-white/15" />
            <p className="label-luxury text-white/30">Elegant · Refined · Timeless</p>
            <span className="h-px w-12 bg-white/15" />
          </div>
          <Link
            href="/products"
            className="btn-outline border-white/35 text-white hover:bg-white hover:text-warm-black hover:border-white px-10 py-4"
          >
            Shop Collection
          </Link>
        </section>

        {/* ── Collections — alternating split ────────────────── */}
        {collections.map((col, i) => {
          const imgLeft = i % 2 === 0
          return (
            <section
              key={col.id}
              className={`flex flex-col ${imgLeft ? 'md:flex-row' : 'md:flex-row-reverse'} border-t border-warm-gray-200`}
            >
              {/* Image — natural ratio, no forced crop */}
              <div className="w-full md:w-1/2 flex-none bg-warm-gray-100 overflow-hidden group">
                {col.cover_url ? (
                  <img
                    src={col.cover_url}
                    alt={col.name}
                    className="w-full h-auto block transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="aspect-[3/4] flex items-center justify-center">
                    <div className="w-12 h-12 border border-warm-gray-300" />
                  </div>
                )}
              </div>

              {/* Text — stretches to match image height */}
              <div className="flex-1 flex flex-col justify-center px-8 md:px-12 lg:px-16 py-12 md:py-16 bg-warm-gray-50">
                <p className="label-luxury text-warm-gray-400 mb-5">
                  {String(i + 1).padStart(2, '0')} — Collection
                </p>
                <h2
                  className="font-serif text-warm-black font-light tracking-wide leading-snug mb-4"
                  style={{ fontSize: 'clamp(1.7rem, 3vw, 3rem)' }}
                >
                  {col.name}
                </h2>
                {col.description && (
                  <p className="font-sans text-sm text-warm-gray-500 font-light leading-relaxed max-w-xs mb-8">
                    {col.description}
                  </p>
                )}
                <div className="h-px w-10 bg-warm-gray-300 mb-8 mt-2" />
                <Link href={`/products?collection=${col.id}`} className="btn-primary w-fit">
                  Shop This Collection
                </Link>
              </div>
            </section>
          )
        })}

        {collections.length === 0 && (
          <section className="h-[50vh] flex items-center justify-center bg-warm-gray-50">
            <Link href="/products" className="btn-primary px-12 py-5">Shop All Products</Link>
          </section>
        )}

      </main>
      <Footer />
    </>
  )
}
