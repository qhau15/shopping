import Link from 'next/link'
import { Product } from '@/lib/types'

function formatPrice(price: number) {
  return price.toLocaleString('vi-VN') + '₫'
}

export default function ProductCard({ product }: { product: Product }) {
  const primaryImage = product.images?.find((i) => i.is_primary) ?? product.images?.[0]
  const hasDiscount = product.discount_price != null && product.discount_price < product.price

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
        {/* Image */}
        <div className="relative overflow-hidden aspect-[3/4] bg-nude-50">
          {primaryImage ? (
            <img
              src={primaryImage.thumb_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-rose-50">
              <span className="text-5xl">👗</span>
            </div>
          )}

          {hasDiscount && product.discount_percent && (
            <span className="badge-discount absolute top-3 left-3">
              -{product.discount_percent}%
            </span>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-rose-600 transition-colors">
            {product.name}
          </h3>

          {/* Sizes preview */}
          {product.sizes?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {product.sizes.slice(0, 5).map((size) => (
                <span
                  key={size.id}
                  className={`text-xs px-2 py-0.5 rounded border font-medium ${
                    size.is_available
                      ? 'border-gray-300 text-gray-600'
                      : 'border-gray-200 text-gray-300 line-through'
                  }`}
                >
                  {size.size_label}
                </span>
              ))}
              {product.sizes.length > 5 && (
                <span className="text-xs text-gray-400">+{product.sizes.length - 5}</span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className="price-tag">{formatPrice(product.discount_price!)}</span>
                <span className="price-original">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="price-tag">{formatPrice(product.price)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
