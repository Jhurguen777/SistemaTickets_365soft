# Documentación - Sistema de Eventos y Selección de Asientos (Frontend)

## 📋 Tabla de Contenidos

1. [Overview](#overview)
2. [Estructura de Componentes](#estructura-de-componentes)
3. [Flujo de Usuario](#flujo-de-usuario)
4. [Configuración de Mapa de Asientos](#configuración-de-mapa-de-asientos)
5. [Estados y Colores](#estados-y-colores)
6. [Sistema de Contador](#sistema-de-contador)
7. [APIs Utilizadas](#apis-utilizadas)
8. [Estructura de Datos](#estructura-de-datos)

---

## Overview

El sistema de eventos permite a los usuarios:
- Ver listado de eventos
- Ver detalles de un evento
- Seleccionar asientos de un mapa interactivo
- Completar la compra de entradas

### Características Principales
- ✅ Mapa de asientos interactivo y personalizable
- ✅ Sectores con precios y colores diferentes
- ✅ Asientos especiales (VIP, Platea, etc.)
- ✅ Contador de 10 minutos para evitar compras duplicadas
- ✅ Integración con WebSocket para actualizaciones en tiempo real
- ✅ Sistema de verificación de disponibilidad

---

## Estructura de Componentes

### 1. **Home (EventGrid)**
**Ubicación:** `src/components/home/EventGrid.tsx`

Muestra una grilla con todos los eventos disponibles.

**Funciones:**
- Carga eventos desde la API: `GET /api/eventos`
- Transforma datos del backend al formato del frontend
- Muestra estado de carga y errores

**Flujo:**
```
Usuario → Home → Selecciona Evento → EventDetail
```

---

### 2. **Detalle de Evento**
**Ubicación:** `src/pages/EventDetail.tsx`

Muestra información completa del evento.

**Funciones:**
- Carga detalles del evento: `GET /api/eventos/:id`
- Muestra imagen, fecha, hora, ubicación, capacidad
- Botón "Comprar Entradas" → navega a selección de asientos

**API Response:**
```typescript
{
  id: string
  titulo: string
  descripcion: string
  imagenUrl: string
  fecha: string
  hora: string
  ubicacion: string
  capacidad: number
  precio: number
  seatMapConfig?: SeatMapConfig
}
```

---

### 3. **Selección de Asientos** ⭐
**Ubicación:** `src/pages/SeatSelection.tsx`

Componente principal para seleccionar asientos.

#### Características:
- **Contador de 10 minutos:** Inicia al entrar a la página
- **Mapa interactivo:** Click para seleccionar/deseleccionar
- **Leyendas:** Sectores y estados con colores
- **Verificación de disponibilidad:** Confirma asientos antes de pagar
- **Máximo 10 asientos** por compra

#### Layout:
```
┌─────────────────────────────────────────────────┐
│  Header (Contador siempre visible)              │
├──────────────┬──────────────────────────────────┤
│ Sidebar      │  Mapa de Asientos                │
│ (1 columna)  │  (3 columnas)                    │
│              │                                  │
│ - Contador   │  - ESCENARIO                     │
│ - Total      │  - Leyenda Sectores              │
│ - Verificar  │  - Leyenda Estados               │
│ - Continuar  │  - Grilla de Asientos            │
│ - Lista      │                                  │
└──────────────┴──────────────────────────────────┘
```

---

## Flujo de Usuario

### 1. Usuario ve Home
```
Home → GET /api/eventos → Muestra eventos
```

### 2. Usuario selecciona evento
```
EventDetail → GET /api/eventos/:id → Muestra detalles
```

### 3. Usuario hace clic en "Comprar Entradas"
```
EventDetail → navigate('/eventos/:id/asientos') → SeatSelection
```

### 4. SeatSelection inicia
```
- Inicia contador de 10 minutos
- Carga configuración del mapa de asientos
- Genera asientos basados en la configuración
```

### 5. Usuario selecciona asientos
```
Click en asiento → toggleSeat() → setSelectedSeats()
- Máximo 10 asientos
- Solo asientos disponibles (AVAILABLE)
```

### 6. Usuario hace clic en "Verificar Disponibilidad"
```
Verificar → Confirmación → Alert de verificación
```

### 7. Usuario hace clic en "Continuar al pago"
```
Checkout → navigate('/checkout') → Proceso de pago
```

---

## Configuración de Mapa de Asientos

### ¿Cómo se configura?

Desde el **Panel de Administrador** → Crear/Editar Evento → Botón "Dibujar Mapa de Asientos"

### Estructura de Configuración

```typescript
interface SeatMapConfig {
  sectors?: Sector[]      // Sectores confirmados
  rows?: Row[]            // Filas de asientos
  specialSeats?: SpecialSeat[]  // Asientos personalizados
}
```

#### 1. **Sectores** (Confirmados)
Definen los sectores que aplican a filas completas.

```typescript
interface Sector {
  id: string          // Ej: "sector-1"
  name: string        // Ej: "General", "VIP"
  color: string       // Ej: "#10B981" (verde)
  price: number       // Ej: 150
}
```

#### 2. **Filas**
Definen la estructura física del teatro.

```typescript
interface Row {
  id: string          // Ej: "row-a"
  name: string        // Ej: "A", "B", "C"
  seats: number       // Ej: 20 asientos
  columns: number     // Ej: 2 columnas (separadas por pasillo)
  order: number       // Ej: 1 (primera fila)
  sectorId?: string   // ID del sector que aplica a esta fila
}
```

#### 3. **Asientos Especiales**
Asientos individuales con configuración personalizada.

```typescript
interface SpecialSeat {
  rowId: string       // ID de la fila
  seatIndex: number   // Índice del asiento (0-based)
  sectorName?: string // Ej: "VIP"
  color?: string      // Ej: "#FFD700" (dorado)
  price?: number      // Ej: 300
}
```

---

## Estados y Colores

### Estados de Asientos

| Estado | Color | Descripción |
|--------|-------|-------------|
| **AVAILABLE** | Verde (o color del sector) | Disponible para seleccionar |
| **OCCUPIED** | Rojo | Ya está vendido/reservado |
| **SELECTED** | Púrpura | Seleccionado por el usuario actual |

### Colores por Defecto

- **Disponible:** Verde (`#10B981`)
- **Ocupado:** Rojo (`#EF4444`)
- **Seleccionado:** Púrpura (`#8B5CF6`)
- **VIP:** Dorado (`#FFD700`)
- **Platea:** Azul (`#3B82F6`)

---

## Sistema de Contador

### Funcionamiento

1. **Inicio:** Al entrar a `SeatSelection`, el contador inicia en 10:00
2. **Cuenta regresiva:** Resta 1 segundo cada segundo
3. **Alerta:** Cambia a color rojo cuando quedan menos de 1 minuto
4. **Expiración:** Al llegar a 0:00, libera todos los asientos y reinicia

### Código

```typescript
const [timeLeft, setTimeLeft] = useState(600) // 10 minutos
const [isTimerActive, setIsTimerActive] = useState(true)

useEffect(() => {
  if (!isTimerActive || timeLeft <= 0) return

  const timer = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        setSelectedSeats([])  // Liberar asientos
        setIsTimerActive(false)
        alert('Tiempo agotado')
        return 600  // Reiniciar
      }
      return prev - 1
    })
  }, 1000)

  return () => clearInterval(timer)
}, [isTimerActive, timeLeft])
```

### Visualización

El contador se muestra en 2 lugares:
1. **Header** (arriba a la derecha) - Siempre visible
2. **Sidebar** (Resumen de compra) - Siempre visible

Formato: `MM:SS` (ej: 10:00, 09:45, 00:30)

---

## APIs Utilizadas

### 1. Obtener Todos los Eventos
```
GET /api/eventos
```

**Response:**
```json
{
  "data": {
    "eventos": [
      {
        "id": "evt-123",
        "titulo": "Vibra Carnavalera 2026",
        "imagenUrl": "/media/banners/evento.jpg",
        "fecha": "2026-02-20",
        "hora": "20:00",
        "ubicacion": "Estadio Olímpico",
        "precio": 150
      }
    ]
  }
}
```

---

### 2. Obtener Detalle de Evento
```
GET /api/eventos/:id
```

**Response:**
```json
{
  "data": {
    "id": "evt-123",
    "titulo": "Vibra Carnavalera 2026",
    "descripcion": "Descripción completa...",
    "imagenUrl": "/media/banners/evento.jpg",
    "fecha": "2026-02-20",
    "hora": "20:00",
    "doorsOpen": "19:00",
    "ubicacion": "Estadio Olímpico",
    "direccion": "Av. Principal 123",
    "capacidad": 5000,
    "precio": 150,
    "seatMapConfig": {
      "sectors": [...],
      "rows": [...],
      "specialSeats": [...]
    }
  }
}
```

---

### 3. WebSocket (Reserva de Asientos)

**Conexión:**
```typescript
socketService.connect()
socketService.joinEvent(eventId)
```

**Evento: Asiento Reservado**
```typescript
socketService.onSeatReserved((data) => {
  // data = { seatId: "A-1" }
  setSeats(prevSeats =>
    prevSeats.map(seat =>
      seat.id === data.seatId
        ? { ...seat, status: 'OCCUPIED' }
        : seat
    )
  )
})
```

**Reservar Asiento:**
```typescript
socketService.reserveSeat({
  eventoId: eventId,
  asientoId: seat.id,
  userId: user?.id || 'guest'
})
```

---

## Estructura de Datos

### Event (Frontend)
```typescript
interface Event {
  id: string
  title: string
  description: string
  longDescription: string
  image: string
  date: string          // ISO date
  time: string          // HH:MM
  doorsOpen: string     // HH:MM
  location: string
  address: string
  capacity: number
  price: number
  category: string
  subcategory: string
  organizer: string
  status: string
  sectors: Sector[]
  gallery: string[]
}
```

### Seat (Asiento)
```typescript
interface Seat {
  id: string           // Ej: "A-1" (Fila A, Asiento 1)
  row: string          // Ej: "A"
  number: number       // Ej: 1
  status: 'AVAILABLE' | 'OCCUPIED'
  price: number        // Precio según sector
  sectorId?: string    // ID del sector
  sectorName?: string  // Nombre del sector
  color?: string       // Color del sector
}
```

### SeatMapConfig
```typescript
interface SeatMapConfig {
  sectors?: Sector[]
  rows?: Row[]
  specialSeats?: SpecialSeat[]
}
```

---

## Panel de Administrador

### Crear/Editar Evento con Mapa de Asientos

**Ubicación:** `src/pages/admin/events/EventForm.tsx`

1. Llenar datos básicos del evento
2. Click en "Dibujar Mapa de Asientos"
3. Se abre el editor de mapa:

#### Editor de Mapa de Asientos
**Ubicación:** `src/pages/admin/events/SeatMapEditor.tsx`

**Funciones:**
- **Agregar Sectores:** Define sectores con nombre, color y precio
- **Agregar Filas:** Define filas con nombre, cantidad de asientos, columnas
- **Personalizar Asientos:** Click en asiento individual para hacerlo especial (VIP, etc.)

**Pasos:**
1. Crear sectores (General, VIP, Platea, etc.)
2. Crear filas (A, B, C, etc.) con número de asientos
3. Asignar sector a cada fila (opcional)
4. Personalizar asientos individuales (opcional)
5. Click en "Guardar y cerrar"

#### Vista Previa del Mapa
**Ubicación:** `src/pages/admin/events/EventDetail.tsx` (Admin)

En el detalle del evento admin, hay un botón "Ver Mapa de Asientos" que muestra:
- Escenario
- Leyenda de sectores (con colores y precios)
- Leyenda de estados
- Vista previa de todos los asientos

---

## Buenas Prácticas

### 1. **Manejo de Errores**
```typescript
try {
  const response = await api.get(`/eventos/${id}`)
  setEvent(response.data.data)
} catch (error) {
  console.error('Error:', error)
  setError('Error al cargar el evento')
}
```

### 2. **Estados de Carga**
```typescript
if (loading) {
  return <div>Cargando...</div>
}

if (error) {
  return <div>Error: {error}</div>
}
```

### 3. **Transformación de Datos**
```typescript
const formattedEvent: Event = {
  id: evt.id,
  title: evt.titulo,  // Backend usa español
  image: evt.imagenUrl || '/media/banners/default.jpg',
  date: new Date(evt.fecha).toISOString().split('T')[0],
  // ...
}
```

---

## Troubleshooting

### Problema: Los asientos no se muestran
**Solución:** Verificar que el evento tenga `seatMapConfig` en la respuesta de la API.

### Problema: El contador no inicia
**Solución:** Verificar que `isTimerActive` esté en `true` desde el inicio en `SeatSelection.tsx`.

### Problema: Los colores de sectores no se muestran
**Solución:** Verificar que los sectores tengan un color válido en formato hexadecimal (`#RRGGBB`).

### Problema: Los asientos especiales no aparecen en la leyenda
**Solución:** Verificar que los asientos especiales tengan `sectorName` definido.

---

## Archivos Principales

| Archivo | Descripción |
|---------|-------------|
| `src/components/home/EventGrid.tsx` | Grilla de eventos en home |
| `src/pages/EventDetail.tsx` | Detalle de evento (usuario) |
| `src/pages/SeatSelection.tsx` | Selección de asientos |
| `src/pages/admin/events/EventForm.tsx` | Crear/editar evento |
| `src/pages/admin/events/SeatMapEditor.tsx` | Editor de mapa de asientos |
| `src/pages/admin/events/EventDetail.tsx` | Vista previa del mapa (admin) |
| `src/services/api.ts` | Cliente HTTP |
| `src/services/socket.ts` | Cliente WebSocket |

---

## Próximos Pasos

Para continuar desarrollando:

1. ✅ Sistema de eventos y selección de asientos
2. ⏳ Proceso de pago (Checkout)
3. ⏳ Generación de tickets/entradas
4. ⏳ Historial de compras del usuario
5. ⏳ Validación de asientos en backend
6. ⏳ Sistema de reservas con expiración

---

**Última actualización:** Febrero 2026
**Versión:** 1.0.0
