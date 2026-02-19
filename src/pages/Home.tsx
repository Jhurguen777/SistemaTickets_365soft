import React, { useState } from 'react'
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
    // TODO: Filter events based on selection
    console.log('Category:', category, 'Subcategory:', subcategory)
  }

  const handleLoadMore = () => {
    // TODO: Load more events from API
    console.log('Loading more events...')
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section con Banner Central */}
      <section className="relative">
        {/* Background Image */}
        <div className="relative h-[300px] md:h-[400px] bg-cover bg-center bg-no-repeat"
             style={{ backgroundImage: "url('/media/banners/SuperTicket_Portada_LINEA.jpg')" }}>
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Search Bar */}
          <div className="h-[200px] md:h-[250px] bg-white flex items-center justify-center px-4">
            <div className="w-full max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar eventos..."
                  className="w-full px-6 py-3 pl-14 rounded-lg border-2 border-gray-200 text-gray-900 text-lg focus:outline-none focus:border-primary shadow-sm"
                />
                <Search
                  size={24}
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Banner Carousel */}
      <section className="py-8 px-4 bg-gray-50">
        <div className="container mx-auto">
          <BannerCarousel />
        </div>
      </section>

      {/* Category Menu */}
      <CategoryMenu onCategoryChange={handleCategoryChange} />

      {/* Filter Info */}
      {(selectedCategory || selectedSubcategory) && (
        <div className="bg-primary/10 py-3 px-4">
          <div className="container mx-auto">
            <p className="text-center text-sm text-gray-700">
              Filtrando por:
              <span className="font-bold">
                {selectedCategory}
                {selectedSubcategory && ` > ${selectedSubcategory}`}
              </span>
              <button
                onClick={() => {
                  setSelectedCategory(null)
                  setSelectedSubcategory(null)
                }}
                className="ml-3 text-red-600 hover:text-red-700 font-semibold"
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
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            ¿Por qué elegir nuestro sistema?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-5xl mb-4">🎟️</div>
              <h3 className="font-bold text-xl mb-2">Compra Fácil</h3>
              <p className="text-gray-600 text-sm">
                Compra tus entradas en pocos clics desde cualquier lugar
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="font-bold text-xl mb-2">100% Seguro</h3>
              <p className="text-gray-600 text-sm">
                Pagos seguros y protegidos con encriptación SSL
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="font-bold text-xl mb-2">Tiempo Real</h3>
              <p className="text-gray-600 text-sm">
                Selección de asientos en vivo con WebSocket
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-5xl mb-4">📱</div>
              <h3 className="font-bold text-xl mb-2">Entradas Digitales</h3>
              <p className="text-gray-600 text-sm">
                Recibe tus entradas al instante con código QR
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => onOpenModal('howToBuy')}
              className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors inline-flex items-center space-x-2"
            >
              <span>¿Cómo comprar?</span>
            </button>
          </div>
        </div>
      </section>

      {/* Tech Stack Info */}
      <section className="py-12 px-4 bg-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="text-2xl font-bold mb-6">Desarrollado con tecnología moderna</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {['React 18', 'TypeScript', 'TailwindCSS', 'Vite', 'React Router', 'Zustand', 'Socket.IO'].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
