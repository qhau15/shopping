'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminGetBanners, adminUploadBanner, adminDeleteBanner, adminToggleBanner } from '@/lib/api'
import { Banner } from '@/lib/types'

const TYPE_LABELS: Record<string, string> = {
  slider: 'Slider chính',
  promo: 'Banner khuyến mãi',
}

export default function AdminBannersPage() {
  const router = useRouter()
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [type, setType] = useState<'slider' | 'promo'>('slider')
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    adminGetBanners()
      .then(setBanners)
      .catch(() => router.push('/tmt/admin/login'))
      .finally(() => setLoading(false))
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target?.result as string)
    reader.readAsDataURL(f)
  }

  const resetForm = () => {
    setFile(null)
    setPreview(null)
    setTitle('')
    setSubtitle('')
    setType('slider')
    if (fileRef.current) fileRef.current.value = ''
    setShowForm(false)
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setUploading(true)
    try {
      const banner = await adminUploadBanner(file, type, title || undefined, subtitle || undefined)
      setBanners(prev => [...prev, banner])
      resetForm()
    } catch (err: any) {
      alert(err.message || 'Lỗi upload')
    } finally {
      setUploading(false)
    }
  }

  const handleToggle = async (id: number) => {
    const { is_active } = await adminToggleBanner(id)
    setBanners(prev => prev.map(b => b.id === id ? { ...b, is_active } : b))
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa banner này?')) return
    await adminDeleteBanner(id)
    setBanners(prev => prev.filter(b => b.id !== id))
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Banner</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            + Thêm banner
          </button>
        )}
      </div>

      {/* Upload form (collapsible) */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-rose-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">Thêm banner mới</h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {(['slider', 'promo'] as const).map(t => (
                <button
                  key={t} type="button" onClick={() => setType(t)}
                  className={`py-2.5 px-4 rounded-xl border-2 text-sm font-semibold transition-all text-left ${
                    type === t ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {TYPE_LABELS[t]}
                  <p className="font-normal text-xs mt-0.5 opacity-60">
                    {t === 'slider' ? 'Full-width ở đầu trang' : 'Popup khi vào trang'}
                  </p>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-400"
                  placeholder="SALE 50%" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phụ đề</label>
                <input value={subtitle} onChange={e => setSubtitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-400"
                  placeholder="Ưu đãi đến 50%..." />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh banner *</label>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} required
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-600 hover:file:bg-rose-100 cursor-pointer" />
              <p className="text-xs text-gray-400 mt-1">
                {type === 'slider' ? 'Khuyến nghị 1920×600px' : 'Khuyến nghị 800×600px (popup)'}
              </p>
            </div>

            {preview && (
              <div className="rounded-xl overflow-hidden border max-h-52">
                <img src={preview} alt="preview" className="w-full object-contain max-h-52 bg-gray-50" />
              </div>
            )}

            <div className="flex gap-3">
              <button type="submit" disabled={uploading || !file}
                className="bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
                {uploading ? 'Đang upload...' : 'Upload banner'}
              </button>
              <button type="button" onClick={resetForm}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Banner table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Đang tải...</div>
        ) : banners.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-400 mb-4">Chưa có banner nào</p>
            <button onClick={() => setShowForm(true)} className="text-rose-500 text-sm font-medium hover:underline">
              + Tạo banner đầu tiên
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Hình</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tiêu đề</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Loại</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Trạng thái</th>
                <th className="text-right px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {banners.map(banner => (
                <tr key={banner.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="w-36 h-20 rounded-lg overflow-hidden bg-gray-100 flex-none">
                      <img src={banner.url} alt={banner.title || ''} className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">
                      {banner.title || <span className="text-gray-400 italic text-xs">Không có tiêu đề</span>}
                    </p>
                    {banner.subtitle && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{banner.subtitle}</p>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                      {TYPE_LABELS[banner.type] ?? banner.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggle(banner.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        banner.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {banner.is_active ? 'Hiện' : 'Ẩn'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(banner.id)} className="text-xs text-red-400 hover:text-red-600 font-medium">
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
