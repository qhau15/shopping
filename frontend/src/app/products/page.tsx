export const dynamic = 'force-dynamic'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProductsSection from '@/components/ProductsSection'
import { getCategories, getCollections, getProducts } from '@/lib/api'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { collection?: string; category?: string }
}) {
  const [categories, collections, products] = await Promise.all([
    getCategories().catch(() => []),
    getCollections().catch(() => []),
    getProducts().catch(() => []),
  ])

  return (
    <>
      <Navbar />
      <main className="pt-6">
        <ProductsSection
          products={products}
          categories={categories}
          collections={collections}
          initialCollectionId={searchParams.collection ? Number(searchParams.collection) : null}
          initialCategoryId={searchParams.category ? Number(searchParams.category) : null}
        />
      </main>
      <Footer />
    </>
  )
}
