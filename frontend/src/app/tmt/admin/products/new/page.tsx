'use client'

import { useRouter } from 'next/navigation'
import ProductForm from '@/components/admin/ProductForm'

export default function NewProductPage() {
  const router = useRouter()

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">
          ← Quay lại
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Thêm sản phẩm mới</h1>
      </div>
      <ProductForm />
    </div>
  )
}
