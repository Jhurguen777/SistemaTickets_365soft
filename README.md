# 🎫 Sistema de Tickets - Frontend

Frontend para sistema de venta de tickets con certificados personalizados, tiempo real con Socket.IO y la identidad visual Alfa.

## 🚀 Stack Tecnológico

- **Framework**: React 18
- **Build Tool**: Vite 5
- **Lenguaje**: TypeScript
- **Routing**: React Router v6
- **State Management**: Zustand
- **Server State**: TanStack Query
- **Styling**: TailwindCSS
- **WebSocket**: Socket.IO Client
- **HTTP Client**: Axios
- **Editor**: TipTap (certificados)

## 📋 Requisitos Previos

- Node.js 20+
- Backend corriendo en `http://localhost:3000`

## 🎨 Identidad Visual - Paleta Alfa

El sistema utiliza la paleta de colores **Alfa** con soporte para modo claro y oscuro:

### Colores Principales

| Nombre | Color | Uso |
|--------|--------|------|
| **Azul Alfa** | #233C7A | Color principal, botones, enlaces, estados activos |
| **Rojo Alfa** | #E0081D | Acciones destructivas, errores, eliminar |
| **Amarillo Alfa** | #FAB90E | Color de acento, notificaciones, highlights |
| **Gris Neutro** | #F5F5F5 | Fondos, bordes, muted |
| **Negro Elegante** | #212121 | Textos, títulos, foreground |

### Logos Dinámicos

El sistema cambia automáticamente el logo según el tema:

- **Modo Claro**: `/assets/alfa-positivo.png`
- **Modo Oscuro**: `/assets/alfa-negativo.png`

Los logos están ubicados en `public/assets/` y se gestionan automáticamente en el componente `Header.tsx`.

### Uso de Colores

Los componentes usan clases Tailwind que se mapean a variables CSS:

```tsx
// Color principal (Azul Alfa)
className="bg-primary text-primary-foreground"

// Color secundario/destructive (Rojo Alfa)
className="bg-destructive text-destructive-foreground"

// Color de acento (Amarillo Alfa)
className="bg-accent text-accent-foreground"

// Fondos y textos
className="bg-background text-foreground"
className="bg-card text-card-foreground"
```

## 🎭 Sistema de Temas

La aplicación soporta cambio dinámico entre tema claro y oscuro:

```tsx
import { useTheme } from '@/contexts/ThemeContext'

function MiComponente() {
  const { theme, setTheme } = useTheme()

  return (
    <button onClick={() => setTheme(theme === 'claro' ? 'oscuro' : 'claro')}>
      Cambiar a {theme === 'claro' ? 'Oscuro' : 'Claro'}
    </button>
  )
}
```

## 🔧 Instalación

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Editar .env si es necesario
# - VITE_API_URL
# - VITE_SOCKET_URL
```

## 🎯 Modos de Ejecución

### Desarrollo

```bash
npm run dev
```

La aplicación arrancará en `http://localhost:5173`

### Producción

```bash
# Build
npm run build

# Preview del build
npm run preview
```

## 📁 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo
npm run build            # Compila para producción

