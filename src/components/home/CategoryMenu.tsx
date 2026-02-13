import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface Category {
  name: string
  subcategories?: string[]
  link: string
}

interface CategoryMenuProps {
  onCategoryChange?: (category: string, subcategory?: string) => void
}

const categories: Category[] = [
  {
    name: 'Cine',
    subcategories: [],
    link: '?categoria=Cine'
  },
  {
    name: 'Conciertos',
    subcategories: [
      'Cristiano',
      'Cumbia',
      'Filarmónica',
      'Folklore',
      'Jazz',
      'Ópera',
      'Reggae',
      'Rock',
      'Sinfónico'
    ],
    link: '?categoria=Conciertos'
  },
  {
    name: 'Danza',
    subcategories: ['Ballet'],
    link: '?categoria=Danza'
  },
  {
    name: 'Deportes',
    subcategories: ['Basquetbol', 'Carrera Pedestre', 'Futbol', 'Voleibol'],
    link: '?categoria=Deportes'
  },
  {
    name: 'Ferias',
    subcategories: [],
    link: '?categoria=Ferias'
  },
  {
    name: 'Fiestas',
    subcategories: [
      'Año Nuevo',
      'Carnaval',
      'Clásicos',
      'Electrónica',
      'Entrada Folklorica',
      'Halloween'
    ],
    link: '?categoria=Fiestas'
  },
  {
    name: 'Teatro',
    subcategories: ['Teatro Musical'],
    link: '?categoria=Teatro'
  },
  {
    name: 'Viajes',
    subcategories: [],
    link: '?categoria=Viajes'
  }
]

const CategoryMenu: React.FC<CategoryMenuProps> = ({ onCategoryChange }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const toggleDropdown = (categoryName: string) => {
    setOpenDropdown(openDropdown === categoryName ? null : categoryName)
  }

  const handleSubcategoryClick = (category: Category, subcategory: string) => {
    if (onCategoryChange) {
      onCategoryChange(category.name, subcategory)
    }
    setOpenDropdown(null)
  }

  const handleCategoryClick = (category: Category) => {
    if (category.subcategories && category.subcategories.length === 0) {
      // No subcategories, directly select category
      if (onCategoryChange) {
        onCategoryChange(category.name)
      }
    }
  }

  return (
    <div className="bg-primary text-white sticky top-16 md:top-20 z-30 shadow-md">
      <div className="container mx-auto px-4">
        {/* Desktop Menu */}
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
                className="px-4 py-2 text-sm font-semibold uppercase tracking-wide hover:bg-primary/80 transition-colors flex items-center space-x-1"
              >
                <span>{category.name}</span>
                {category.subcategories && category.subcategories.length > 0 && (
                  <ChevronDown size={16} />
                )}
              </button>

              {/* Dropdown */}
              {category.subcategories && category.subcategories.length > 0 && (
                <div
                  className={`absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 ${
                    openDropdown === category.name ? 'block' : 'hidden'
                  } group-hover:block`}
                >
                  <div className="border-b border-gray-200 px-4 py-2">
                    <a
                      href={category.link}
                      className="text-sm font-bold text-gray-900 hover:text-primary block"
                      onClick={(e) => {
                        e.preventDefault()
                        handleCategoryClick(category)
                      }}
                    >
                      TODOS
                    </a>
                  </div>
                  {category.subcategories.map((subcategory) => (
                    <a
                      key={subcategory}
                      href={`?subcategoria=${subcategory}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
                      onClick={(e) => {
                        e.preventDefault()
                        handleSubcategoryClick(category, subcategory)
                      }}
                    >
                      {subcategory}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Mobile Menu - Accordion Style */}
        <div className="md:hidden py-2">
          {categories.map((category) => (
            <div key={category.name} className="border-b border-primary/80 last:border-0">
              <button
                onClick={() => {
                  if (category.subcategories && category.subcategories.length > 0) {
                    toggleDropdown(category.name)
                  } else {
                    handleCategoryClick(category)
                  }
                }}
                className="w-full px-4 py-3 text-left flex items-center justify-between font-semibold uppercase"
              >
                <span>{category.name}</span>
                {category.subcategories && category.subcategories.length > 0 && (
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      openDropdown === category.name ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </button>

              {/* Mobile Dropdown */}
              {category.subcategories &&
                category.subcategories.length > 0 &&
                openDropdown === category.name && (
                  <div className="bg-primary/90 px-4 py-2 space-y-1">
                    <a
                      href={category.link}
                      className="block py-2 text-sm text-white/90 hover:text-white"
                      onClick={(e) => {
                        e.preventDefault()
                        handleCategoryClick(category)
                      }}
                    >
                      TODOS
                    </a>
                    {category.subcategories.map((subcategory) => (
                      <a
                        key={subcategory}
                        href={`?subcategoria=${subcategory}`}
                        className="block py-2 pl-4 text-sm text-white/90 hover:text-white"
                        onClick={(e) => {
                          e.preventDefault()
                          handleSubcategoryClick(category, subcategory)
                        }}
                      >
                        {subcategory}
                      </a>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CategoryMenu
