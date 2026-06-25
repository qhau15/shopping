'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getProduct } from '@/lib/api'
import { Product, ProductImage } from '@/lib/types'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

function formatPrice(price: number) {
  return price.toLocaleString('vi-VN') + '₫'
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [activeImage, setActiveImage] = useState<ProductImage | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProduct(Number(params.id))
      .then((p) => {
        setProduct(p)
        const primary = p.images?.find((i) => i.is_primary) ?? p.images?.[0]
        setActiveImage(primary ?? null)
      })
      .catch(() => router.push('/'))
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-6 h-6 border border-warm-gray-200 animate-spin border-t-warm-black" />
        </div>
      </>
    )
  }

  if (!product) return null

  const hasDiscount = product.discount_price != null && product.discount_price < product.price
  const buyLink = product.fb_link || process.env.NEXT_PUBLIC_FB_PAGE || 'https://facebook.com'

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-12 pb-32 md:pb-16">
        {/* Breadcrumb */}
        <nav className="label-luxury text-warm-gray-400 mb-10 flex items-center gap-2">
          <a href="/" className="hover:text-warm-black transition-colors">Home</a>
          <span className="text-warm-gray-300">/</span>
          {product.category && (
            <>
              <span>{product.category.name}</span>
              <span className="text-warm-gray-300">/</span>
            </>
          )}
          <span className="text-warm-gray-600 truncate max-w-xs">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {/* Images column */}
          <div>
            <div className="aspect-[2/3] bg-warm-gray-100 overflow-hidden border border-warm-gray-200">
              {activeImage ? (
                <img
                  src={activeImage.url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-16 h-16 border border-warm-gray-200" />
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                {product.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(img)}
                    className={`flex-none w-16 h-20 overflow-hidden border-2 transition-colors ${
                      activeImage?.id === img.id
                        ? 'border-warm-black'
                        : 'border-transparent hover:border-warm-gray-300'
                    }`}
                  >
                    <img src={img.thumb_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info column */}
          <div className="md:pt-4">
            {/* Category / Collection */}
            <div className="flex flex-wrap gap-3 mb-4">
              {product.category && (
                <span className="label-luxury text-warm-gray-400 border border-warm-gray-200 px-3 py-1.5">
                  {product.category.name}
                </span>
              )}
              {product.collection && (
                <span className="label-luxury text-warm-gray-400 border border-warm-gray-200 px-3 py-1.5">
                  {product.collection.name}
                </span>
              )}
            </div>

            <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-light text-warm-black leading-snug mb-6 tracking-wide">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex flex-wrap items-baseline gap-3 mb-8">
              {hasDiscount ? (
                <>
                  <span className="font-serif text-2xl text-warm-black font-light">
                    {formatPrice(product.discount_price!)}
                  </span>
                  <span className="text-warm-gray-400 line-through text-sm font-sans">
                    {formatPrice(product.price)}
                  </span>
                  {product.discount_percent && (
                    <span className="badge-discount">−{product.discount_percent}%</span>
                  )}
                </>
              ) : (
                <span className="font-serif text-2xl text-warm-black font-light">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {/* Divider */}
            <div className="rule mb-8" />

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <p className="label-luxury text-warm-gray-500">Select Size</p>
                  {selectedSize && (
                    <span className="label-luxury text-warm-black">{selectedSize}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => {
                    const outOfStock = !size.is_available || size.quantity === 0
                    const lowStock = !outOfStock && size.quantity > 0 && size.quantity <= 5
                    return (
                      <button
                        key={size.id}
                        onClick={() => !outOfStock && setSelectedSize(size.size_label)}
                        disabled={outOfStock}
                        title={outOfStock ? 'Out of stock' : `${size.quantity} remaining`}
                        className={`relative px-5 py-2.5 border text-xs font-sans font-medium tracking-widest transition-all duration-200 ${
                          outOfStock
                            ? 'border-warm-gray-100 text-warm-gray-300 cursor-not-allowed line-through'
                            : selectedSize === size.size_label
                            ? 'border-warm-black bg-warm-black text-white'
                            : 'border-warm-gray-300 text-warm-gray-700 hover:border-warm-black'
                        }`}
                      >
                        {size.size_label}
                        {lowStock && !outOfStock && (
                          <span className="absolute -top-2 -right-2 text-[9px] bg-warm-black text-white px-1 leading-4 font-sans">
                            {size.quantity}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
                {selectedSize && (() => {
                  const s = product.sizes.find(sz => sz.size_label === selectedSize)
                  return s && s.quantity > 0 ? (
                    <p className="label-luxury text-warm-gray-400 mt-3">
                      {s.quantity} remaining
                    </p>
                  ) : null
                })()}
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="mb-8 pt-6 border-t border-warm-gray-100">
                <p className="label-luxury text-warm-gray-400 mb-4">About</p>
                <p className="font-sans text-sm text-warm-gray-600 leading-relaxed whitespace-pre-line font-light">
                  {product.description}
                </p>
              </div>
            )}

            {/* Size chart */}
            <SizeChart />

            {/* CTA desktop */}
            <a
              href={buyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex btn-primary w-full justify-center py-5 mt-2"
            >
              <FbIcon />
              Order via Facebook
            </a>
            <p className="hidden md:block label-luxury text-warm-gray-400 mt-4 text-center">
              Chat with us to place your order
            </p>
          </div>
        </div>
      </main>

      <Footer />

      {/* Sticky CTA mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-warm-gray-50 border-t border-warm-gray-200 px-6 py-4">
        <a
          href={buyLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary w-full justify-center py-4"
        >
          <FbIcon />
          Order via Facebook
        </a>
      </div>
    </>
  )
}

function SizeChart() {
  const rows = [
    { size: 'S',  chest: 84, waist: 64, hip: 90,  weight: '45 – 49 kg' },
    { size: 'M',  chest: 88, waist: 68, hip: 94,  weight: '51 – 55 kg' },
    { size: 'L',  chest: 92, waist: 72, hip: 98,  weight: '56 – 60 kg' },
    { size: 'XL', chest: 96, waist: 76, hip: 102, weight: '61 – 65 kg' },
  ]

  return (
    <div className="mb-8 pt-6 border-t border-warm-gray-100">
      <p className="label-luxury text-warm-gray-400 mb-5">Size Chart</p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-sans border-collapse">
          <thead>
            <tr className="border-b border-warm-gray-200">
              <th className="text-left py-2.5 pr-4 label-luxury text-warm-gray-500 font-medium">Size</th>
              <th className="text-center py-2.5 px-3 label-luxury text-warm-gray-500 font-medium">Ngực (cm)</th>
              <th className="text-center py-2.5 px-3 label-luxury text-warm-gray-500 font-medium">Eo (cm)</th>
              <th className="text-center py-2.5 px-3 label-luxury text-warm-gray-500 font-medium">Mông (cm)</th>
              <th className="text-center py-2.5 pl-3 label-luxury text-warm-gray-500 font-medium">Cân nặng</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.size} className={`border-b border-warm-gray-100 ${i % 2 === 0 ? 'bg-warm-gray-50/50' : ''}`}>
                <td className="py-3 pr-4 font-semibold text-warm-black tracking-widest">{r.size}</td>
                <td className="py-3 px-3 text-center text-warm-gray-600">{r.chest}</td>
                <td className="py-3 px-3 text-center text-warm-gray-600">{r.waist}</td>
                <td className="py-3 px-3 text-center text-warm-gray-600">{r.hip}</td>
                <td className="py-3 pl-3 text-center text-warm-gray-600">{r.weight}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="label-luxury text-warm-gray-300 mt-3 text-center">@tranminhtrangboutique</p>
      </div>
    </div>
  )
}

function FbIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}
