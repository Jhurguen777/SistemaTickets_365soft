import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Upload, X, Image as ImageIcon } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import adminService from '@/services/adminService'
import { convertImageFileToWebP, isValidImageFile, isValidImageSize } from '@/utils/imageConverter'

export default function EventForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const isEditing = !!id

  const [conAsientos, setConAsientos] = useState(searchParams.get('tipo') === 'asientos')

  const [formData, setFormData] = useState({
    title: '', description: '', longDescription: '',
    location: '', address: '', date: '', time: '', doorsOpen: '',
    capacity: 0, precio: 0,
    category: 'Fiestas', subcategory: '',
    organizer: '365soft Eventos',
    status: 'ACTIVO' as 'ACTIVO' | 'INACTIVO' | 'CANCELADO',
    image: '/media/banners/vibra-carnavalera.jpg',
    gallery: [] as string[],
    permitirMultiplesAsientos: false,
    limiteAsientosPorUsuario: 1,
    modo: 'ASIENTOS' as 'ASIENTOS' | 'CANTIDAD',
  })

  const [images, setImages] = useState<string[]>([])
  const [mainImageIndex, setMainImageIndex] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [loadingEvent, setLoadingEvent] = useState(false)

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return
      setLoadingEvent(true)
      try {
        const events = await adminService.getEvents()
        const event = events.find((e: any) => e.id === id)
        if (event) {
          const formatDate = (d: Date | string) => new Date(d).toISOString().split('T')[0]
          const eventImages: string[] = []
          if (event.image) eventImages.push(event.image)
          if (event.gallery?.length) eventImages.push(...event.gallery)
          setImages(eventImages)
          setMainImageIndex(0)
          const e = event as any
          const modoGuardado = e.modo || 'ASIENTOS'
          setConAsientos(modoGuardado === 'ASIENTOS')
          setFormData({
            title: e.title || e.titulo || '',
            description: e.description || '',
            longDescription: e.longDescription || '',
            location: e.location || e.ubicacion || '',
            address: e.address || e.direccion || '',
            date: formatDate(e.date || e.fecha),
            time: e.time || e.hora || '',
            doorsOpen: e.doorsOpen || '',
            capacity: e.capacity || e.capacidad || 0,
            precio: e.precio || e.price || 0,
            category: e.category || e.categoria || 'Fiestas',
            subcategory: e.subcategory || '',
            organizer: e.organizer || '365soft Eventos',
            status: e.status || e.estado || 'ACTIVO',
            image: e.image || e.imagenUrl || '',
            gallery: e.gallery || [],
            permitirMultiplesAsientos: e.permitirMultiplesAsientos || false,
            limiteAsientosPorUsuario: e.limiteAsientosPorUsuario || 1,
            modo: modoGuardado,
          })
        }
      } catch { setErrors({ form: 'Error al cargar el evento' }) }
      finally { setLoadingEvent(false) }
    }
    loadEvent()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    const newErrors: Record<string, string> = {}
    if (!formData.title || formData.title.length < 3) newErrors.title = 'El título debe tener al menos 3 caracteres'
    if (!formData.description) newErrors.description = 'La descripción es requerida'
    if (!formData.location) newErrors.location = 'La ubicación es requerida'
    if (!formData.date) newErrors.date = 'La fecha es requerida'
    if (!formData.time) newErrors.time = 'El horario es requerido'
    if (formData.capacity < 1) newErrors.capacity = 'La capacidad debe ser al menos 1'
    if (formData.precio < 0) newErrors.precio = 'El precio no puede ser negativo'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    setLoading(true)
    try {
      const mainImage = images.length > 0 ? images[mainImageIndex] : formData.image
      const finalFormData = {
        title: formData.title, description: formData.description,
        longDescription: formData.longDescription, location: formData.location,
        address: formData.address, date: formData.date, time: formData.time,
        doorsOpen: formData.doorsOpen, capacity: formData.capacity,
        price: formData.precio, category: formData.category,
        subcategory: formData.subcategory, organizer: formData.organizer,
        status: formData.status, image: mainImage, gallery: images,
        modo: (conAsientos ? 'ASIENTOS' : 'CANTIDAD') as 'ASIENTOS' | 'CANTIDAD',
        sectors: [{ id: '1', name: 'General', price: formData.precio, available: formData.capacity, total: formData.capacity }]
      }
      if (isEditing && id) await adminService.updateEvent(id, finalFormData)
      else await adminService.createEvent(finalFormData)
      navigate('/admin/eventos')
    } catch (error: any) {
      setErrors({ form: error.message || 'Error al guardar el evento' })
    } finally { setLoading(false) }
  }

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    setUploadingImage(true)
    try {
      const newImages: string[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!isValidImageFile(file)) { alert(`"${file.name}" no es una imagen válida`); continue }
        if (!isValidImageSize(file, 5)) { alert(`"${file.name}" supera los 5MB`); continue }
        const webpFile = await convertImageFileToWebP(file, 85)
        const reader = new FileReader()
        const base64 = await new Promise<string>((res, rej) => {
          reader.onload = () => res(reader.result as string)
          reader.onerror = rej
          reader.readAsDataURL(webpFile)
        })
        newImages.push(base64)
      }
      if (images.length === 0 && newImages.length > 0) setMainImageIndex(0)
      setImages([...images, ...newImages])
    } catch { alert('Error al procesar las imágenes.') }
    finally { setUploadingImage(false); e.target.value = '' }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    if (index === mainImageIndex) setMainImageIndex(0)
    else if (index < mainImageIndex) setMainImageIndex(mainImageIndex - 1)
  }

  const field = (label: string, required = false) => (
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label>
  )

  if (loadingEvent) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Cargando evento...</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900">
            {isEditing ? 'Editar Evento' : 'Crear Nuevo Evento'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
            {isEditing ? 'Modifica la información del evento' : 'Completa el formulario para crear un nuevo evento'}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.form && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{errors.form}</div>
            )}

            {/* Información Básica */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Información Básica</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  {field('Título del Evento', true)}
                  <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} error={errors.title} placeholder="Ej: Concierto de Rock 2026" />
                </div>
                <div>
                  {field('Categoría', true)}
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary text-sm">
                    {['Fiestas', 'Conciertos', 'Teatro', 'Deportes', 'Ferias'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  {field('Descripción Corta', true)}
                  <Input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} error={errors.description} placeholder="Breve descripción del evento" />
                </div>
                <div className="sm:col-span-2">
                  {field('Descripción Larga')}
                  <textarea value={formData.longDescription} onChange={e => setFormData({ ...formData, longDescription: e.target.value })} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary text-sm" placeholder="Descripción detallada..." />
                </div>
              </div>
            </div>

            {/* Imágenes */}
            <div className="border-t pt-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Imágenes del Evento</h3>
                  <p className="text-xs text-gray-500 mt-0.5">La primera imagen será la principal</p>
                </div>
                <div>
                  <input type="file" id="imagesUpload" accept="image/*" multiple onChange={handleImagesUpload} className="hidden" disabled={uploadingImage} />
                  <label htmlFor="imagesUpload" className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 cursor-pointer text-sm">
                    <Upload size={16} />
                    <span>{uploadingImage ? 'Procesando...' : 'Subir'}</span>
                  </label>
                </div>
              </div>
              {images.length === 0 ? (
                <label htmlFor="imagesUpload" className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center block cursor-pointer hover:border-primary transition-colors">
                  <ImageIcon size={40} className="text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium text-sm mb-1">Sin imágenes subidas</p>
                  <p className="text-gray-500 text-xs">PNG, JPG, WebP · máx 5MB c/u</p>
                </label>
              ) : (
                <div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4">
                    {images.map((img, idx) => (
                      <div key={idx} onDoubleClick={() => setMainImageIndex(idx)} className={`relative group cursor-pointer rounded-lg overflow-hidden border-4 transition-all aspect-square ${idx === mainImageIndex ? 'border-primary shadow-lg ring-2 ring-primary ring-offset-1' : 'border-gray-200'}`} title="Doble clic para principal">
                        <img src={img} alt={`Imagen ${idx + 1}`} className="w-full h-full object-cover" />
                        {idx === mainImageIndex && <div className="absolute top-1 left-1 bg-primary text-white px-1.5 py-0.5 rounded text-xs font-bold">✓</div>}
                        <button type="button" onClick={e => { e.stopPropagation(); handleRemoveImage(idx) }} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{images.length} imagen(es) · Principal: #{mainImageIndex + 1}</p>
                </div>
              )}
            </div>

            {/* Fecha, Ubicación y Precio */}
            <div className="border-t pt-5">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Fecha, Ubicación y Precio</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  {field('Fecha del Evento', true)}
                  <Input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} error={errors.date} />
                </div>
                <div>
                  {field('Horario del Evento', true)}
                  <Input type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} error={errors.time} />
                </div>
                <div>
                  {field('Hora Apertura Puertas')}
                  <Input type="time" value={formData.doorsOpen} onChange={e => setFormData({ ...formData, doorsOpen: e.target.value })} />
                </div>
                <div>
                  {field('Capacidad Total', true)}
                  <Input type="number" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })} error={errors.capacity} placeholder="Ej: 1500" />
                </div>

                {/* ✅ Precio por ticket — solo modo CANTIDAD */}
                {!conAsientos && (
                  <div className="sm:col-span-2">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-amber-800 mb-3">🎟️ Precio del Ticket General</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          {field('Precio por ticket (Bs)', true)}
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">Bs</span>
                            <Input
                              type="number"
                              value={formData.precio}
                              onChange={e => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
                              error={errors.precio}
                              placeholder="Ej: 150"
                              className="pl-9"
                            />
                          </div>
                        </div>
                        <div className="flex items-end">
                          <div className="w-full bg-white border border-amber-200 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">Recaudación máxima estimada</p>
                            <p className="text-lg font-bold text-amber-700">
                              Bs {(formData.precio * formData.capacity).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formData.precio} × {formData.capacity} tickets
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">⚙️ Configuración de Compras por Usuario</label>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <input type="checkbox" id="permitirMultiplesAsientos" checked={formData.permitirMultiplesAsientos}
                        onChange={e => setFormData({ ...formData, permitirMultiplesAsientos: e.target.checked, limiteAsientosPorUsuario: e.target.checked ? formData.limiteAsientosPorUsuario : 1 })}
                        className="mt-1 w-4 h-4 text-primary border-gray-300 rounded" />
                      <div>
                        <label htmlFor="permitirMultiplesAsientos" className="text-sm font-semibold text-gray-900 cursor-pointer">Permitir múltiples asientos por usuario</label>
                        <p className="text-xs text-gray-600 mt-0.5">{formData.permitirMultiplesAsientos ? 'Los usuarios podrán comprar varios asientos' : 'Solo un asiento por usuario'}</p>
                      </div>
                    </div>
                    {formData.permitirMultiplesAsientos && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Límite de asientos por usuario</label>
                        <Input type="number" min={1} max={50} value={formData.limiteAsientosPorUsuario} onChange={e => setFormData({ ...formData, limiteAsientosPorUsuario: parseInt(e.target.value) || 1 })} placeholder="Ej: 5" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  {field('Lugar / Ubicación', true)}
                  <Input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} error={errors.location} placeholder="Ej: Estadio Olímpico, La Paz" />
                </div>
                <div className="sm:col-span-2">
                  {field('Dirección Completa')}
                  <Input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Ej: Av. Saavedra #1895, La Paz" />
                </div>
              </div>
            </div>

            {/* Estado */}
            <div className="border-t pt-5">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Estado del Evento</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  {field('Estado')}
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary text-sm">
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </div>
                <div>
                  {field('Organizador')}
                  <Input value={formData.organizer} onChange={e => setFormData({ ...formData, organizer: e.target.value })} placeholder="Ej: 365soft Eventos" />
                </div>
              </div>
            </div>

            {/* Configuración de Asientos — solo si conAsientos */}
            {conAsientos && (
              <div className="border-t pt-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Configuración de Asientos</h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Dibuja el mapa del escenario y configura sectores</p>
                  </div>
                  {(isEditing || formData.title) && (
                    <button type="button"
                      onClick={() => { if (isEditing && id) navigate(`/admin/eventos/${id}/dibujar-mapa`); else handleSubmit(new Event('submit') as any) }}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium w-full sm:w-auto"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                      {isEditing ? 'Editar Mapa de Asientos' : 'Dibujar Mapa de Asientos'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="border-t pt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={loading} className="w-full sm:w-auto">Cancelar</Button>
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Evento'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