# Utilidades
npm run lint            # Ejecuta ESLint
npm run preview          # Preview del build de producción
```

## 🎭 Temas y Modos

La aplicación tiene soporte completo para tema claro y oscuro:

- **Tema Claro**: Fondo blanco/gris claro, texto oscuro, logo Alfa Positivo
- **Tema Oscuro**: Fondo gris oscuro/negro, texto claro, logo Alfa Negativo

El tema se guarda en `localStorage` y persiste entre sesiones.

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── ui/                  # Componentes base reutilizables
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   ├── layout/              # Layout de la aplicación
│   │   ├── Header.tsx       # Header con logos dinámicos
│   │   └── Footer.tsx
│   ├── home/                # Componentes del home
│   │   ├── BannerCarousel.tsx
│   │   ├── CategoryMenu.tsx
│   │   ├── EventCard.tsx
│   │   └── EventGrid.tsx
│   ├── admin/               # Componentes del panel admin
│   │   ├── AdminLayout.tsx
│   │   ├── EventCard.tsx
│   │   └── QRScanner.tsx
│   ├── certificate-editor/ # Editor de certificados TipTap
│   │   ├── CertificateEditor.tsx
│   │   ├── CertificatePreview.tsx
│   │   ├── TemplateSelector.tsx
│   │   └── VariablesSidebar.tsx
│   ├── modals/              # Modales de la aplicación
│   │   ├── LoginModal.tsx
│   │   ├── PaymentMethodsModal.tsx
│   │   ├── FAQModal.tsx
│   │   └── ...
│   └── auth/                # Autenticación
│       └── ProtectedRoute.tsx
├── contexts/              # Contexts globales
│   └── ThemeContext.tsx       # Gestión de temas (claro/oscuro)
├── pages/                 # Páginas de la aplicación
│   ├── Home.tsx
│   ├── EventDetail.tsx
│   ├── SeatSelection.tsx
│   ├── Checkout.tsx
│   ├── PurchaseSuccess.tsx
│   ├── MisCompras.tsx
│   ├── auth/
│   │   ├── Login.tsx
│   │   └── CompleteProfile.tsx
│   └── admin/
│       ├── Dashboard.tsx
│       ├── events/
│       ├── users/
│       └── Attendance.tsx
├── store/                 # Zustand stores
│   ├── authStore.ts        # Estado de autenticación
│   └── adminStore.ts      # Estado del panel admin
├── services/              # Servicios externos
│   ├── api.ts             # Cliente Axios
│   ├── socket.ts          # Socket.IO Client
│   └── adminService.ts    # Servicios del admin
├── types/                 # TypeScript types
│   ├── index.ts
│   └── admin.ts
├── lib/                   # Librerías y configuraciones
│   └── tiptap/           # Extensiones TipTap
├── utils/                 # Utilidades
│   └── cn.ts             # Classnames utility
├── assets/               # Archivos estáticos
│   ├── alfa-positivo.png
│   └── alfa-negativo.png
└── main.tsx               # Entry point
```

## 🎨 Páginas

- `/` - Home
- `/login` - Login con Google OAuth
- `/eventos` - Listado de eventos
- `/eventos/:id` - Detalle de evento
- `/eventos/:id/asientos` - Selección de asientos (tiempo real)
- `/checkout` - Proceso de pago
- `/mis-compras` - Historial de compras
- `/admin` - Panel de administración

## 🔌 WebSocket Events

### Suscribirse a eventos

```typescript
import socketService from '@/services/socket'

// Conectar
socketService.connect()

// Unirse a un evento
socketService.joinEvent(eventId)

// Escuchar actualizaciones de asientos
socketService.onSeatsUpdate((data) => {
  console.log('Asientos:', data)
})

// Escuchar asiento reservado
socketService.onSeatReserved((data) => {
  console.log('Asiento reservado:', data.asientoId)
})
```

### Enviar eventos

```typescript
// Reservar asiento
socketService.reserveSeat({
  eventoId: '123',
  asientoId: '456',
  userId: '789'
})
```

## 🎨 Componentes UI

El proyecto usa TailwindCSS con un sistema de diseño similar a shadcn/ui:

```typescript
import { cn } from '@/utils/cn'

function Button({ className, ...props }) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-lg font-medium",
        "bg-primary text-primary-foreground",
        "hover:bg-primary/90",
        className
      )}
      {...props}
    />
  )
}
```

## 📦 Deploy en Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy en producción
vercel --prod
```

### Variables de Entorno en Vercel

Configura estas variables en el dashboard de Vercel:

```bash
VITE_API_URL=https://tu-backend.railway.app/api
VITE_SOCKET_URL=https://tu-backend.railway.app
```

## 🔗 Integración con Backend

El frontend se comunica con el backend mediante:

1. **HTTP REST API** (via Axios)
   - Autenticación
   - CRUD de eventos
   - Procesamiento de pagos
   - Descarga de certificados

2. **WebSocket** (via Socket.IO)
   - Selección de asientos en tiempo real
   - Sincronización entre múltiples usuarios
   - Notificaciones instantáneas

## 📚 Recursos

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)

## 👨‍💻 Autor

365soft

## 📄 Licencia

MIT