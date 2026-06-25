'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Category, Collection, Product } from '@/lib/types'

const PAGE_SIZE = 16

function formatPrice(p: number) {
  return new Intl.NumberFormat('vi-VN').format(p) + '₫'
}

function ProductCard({ product }: { product: Product }) {
  const primaryImage = product.images.find((i) => i.is_primary) ?? product.images[0]

  return (
    <Link href={`/products/${product.id}`} className="group block">
      {/* Image */}
      <div className="relative overflow-hidden bg-warm-gray-100 border border-warm-gray-200 group-hover:border-warm-gray-300 transition-colors duration-500 aspect-[2/3]">
          {primaryImage ? (
            <img
              src={primaryImage.thumb_url}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border border-warm-gray-300" />
            </div>
          )}

        {product.discount_percent && (
          <span className="badge-discount absolute top-3 right-3">
            −{product.discount_percent}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="mt-3.5 space-y-1.5">
        {product.category && (
          <p className="label-luxury text-warm-gray-400 text-[9px]">{product.category.name}</p>
        )}
        <h3 className="font-serif text-base font-light text-warm-black leading-snug group-hover:opacity-60 transition-opacity duration-300 line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2.5">
          <span className="font-serif text-warm-black text-base font-light">
            {formatPrice(product.discount_price ?? product.price)}
          </span>
          {product.discount_price && (
            <span className="text-warm-gray-400 text-xs line-through font-sans">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
        {product.sizes.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {product.sizes.slice(0, 6).map((s) => (
              <span
                key={s.id}
                className={`text-[9px] px-1.5 py-0.5 border font-sans tracking-wider ${
                  s.is_available && s.quantity !== 0
                    ? 'border-warm-gray-300 text-warm-gray-600'
                    : 'border-warm-gray-100 text-warm-gray-300 line-through'
                }`}
              >
                {s.size_label}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

interface Props {
  products: Product[]
  categories: Category[]
  collections: Collection[]
  initialCollectionId?: number | null
  initialCategoryId?: number | null
}

export default function ProductsSection({ products, categories, collections, initialCollectionId, initialCategoryId }: Props) {
  const [activeCat, setActiveCat] = useState<number | null>(initialCategoryId ?? null)
  const [activeCol, setActiveCol] = useState<number | null>(initialCollectionId ?? null)
  const [page, setPage] = useState(1)

  const filtered = products.filter((p) => {
    if (activeCat !== null && p.category_id !== activeCat) return false
    if (activeCol !== null && p.collection_id !== activeCol) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleCat = (id: number | null) => { setActiveCat(id); setActiveCol(null); setPage(1) }
  const handleCol = (id: number | null) => { setActiveCol(id); setActiveCat(null); setPage(1) }

  const activeLabel = activeCol !== null
    ? collections.find((c) => c.id === activeCol)?.name
    : activeCat !== null
    ? categories.find((c) => c.id === activeCat)?.name
    : 'All Pieces'

  const goToPage = (p: number) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section id="products" className="max-w-7xl mx-auto px-6 pb-20">
      {/* Filter navigation */}
      <div className="sticky top-[80px] z-20 bg-warm-gray-50 -mx-6 px-6 py-5 border-b border-warm-gray-200 mb-12">
        <div className="flex items-center gap-8 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => handleCat(null)}
            className={`flex-none label-luxury pb-0.5 transition-all whitespace-nowrap border-b ${
              activeCat === null && activeCol === null
                ? 'border-warm-black text-warm-black'
                : 'border-transparent text-warm-gray-400 hover:text-warm-gray-600'
            }`}
          >
            All
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCat(cat.id)}
              className={`flex-none label-luxury pb-0.5 transition-all whitespace-nowrap border-b ${
                activeCat === cat.id
                  ? 'border-warm-black text-warm-black'
                  : 'border-transparent text-warm-gray-400 hover:text-warm-gray-600'
              }`}
            >
              {cat.name}
            </button>
          ))}

          {collections.map((col) => (
            <button
              key={col.id}
              onClick={() => handleCol(col.id)}
              className={`flex-none label-luxury pb-0.5 transition-all whitespace-nowrap border-b ${
                activeCol === col.id
                  ? 'border-warm-black text-warm-black'
                  : 'border-transparent text-warm-gray-400 hover:text-warm-gray-600'
              }`}
            >
              {col.name}
            </button>
          ))}
        </div>
      </div>

      {/* Section header */}
      <div className="text-center mb-12">
        <h2 className="font-serif text-3xl md:text-5xl font-light text-warm-black tracking-wide mb-2">
          {activeLabel}
        </h2>
        {filtered.length > 0 && (
          <p className="label-luxury text-warm-gray-400">
            {filtered.length} pieces
            {totalPages > 1 && <span className="ml-2 text-warm-gray-300">· page {page} of {totalPages}</span>}
          </p>
        )}
      </div>

      {/* Products grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-28">
          <div className="w-10 h-10 border border-warm-gray-200 mx-auto mb-6" />
          <p className="label-luxury text-warm-gray-300">No items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-14 md:gap-x-8 md:gap-y-16">
          {paginated.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-16">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="w-9 h-9 flex items-center justify-center border border-warm-gray-200 text-warm-gray-400 hover:border-warm-black hover:text-warm-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => goToPage(p)}
              className={`w-9 h-9 label-luxury transition-colors ${
                p === page
                  ? 'bg-warm-black text-white border border-warm-black'
                  : 'border border-warm-gray-200 text-warm-gray-500 hover:border-warm-black hover:text-warm-black'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            className="w-9 h-9 flex items-center justify-center border border-warm-gray-200 text-warm-gray-400 hover:border-warm-black hover:text-warm-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </section>
  )
}
