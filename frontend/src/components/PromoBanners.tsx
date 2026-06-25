import { Banner } from '@/lib/types'

export default function PromoBanners({ banners }: { banners: Banner[] }) {
  if (!banners.length) return null

  return (
    <section className="max-w-7xl mx-auto px-6 py-8">
      <div className={`grid gap-2 ${
        banners.length === 1 ? 'grid-cols-1' :
        banners.length === 2 ? 'grid-cols-2' :
        'grid-cols-2 md:grid-cols-3'
      }`}>
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="relative overflow-hidden group cursor-pointer"
            style={{ aspectRatio: '16/7' }}
          >
            <img
              src={banner.url}
              alt={banner.title || 'Promotion'}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-colors duration-500" />
            {banner.title && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <p className="text-white font-serif text-lg md:text-2xl font-light tracking-wide drop-shadow">
                  {banner.title}
                </p>
                {banner.subtitle && (
                  <p className="text-white/75 label-luxury mt-2 drop-shadow">
                    {banner.subtitle}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
