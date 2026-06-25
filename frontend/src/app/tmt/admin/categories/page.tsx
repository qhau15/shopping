'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Category } from '@/lib/types'
import { adminGetCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from '@/lib/api'

const COMMON_ICONS = ['👗', '👚', '👖', '🧥', '👜', '👟', '💍', '🧣', '🕶️', '👒']

const emptyForm = { name: '', icon: '', sort_order: 0 }

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      setCategories(await adminGetCategories())
    } catch {
      router.replace('/tmt/admin/login')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditId(null)
    setForm(emptyForm)
    setError('')
    setShowModal(true)
  }

  const openEdit = (cat: Category) => {
    setEditId(cat.id)
    setForm({ name: cat.name, icon: cat.icon ?? '', sort_order: cat.sort_order })
    setError('')
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setError('') }

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Tên danh mục không được trống'); return }
    setSaving(true)
    setError('')
    try {
      if (editId) {
        const updated = await adminUpdateCategory(editId, form)
        setCategories(prev => prev.map(c => c.id === editId ? updated : c))
      } else {
        const created = await adminCreateCategory(form)
        setCategories(prev => [...prev, created])
      }
      closeModal()
    } catch (e: any) {
      setError(e.message || 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Xóa danh mục "${name}"?`)) return
    try {
      await adminDeleteCategory(id)
      setCategories(prev => prev.filter(c => c.id !== id))
    } catch (e: any) {
      alert(e.message || 'Lỗi xóa')
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Danh mục sản phẩm</h1>
        <button
          onClick={openCreate}
          className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2"
        >
          + Thêm danh mục
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Đang tải...</div>
        ) : categories.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-400 mb-4">Chưa có danh mục nào</p>
            <button onClick={openCreate} className="text-rose-500 text-sm font-medium hover:underline">
              + Tạo danh mục đầu tiên
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 font-medium text-gray-600">Danh mục</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Thứ tự</th>
                <th className="text-right px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <span className="text-2xl mr-3">{cat.icon}</span>
                    <span className="font-medium text-gray-800">{cat.name}</span>
                  </td>
                  <td className="text-center px-4 py-4 text-gray-500">{cat.sort_order}</td>
                  <td className="px-5 py-4 text-right space-x-4">
                    <button onClick={() => openEdit(cat)} className="text-rose-500 hover:text-rose-700 font-medium text-xs">
                      Sửa
                    </button>
                    <button onClick={() => handleDelete(cat.id, cat.name)} className="text-gray-400 hover:text-red-500 font-medium text-xs">
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-800 text-lg">
                {editId ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleSave()}
                  autoFocus
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-400"
                  placeholder="VD: Tops, Bottoms..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {COMMON_ICONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, icon }))}
                      className={`text-xl px-2 py-1 rounded-lg border-2 transition-all ${
                        form.icon === icon ? 'border-rose-400 bg-rose-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={form.icon}
                  onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                  className="w-28 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
                  placeholder="hoặc nhập"
                  maxLength={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                  className="w-28 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
                  min={0}
                />
              </div>

              {error && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-2">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                >
                  {saving ? 'Đang lưu...' : editId ? 'Cập nhật' : 'Thêm danh mục'}
                </button>
                <button
                  onClick={closeModal}
                  className="px-5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl text-sm transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
