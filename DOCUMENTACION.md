# SistemaTickets 365soft - Documentación Funcional

## Tabla de Contenidos

1. [Visión General](#1-visión-general)
2. [Diagrama de Flujo - Usuario Final](#2-diagrama-de-flujo---usuario-final)
3. [Diagrama de Flujo - Panel Administrador](#3-diagrama-de-flujo---panel-administrador)
4. [Descripción Detallada de Componentes](#4-descripción-detallada-de-componentes)
5. [Panel de Administración](#5-panel-de-administración)
6. [Requerimientos Técnicos](#6-requerimientos-técnicos-frontend)
7. [Pendientes y Futuras Implementaciones](#7-pendientes-y-futuras-implementaciones)

---

## 1. Visión General

**SistemaTickets 365soft** es una plataforma web para la venta y gestión de entradas de eventos, similar a SuperTicket, diseñada para facilitar la compra en línea de entradas para eventos como conciertos, fiestas, teatro, deportes y ferias.

### Características Principales

- 🎟️ **Compra de entradas en línea** con selección de asientos en tiempo real
- 👤 **Autenticación con Google** para acceso rápido y seguro
- 📱 **Entradas digitales con código QR** para check-in en eventos
- 📊 **Panel de administración** para gestión completa de eventos
- 📈 **Reportes de ventas y asistencia** para análisis de negocio

---

## 2. Diagrama de Flujo - Usuario Final

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FLUJO DE USUARIO FINAL                         │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────┐
  │   INICIO  │
  └─────┬────┘
        │
        ▼
  ┌─────────────────┐
  │  PÁGINA DE     │
  │     INICIO      │
  │ • Ver eventos   │
  │ • Buscador      │
  │ • Categorías    │
  └───────┬─────────┘
          │
          ▼
  ┌─────────────────┐
  │  VER LISTADO DE │
  │    EVENTOS      │
  └───────┬─────────┘
          │
          │ Usuario hace click en un evento
          ▼
  ┌─────────────────┐
  │  DETALLES DEL   │
  │     EVENTO      │
  │                 │
  │ • Fecha/Hora    │
  │ • Ubicación     │
  │ • Capacidad     │
  │ • Organizador   │
  │ • Descripción   │
  │ • Galería       │
  │                 │
  │ [COMPRAR ENTRADAS]
  └───────┬─────────┘
          │
          ▼
  ┌─────────────────┐
  │ SELECCIONAR     │
  │    SECTOR       │
  │                 │
  │ ○ General Bs 150│
  │ ○ VIP Bs 350    │
  │ ○ Super VIP     │
  │   Bs 500        │
  └───────┬─────────┘
          │
          ▼
  ┌─────────────────┐
  │ SELECCIONAR     │
  │    ASIENTOS     │
  │                 │
  │    [ESCENARIO]   │
  │  [A1][A2][A3]  │
  │  [B1][B2][B3]  │
  │                 │
  │ Máx: 10 asientos│
  │                 │
  │ [CONTINUAR PAGO] │
  └───────┬─────────┘
          │
          ▼
  ┌─────────────────┐
  │   ¿ESTÁ         │
  │   LOGUEADO?     │
  └───────┬─────────┘
          │
    ┌─────┴─────┐
    │ NO         │ SÍ
    ▼           ▼
┌─────────┐  ┌─────────────────┐
│ LOGIN   │  │   FORMULARIO DE │
│ GOOGLE  │  │   DATOS         │
└────┬────┘  │   PERSONALES    │
     │       │                 │
     │       │ Para cada       │
     └──────→│ entrada:       │
             │ • Nombre        │
             │ • Apellido      │
             │ • Email         │
             │ • Teléfono      │
             │ • CI            │
             │ • Dirección     │
             │                │
             │ Continuar al pago│
             └────────┬────────┘
                      │
                      ▼
             ┌─────────────────┐
             │   MÉTODO DE     │
             │      PAGO       │
             │                │
             │ ○ Tarjeta       │
             │ ○ QR Simple     │
             │ ○ BaniPay       │
             │                │
             │ [CONFIRMAR]     │
             └────────┬────────┘
                      │
                      ▼
             ┌─────────────────┐
             │   COMPRA        │
             │   EXITOSA ✓     │
             │                │
             │ • Código QR     │
             │ • Certificado   │
             │ • Email de     │
             │   confirmación │
             └────────┬────────┘
                      │
                      ▼
             ┌─────────────────┐
             │   MIS COMPRAS    │
             │   (Ver tickets)  │
             └─────────────────┘
```

---

## 3. Diagrama de Flujo - Panel Administrador

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      FLUJO DE ADMINISTRADOR                               │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────┐
  │   INICIO  │
  └─────┬────┘
        │
        ▼
  ┌─────────────────┐
  │   LOGIN ADMIN   │
  │                 │
  │ Email/Password  │
  └───────┬─────────┘
          │
          ▼
  ┌─────────────────────────────────────────────────────────┐
  │              DASHBOARD HORIZONTAL                      │
  │                                                       │
  │  ┌──────────┬──────────┬──────────┬──────────┐     │
  │  │Dashboard │ Eventos  │ Usuarios  │ Reportes  │     │
  │  └──────────┴──────────┴──────────┴──────────┘     │
  │  ┌──────────┬──────────┬──────────┬──────────┐     │
  │  │Config.   │ Accesos  │                                │
  │  └──────────┴──────────┘                            │
  └───────────────────────┬───────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
    ┌─────────┐   ┌─────────┐   ┌─────────┐
    │DASHBOARD │   │ EVENTOS │   │USUARIOS │
    │         │   │         │   │         │
    │• Ver    │   │• Crear  │   │• Ver    │
    │  stats  │   │  nuevo  │   │  lista  │
    │• Ver    │   │• Editar │   │• Bloquear│
    │  eventos│   │• Eliminar│   │• Historial│
    │• Ver    │   │         │   │         │
    │  inscritos│  └────┬────┘   └────┬────┘
    └────┬────┘       │             │
         │            ▼             │
         │      ┌──────────┐         │
         │      │Crear     │         │
         │      │Evento:   │         │
         │      │• Título  │         │
         │      │• Descrip. │         │
         │      │• Precio  │         │
         │      │• Fecha   │         │
         │      │• Imagen  │         │
         │      │• Categor. │         │
         │      │• Sectores │         │
         │      └──────────┘         │
         │                            │
         ▼                            ▼
  ┌─────────────────┐       ┌─────────────────┐
  │ DETALLE EVENTO │       │    REPORTES     │
  │ Y ASISTENCIA   │       │                 │
  │                │       │ • Ventas por    │
  │ TABLA INSCRITOS│       │   evento       │
  │                │       │ • Ingresos      │
  │ [Expandir]     │       │ • Asistencia   │
  │ Juan Pérez (3)  │       │ • Tendencias   │
  │  └─ Juan (✓)   │       │ • Exportar     │
  │  └─ Ana (✓)    │       └─────────────────┘
  │  └─ Carlos (✗)  │
  │                │       ┌─────────────────┐
  │ SECCIÓN        │       │  CONFIGURACIÓN  │
  │ ASISTENCIA      │       │                │
  │ • QR Scanner    │       │ • Tema claro/  │
  │ • Check-in      │       │   oscuro       │
  │ • Lista        │       │ • Datos sitio   │
  │   asistentes   │       │ • Redes sociales│
  └─────────────────┘       │ • Métodos pago │
                            └─────────────────┘

                          ┌─────────────────┐
                          │    ACCESOS      │
                          │                │
                          │ • Ver admins    │
                          │ • Crear admin   │
                          │ • Roles        │
                          │ • Historial     │
                          └─────────────────┘
```

---

## 4. Descripción Detallada de Componentes

### 4.1 Página de Inicio (Home)

**Ruta:** `/`

**Funcionalidades:**
- Carrusel de banners destacados
- Menú de categorías (Fiestas, Conciertos, Teatro, Deportes, Ferias)
- Buscador de eventos
- Grid de eventos con filtros
- Sección informativa "Por qué elegirnos"

---

### 4.2 Detalle de Evento

**Ruta:** `/eventos/:id`

**Información mostrada:**

**A. Información Básica**
- Título del evento
- Descripción corta
- Categoría y subcategoría
- Estado (Activo / Inactivo)

**B. Información Logística**
- Fecha y hora del evento
- Hora de apertura de puertas
- Ubicación: "Estadio Olímpico, La Paz"
- Dirección completa
- Capacidad total
- Organizador

**C. Media**
- Imagen principal del evento
- Galería de imágenes adicionales

**D. Contenido**
- Descripción larga del evento

**E. Compra de Entradas**
- Sectores disponibles:
  - General: Bs 150
  - VIP: Bs 350
  - Super VIP: Bs 500
- Asientos disponibles por sector
- Botón "Comprar Entradas"

---

### 4.3 Selección de Asientos

**Ruta:** `/eventos/:id/asientos`

**Características:**

**A. Mapa Interactivo del Escenario**
- Visualización del escenario
- Grid de asientos organizados por filas (A-T) y columnas
- 3 bloques de asientos por fila

**B. Códigos de Color**
- ⬜ **Blanco** = Disponible
- 🟢 **Verde** = Seleccionado por el usuario
- 🟡 **Amarillo** = Reservado por otro usuario
- ⬛ **Gris** = Ocupado/Vendido

**C. Funcionalidades**
- Selección de hasta 10 asientos por compra
- Actualización en tiempo real mediante WebSocket
- Resumen de selección:
  - Asientos seleccionados (Fila + Número)
  - Precio por asiento
  - Total a pagar

**D. Validaciones**
- Máximo 10 asientos por persona
- No permite seleccionar asientos ocupados o reservados

---

### 4.4 Checkout y Pago

**Ruta:** `/checkout`

**A. Formulario de Datos Personales**

**Para el comprador principal:**
- Nombre completo (mínimo 3 caracteres, solo letras)
- Apellido (mínimo 3 caracteres, solo letras)
- Email (formato válido)
- Teléfono (exactamente 10 dígitos)
- Documento de identidad - CI (mínimo 5 dígitos, solo números)
- Dirección completa
- Ciudad
- Código Postal

**Para cada entrada adicional (2°, 3°, etc.):**
- Nombre completo
- Documento de identidad - CI

**B. Validaciones del Formulario**

| Campo | Validación |
|-------|------------|
| Nombre/Apellido | Mínimo 3 caracteres, solo letras y acentos |
| Email | Formato válido de email |
| Teléfono | Exactamente 10 dígitos |
| CI | Mínimo 5 dígitos, solo números |
| Ciudad | Sin caracteres especiales |

**C. Métodos de Pago**

- Tarjeta de Crédito Visa
- Tarjeta de Crédito Mastercard
- Tarjeta American Express
- QR Simple / BaniPay

**D. Resumen del Pedido**
- Información del evento
- Sector seleccionado
- Asientos seleccionados con precios individuales
- Subtotal y total
- Tarifa de servicio (Bs 0.00)

**E. Términos y Condiciones**
- Checkbox obligatorio para aceptar términos
- Links a Términos y Condiciones
- Links a Política de Privacidad

---

### 4.5 Pantalla de Éxito

**Ruta:** `/compra-exitosa`

**Contenido:**

**A. Confirmación**
- Mensaje de compra exitosa
- Número de orden/referencia

**B. Código QR Digital**
- QR único para la entrada
- Opción de descargar

**C. Certificado de Compra**
- Certificado en PDF descargable
- Incluye todos los datos de la compra

**D. Opciones Post-Compra**
- Descargar ticket
- Ver en Mis Compras
- Ir al inicio
- Recibir email de confirmación

---

### 4.6 Mis Compras

**Ruta:** `/mis-compras`

**Funcionalidades:**

**A. Lista de Compras**
- Todas las compras realizadas por el usuario
- Ordenadas por fecha (más reciente primero)

**B. Información por Compra**
- Imagen del evento
- Título del evento
- Fecha y hora
- Cantidad de entradas
- Monto total
- Estado de pago (Pagado / Pendiente)

**C. Acciones Disponibles**
- Ver ticket/QR
- Descargar certificado PDF
- Ver detalles del evento

---

## 5. Panel de Administración

### 5.1 Autenticación de Administrador

**Ruta:** `/login`

**Credenciales:**
- **Email:** administrador@gmail.com
- **Password:** (Gestión segura en producción)

**Características:**
- Cifrado de contraseña
- Sesión con token JWT
- Recuperación de contraseña (pendiente)

---

### 5.2 Dashboard

**Ruta:** `/admin/dashboard`

**A. Tarjetas de Resumen (KPIs)**

| Tarjeta | Descripción |
|---------|-------------|
| **Total Ventas** | Monto total de ventas en Bs |
| **Eventos Activos** | Cantidad de eventos con estado ACTIVO |
| **Usuarios Registrados** | Total de usuarios con compras realizadas |
| **Próximos Eventos** | Eventos pendientes de realizarse |

**B. Gráficos de Análisis**

1. **Ventas de la Última Semana** (Gráfico de Líneas)
   - Eje X: Días de la semana
   - Eje Y: Monto en Bs
   - Tendencia de ventas diarias

2. **Ventas por Evento** (Gráfico de Barras)
   - Eje X: Nombres de eventos
   - Eje Y: Monto de ventas
   - Comparativa de rendimiento

3. **Distribución por Sector** (Gráfico Circular)
   - Sectores: General, VIP, Super VIP
   - Porcentaje de ventas por sector

**C. Tabla de Eventos Recientes**
- Últimos 5 eventos creados/actualizados
- Información: Imagen, Título, Ubicación, Fecha, Estado, Ventas
- Acciones rápidas:
  - 👁️ Ver detalle
  - ✏️ Editar

---

### 5.3 Gestión de Eventos

**Ruta:** `/admin/eventos`

**A. Listado de Eventos**

**Tabla con columnas:**
- Imagen del evento
- Título
- Fecha
- Ubicación
- Estado (badge con colores)
- Ventas totales
- Acciones (Ver, Editar, Eliminar)

**Filtros y Búsqueda:**
- Filtro por estado (Activo, Inactivo, Cancelado)
- Filtro por categoría
- Búsqueda por título

**Acciones:**
- ➕ Crear nuevo evento
- 👁️ Ver detalle del evento
- ✏️ Editar evento
- 🗑️ Eliminar evento (con confirmación)

**B. Crear/Editar Evento**

**Formulario Completo:**

**1. Información Básica**
- **Título del evento** (obligatorio, mínimo 3 caracteres)
- **Categoría** (obligatorio):
  - Fiestas
  - Conciertos
  - Teatro
  - Deportes
  - Ferias
- **Descripción corta** (obligatoria)
- **Descripción larga** (opcional, campo de texto)
- **Imagen principal** (URL de imagen)
- **Galería de imágenes** (array de URLs)

**2. Fecha y Ubicación**
- **Fecha del evento** (obligatoria)
- **Horario del evento** (obligatorio)
- **Hora apertura puertas** (opcional)
- **Capacidad total** (obligatorio, número)
- **Lugar/Ubicación** (obligatorio): Ej. "Estadio Olímpico, La Paz"
- **Dirección completa** (opcional): Ej. "Av. Saavedra #1895, La Paz, Bolivia"

**3. Sectores y Precios**
- Formulario dinámico para agregar sectores:
  - Nombre del sector (General, VIP, Super VIP)
  - Precio del sector
  - Cantidad de asientos disponibles
- Posibilidad de agregar múltiples sectores

**4. Estado del Evento**
- **Estado** (obligatorio):
  - Activo
  - Inactivo
  - Cancelado
- **Organizador** (opcional): Ej. "365soft Eventos"

---

### 5.4 Detalle del Evento (Vista Admin)

**Ruta:** `/admin/eventos/:id`

**A. Información del Evento**
- Todos los datos del evento
- Acciones: Editar, Eliminar

**B. Tabla de Inscritos**

**Estructura de la tabla:**

| COMPRADOR | CANTIDAD | ESTADO | MONTO TOTAL | ASISTENCIA |
|-----------|----------|--------|-------------|------------|
| Juan Pérez [▼] | 3 | PAGADO | Bs 450 | 2/3 ✓ |
| María González [▼] | 1 | PAGADO | Bs 150 | 1/1 ✓ |
| Carlos Mendoza [▼] | 5 | PENDIENTE | Bs 1250 | 0/5 ✗ |

**Al hacer click en [▼] (Expandir):**

```
┌───────────────────────────────────────────┐
│ ▼ Juan Pérez (COMPRADOR)               │
│   CI: 1234567                         │
│   Tel: +591 70012345                  │
│   Email: juan@gmail.com               │
│   ✓ Asistió                           │
│                                        │
│   └── Ana Pérez (INVITADO 1)           │
│       CI: 7654321                      │
│       Email: ana@gmail.com             │
│       ✓ Asistió                         │
│                                        │
│   └── Carlos Pérez (INVITADO 2)         │
│       CI: 2345678                      │
│       Email: carlos@gmail.com           │
│       ✗ No asistió                     │
└───────────────────────────────────────────┘
```

**Ventajas de este diseño:**
- La tabla principal no se hace extensa
- Se ve rápidamente quién compró y cuántas entradas
- Al expandir, se ven todos los detalles individuales
- Se puede marcar asistencia individualmente

**C. Sección de Asistencia**

**Funcionalidades:**

1. **Escáner de QR**
- Cámara del dispositivo para escanear QR
- Reconocimiento automático del código
- Marcaje automático de asistencia
- Sonido de confirmación

2. **Lista de Asistentes**
- Filtros:
  - Todos / Asistentes / No Asistentes
  - Por sector
- Búsqueda por nombre o CI
- Datos mostrados:
  - Foto (iniciales)
  - Nombre completo
  - Número de asiento
  - Sector
  - Hora de registro
  - Estado (✓ / ✗)

3. **Acciones:**
- Marcar asistencia manualmente
- Desmarcar asistencia
- Exportar lista a PDF/Excel

---

### 5.5 Usuarios (Admin)

**Ruta:** `/admin/usuarios`

**A. Lista Completa de Usuarios**

**Tabla con información:**
- Foto (iniciales)
- Nombre completo
- Email
- Teléfono
- CI
- Estado (Activo / Bloqueado)
- Total de compras
- Acciones

**B. Filtros y Búsqueda**
- Filtro por estado: Todos / Activos / Bloqueados
- Búsqueda por:
  - Nombre
  - Email
  - CI

**C. Acciones por Usuario**
- 👁️ Ver perfil completo
- 📜 Ver historial de compras
- 🔒 Bloquear cuenta
- 🔓 Desbloquear cuenta
- ✏️ Editar datos

**D. Perfil Completo del Usuario**
- Datos personales
- Historial de compras
- Total gastado
- Último acceso
- Estado de cuenta

**Utilidad del Módulo:**
- **Soporte al cliente:** Búsqueda rápida cuando un usuario contacta
- **Gestión de cuentas:** Bloquear usuarios problemáticos
- **Análisis:** Ver actividad y comportamiento del usuario

---

### 5.6 Reportes

**Ruta:** `/admin/reportes`

**A. Reporte de Ventas**

**Por Evento:**
- Listado de todos los eventos
- Ventas totales por evento
- Tickets vendidos por evento
- Porcentaje de ocupación
- Tendencia vs. período anterior

**Por Sector:**
- General, VIP, Super VIP
- Ventas totales por sector
- Tickets vendidos por sector
- Promedio de precio

**Por Período:**
- Selector de fecha: Hoy, Últimos 7 días, Último mes, Personalizado
- Gráfico de ventas en el tiempo
- Comparación con período anterior

**B. Reporte Financiero**

**Ingresos:**
- Total de ingresos
- Ingresos por evento
- Ingresos por método de pago
- Promedio de ticket (monto promedio por compra)

**Métricas:**
- Evento más vendido
- Evento con mayor ingresos
- Sector más popular
- Mejor día de ventas

**C. Reporte de Asistencia**

**Tasa de Asistencia:**
- Confirmados vs. Asistieron
- Porcentaje de asistencia
- No-shows (confirmaron pero no asistieron)

**Por Evento:**
- Asistencia total por evento
- Asistencia por sector
- Lista de no-shows

**D. Tendencias**

**Gráficos Temporales:**
- Ventas por día/semana/mes
- Crecimiento vs. período anterior
- Proyecciones basadas en datos históricos

**E. Exportación**

**Formatos disponibles:**
- PDF (para presentaciones)
- Excel (para análisis)
- CSV (para importar en otros sistemas)

---

### 5.7 Configuración

**Ruta:** `/admin/configuracion`

**A. Apariencia**

**Tema:**
- ☐ Claro
- ☐ Oscuro
- Selector de color primario

**Personalización:**
- Vista previa en tiempo real

**B. Datos del Sitio**

**Información editable:**
- Nombre del sitio
- Logo (URL de imagen)
- Slogan o descripción
- Email de contacto

**C. Redes Sociales**

**Links editables:**
- Facebook
- Twitter/X
- Instagram
- YouTube
- TikTok

**D. Métodos de Pago**

**Activar/Desactivar:**
- ☐ Tarjeta de Crédito Visa
- ☐ Tarjeta de Crédito Mastercard
- ☐ Tarjeta American Express
- ☐ QR Simple
- ☐ BaniPay
- ☐ TIGO MONEY

**E. Textos Legales**

**Editores de texto enriquecido:**
- Términos y condiciones
- Política de privacidad
- Aviso legal
- Política de reembolso

---

### 5.8 Accesos

**Ruta:** `/admin/accesos`

**A. Gestión de Administradores**

**Lista de Administradores:**
- Nombre completo
- Email
- Rol asignado
- Estado (Activo/Inactivo)
- Último acceso
- Acciones

**Roles Disponibles:**

| Rol | Permisos |
|-----|----------|
| **Super Admin** | Acceso total a todos los módulos |
| **Gestor de Eventos** | Solo módulo de Eventos (crear, editar, eliminar) |
| **Gestor de Reportes** | Solo módulo de Reportes (ver, exportar) |
| **Gestor de Asistencia** | Solo módulo de Asistencia (escanear QR, marcar) |
| **Gestor de Usuarios** | Solo módulo de Usuarios (ver, bloquear) |

**Crear Nuevo Administrador:**
- Formulario con:
  - Nombre completo
  - Email
  - Contraseña (o generar automáticamente)
  - Rol a asignar
- Envío de email de bienvenida

**B. Historial de Actividad**

**Registro de Auditoría:**
- ¿Quién entró? (Administrador/Usuario)
- ¿Cuándo entró? (Fecha y hora)
- ¿Desde dónde? (IP, dispositivo, navegador)
- ¿Qué acciones realizó?
  - Creó evento X
  - Modificó evento Y
  - Eliminó usuario Z
  - Marcó asistencia de W personas

**Filtros:**
- Por administrador
- Por fecha
- Por tipo de acción

**C. Sesiones Activas**

**Visualización:**
- Administradores actualmente conectados
- Hora de inicio de sesión
- Ubicación (IP)

**Acciones:**
- Ver detalles de sesión
- Cerrar sesión remotamente (logout forzado)

---

## 6. Requerimientos Técnicos (Frontend)

### 6.1 Stack Tecnológico

| Tecnología | Versión | Uso |
|-----------|----------|-----|
| **React** | 18.2.0 | Framework de UI |
| **TypeScript** | 5.4.3 | Tipado estático |
| **Vite** | 5.1.6 | Bundler y dev server |
| **TailwindCSS** | 3.4.1 | Framework de estilos |
| **React Router** | 6.22.0 | Enrutamiento |
| **Zustand** | 4.5.0 | Gestión de estado |
| **React Query** | 5.28.0 | Fetching y caché de datos |
| **Socket.IO Client** | 4.7.5 | Conexiones WebSocket en tiempo real |
| **Recharts** | 3.7.0 | Gráficos para el panel admin |
| **Lucide React** | 0.344.0 | Iconos |
| **Axios** | 1.6.7 | Cliente HTTP |

### 6.2 Características del Frontend

**A. Responsive Design**
- Optimizado para:
  - Móvil (320px+)
  - Tablet (768px+)
  - Desktop (1024px+)
- Diseño adaptativo con TailwindCSS

**B. PWA Ready**
- Instalable en dispositivos móviles
- Funciona offline (con caché)
- Notificaciones push (pendiente)

**C. WebSocket**
- Selección de asientos en tiempo real
- Actualización de disponibilidad
- Reserva temporal de asientos

**D. Google Auth**
- Autenticación con Firebase/Google
- Gestión de tokens
- Refresco automático de sesión

**E. QR Code**
- **Generación:** `qrcode.react`
- **Lectura:** `react-qr-reader` (pendiente)

### 6.3 Variables de Entorno

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

---

## 7. Pendientes y Futuras Implementaciones

### 7.1 Método de Pago

**Estado:** Pendiente de definición

**Opciones para Bolivia:**

1. **BiniPay**
   - Pasarela de pago boliviana
   - Integra múltiples bancos
   - QR y tarjetas

2. **QR Simple**
   - Pagos vía QR de bancos
   - Popular en Bolivia

3. **TIGO MONEY**
   - Billetera móvil
   - Amplia penetración

**Pasarelas Internacionales (requieren backend):**

1. **Stripe**
   - Amplia variedad de métodos
   - Documentación completa
   - Requiere backend para seguridad

2. **PayPal**
   - Reconocimiento global
   - Facilidad de integración
   - Requiere backend

**Recomendación:** Implementar BiniPay + QR Simple para el contexto boliviano.

---

### 7.2 Check-in por QR

**Estado:** Por implementar

**Flujo Completo:**

1. **Usuario**
   - Descarga su ticket con QR
   - Se presenta en la entrada del evento

2. **Administrador (Módulo de Asistencia)**
   - Abre el escáner de QR
   - Apunta la cámara al QR del usuario

3. **Sistema**
   - Valida el QR
   - Verifica que el ticket sea para ese evento
   - Marca automáticamente la asistencia
   - Muestra confirmación visual y sonora

4. **Base de Datos**
   - Actualiza el estado de asistencia
   - Registra la hora de check-in
   - Sincroniza en tiempo real

**Librerías Recomendadas:**

**Para Generar QR:**
```bash
npm install qrcode.react
```

**Para Escanear QR:**
```bash
npm install react-qr-reader
```

**Ejemplo de implementación:**
```typescript
import { QRReader } from 'react-qr-reader'

<QRReader
  onScan={(data) => {
    // Validar QR y marcar asistencia
    validateAndCheckIn(data)
  }}
  onError={(error) => {
    console.error('Error escaneando:', error)
  }}
/>
```

---

## 8. Métricas de Éxito

### 8.1 KPIs para Usuarios

- **Tasa de conversión:** Visitantes → Compradores
- **Tiempo en el sitio:** Duración promedio de visita
- **Tasa de abandono:** Carritos abandonados
- **Satisfacción:** Encuestas post-compra

### 8.2 KPIs para Administradores

- **Eventos creados por mes:** Productividad del equipo
- **Tasa de asistencia:** Confirmados vs. Asistieron
- **Ingresos por evento:** Rentabilidad
- **Tickets procesados:** Volumen de ventas

---

## 9. Consideraciones de Seguridad

### 9.1 Frontend

- ✅ Validación de formularios en cliente
- ✅ Sanitización de inputs
- ✅ Protección contra XSS
- ✅ Tokens JWT en localStorage (considerar HttpOnly cookies)
- ⚠️ HTTPS obligatorio en producción

### 9.2 Pendientes de Seguridad

- ⚠️ Implementar HttpOnly cookies para tokens
- ⚠️ Rate limiting en peticiones
- ⚠️ Sanitización más estricta en inputs del usuario
- ⚠️ Verificación de email para nuevos usuarios

---

## 10. Roadmap de Desarrollo

### Fase 1 - MVP (Actual) ✅
- [x] Listado de eventos
- [x] Detalle de evento
- [x] Selección de asientos
- [x] Formulario de checkout
- [x] Panel admin básico
- [x] Dashboard con estadísticas
- [x] Gestión de eventos

### Fase 2 - Core Features
- [ ] Integración de pasarela de pago
- [ ] Generación de QR para tickets
- [ ] Escáner de QR para check-in
- [ ] Autenticación con Google
- [ ] Mis Compras funcional

### Fase 3 - Admin Features
- [ ] Módulo de Usuarios completo
- [ ] Módulo de Reportes detallados
- [ ] Módulo de Configuración
- [ ] Módulo de Accesos
- [ ] Roles y permisos

### Fase 4 - Optimización
- [ ] Testing (Unit + E2E)
- [ ] Optimización de performance
- [ ] SEO
- [ ] Analytics
- [ ] PWA completo

---

**Documento de Requerimientos - Versión 1.0**
**Fecha:** Febrero 2026
**Autor:** 365soft Development Team
