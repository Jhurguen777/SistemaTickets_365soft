import React, { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Banner {
  image: string
  link: string
  title: string
}

interface BannerCarouselProps {
  banners?: Banner[]
  autoPlayInterval?: number
}

// Los banners de blog han sido eliminados - el carrusel ahora está deshabilitado
const defaultBanners: Banner[] = []

// Si quieres agregar banners en el futuro, puedes agregarlos aquí:
// Ejemplo:
// const defaultBanners: Banner[] = [
//   { image: '/assets/tu-imagen.webp', link: '/ruta', title: 'Título' },
// ]

const BannerCarousel: React.FC<BannerCarouselProps> = ({
  banners = defaultBanners,
  autoPlayInterval = 5000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length)
      }, autoPlayInterval)
      return () => clearInterval(interval)
    }
  }, [isPaused, banners.length, autoPlayInterval])

  const goToPrevious = (e: React.MouseEvent) => {
    e.preventDefault()
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1))
  }

  const goToNext = (e: React.MouseEvent) => {
    e.preventDefault()
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    setIsPaused(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setCurrentIndex((prev) => (prev + 1) % banners.length)
      } else {
        setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1))
      }
    }
    setTimeout(() => setIsPaused(false), 1000)
  }

  // Show fewer dots on mobile to avoid overflow
  const visibleDots = banners.length <= 8 ? banners.length : 5
  const dotStart = Math.max(0, Math.min(currentIndex - 2, banners.length - visibleDots))

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => { setIsPaused(true); setIsHovered(true) }}
      onMouseLeave={() => { setIsPaused(false); setIsHovered(false) }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative overflow-hidden rounded-none md:rounded-lg">
        {/* Slides */}
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {banners.map((banner, index) => (
            <a
              key={index}
              href={banner.link}
              className="min-w-full relative block"
              // Mobile: 16:9, Desktop: wider aspect
              style={{ aspectRatio: window.innerWidth < 768 ? '16/9' : '3.5/1' }}
            >
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              {/* Gradient overlay for better dot visibility */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 pointer-events-none" />
            </a>
          ))}
        </div>

        {/* Navigation Arrows — always visible on mobile (smaller), hover on desktop */}
        <button
          onClick={goToPrevious}
          className={`
            absolute left-2 md:left-4 top-1/2 -translate-y-1/2
            w-8 h-8 md:w-11 md:h-11
            flex items-center justify-center
            bg-black/40 md:bg-white/90 hover:bg-white
            rounded-full shadow-lg transition-all
            md:opacity-0 ${isHovered ? 'md:opacity-100' : ''}
            opacity-70 hover:opacity-100
            touch-manipulation
          `}
          aria-label="Anterior"
        >
          <ChevronLeft size={16} className="text-white md:text-gray-800" />
        </button>

        <button
          onClick={goToNext}
          className={`
            absolute right-2 md:right-4 top-1/2 -translate-y-1/2
            w-8 h-8 md:w-11 md:h-11
            flex items-center justify-center
            bg-black/40 md:bg-white/90 hover:bg-white
            rounded-full shadow-lg transition-all
            md:opacity-0 ${isHovered ? 'md:opacity-100' : ''}
            opacity-70 hover:opacity-100
            touch-manipulation
          `}
          aria-label="Siguiente"
        >
          <ChevronRight size={16} className="text-white md:text-gray-800" />
        </button>

        {/* Dots — compact on mobile */}
        <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-1.5">
          {banners.slice(dotStart, dotStart + visibleDots).map((_, i) => {
            const realIndex = dotStart + i
            return (
              <button
                key={realIndex}
                onClick={() => setCurrentIndex(realIndex)}
                className={`
                  rounded-full transition-all duration-300 touch-manipulation
                  ${realIndex === currentIndex
                    ? 'bg-white w-5 h-2 md:w-8 md:h-3'
                    : 'bg-white/50 w-2 h-2 md:w-3 md:h-3 hover:bg-white/75'
                  }
                `}
                aria-label={`Slide ${realIndex + 1}`}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default BannerCarousel