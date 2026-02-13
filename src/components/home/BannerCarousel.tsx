import React, { useState, useEffect } from 'react'
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

const defaultBanners: Banner[] = [
  {
    image: '/media/banners/Shop5_Rotativo_3_Mm8h4tP.jpg',
    link: '/Vibra-Carnavalera',
    title: 'Vibra Carnavalera'
  },
  {
    image: '/media/banners/Shop5_Rotativo_4_uZC9ckl.jpg',
    link: '/Descorazonados',
    title: 'Descorazonados'
  },
  {
    image: '/media/banners/Shop5_Rotativo_CzAIvdo.jpg',
    link: '/Compadres-Con---Session--1',
    title: 'Compadres Session'
  },
  {
    image: '/media/banners/2_WIrFQ30.jpg',
    link: '/Forever-Michael-un-Musical-Eterno',
    title: 'Forever Michael'
  },
  {
    image: '/media/banners/Rotativo_mQOBIdP.jpeg',
    link: '/Carnaval-de-Oruro-2026-Avi-Tour',
    title: 'Carnaval de Oruro 2026'
  },
  {
    image: '/media/banners/Shop5_Rotativo_i06SJ4B.jpg',
    link: '/Zona-Carnavalera',
    title: 'Zona Carnavalera'
  },
  {
    image: '/media/banners/Shop5_Rotativo_veMqph2.jpg',
    link: '/Mundo-Encantado--Santa-Cruz-',
    title: 'Mundo Encantado'
  },
  {
    image: '/media/banners/Shop5_Rotativo_puSIroa.jpg',
    link: '/Shingeki-Sinfonico',
    title: 'Shingeki Sinfónico'
  },
  {
    image: '/media/banners/Shop5_Rotativo_V9EZ5Rv.jpg',
    link: '/Lesmills-Day-Tarija-2026',
    title: 'Lesmills Day Tarija'
  },
  {
    image: '/media/banners/Shop5_Rotativo_1_JvbOWgx.jpg',
    link: '/Especial-de-Ha-Ash',
    title: 'Especial de Ha-Ash'
  },
  {
    image: '/media/banners/Shop5_Rotativo_ArR9CcJ.jpg',
    link: '/Tributo-a-Floricienta',
    title: 'Tributo a Floricienta'
  },
  {
    image: '/media/banners/ARTE_1400X400.jpeg',
    link: '/Abono-2026---Coro-y-Orquesta-Wagneriano-de-la-SOCLP',
    title: 'Abono 2026 Wagneriano'
  },
  {
    image: '/media/banners/Shop5_Rotativo_1_9ZSnlGs.jpg',
    link: '/Viva-la-Vida--Experiencia-Coldplay',
    title: 'Viva la Vida Coldplay'
  },
  {
    image: '/media/banners/3_Xl2hOo3.jpg',
    link: '/Quirquina-Omnia/',
    title: 'Quirquina Omnia'
  }
]

const BannerCarousel: React.FC<BannerCarouselProps> = ({
  banners = defaultBanners,
  autoPlayInterval = 5000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Auto-play
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length)
      }, autoPlayInterval)

      return () => clearInterval(interval)
    }
  }, [isPaused, banners.length, autoPlayInterval])

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1
    )
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Carousel Container */}
      <div className="relative overflow-hidden rounded-lg">
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
              style={{ aspectRatio: '16/9' }}
            >
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </a>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-lg transition-all opacity-0 hover:opacity-100 group-hover:opacity-100"
          aria-label="Anterior"
        >
          <ChevronLeft size={24} className="text-gray-800" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-lg transition-all opacity-0 hover:opacity-100 group-hover:opacity-100"
          aria-label="Siguiente"
        >
          <ChevronRight size={24} className="text-gray-800" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Ir a slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default BannerCarousel
