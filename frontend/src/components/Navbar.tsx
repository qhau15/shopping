'use client'

import Link from 'next/link'
import { useState } from 'react'

const FB_PAGE = process.env.NEXT_PUBLIC_FB_PAGE || 'https://facebook.com'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="bg-warm-gray-50 border-b border-warm-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-18 md:h-20 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-serif text-warm-black text-xl md:text-2xl leading-none font-light tracking-wide"
        >
          𝓣𝓻𝓪𝓷 𝓜𝓲𝓷𝓱 𝓣𝓻𝓪𝓷𝓰
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-10">
          <Link href="/" className="btn-ghost">Home</Link>
          <Link href="/products" className="btn-ghost">Shop</Link>
          <a
            href={FB_PAGE}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Shop Now
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-warm-black hover:opacity-50 transition-opacity"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7h16M4 12h16M4 17h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-warm-gray-200 bg-warm-gray-50 px-6 py-8 flex flex-col gap-7">
          <Link href="/" className="label-luxury text-warm-black" onClick={() => setOpen(false)}>Home</Link>
          <Link href="/products" className="label-luxury text-warm-black" onClick={() => setOpen(false)}>Shop</Link>
          <a href={FB_PAGE} target="_blank" rel="noopener noreferrer" className="btn-primary w-fit">
            Shop Now
          </a>
        </div>
      )}
    </nav>
  )
}
