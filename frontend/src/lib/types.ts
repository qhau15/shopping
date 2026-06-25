export interface Category {
  id: number
  name: string
  slug: string
  icon: string | null
  is_active: boolean
  sort_order: number
}

export interface Collection {
  id: number
  name: string
  slug: string
  description: string | null
  cover_url: string | null
  is_active: boolean
  sort_order: number
  products_count?: number
}

export interface ProductImage {
  id: number
  path: string
  thumb_path: string
  is_primary: boolean
  sort_order: number
  url: string
  thumb_url: string
}

export interface ProductSize {
  id: number
  size_label: string
  quantity: number
  is_available: boolean
  sort_order: number
}

export interface Product {
  id: number
  name: string
  description: string | null
  price: number
  discount_price: number | null
  discount_percent: number | null
  fb_link: string | null
  is_active: boolean
  sort_order: number
  category_id: number | null
  collection_id: number | null
  category: Category | null
  collection: Collection | null
  images: ProductImage[]
  sizes: ProductSize[]
  created_at: string
}

export interface Banner {
  id: number
  type: 'slider' | 'promo'
  title: string | null
  subtitle: string | null
  image_path: string
  is_active: boolean
  sort_order: number
  url: string
}
