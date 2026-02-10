# 🎫 Sistema de Tickets - Frontend

Frontend para sistema de venta de tickets con certificados personalizados, tiempo real con Socket.IO.

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

## 📋 Requisitos Previos

- Node.js 20+
- Backend corriendo en `http://localhost:3000`

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

## 📁 Estructura del Proyecto

```
src/
├── components/       # Componentes React
│   ├── ui/          # Componentes base (shadcn/ui)
│   └── layout/      # Componentes de layout
├── pages/           # Páginas de la aplicación
├── hooks/           # Custom React hooks
├── services/        # Servicios externos
│   ├── api.ts       # Cliente Axios
│   └── socket.ts    # Socket.IO Client
├── store/           # Zustand stores
│   ├── authStore.ts # Autenticación
│   └── cartStore.ts # Carrito de compras
├── types/           # TypeScript types
├── utils/           # Utilidades
└── main.tsx         # Entry point
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