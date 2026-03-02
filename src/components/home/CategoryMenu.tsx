import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Menu, X } from 'lucide-react'

interface Category {
  name: string
  subcategories?: string[]
  link: string
}

interface CategoryMenuProps {
  onCategoryChange?: (category: string, subcategory?: string) => void
}

const categories: Category[] = [
  { name: 'Cine', subcategories: [], link: '?categoria=Cine' },
  {
    name: 'Conciertos',
    subcategories: ['Cristiano', 'Cumbia', 'Filarmónica', 'Folklore', 'Jazz', 'Ópera', 'Reggae', 'Rock', 'Sinfónico'],
    link: '?categoria=Conciertos'
  },
  { name: 'Danza', subcategories: ['Ballet'], link: '?categoria=Danza' },
  { name: 'Deportes', subcategories: ['Basquetbol', 'Carrera Pedestre', 'Futbol', 'Voleibol'], link: '?categoria=Deportes' },
  { name: 'Ferias', subcategories: [], link: '?categoria=Ferias' },
  {
    name: 'Fiestas',
    subcategories: ['Año Nuevo', 'Carnaval', 'Clásicos', 'Electrónica', 'Entrada Folklorica', 'Halloween'],
    link: '?categoria=Fiestas'
  },
  { name: 'Teatro', subcategories: ['Teatro Musical'], link: '?categoria=Teatro' },
  { name: 'Viajes', subcategories: [], link: '?categoria=Viajes' }
]

const CategoryMenu: React.FC<CategoryMenuProps> = ({ onCategoryChange }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileOpen(false)
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const handleSubcategoryClick = (category: Category, subcategory: string) => {
    onCategoryChange?.(category.name, subcategory)
    setOpenDropdown(null)
    setMobileOpen(false)
  }

  const handleCategoryClick = (category: Category) => {
    if (!category.subcategories?.length) {
      onCategoryChange?.(category.name)
      setMobileOpen(false)
    }
  }

  return (
    <div ref={menuRef} className="bg-primary text-white sticky top-16 md:top-20 z-30 shadow-md">
      <div className="container mx-auto px-4">

        {/* ── DESKTOP ── */}
        <nav className="hidden md:flex items-center justify-center space-x-1 py-3">
          {categories.map((category) => (
            <div
              key={category.name}
              className="relative group"
              onMouseEnter={() => setOpenDropdown(category.name)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                onClick={() => handleCategoryClick(category)}
                className="px-4 py-2 text-sm font-semibold uppercase tracking-wide hover:bg-white/10 rounded transition-colors flex items-center gap-1"
              >
                {category.name}
                {!!category.subcategories?.length && (
                  <ChevronDown size={14} className={`transition-transform ${openDropdown === category.name ? 'rotate-180' : ''}`} />
                )}
              </button>

              {!!category.subcategories?.length && openDropdown === category.name && (
                <div className="absolute left-0 top-full mt-1 w-52 bg-white rounded-lg shadow-xl py-2 z-50">
                  <a
                    href={category.link}
                    className="block px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 hover:text-primary"
                    onClick={(e) => { e.preventDefault(); handleCategoryClick(category) }}
                  >
                    Ver todos
                  </a>
                  {category.subcategories.map((sub) => (
                    <a
                      key={sub}
                      href={`?subcategoria=${sub}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                      onClick={(e) => { e.preventDefault(); handleSubcategoryClick(category, sub) }}
                    >
                      {sub}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* ── MOBILE TRIGGER BAR ── */}
        {/* Only shows a compact scrollable pill strip + hamburger, does NOT cover the page */}
        <div className="md:hidden flex items-center gap-2 py-2">
          {/* Scrollable category pills */}
          <div className="flex-1 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-2 pb-0.5" style={{ width: 'max-content' }}>
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => {
                    if (cat.subcategories?.length) {
                      setMobileOpen(true)
                      setOpenDropdown(cat.name)
                    } else {
                      handleCategoryClick(cat)
                    }
                  }}
                  className="whitespace-nowrap px-3 py-1.5 text-xs font-semibold uppercase tracking-wide bg-white/15 hover:bg-white/25 rounded-full transition-colors flex items-center gap-1 touch-manipulation"
                >
                  {cat.name}
                  {!!cat.subcategories?.length && <ChevronDown size={11} />}
                </button>
              ))}
            </div>
          </div>

          {/* Hamburger for full menu */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center bg-white/15 rounded-full touch-manipulation"
            aria-label="Menú categorías"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* ── MOBILE DROPDOWN PANEL ── */}
      {/* Slides down below the bar, max-height so it doesn't cover everything */}
      {mobileOpen && (
        <div className="md:hidden bg-primary border-t border-white/20 max-h-[60vh] overflow-y-auto">
          {categories.map((category) => (
            <div key={category.name} className="border-b border-white/10 last:border-0">
              <button
                onClick={() => {
                  if (category.subcategories?.length) {
                    setOpenDropdown(openDropdown === category.name ? null : category.name)
                  } else {
                    handleCategoryClick(category)
                  }
                }}
                className="w-full px-5 py-3 text-left flex items-center justify-between text-sm font-bold uppercase tracking-wide hover:bg-white/10 transition-colors touch-manipulation"
              >
                <span>{category.name}</span>
                {!!category.subcategories?.length && (
                  <ChevronDown
                    size={15}
                    className={`transition-transform duration-200 ${openDropdown === category.name ? 'rotate-180' : ''}`}
                  />
                )}
              </button>

              {/* Subcategory accordion */}
              {!!category.subcategories?.length && openDropdown === category.name && (
                <div className="bg-black/20">
                  <a
                    href={category.link}
                    className="block px-7 py-2.5 text-xs font-bold text-white/60 uppercase tracking-wider hover:text-white"
                    onClick={(e) => { e.preventDefault(); handleCategoryClick(category) }}
                  >
                    Ver todos
                  </a>
                  {category.subcategories.map((sub) => (
                    <a
                      key={sub}
                      href={`?subcategoria=${sub}`}
                      className="block px-7 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                      onClick={(e) => { e.preventDefault(); handleSubcategoryClick(category, sub) }}
                    >
                      {sub}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CategoryMenu