'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { adminGetProduct } from '@/lib/api'
import { Product } from '@/lib/types'
import ProductForm from '@/components/tmt/admin/ProductForm'

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)

  useEffect(() => {
    adminGetProduct(Number(params.id))
      .then(setProduct)
      .catch(() => router.push('/tmt/admin/login'))
  }, [params.id])

  if (!product) {
    return <div className="text-center py-16 text-gray-400 animate-pulse">Đang tải...</div>
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">
          ← Quay lại
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Sửa sản phẩm</h1>
      </div>
      <ProductForm product={product} />
    </div>
  )
}
