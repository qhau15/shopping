import { Banner, Category, Collection, Product } from './types'

const serverApi = () =>
  typeof window === 'undefined' ? (process.env.API_URL || 'http://nginx') : ''

// Public API
export async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${serverApi()}/api/products`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Lỗi tải sản phẩm')
  return res.json()
}

export async function getProduct(id: number): Promise<Product> {
  const res = await fetch(`${serverApi()}/api/products/${id}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Sản phẩm không tồn tại')
  return res.json()
}

export async function getBanners(type?: 'slider' | 'promo'): Promise<Banner[]> {
  const url = type
    ? `${serverApi()}/api/banners?type=${type}`
    : `${serverApi()}/api/banners`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
}

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${serverApi()}/api/categories`, { cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
}

export async function getCollections(): Promise<Collection[]> {
  const res = await fetch(`${serverApi()}/api/collections`, { cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
}

// Admin API (client-side only)
function authHeader(): HeadersInit {
  const token = localStorage.getItem('admin_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function adminLogin(email: string, password: string) {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return { ok: res.ok, data: await res.json() }
}

export async function adminLogout() {
  await fetch('/api/admin/logout', { method: 'POST', headers: authHeader() })
  localStorage.removeItem('admin_token')
}

// Products
export async function adminGetProducts(): Promise<Product[]> {
  const res = await fetch('/api/admin/products', { headers: authHeader() })
  if (!res.ok) throw new Error('Unauthorized')
  return res.json()
}

export async function adminGetProduct(id: number): Promise<Product> {
  const res = await fetch(`/api/admin/products/${id}`, { headers: authHeader() })
  if (!res.ok) throw new Error('Not found')
  return res.json()
}

export async function adminCreateProduct(data: object): Promise<Product> {
  const res = await fetch('/api/admin/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Lỗi tạo sản phẩm')
  return json
}

export async function adminUpdateProduct(id: number, data: object): Promise<Product> {
  const res = await fetch(`/api/admin/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Lỗi cập nhật sản phẩm')
  return json
}

export async function adminDeleteProduct(id: number) {
  const res = await fetch(`/api/admin/products/${id}`, {
    method: 'DELETE',
    headers: authHeader(),
  })
  if (!res.ok) throw new Error('Lỗi xóa sản phẩm')
}

export async function adminToggleProduct(id: number) {
  const res = await fetch(`/api/admin/products/${id}/toggle`, {
    method: 'POST',
    headers: authHeader(),
  })
  return res.json()
}

export async function adminUploadImage(productId: number, file: File, isPrimary: boolean) {
  const form = new FormData()
  form.append('image', file)
  form.append('is_primary', isPrimary ? '1' : '0')
  const res = await fetch(`/api/admin/products/${productId}/images`, {
    method: 'POST',
    headers: authHeader(),
    body: form,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Lỗi upload ảnh')
  return json
}

export async function adminDeleteImage(imageId: number) {
  const res = await fetch(`/api/admin/images/${imageId}`, {
    method: 'DELETE',
    headers: authHeader(),
  })
  if (!res.ok) throw new Error('Lỗi xóa ảnh')
}

export async function adminSetPrimaryImage(imageId: number) {
  const res = await fetch(`/api/admin/images/${imageId}/primary`, {
    method: 'POST',
    headers: authHeader(),
  })
  if (!res.ok) throw new Error('Lỗi đặt ảnh chính')
}

// Banners
export async function adminGetBanners(): Promise<Banner[]> {
  const res = await fetch('/api/admin/banners', { headers: authHeader() })
  if (!res.ok) throw new Error('Unauthorized')
  return res.json()
}

export async function adminUploadBanner(
  file: File,
  type: 'slider' | 'promo',
  title?: string,
  subtitle?: string
) {
  const form = new FormData()
  form.append('image', file)
  form.append('type', type)
  if (title) form.append('title', title)
  if (subtitle) form.append('subtitle', subtitle)
  const res = await fetch('/api/admin/banners', {
    method: 'POST',
    headers: authHeader(),
    body: form,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Lỗi upload banner')
  return json
}

export async function adminDeleteBanner(id: number) {
  const res = await fetch(`/api/admin/banners/${id}`, {
    method: 'DELETE',
    headers: authHeader(),
  })
  if (!res.ok) throw new Error('Lỗi xóa banner')
}

export async function adminToggleBanner(id: number) {
  const res = await fetch(`/api/admin/banners/${id}/toggle`, {
    method: 'POST',
    headers: authHeader(),
  })
  return res.json()
}

// Categories
export async function adminGetCategories(): Promise<Category[]> {
  const res = await fetch('/api/admin/categories', { headers: authHeader() })
  if (!res.ok) throw new Error('Unauthorized')
  return res.json()
}

export async function adminCreateCategory(data: object): Promise<Category> {
  const res = await fetch('/api/admin/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Lỗi tạo danh mục')
  return json
}

export async function adminUpdateCategory(id: number, data: object): Promise<Category> {
  const res = await fetch(`/api/admin/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Lỗi cập nhật danh mục')
  return json
}

export async function adminDeleteCategory(id: number) {
  const res = await fetch(`/api/admin/categories/${id}`, {
    method: 'DELETE',
    headers: authHeader(),
  })
  if (!res.ok) throw new Error('Lỗi xóa danh mục')
}

// Collections
export async function adminGetCollections(): Promise<Collection[]> {
  const res = await fetch('/api/admin/collections', { headers: authHeader() })
  if (!res.ok) throw new Error('Unauthorized')
  return res.json()
}

export async function adminCreateCollection(form: FormData): Promise<Collection> {
  const res = await fetch('/api/admin/collections', {
    method: 'POST',
    headers: authHeader(),
    body: form,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Lỗi tạo bộ sưu tập')
  return json
}

export async function adminUpdateCollection(id: number, form: FormData): Promise<Collection> {
  const res = await fetch(`/api/admin/collections/${id}`, {
    method: 'POST', // PHP only parses multipart for GET/POST; route accepts both PUT and POST
    headers: authHeader(),
    body: form,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Lỗi cập nhật bộ sưu tập')
  return json
}

export async function adminDeleteCollection(id: number) {
  const res = await fetch(`/api/admin/collections/${id}`, {
    method: 'DELETE',
    headers: authHeader(),
  })
  if (!res.ok) throw new Error('Lỗi xóa bộ sưu tập')
}

export async function adminToggleCollection(id: number) {
  const res = await fetch(`/api/admin/collections/${id}/toggle`, {
    method: 'POST',
    headers: authHeader(),
  })
  return res.json()
}
