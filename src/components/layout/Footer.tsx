import React from 'react'
import { Facebook, Twitter, Youtube, Instagram, LucideIcon } from 'lucide-react'

interface FooterProps {
  onOpenModal: (modalType: string) => void
}

// Icon components
const FacebookIcon: LucideIcon = (props) => <Facebook {...props} />
const TwitterIcon: LucideIcon = (props) => <Twitter {...props} />
const YoutubeIcon: LucideIcon = (props) => <Youtube {...props} />
const InstagramIcon: LucideIcon = (props) => <Instagram {...props} />

const Footer: React.FC<FooterProps> = ({ onOpenModal }) => {
  const socialLinks = [
    { name: 'Facebook', icon: FacebookIcon, url: 'https://www.facebook.com/SuperTicketBo' },
    { name: 'Twitter', icon: TwitterIcon, url: 'https://twitter.com/SuperTicketBo' },
    { name: 'YouTube', icon: YoutubeIcon, url: 'https://www.youtube.com/user/SuperTicketBo' },
    { name: 'Instagram', icon: InstagramIcon, url: 'https://www.instagram.com/superticketbo' }
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Column 1: Información */}
          <div>
            <h3 className="text-lg font-bold mb-4">SOCIEDAD COMERCIAL PARAEL TICKETING SRL</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div>
                <p className="font-semibold text-white mb-1">LA PAZ</p>
                <p>Plaza del Estudiante, Av. Villazón 1940.</p>
                <p>Edificio Inchauste Zelaya, Piso 6</p>
              </div>
              <div>
                <p className="font-semibold text-white mb-1">SANTA CRUZ</p>
                <p>Av. Monseñor Rivero, Edificio Milenium, Piso 8, Of. 8</p>
              </div>
            </div>
          </div>

          {/* Column 2: Links principales */}
          <div>
            <h3 className="text-lg font-bold mb-4">INFORMACIÓN</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onOpenModal('howToBuy')}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  CÓMO COMPRAR
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenModal('faq')}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  PREGUNTAS FRECUENTES
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenModal('storeLocations')}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  PUNTOS DE VENTA
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Links legales */}
          <div>
            <h3 className="text-lg font-bold mb-4">LEGAL</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onOpenModal('terms')}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  TÉRMINOS Y CONDICIONES
                </button>
              </li>
              <li>
                <a
                  href="/atencion_cliente"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  ATENCIÓN AL CLIENTE
                </a>
              </li>
              <li>
                <button
                  onClick={() => onOpenModal('privacy')}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  AVISO DE PRIVACIDAD
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Redes Sociales */}
          <div>
            <h3 className="text-lg font-bold mb-4">SÍGUENOS</h3>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-primary transition-colors"
                    aria-label={social.name}
                  >
                    <Icon size={20} />
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        {/* Powered By */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} SistemaTickets 365soft. Todos los derechos reservados.</p>
          <p className="mt-2">Powered by 365soft</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
