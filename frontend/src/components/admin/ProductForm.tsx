'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  adminCreateProduct,
  adminUpdateProduct,
  adminUploadImage,
  adminDeleteImage,
  adminSetPrimaryImage,
  adminGetCategories,
  adminGetCollections,
} from '@/lib/api'
import { Category, Collection, Product, ProductImage } from '@/lib/types'

interface SizeInput {
  size_label: string
  quantity: number
  is_available: boolean
}

interface Props {
  product?: Product
}

const QUICK_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size']

function fmtPrice(val: string) {
  const digits = val.replace(/\D/g, '')
  if (!digits) return ''
  return Number(digits).toLocaleString('vi-VN')
}

function rawPrice(val: string) {
  return parseInt(val.replace(/\./g, '').replace(/,/g, '')) || 0
}

export default function ProductForm({ product }: Props) {
  const router = useRouter()
  const isEdit = !!product
  const fileRef = useRef<HTMLInputElement>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [currentImages, setCurrentImages] = useState<ProductImage[]>(product?.images ?? [])
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const [pendingDragIdx, setPendingDragIdx] = useState<number | null>(null)
  const [pendingDragOverIdx, setPendingDragOverIdx] = useState<number | null>(null)

  const [name, setName] = useState(product?.name ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [price, setPrice] = useState(product ? fmtPrice(String(product.price)) : '')
  const [discountPrice, setDiscountPrice] = useState(product?.discount_price ? fmtPrice(String(product.discount_price)) : '')
  const [fbLink, setFbLink] = useState(product?.fb_link ?? '')
  const [isActive, setIsActive] = useState(product?.is_active ?? true)
  const [categoryId, setCategoryId] = useState<string>(product?.category_id ? String(product.category_id) : '')
  const [collectionId, setCollectionId] = useState<string>(product?.collection_id ? String(product.collection_id) : '')
  const [sortOrder, setSortOrder] = useState(product?.sort_order ?? 0)

  const [sizes, setSizes] = useState<SizeInput[]>(
    product?.sizes.map((s) => ({
      size_label: s.size_label,
      quantity: s.quantity,
      is_available: s.is_available,
    })) ?? []
  )
  const [newSize, setNewSize] = useState('')

  // New images queue (for new product)
  const [pendingImages, setPendingImages] = useState<File[]>([])
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([])

  useEffect(() => {
    adminGetCategories().then(setCategories).catch(() => {})
    adminGetCollections().then(setCollections).catch(() => {})
  }, [])

  const addSize = (label = newSize) => {
    const sl = label.trim().toUpperCase()
    if (!sl || sizes.find((s) => s.size_label === sl)) return
    setSizes([...sizes, { size_label: sl, quantity: 0, is_available: true }])
    setNewSize('')
  }

  const removeSize = (i: number) => setSizes(sizes.filter((_, idx) => idx !== i))

  const updateSize = (i: number, patch: Partial<SizeInput>) =>
    setSizes(sizes.map((s, idx) => idx === i ? { ...s, ...patch } : s))

  const handlePendingImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setPendingImages((prev) => [...prev, ...files])
    files.forEach((f) => {
      const reader = new FileReader()
      reader.onload = (ev) => setPendingPreviews((prev) => [...prev, ev.target?.result as string])
      reader.readAsDataURL(f)
    })
    e.target.value = ''
  }

  const removePending = (i: number) => {
    setPendingImages(pendingImages.filter((_, idx) => idx !== i))
    setPendingPreviews(pendingPreviews.filter((_, idx) => idx !== i))
  }

  const handleUploadMore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length || !product) return
    setUploadingImage(true)
    try {
      for (const file of files) {
        const newImg = await adminUploadImage(product.id, file, currentImages.length === 0)
        setCurrentImages((prev) => [...prev, newImg])
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploadingImage(false)
    }
    e.target.value = ''
  }

  const handleDeleteImage = async (img: ProductImage) => {
    if (!confirm('Xóa ảnh này?')) return
    await adminDeleteImage(img.id)
    setCurrentImages((prev) => prev.filter((i) => i.id !== img.id))
  }

  const handleSetPrimary = async (img: ProductImage) => {
    await adminSetPrimaryImage(img.id)
    setCurrentImages((prev) => prev.map((i) => ({ ...i, is_primary: i.id === img.id })))
  }

  const handleEditDrop = async (targetIdx: number) => {
    if (dragIdx === null || dragIdx === targetIdx) { setDragIdx(null); setDragOverIdx(null); return }
    const newImages = [...currentImages]
    const [moved] = newImages.splice(dragIdx, 1)
    newImages.splice(targetIdx, 0, moved)
    const oldPrimaryId = currentImages[0]?.id
    const newPrimaryId = newImages[0]?.id
    setCurrentImages(newImages)
    setDragIdx(null)
    setDragOverIdx(null)
    if (newPrimaryId && newPrimaryId !== oldPrimaryId) {
      await adminSetPrimaryImage(newPrimaryId)
      setCurrentImages(newImages.map((img, i) => ({ ...img, is_primary: i === 0 })))
    }
  }

  const handlePendingDrop = (targetIdx: number) => {
    if (pendingDragIdx === null || pendingDragIdx === targetIdx) { setPendingDragIdx(null); setPendingDragOverIdx(null); return }
    const newImgs = [...pendingImages]
    const newPrevs = [...pendingPreviews]
    const [movedImg] = newImgs.splice(pendingDragIdx, 1)
    const [movedPrev] = newPrevs.splice(pendingDragIdx, 1)
    newImgs.splice(targetIdx, 0, movedImg)
    newPrevs.splice(targetIdx, 0, movedPrev)
    setPendingImages(newImgs)
    setPendingPreviews(newPrevs)
    setPendingDragIdx(null)
    setPendingDragOverIdx(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const payload = {
        name,
        description: description || null,
        price: rawPrice(price),
        discount_price: discountPrice ? rawPrice(discountPrice) : null,
        fb_link: fbLink || null,
        is_active: isActive,
        sort_order: sortOrder,
        category_id: categoryId ? parseInt(categoryId) : null,
        collection_id: collectionId ? parseInt(collectionId) : null,
        sizes,
      }

      if (isEdit) {
        await adminUpdateProduct(product!.id, payload)
      } else {
        const created = await adminCreateProduct(payload)
        for (let i = 0; i < pendingImages.length; i++) {
          await adminUploadImage(created.id, pendingImages[i], i === 0)
        }
      }

      router.push('/tmt/admin/products')
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

      {/* Basic info */}
      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-700 border-b pb-2">Thông tin cơ bản</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-400"
            placeholder="Áo len cổ V màu hồng"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-400 resize-none"
            placeholder="Chất liệu, xuất xứ, hướng dẫn sử dụng..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giá gốc (VNĐ) *</label>
            <div className="relative">
              <input
                type="text" inputMode="numeric" value={price}
                onChange={(e) => setPrice(fmtPrice(e.target.value))}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-400 pr-14"
                placeholder="350,000"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">VNĐ</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giá khuyến mãi</label>
            <div className="relative">
              <input
                type="text" inputMode="numeric" value={discountPrice}
                onChange={(e) => setDiscountPrice(fmtPrice(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-400 pr-14"
                placeholder="280,000"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">VNĐ</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Link Facebook (mua hàng)</label>
          <input
            type="url" value={fbLink} onChange={(e) => setFbLink(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-400"
            placeholder="https://facebook.com/..."
          />
        </div>

        {/* Category + Collection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-400 bg-white"
            >
              <option value="">-- Không có --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bộ sưu tập</label>
            <select
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-400 bg-white"
            >
              <option value="">-- Không có --</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="checkbox" id="isActive" checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 accent-rose-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Hiện sản phẩm</label>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Thứ tự:</label>
            <input
              type="number" value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
              className="w-20 border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-rose-400"
              min={0}
            />
          </div>
        </div>
      </div>

      {/* Sizes with quantity */}
      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-700 border-b pb-2">Kích thước & Số lượng</h2>

        {/* Quick add */}
        <div>
          <p className="text-xs text-gray-500 mb-2">Thêm nhanh:</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {QUICK_SIZES.map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => addSize(sz)}
                disabled={!!sizes.find((s) => s.size_label === sz)}
                className="text-xs px-3 py-1.5 rounded-full border border-gray-200 hover:border-rose-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                {sz}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-rose-400"
              placeholder="Hoặc nhập size tùy chọn..."
            />
            <button type="button" onClick={() => addSize()} className="btn-outline text-sm">
              Thêm
            </button>
          </div>
        </div>

        {/* Size table */}
        {sizes.length > 0 && (
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Size</th>
                  <th className="text-center px-4 py-2.5 font-medium text-gray-600">Số lượng</th>
                  <th className="text-center px-4 py-2.5 font-medium text-gray-600">Còn hàng</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {sizes.map((size, i) => (
                  <tr key={i} className="border-t border-gray-50">
                    <td className="px-4 py-2.5">
                      <span className="font-semibold text-gray-800">{size.size_label}</span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <input
                        type="number"
                        value={size.quantity}
                        onChange={(e) => updateSize(i, { quantity: Math.max(0, parseInt(e.target.value) || 0) })}
                        min={0}
                        className="w-20 border border-gray-200 rounded-lg px-3 py-1 text-sm text-center focus:outline-none focus:border-rose-400"
                      />
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => updateSize(i, { is_available: !size.is_available })}
                        className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
                          size.is_available
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {size.is_available ? 'Còn hàng' : 'Hết hàng'}
                      </button>
                    </td>
                    <td className="pr-3">
                      <button
                        type="button"
                        onClick={() => removeSize(i)}
                        className="text-gray-300 hover:text-red-400 transition-colors"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {sizes.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">Chưa có size nào — thêm size ở trên</p>
        )}
      </div>

      {/* Images */}
      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-700 border-b pb-2">
          Hình ảnh sản phẩm
          <span className="text-xs text-gray-400 font-normal ml-2">(có thể upload nhiều ảnh)</span>
        </h2>

        {isEdit ? (
          /* Edit mode: show current images + upload more */
          <div>
            <p className="text-xs text-gray-400 mb-3">Kéo thả để sắp xếp — ảnh đầu tiên là ảnh chính</p>
            <div className="flex flex-wrap gap-3">
              {currentImages.map((img, i) => (
                <div
                  key={img.id}
                  draggable
                  onDragStart={() => setDragIdx(i)}
                  onDragOver={(e) => { e.preventDefault(); setDragOverIdx(i) }}
                  onDragLeave={() => setDragOverIdx(null)}
                  onDrop={() => handleEditDrop(i)}
                  onDragEnd={() => { setDragIdx(null); setDragOverIdx(null) }}
                  className={`relative group cursor-grab active:cursor-grabbing transition-all ${
                    dragIdx === i ? 'opacity-40 scale-95' : ''
                  } ${dragOverIdx === i && dragIdx !== i ? 'ring-2 ring-rose-400 ring-offset-1 rounded-lg' : ''}`}
                >
                  <img src={img.thumb_url} alt="" className="w-20 h-24 object-cover rounded-lg border select-none" />
                  {i === 0 && (
                    <span className="absolute top-1 left-1 bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      Chính
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <label className="w-20 h-24 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-rose-300 transition-colors">
                <input type="file" accept="image/*" multiple onChange={handleUploadMore} className="hidden" disabled={uploadingImage} />
                {uploadingImage
                  ? <span className="text-xs text-gray-400 animate-pulse">...</span>
                  : <><span className="text-2xl text-gray-300">+</span><span className="text-xs text-gray-400 mt-0.5">Thêm ảnh</span></>
                }
              </label>
            </div>
          </div>
        ) : (
          /* New mode: queue images */
          <>
            <label
              ref={fileRef as any}
              className="block w-full border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-rose-300 hover:bg-rose-50/30 transition-colors"
            >
              <input type="file" accept="image/*" multiple onChange={handlePendingImages} className="hidden" />
              <p className="text-3xl mb-2">📷</p>
              <p className="text-sm text-gray-500">Click để chọn ảnh (có thể chọn nhiều)</p>
              <p className="text-xs text-gray-400 mt-1">Ảnh đầu tiên sẽ là ảnh chính</p>
            </label>

            {pendingPreviews.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Kéo thả để sắp xếp — ảnh đầu tiên là ảnh chính</p>
                <div className="flex flex-wrap gap-3">
                  {pendingPreviews.map((src, i) => (
                    <div
                      key={i}
                      draggable
                      onDragStart={() => setPendingDragIdx(i)}
                      onDragOver={(e) => { e.preventDefault(); setPendingDragOverIdx(i) }}
                      onDragLeave={() => setPendingDragOverIdx(null)}
                      onDrop={() => handlePendingDrop(i)}
                      onDragEnd={() => { setPendingDragIdx(null); setPendingDragOverIdx(null) }}
                      className={`relative group cursor-grab active:cursor-grabbing transition-all ${
                        pendingDragIdx === i ? 'opacity-40 scale-95' : ''
                      } ${pendingDragOverIdx === i && pendingDragIdx !== i ? 'ring-2 ring-rose-400 ring-offset-1 rounded-lg' : ''}`}
                    >
                      <img src={src} alt="" className="w-20 h-24 object-cover rounded-lg border select-none" />
                      {i === 0 && (
                        <span className="absolute top-1 left-1 bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                          Chính
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removePending(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex gap-4">
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? 'Đang lưu...' : isEdit ? '✓ Lưu thay đổi' : '✓ Tạo sản phẩm'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-outline">
          Hủy
        </button>
      </div>
    </form>
  )
}
