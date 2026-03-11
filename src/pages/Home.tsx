import { useState } from 'react'
import { Search } from 'lucide-react'
import BannerCarousel from '@/components/home/BannerCarousel'
import CategoryMenu from '@/components/home/CategoryMenu'
import EventGrid from '@/components/home/EventGrid'

interface HomeProps {
  onOpenModal: (modalType: string) => void
}

export default function Home({ onOpenModal }: HomeProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)

  const handleCategoryChange = (category: string, subcategory?: string) => {
    setSelectedCategory(category)
    setSelectedSubcategory(subcategory || null)
    console.log('Category:', category, 'Subcategory:', subcategory)
  }

  const handleLoadMore = () => {
    console.log('Loading more events...')
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative">
        <div
          className="relative h-[160px] sm:h-[260px] md:h-[400px] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/assets/gente-de-negocios-en-el-centro-de-convenciones-durante-la-pausa-para-el-cafe.webp')" }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Search Bar — debajo del hero, siempre visible */}
        <div className="bg-white px-3 sm:px-4 py-3 sm:py-4 shadow-sm">
          <div className="w-full max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar eventos..."
                className="w-full px-4 py-2.5 sm:py-3 pl-10 sm:pl-14 rounded-lg border-2 border-gray-200 text-gray-900 text-sm sm:text-lg focus:outline-none focus:border-primary shadow-sm"
              />
              <Search size={18} className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Banner Carousel */}
      <section className="py-4 sm:py-8 px-3 sm:px-4 bg-gray-50">
        <div className="container mx-auto">
          <BannerCarousel />
        </div>
      </section>

      {/* Category Menu */}
      <CategoryMenu onCategoryChange={handleCategoryChange} />

      {/* Filter Info */}
      {(selectedCategory || selectedSubcategory) && (
        <div className="bg-primary/10 py-2 sm:py-3 px-3 sm:px-4">
          <div className="container mx-auto">
            <p className="text-center text-xs sm:text-sm text-gray-700 flex flex-wrap items-center justify-center gap-1">
              <span>Filtrando por:</span>
              <span className="font-bold">
                {selectedCategory}
                {selectedSubcategory && ` > ${selectedSubcategory}`}
              </span>
              <button
                onClick={() => { setSelectedCategory(null); setSelectedSubcategory(null) }}
                className="ml-2 text-red-600 hover:text-red-700 font-semibold"
              >
                ✕ Limpiar filtro
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Events Grid */}
      <EventGrid onLoadMore={handleLoadMore} hasMore />

      {/* Info Section */}
      <section className="py-10 sm:py-16 px-3 sm:px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-xl sm:text-3xl font-bold text-center mb-6 sm:mb-12">
            ¿Por qué elegir nuestro sistema?
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[
              { icon: 'logo', title: 'Compra Fácil', desc: 'Compra tus entradas en pocos clics desde cualquier lugar' },
              { icon: '🔒', title: '100% Seguro', desc: 'Pagos seguros y protegidos con encriptación SSL' },
              { icon: '⚡', title: 'Tiempo Real', desc: 'Selección de asientos en vivo con WebSocket' },
              { icon: '📱', title: 'Entradas Digitales', desc: 'Recibe tus entradas al instante con código QR' },
            ].map((item) => (
              <div key={item.title} className="bg-white p-3 sm:p-6 rounded-lg shadow-md text-center">
                <div className="text-3xl sm:text-5xl mb-2 sm:mb-4 flex items-center justify-center">
                  {item.icon === 'logo' ? (
                    <img src="/assets/alfa-positivo.png" alt="365soft" className="w-16 h-16 sm:w-20 sm:h-20 object-contain" />
                  ) : (
                    <span>{item.icon}</span>
                  )}
                </div>
                <h3 className="font-bold text-sm sm:text-xl mb-1 sm:mb-2">{item.title}</h3>
                <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 sm:mt-12 text-center">
            <button
              onClick={() => onOpenModal('howToBuy')}
              className="px-5 sm:px-8 py-2.5 sm:py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors inline-flex items-center space-x-2 text-sm sm:text-base"
            >
              <span>¿Cómo comprar?</span>
            </button>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-8 sm:py-12 px-3 sm:px-4 bg-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6">Desarrollado con tecnología moderna</h3>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {['React 18', 'TypeScript', 'TailwindCSS', 'Vite', 'React Router', 'Zustand', 'Socket.IO'].map((tech) => (
              <span key={tech} className="px-2.5 sm:px-4 py-1 sm:py-2 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-semibold">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}