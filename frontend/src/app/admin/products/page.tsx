'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { adminGetProducts, adminDeleteProduct, adminToggleProduct } from '@/lib/api'
import { Product } from '@/lib/types'

function formatPrice(p: number) {
  return p.toLocaleString('vi-VN') + '₫'
}

function ConfirmDialog({
  count,
  action,
  onConfirm,
  onCancel,
}: {
  count: number
  action: 'delete' | 'hide' | 'show'
  onConfirm: () => void
  onCancel: () => void
}) {
  const label = action === 'delete' ? 'Xóa' : action === 'hide' ? 'Ẩn' : 'Hiện'
  const desc =
    action === 'delete'
      ? `${count} sản phẩm sẽ bị xóa vĩnh viễn cùng tất cả hình ảnh.`
      : `${count} sản phẩm sẽ được ${action === 'hide' ? 'ẩn khỏi' : 'hiện trên'} trang mua hàng.`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${action === 'delete' ? 'bg-red-50' : 'bg-blue-50'}`}>
          {action === 'delete' ? (
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <h3 className="text-center font-semibold text-gray-800 mb-1">{label} {count} sản phẩm?</h3>
        <p className="text-center text-sm text-gray-500 mb-6">{desc}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-xl text-sm transition-colors">
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 text-white font-medium py-2.5 rounded-xl text-sm transition-colors ${action === 'delete' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {label}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [confirm, setConfirm] = useState<{ action: 'delete' | 'hide' | 'show' } | null>(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => { loadProducts() }, [])

  const loadProducts = async () => {
    try {
      setProducts(await adminGetProducts())
    } catch {
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (p.collection?.name ?? '').toLowerCase().includes(search.toLowerCase())
  )

  // Selection helpers
  const allChecked = filtered.length > 0 && filtered.every(p => selected.has(p.id))
  const someChecked = filtered.some(p => selected.has(p.id))

  const toggleOne = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (allChecked) {
      setSelected(prev => {
        const next = new Set(prev)
        filtered.forEach(p => next.delete(p.id))
        return next
      })
    } else {
      setSelected(prev => {
        const next = new Set(prev)
        filtered.forEach(p => next.add(p.id))
        return next
      })
    }
  }

  const clearSelection = () => setSelected(new Set())

  // Single toggle
  const handleToggleOne = async (id: number) => {
    await adminToggleProduct(id)
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !p.is_active } : p))
  }

  // Bulk actions
  const executeBulkAction = async (action: 'delete' | 'hide' | 'show') => {
    setProcessing(true)
    const ids = Array.from(selected)
    try {
      if (action === 'delete') {
        await Promise.all(ids.map(id => adminDeleteProduct(id)))
        setProducts(prev => prev.filter(p => !selected.has(p.id)))
      } else {
        const targetState = action === 'show'
        await Promise.all(
          ids
            .filter(id => {
              const p = products.find(p => p.id === id)
              return p && p.is_active !== targetState
            })
            .map(id => adminToggleProduct(id))
        )
        setProducts(prev => prev.map(p => selected.has(p.id) ? { ...p, is_active: targetState } : p))
      }
      clearSelection()
    } catch (e: any) {
      alert(e.message || 'Có lỗi xảy ra')
    } finally {
      setProcessing(false)
      setConfirm(null)
    }
  }

  const primaryImg = (p: Product) => p.images?.find(i => i.is_primary) ?? p.images?.[0]
  const selCount = selected.size

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sản phẩm</h1>
        <Link href="/admin/products/new" className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm sản phẩm
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); clearSelection() }}
          placeholder="Tìm theo tên, danh mục, bộ sưu tập..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-400 bg-white"
        />
        {search && (
          <button onClick={() => { setSearch(''); clearSelection() }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
        )}
      </div>

      {/* Bulk action bar */}
      {selCount > 0 && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4">
          <span className="text-sm font-semibold text-blue-700">Đã chọn {selCount} sản phẩm</span>
          <div className="flex-1" />
          <button
            onClick={() => setConfirm({ action: 'show' })}
            disabled={processing}
            className="text-xs font-semibold px-4 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50"
          >
            ✓ Bật hiển thị
          </button>
          <button
            onClick={() => setConfirm({ action: 'hide' })}
            disabled={processing}
            className="text-xs font-semibold px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            ○ Tắt hiển thị
          </button>
          <button
            onClick={() => setConfirm({ action: 'delete' })}
            disabled={processing}
            className="text-xs font-semibold px-4 py-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-50"
          >
            Xóa
          </button>
          <button onClick={clearSelection} className="text-gray-400 hover:text-gray-600 ml-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-400">Đang tải...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          {search ? `Không tìm thấy "${search}"` : 'Chưa có sản phẩm nào'}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3.5 w-10">
                    <input
                      type="checkbox"
                      checked={allChecked}
                      ref={el => { if (el) el.indeterminate = someChecked && !allChecked }}
                      onChange={toggleAll}
                      className="w-4 h-4 accent-rose-500 cursor-pointer"
                    />
                  </th>
                  <th className="text-left px-4 py-3.5 text-gray-500 font-medium w-20">Ảnh</th>
                  <th className="text-left px-4 py-3.5 text-gray-500 font-medium">Tên sản phẩm</th>
                  <th className="text-left px-4 py-3.5 text-gray-500 font-medium w-36">Giá</th>
                  <th className="text-left px-4 py-3.5 text-gray-500 font-medium w-40">Danh mục / BST</th>
                  <th className="text-left px-4 py-3.5 text-gray-500 font-medium w-28">Sizes</th>
                  <th className="text-center px-4 py-3.5 text-gray-500 font-medium w-24">Hiển thị</th>
                  <th className="text-right px-4 py-3.5 text-gray-500 font-medium w-20">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => {
                  const img = primaryImg(p)
                  const isSelected = selected.has(p.id)
                  return (
                    <tr
                      key={p.id}
                      className={`transition-colors ${isSelected ? 'bg-blue-50/60' : 'hover:bg-gray-50/60'}`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOne(p.id)}
                          className="w-4 h-4 accent-rose-500 cursor-pointer"
                        />
                      </td>

                      {/* Image */}
                      <td className="px-4 py-3">
                        <div className="w-14 h-[4.5rem] bg-gray-100 rounded-xl overflow-hidden">
                          {img ? (
                            <img src={img.thumb_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800 leading-snug line-clamp-2 max-w-[200px]">{p.name}</p>
                        {(p.images?.length ?? 0) > 1 && (
                          <p className="text-xs text-gray-400 mt-0.5">{p.images.length} ảnh</p>
                        )}
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3">
                        {p.discount_price ? (
                          <div>
                            <p className="font-semibold text-rose-600">{formatPrice(p.discount_price)}</p>
                            <p className="text-xs text-gray-400 line-through">{formatPrice(p.price)}</p>
                          </div>
                        ) : (
                          <p className="font-semibold text-gray-800">{formatPrice(p.price)}</p>
                        )}
                      </td>

                      {/* Category / Collection */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {p.category && (
                            <span className="text-xs bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full w-fit">{p.category.name}</span>
                          )}
                          {p.collection && (
                            <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full w-fit">{p.collection.name}</span>
                          )}
                        </div>
                      </td>

                      {/* Sizes */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {p.sizes?.slice(0, 4).map(s => (
                            <span key={s.id} className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${s.is_available && s.quantity !== 0 ? 'border-gray-300 text-gray-600' : 'border-gray-100 text-gray-300 line-through'}`}>
                              {s.size_label}
                            </span>
                          ))}
                          {(p.sizes?.length ?? 0) > 4 && (
                            <span className="text-[10px] text-gray-400">+{p.sizes.length - 4}</span>
                          )}
                        </div>
                      </td>

                      {/* Toggle */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleOne(p.id)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${p.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        >
                          {p.is_active ? 'Hiện' : 'Ẩn'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <Link href={`/admin/products/${p.id}/edit`} className="text-xs text-blue-500 hover:text-blue-700 font-medium">
                          Sửa
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
            {filtered.length} sản phẩm{search ? ` (lọc từ ${products.length})` : ''}
            {selCount > 0 && <span className="ml-2 text-blue-500 font-medium">· {selCount} đã chọn</span>}
          </div>
        </div>
      )}

      {/* Confirm bulk action */}
      {confirm && (
        <ConfirmDialog
          count={selCount}
          action={confirm.action}
          onConfirm={() => executeBulkAction(confirm.action)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
