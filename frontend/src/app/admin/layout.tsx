'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { adminLogout } from '@/lib/api'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (pathname !== '/admin/login' && !localStorage.getItem('admin_token')) {
      router.replace('/admin/login')
    }
  }, [pathname, router])

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const handleLogout = async () => {
    await adminLogout()
    router.push('/admin/login')
  }

  const navItems = [
    { href: '/admin/products', label: '🛍️ Sản phẩm' },
    { href: '/admin/collections', label: '✨ Bộ sưu tập' },
    { href: '/admin/categories', label: '🏷️ Danh mục' },
    { href: '/admin/banners', label: '🖼️ Banner' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white shadow-sm flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <Link href="/admin" className="text-rose-600 font-bold text-base leading-tight">𝓣𝓻𝓪𝓷 𝓜𝓲𝓷𝓱 𝓣𝓻𝓪𝓷𝓰</Link>
          <p className="text-xs text-gray-400 mt-1">Quản trị</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith(href)
                  ? 'bg-rose-50 text-rose-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full text-sm text-gray-500 hover:text-rose-500 py-2 text-left transition-colors"
          >
            → Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}
