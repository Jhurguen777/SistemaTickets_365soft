// src/utils/imageConverter.ts

/**
 * Convierte una imagen (File) a formato WebP
 * @param file - Archivo de imagen (PNG, JPG, etc.)
 * @param quality - Calidad de conversión (0-100, default 80)
 * @returns Promise<Blob> - Imagen convertida a WebP
 */
export const convertToWebP = async (
  file: File,
  quality: number = 80
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    // Crear un elemento imagen
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      // Crear canvas
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('No se pudo obtener el contexto del canvas'))
        return
      }

      // Dibujar imagen en el canvas
      ctx.drawImage(img, 0, 0)

      // Convertir a WebP
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('No se pudo convertir la imagen a WebP'))
          }
          URL.revokeObjectURL(url)
        },
        'image/webp',
        quality / 100
      )
    }

    img.onerror = () => {
      reject(new Error('Error al cargar la imagen'))
      URL.revokeObjectURL(url)
    }

    img.src = url
  })
}

/**
 * Convierte un File (imagen) a WebP y retorna un nuevo File
 * @param file - Archivo de imagen original
 * @param quality - Calidad de conversión (0-100)
 * @returns Promise<File> - Nuevo archivo en formato WebP
 */
export const convertImageFileToWebP = async (
  file: File,
  quality: number = 80
): Promise<File> => {
  const webpBlob = await convertToWebP(file, quality)

  // Crear nuevo File con extensión .webp
  const webpFile = new File(
    [webpBlob],
    file.name.replace(/\.[^/.]+$/, '.webp'),
    { type: 'image/webp' }
  )

  return webpFile
}

/**
 * Convierte una imagen a WebP y retorna como Data URL
 * @param file - Archivo de imagen
 * @param quality - Calidad de conversión (0-100)
 * @returns Promise<string> - Data URL de la imagen WebP
 */
export const convertToWebPDataUrl = async (
  file: File,
  quality: number = 80
): Promise<string> => {
  const webpBlob = await convertToWebP(file, quality)

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Error al leer el blob'))
    reader.readAsDataURL(webpBlob)
  })
}

/**
 * Obtiene las dimensiones de una imagen
 * @param file - Archivo de imagen
 * @returns Promise<{width: number, height: number}>
 */
export const getImageDimensions = (
  file: File
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      resolve({ width: img.width, height: img.height })
      URL.revokeObjectURL(url)
    }

    img.onerror = () => {
      reject(new Error('Error al cargar la imagen'))
      URL.revokeObjectURL(url)
    }

    img.src = url
  })
}

/**
 * Valida que un archivo sea una imagen
 * @param file - Archivo a validar
 * @returns boolean
 */
export const isValidImageFile = (file: File): boolean => {
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml']
  return validTypes.includes(file.type)
}

/**
 * Valida el tamaño máximo de una imagen (en bytes)
 * @param file - Archivo a validar
 * @param maxSizeInMB - Tamaño máximo en MB
 * @returns boolean
 */
export const isValidImageSize = (file: File, maxSizeInMB: number = 5): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024
  return file.size <= maxSizeInBytes
}

export default {
  convertToWebP,
  convertImageFileToWebP,
  convertToWebPDataUrl,
  getImageDimensions,
  isValidImageFile,
  isValidImageSize
}
