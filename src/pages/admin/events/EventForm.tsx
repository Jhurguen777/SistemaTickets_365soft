import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Upload, X, Image as ImageIcon, Plus } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import adminService from '@/services/adminService'
import { convertImageFileToWebP, isValidImageFile, isValidImageSize } from '@/utils/imageConverter'

export default function EventForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    longDescription: '',
    location: '',
    address: '',
    date: '',
    time: '',
    doorsOpen: '',
    capacity: 0,
    category: 'Fiestas',
    subcategory: '',
    organizer: '365soft Eventos',
    status: 'ACTIVO' as 'ACTIVO' | 'INACTIVO' | 'CANCELADO',
    image: '/media/banners/vibra-carnavalera.jpg',
    gallery: [],
    permitirMultiplesAsientos: false,
    limiteAsientosPorUsuario: 1
  })

  // Estado local para manejar las imágenes y la principal
  const [images, setImages] = useState<string[]>([])
  const [mainImageIndex, setMainImageIndex] = useState<number>(0)

  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [loadingEvent, setLoadingEvent] = useState(false)

  // Cargar datos del evento si estamos editando
  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return

      setLoadingEvent(true)
      try {
        const events = await adminService.getEvents()
        const event = events.find(e => e.id === id)

        if (event) {
          // Convertir fecha al formato que espera el input date
          const formatDateForInput = (date: Date | string) => {
            const d = new Date(date)
            return d.toISOString().split('T')[0]
          }

          // Cargar imágenes
          const eventImages: string[] = []
          if (event.image) {
            eventImages.push(event.image)
          }
          if (event.gallery && event.gallery.length > 0) {
            eventImages.push(...event.gallery)
          }

          setImages(eventImages)
          setMainImageIndex(0)

          setFormData({
            title: event.title || '',
            description: event.description || '',
            longDescription: event.longDescription || '',
            location: event.location || '',
            address: event.address || '',
            date: formatDateForInput(event.date),
            time: event.time || '',
            doorsOpen: event.doorsOpen || '',
            capacity: event.capacity || 0,
            category: event.category || 'Fiestas',
            subcategory: event.subcategory || '',
            organizer: event.organizer || '365soft Eventos',
            status: event.status || 'ACTIVO',
            image: event.image || '',
            gallery: event.gallery || [],
            permitirMultiplesAsientos: event.permitirMultiplesAsientos || false,
            limiteAsientosPorUsuario: event.limiteAsientosPorUsuario || 1
          })
        }
      } catch (error) {
        console.error('Error al cargar evento:', error)
        setErrors({ form: 'Error al cargar el evento' })
      } finally {
        setLoadingEvent(false)
      }
    }

    loadEvent()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validaciones básicas
    const newErrors: { [key: string]: string } = {}

    if (!formData.title || formData.title.length < 3) {
      newErrors.title = 'El título debe tener al menos 3 caracteres'
    }
    if (!formData.description) {
      newErrors.description = 'La descripción es requerida'
    }
    if (!formData.location) {
      newErrors.location = 'La ubicación es requerida'
    }
    if (!formData.date) {
      newErrors.date = 'La fecha es requerida'
    }
    if (!formData.time) {
      newErrors.time = 'El horario es requerido'
    }
    if (formData.capacity < 1) {
      newErrors.capacity = 'La capacidad debe ser al menos 1'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)

    try {
      // Actualizar formData con la imagen principal (la primera del array o la marcada)
      const mainImage = images.length > 0 ? images[mainImageIndex] : formData.image

      const finalFormData = {
        ...formData,
        image: mainImage,
        images: images // Todas las imágenes
      }

      if (isEditing && id) {
        await adminService.updateEvent(id, finalFormData)
      } else {
        await adminService.createEvent(finalFormData)
      }
      navigate('/admin/eventos')
    } catch (error: any) {
      setErrors({ form: error.message || 'Error al guardar el evento' })
    } finally {
      setLoading(false)
    }
  }

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingImage(true)

    try {
      const newImages: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        if (!isValidImageFile(file)) {
          alert(`El archivo "${file.name}" no es una imagen válida`)
          continue
        }

        if (!isValidImageSize(file, 5)) {
          alert(`La imagen "${file.name}" supera los 5MB`)
          continue
        }

        // Convertir a WebP y luego a base64
        const webpFile = await convertImageFileToWebP(file, 85)

        // Convertir el WebP a base64
        const reader = new FileReader()
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
        })
        reader.readAsDataURL(webpFile)

        const base64Image = await base64Promise
        newImages.push(base64Image)
      }

      // Si es la primera imagen que se sube, hacerla principal automáticamente
      if (images.length === 0 && newImages.length > 0) {
        setMainImageIndex(0)
      }

      setImages([...images, ...newImages])
    } catch (error) {
      console.error('Error al convertir imágenes:', error)
      alert('Error al procesar las imágenes. Por favor intenta con otras imágenes.')
    } finally {
      setUploadingImage(false)
      // Limpiar el input para permitir subir el mismo archivo nuevamente si se desea
      e.target.value = ''
    }
  }

  const handleSetMainImage = (index: number) => {
    setMainImageIndex(index)
  }

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)

    // Si eliminamos la imagen principal, ajustar el índice
    if (index === mainImageIndex) {
      setMainImageIndex(newImages.length > 0 ? 0 : 0)
    } else if (index < mainImageIndex) {
      // Si eliminamos una imagen antes de la principal, ajustar el índice
      setMainImageIndex(mainImageIndex - 1)
    }
  }

  // Mostrar indicador de carga cuando se está cargando el evento
  if (loadingEvent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando evento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Editar Evento' : 'Crear Nuevo Evento'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? 'Modifica la información del evento' : 'Completa el formulario para crear un nuevo evento'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.form && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {errors.form}
              </div>
            )}

            {/* Información Básica */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título del Evento *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    error={errors.title}
                    placeholder="Ej: Concierto de Rock 2026"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="Fiestas">Fiestas</option>
                    <option value="Conciertos">Conciertos</option>
                    <option value="Teatro">Teatro</option>
                    <option value="Deportes">Deportes</option>
                    <option value="Ferias">Ferias</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción Corta *
                  </label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    error={errors.description}
                    placeholder="Breve descripción del evento"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción Larga
                  </label>
                  <textarea
                    value={formData.longDescription}
                    onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Descripción detallada del evento..."
                  />
                </div>
              </div>
            </div>

            {/* Imágenes del Evento */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Imágenes del Evento</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Sube las imágenes del evento. La primera será la principal por defecto.
                  </p>
                </div>
                <div>
                  <input
                    type="file"
                    id="imagesUpload"
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                    multiple
                    onChange={handleImagesUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                  <label
                    htmlFor="imagesUpload"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 cursor-pointer transition-colors shadow-sm"
                  >
                    <Upload size={18} />
                    <span className="text-sm font-medium">
                      {uploadingImage ? 'Procesando...' : 'Subir imágenes'}
                    </span>
                  </label>
                </div>
              </div>

              {images.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary transition-colors">
                  <label htmlFor="imagesUpload" className="cursor-pointer">
                    <ImageIcon size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-700 font-medium mb-1">
                      No hay imágenes subidas
                    </p>
                    <p className="text-gray-500 text-sm">
                      Haz clic para subir una o varias imágenes (PNG, JPG, GIF, WebP - máx 5MB c/u)
                    </p>
                    <p className="text-gray-400 text-xs mt-2">
                      Todas las imágenes se convertirán automáticamente a WebP
                    </p>
                  </label>
                </div>
              ) : (
                <div>
                  {/* Grid de imágenes */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((imageUrl, index) => (
                      <div
                        key={index}
                        onDoubleClick={() => handleSetMainImage(index)}
                        className={`relative group cursor-pointer rounded-lg overflow-hidden border-4 transition-all ${
                          index === mainImageIndex
                            ? 'border-primary shadow-lg ring-2 ring-primary ring-offset-2'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        title="Doble clic para hacer principal"
                      >
                        {/* Imagen */}
                        <div className="aspect-square">
                          <img
                            src={imageUrl}
                            alt={`Imagen ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Badge PRINCIPAL */}
                        {index === mainImageIndex && (
                          <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded text-xs font-bold shadow-lg">
                            PRINCIPAL
                          </div>
                        )}

                        {/* Contador */}
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-0.5 rounded text-xs">
                          #{index + 1}
                        </div>

                        {/* Botón eliminar */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveImage(index)
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg z-10"
                          title="Eliminar imagen"
                        >
                          <X size={16} />
                        </button>

                        {/* Tooltip en hover */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center pointer-events-none">
                          <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-medium bg-black bg-opacity-70 px-2 py-1 rounded pointer-events-none">
                            Doble clic para hacer principal
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Contador de imágenes */}
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Total de imágenes: <strong>{images.length}</strong>
                    </span>
                    <span className="text-gray-500">
                      Imagen principal: <strong>Imagen #{mainImageIndex + 1}</strong>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Fecha y Ubicación */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Fecha y Ubicación</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha del Evento *
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    error={errors.date}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horario del Evento *
                  </label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    error={errors.time}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora Apertura Puertas
                  </label>
                  <Input
                    type="time"
                    value={formData.doorsOpen}
                    onChange={(e) => setFormData({ ...formData, doorsOpen: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacidad Total *
                  </label>
                  <Input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                    error={errors.capacity}
                    placeholder="Ej: 15000"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    ⚙️ Configuración de Compras por Usuario
                  </label>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="permitirMultiplesAsientos"
                        checked={formData.permitirMultiplesAsientos}
                        onChange={(e) => {
                          const permitir = e.target.checked
                          setFormData({
                            ...formData,
                            permitirMultiplesAsientos: permitir,
                            limiteAsientosPorUsuario: permitir ? formData.limiteAsientosPorUsuario : 1
                          })
                        }}
                        className="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <div className="flex-1">
                        <label htmlFor="permitirMultiplesAsientos" className="font-semibold text-gray-900 cursor-pointer">
                          Permitir que un usuario compre múltiples asientos
                        </label>
                        <p className="text-sm text-gray-600 mt-1">
                          {formData.permitirMultiplesAsientos
                            ? 'Los usuarios podrán comprar varios asientos en una sola transacción'
                            : 'Cada usuario solo podrá comprar UN asiento (recomendado para eventos con certificados individuales)'}
                        </p>
                      </div>
                    </div>

                    {formData.permitirMultiplesAsientos && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Límite de asientos por usuario
                        </label>
                        <Input
                          type="number"
                          min={1}
                          max={50}
                          value={formData.limiteAsientosPorUsuario}
                          onChange={(e) => setFormData({ ...formData, limiteAsientosPorUsuario: parseInt(e.target.value) || 1 })}
                          placeholder="Ej: 5"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Máximo de asientos que un usuario puede comprar en una sola transacción
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lugar / Ubicación *
                  </label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    error={errors.location}
                    placeholder="Ej: Estadio Olímpico, La Paz"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección Completa
                  </label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Ej: Av. Saavedra #1895, La Paz, Bolivia"
                  />
                </div>
              </div>
            </div>

            {/* Estado */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado del Evento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organizador
                  </label>
                  <Input
                    value={formData.organizer}
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                    placeholder="Ej: 365soft Eventos"
                  />
                </div>
              </div>
            </div>

            {/* Configuración de Asientos */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Configuración de Asientos</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Dibuja el mapa del escenario y configura los sectores
                  </p>
                </div>
                {(isEditing || formData.title) && (
                  <button
                    type="button"
                    onClick={() => {
                      // Si es edición, usar el ID existente, si no, guardar primero
                      if (isEditing && id) {
                        navigate(`/admin/eventos/${id}/dibujar-mapa`)
                      } else {
                        // Primero guardar el evento básico, luego ir a dibujar mapa
                        handleSubmit(new Event('submit') as any)
                      }
                    }}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <span className="text-sm font-medium">
                      {isEditing ? 'Editar Mapa de Asientos' : 'Dibujar Mapa de Asientos'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="border-t pt-6 flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Evento'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
