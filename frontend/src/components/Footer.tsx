const FB_PAGE = process.env.NEXT_PUBLIC_FB_PAGE || 'https://facebook.com'

export default function Footer() {
  return (
    <footer className="bg-warm-black text-white mt-28">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-14">
          <div>
            <p className="font-serif text-2xl font-light tracking-wide mb-5">
              𝓣𝓻𝓪𝓷 𝓜𝓲𝓷𝓱 𝓣𝓻𝓪𝓷𝓰
            </p>
            <p className="text-sm text-warm-gray-400 leading-relaxed font-light">
              Women's fashion curated with<br />elegance, crafted with care.
            </p>
          </div>

          <div>
            <p className="label-luxury text-warm-gray-400 mb-6">Navigate</p>
            <ul className="space-y-3.5 text-sm text-warm-gray-300 font-light">
              <li><a href="/" className="hover:text-white transition-colors duration-200">Home</a></li>
              <li><a href="/#products" className="hover:text-white transition-colors duration-200">Collection</a></li>
              <li>
                <a href={FB_PAGE} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200">
                  Facebook Shop
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="label-luxury text-warm-gray-400 mb-6">Contact</p>
            <p className="text-sm text-warm-gray-400 mb-6 leading-relaxed font-light">
              Message us on Facebook for<br />personal styling &amp; orders.
            </p>
            <a
              href={FB_PAGE}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 border border-warm-gray-600 text-warm-gray-300
                         text-[10px] tracking-[0.2em] uppercase font-medium py-3.5 px-7
                         hover:border-white hover:text-white transition-all duration-300"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Chat with Us
            </a>
          </div>
        </div>

        <div className="border-t border-warm-gray-900 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-warm-gray-600 font-light">
            © {new Date().getFullYear()} Tran Minh Trang Fashion
          </p>
          <p className="label-luxury text-warm-gray-700">Elegant · Refined · Timeless</p>
        </div>
      </div>
    </footer>
  )
}
