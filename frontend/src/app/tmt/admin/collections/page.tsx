'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Collection } from '@/lib/types'
import {
  adminGetCollections,
  adminCreateCollection,
  adminUpdateCollection,
  adminDeleteCollection,
  adminToggleCollection,
} from '@/lib/api'

/* ── Custom confirm dialog ─────────────────────────────────── */
function ConfirmDialog({
  name,
  onConfirm,
  onCancel,
}: {
  name: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-center font-semibold text-gray-800 mb-1">Xóa bộ sưu tập?</h3>
        <p className="text-center text-sm text-gray-500 mb-6">
          Bộ sưu tập <span className="font-medium text-gray-700">"{name}"</span> sẽ bị xóa vĩnh viễn. Sản phẩm trong bộ sưu tập sẽ không bị xóa.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-xl text-sm transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Create / Edit modal ───────────────────────────────────── */
function CollectionModal({
  collection,
  onSave,
  onClose,
}: {
  collection: Collection | null
  onSave: () => void
  onClose: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    name: collection?.name ?? '',
    description: collection?.description ?? '',
    sort_order: collection?.sort_order ?? 0,
  })
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(collection?.cover_url ?? null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Tên không được trống'); return }
    setSaving(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      if (form.description) fd.append('description', form.description)
      fd.append('sort_order', String(form.sort_order))
      if (coverFile) fd.append('cover_image', coverFile)

      if (collection) {
        await adminUpdateCollection(collection.id, fd)
      } else {
        await adminCreateCollection(fd)
      }
      onSave()
    } catch (e: any) {
      setError(e.message || 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">
            {collection ? 'Chỉnh sửa bộ sưu tập' : 'Tạo bộ sưu tập mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            {/* Left: fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên bộ sưu tập *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-400"
                  placeholder="VD: Bộ Sưu Tập Hè 2025"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-400 resize-none"
                  placeholder="Mô tả ngắn..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                  className="w-28 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-rose-400"
                  min={0}
                />
              </div>
            </div>

            {/* Right: cover image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh bìa</label>
              <div className="relative group" style={{ aspectRatio: '3/4' }}>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-full rounded-xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-rose-300 cursor-pointer transition-colors"
                >
                  {coverPreview ? (
                    <img src={coverPreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs">Nhấn để chọn ảnh</span>
                    </div>
                  )}
                </div>
                {/* Overlay change button */}
                {coverPreview && (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="absolute inset-0 bg-black/0 hover:bg-black/30 rounded-xl transition-colors flex items-center justify-center opacity-0 hover:opacity-100"
                  >
                    <span className="bg-white text-gray-800 text-xs font-medium px-3 py-1.5 rounded-full shadow">
                      Đổi ảnh bìa
                    </span>
                  </button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleCover} />
              {coverFile && (
                <p className="text-xs text-rose-500 mt-1.5">✓ Đã chọn ảnh mới</p>
              )}
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-2.5">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
            >
              {saving ? 'Đang lưu...' : collection ? 'Cập nhật' : 'Tạo bộ sưu tập'}
            </button>
            <button
              onClick={onClose}
              className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-2.5 rounded-xl text-sm transition-colors"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main page ─────────────────────────────────────────────── */
export default function CollectionsPage() {
  const router = useRouter()
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalCollection, setModalCollection] = useState<Collection | null | undefined>(undefined) // undefined = closed
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null)

  const load = async () => {
    try {
      setCollections(await adminGetCollections())
    } catch {
      router.replace('/tmt/admin/login')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = collections.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleToggle = async (id: number) => {
    const { is_active } = await adminToggleCollection(id)
    setCollections(prev => prev.map(c => c.id === id ? { ...c, is_active } : c))
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await adminDeleteCollection(deleteTarget.id)
      setCollections(prev => prev.filter(c => c.id !== deleteTarget.id))
    } catch (e: any) {
      alert(e.message || 'Lỗi xóa')
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Bộ sưu tập</h1>
        <button
          onClick={() => setModalCollection(null)}
          className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tạo bộ sưu tập
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Tìm kiếm bộ sưu tập..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-400 bg-white"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            ✕
          </button>
        )}
      </div>

      {/* Grid list */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Đang tải...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          {search ? `Không tìm thấy "${search}"` : 'Chưa có bộ sưu tập nào'}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(col => (
            <div key={col.id} className="bg-white rounded-2xl shadow-sm overflow-hidden group">
              {/* Cover image */}
              <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
                {col.cover_url ? (
                  <img src={col.cover_url} alt={col.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => setModalCollection(col)}
                    className="bg-white text-gray-800 text-xs font-medium px-3 py-1.5 rounded-full shadow hover:bg-rose-500 hover:text-white transition-colors"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => setDeleteTarget(col)}
                    className="bg-white text-gray-800 text-xs font-medium px-3 py-1.5 rounded-full shadow hover:bg-red-500 hover:text-white transition-colors"
                  >
                    Xóa
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2">{col.name}</p>
                  <button
                    onClick={() => handleToggle(col.id)}
                    className={`flex-none text-[10px] font-semibold px-2 py-1 rounded-full transition-colors whitespace-nowrap ${
                      col.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {col.is_active ? 'Hiện' : 'Ẩn'}
                  </button>
                </div>
                {col.description && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">{col.description}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">{col.products_count ?? 0} sản phẩm</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      {modalCollection !== undefined && (
        <CollectionModal
          collection={modalCollection}
          onSave={async () => { setModalCollection(undefined); await load() }}
          onClose={() => setModalCollection(undefined)}
        />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <ConfirmDialog
          name={deleteTarget.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
