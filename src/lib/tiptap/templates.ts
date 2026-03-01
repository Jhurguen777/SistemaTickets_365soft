import { CertificateTemplateType } from '@/types/certificate'

export interface CertificateTemplateBase {
  id: string
  name: string
  description: string
  type: CertificateTemplateType
  content: string
}

/**
 * Plantillas base predefinidas para certificados
 * Cada plantilla contiene HTML con las variables en formato {{variable}}
 */
export const CERTIFICATE_BASE_TEMPLATES: CertificateTemplateBase[] = [
  {
    id: 'asistencia',
    name: 'Certificado de Asistencia',
    description: 'Plantilla estándar para certificar asistencia a eventos',
    type: 'asistencia',
    content: `
<div style="
  font-family: 'Times New Roman', serif;
  width: 11in;
  height: 8.5in;
  padding: 0.5in;
  box-sizing: border-box;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  position: relative;
  overflow: hidden;
">
  <!-- Marco decorativo externo -->
  <div style="
    position: absolute;
    top: 20px;
    left: 20px;
    right: 20px;
    bottom: 20px;
    border: 3px solid #1e40af;
    border-radius: 8px;
    pointer-events: none;
  "></div>

  <!-- Marco decorativo interno -->
  <div style="
    position: absolute;
    top: 28px;
    left: 28px;
    right: 28px;
    bottom: 28px;
    border: 1px solid #3b82f6;
    border-radius: 6px;
    pointer-events: none;
  "></div>

  <!-- Esquinas decorativas -->
  <div style="
    position: absolute;
    top: 20px;
    left: 20px;
    width: 60px;
    height: 60px;
    border-top: 4px solid #1e40af;
    border-left: 4px solid #1e40af;
    border-top-left-radius: 8px;
  "></div>
  <div style="
    position: absolute;
    top: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    border-top: 4px solid #1e40af;
    border-right: 4px solid #1e40af;
    border-top-right-radius: 8px;
  "></div>
  <div style="
    position: absolute;
    bottom: 20px;
    left: 20px;
    width: 60px;
    height: 60px;
    border-bottom: 4px solid #1e40af;
    border-left: 4px solid #1e40af;
    border-bottom-left-radius: 8px;
  "></div>
  <div style="
    position: absolute;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    border-bottom: 4px solid #1e40af;
    border-right: 4px solid #1e40af;
    border-bottom-right-radius: 8px;
  "></div>

  <!-- Contenido central -->
  <div style="
    position: relative;
    z-index: 1;
    text-align: center;
    padding: 60px 40px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  ">
    <!-- Sello decorativo -->
    <div style="
      position: absolute;
      top: 50px;
      right: 60px;
      width: 90px;
      height: 90px;
      border: 3px solid #d97706;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: rotate(-15deg);
      opacity: 0.3;
    ">
      <span style="font-size: 42px;">✓</span>
    </div>

    <!-- Título Principal -->
    <h1 style="
      font-size: 52px;
      color: #1e40af;
      margin: 0 0 10px 0;
      font-weight: 900;
      letter-spacing: 3px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
      line-height: 1.2;
    ">
      CERTIFICADO
    </h1>

    <h2 style="
      font-size: 28px;
      color: #3b82f6;
      margin: 0 0 40px 0;
      font-weight: 600;
      letter-spacing: 8px;
      text-transform: uppercase;
    ">
      DE ASISTENCIA
    </h2>

    <!-- Línea decorativa -->
    <div style="
      width: 300px;
      height: 3px;
      background: linear-gradient(90deg, transparent, #1e40af, transparent);
      margin: 0 auto 40px auto;
    "></div>

    <!-- Texto introductorio -->
    <p style="
      font-size: 20px;
      color: #64748b;
      margin: 0 0 30px 0;
      font-style: italic;
      font-weight: 400;
    ">
      Se otorga el presente certificado a:
    </p>

    <!-- Nombre del participante -->
    <div style="
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      padding: 20px 40px;
      border-radius: 8px;
      border: 2px dashed #d97706;
      margin: 0 auto 30px auto;
      display: inline-block;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    ">
      <p style="
        font-size: 42px;
        color: #1e293b;
        margin: 0;
        font-weight: 700;
        letter-spacing: 1px;
      ">
        {{nombre_completo}}
      </p>
    </div>

    <!-- Datos del participante -->
    <p style="
      font-size: 16px;
      color: #64748b;
      margin: 0 0 40px 0;
      font-weight: 500;
    ">
      <strong style="color: #475569;">C.I.:</strong> {{ci}}
      <span style="margin: 0 15px;">|</span>
      <strong style="color: #475569;">Teléfono:</strong> {{telefono}}
      <span style="margin: 0 15px;">|</span>
      <strong style="color: #475569;">Oficina:</strong> {{oficina_alfa}}
    </p>

    <!-- Texto del evento -->
    <p style="
      font-size: 20px;
      color: #475569;
      margin: 0 0 20px 0;
      font-weight: 500;
      line-height: 1.6;
    ">
      Por su asistencia y participación en el evento:
    </p>

    <!-- Nombre del evento -->
    <div style="
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      padding: 25px 50px;
      border-radius: 8px;
      border: 2px solid #1e40af;
      margin: 0 auto 40px auto;
      display: inline-block;
      box-shadow: 0 6px 12px rgba(30, 64, 175, 0.15);
    ">
      <p style="
        font-size: 32px;
        color: #1e40af;
        margin: 0;
        font-weight: 800;
        letter-spacing: 1px;
      ">
        {{evento}}
      </p>
    </div>

    <!-- Fecha -->
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 15px;
      margin: 0 auto 60px auto;
    ">
      <div style="width: 40px; height: 1px; background: #94a3b8;"></div>
      <p style="
        font-size: 18px;
        color: #64748b;
        margin: 0;
        font-weight: 600;
      ">
        {{fecha}}
      </p>
      <div style="width: 40px; height: 1px; background: #94a3b8;"></div>
    </div>

    <!-- Firmas -->
    <div style="
      display: flex;
      justify-content: space-around;
      align-items: flex-end;
      margin-top: auto;
      padding: 0 100px;
    ">
      <div style="text-align: center;">
        <div style="
          width: 200px;
          border-top: 3px solid #1e40af;
          padding-top: 15px;
          margin: 0 auto 10px auto;
        "></div>
        <p style="font-size: 14px; color: #475569; margin: 0; font-weight: 700;">Director del Evento</p>
        <p style="font-size: 12px; color: #94a3b8; margin: 5px 0 0 0;">Firma y Sello</p>
      </div>

      <div style="text-align: center;">
        <div style="
          width: 200px;
          border-top: 3px solid #1e40af;
          padding-top: 15px;
          margin: 0 auto 10px auto;
        "></div>
        <p style="font-size: 14px; color: #475569; margin: 0; font-weight: 700;">Fecha de Emisión</p>
        <p style="font-size: 12px; color: #94a3b8; margin: 5px 0 0 0;">Validación Oficial</p>
      </div>
    </div>
  </div>
</div>
    `.trim()
  },

  {
    id: 'finalizacion',
    name: 'Certificado de Finalización',
    description: 'Certificado para completar cursos o programas',
    type: 'finalizacion',
    content: `
<div style="
  font-family: 'Georgia', serif;
  width: 11in;
  height: 8.5in;
  padding: 0;
  box-sizing: border-box;
  background: linear-gradient(180deg, #fef3c7 0%, #fef9c3 50%, #fef3c7 100%);
  position: relative;
  overflow: hidden;
">
  <!-- Patrón de fondo -->
  <div style="
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
      repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(251, 191, 36, 0.05) 35px, rgba(251, 191, 36, 0.05) 70px);
    pointer-events: none;
  "></div>

  <!-- Marco principal -->
  <div style="
    position: absolute;
    top: 30px;
    left: 30px;
    right: 30px;
    bottom: 30px;
    border: 6px double #1e40af;
    border-radius: 12px;
    pointer-events: none;
    background: white;
    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
  "></div>

  <!-- Cinta decorativa superior -->
  <div style="
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 300px;
    height: 40px;
    background: linear-gradient(180deg, #1e40af 0%, #3b82f6 100%);
    border-radius: 0 0 20px 20px;
    box-shadow: 0 4px 8px rgba(30, 64, 175, 0.3);
    z-index: 2;
  "></div>

  <!-- Medallón central -->
  <div style="
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
    border-radius: 50%;
    border: 5px solid #92400e;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 3;
  ">
    <span style="font-size: 40px; color: white;">★</span>
  </div>

  <!-- Contenido -->
  <div style="
    position: relative;
    z-index: 1;
    text-align: center;
    padding: 100px 80px 60px 80px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  ">
    <!-- Título -->
    <h1 style="
      font-size: 64px;
      color: #1e40af;
      margin: 0 0 10px 0;
      font-weight: 900;
      letter-spacing: 4px;
      text-shadow: 3px 3px 6px rgba(0,0,0,0.1);
    ">
      CERTIFICADO
    </h1>

    <h2 style="
      font-size: 32px;
      color: #3b82f6;
      margin: 0 0 50px 0;
      font-weight: 700;
      letter-spacing: 12px;
      text-transform: uppercase;
    ">
      DE FINALIZACIÓN
    </h2>

    <!-- Líneas decorativas -->
    <div style="
      width: 400px;
      height: 2px;
      background: linear-gradient(90deg, transparent, #1e40af, transparent);
      margin: 0 auto 30px auto;
    "></div>
    <div style="
      width: 300px;
      height: 1px;
      background: #3b82f6;
      margin: 0 auto 50px auto;
    "></div>

    <!-- Texto introductorio -->
    <p style="
      font-size: 22px;
      color: #64748b;
      margin: 0 0 40px 0;
      font-style: italic;
    ">
      Se hace constar que
    </p>

    <!-- Nombre destacado -->
    <div style="
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      padding: 25px 50px;
      border-radius: 12px;
      border: 3px solid #d97706;
      margin: 0 auto 40px auto;
      display: inline-block;
      box-shadow: 0 8px 16px rgba(217, 119, 6, 0.2);
      transform: scale(1.05);
    ">
      <p style="
        font-size: 48px;
        color: #1e293b;
        margin: 0;
        font-weight: 800;
        letter-spacing: 2px;
      ">
        {{nombre_completo}}
      </p>
    </div>

    <!-- Datos del participante -->
    <p style="
      font-size: 16px;
      color: #64748b;
      margin: 0 0 50px 0;
      font-weight: 500;
    ">
      <strong>C.I.:</strong> {{ci}}
      <span style="margin: 0 20px; color: #cbd5e1;">|</span>
      <strong>Oficina:</strong> {{oficina_alfa}}
    </p>

    <!-- Texto de finalización -->
    <p style="
      font-size: 24px;
      color: #475569;
      margin: 0 0 30px 0;
      font-weight: 600;
      line-height: 1.8;
    ">
      Ha completado satisfactoriamente el evento:
    </p>

    <!-- Evento destacado -->
    <div style="
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      padding: 30px 60px;
      border-radius: 12px;
      border: 3px solid #1e40af;
      margin: 0 auto 40px auto;
      display: inline-block;
      box-shadow: 0 8px 20px rgba(30, 64, 175, 0.2);
    ">
      <p style="
        font-size: 36px;
        color: #1e40af;
        margin: 0;
        font-weight: 900;
        letter-spacing: 1px;
      ">
        {{evento}}
      </p>
    </div>

    <!-- Fecha -->
    <div style="
      display: inline-block;
      background: white;
      padding: 15px 40px;
      border-radius: 30px;
      border: 2px solid #eab308;
      margin: 0 auto 80px auto;
      box-shadow: 0 4px 8px rgba(234, 179, 8, 0.15);
    ">
      <p style="
        font-size: 20px;
        color: #d97706;
        margin: 0;
        font-weight: 700;
      ">
        {{fecha}}
      </p>
    </div>

    <!-- Firmas -->
    <div style="
      display: flex;
      justify-content: space-around;
      align-items: flex-end;
      margin-top: auto;
      padding: 0 100px;
    ">
      <div style="text-align: center;">
        <div style="
          width: 220px;
          border-top: 4px double #1e40af;
          padding-top: 20px;
          margin: 0 auto 15px auto;
        "></div>
        <p style="font-size: 16px; color: #1e293b; margin: 0; font-weight: 800;">Director del Programa</p>
        <p style="font-size: 13px; color: #64748b; margin: 5px 0 0 0;">Certificación Oficial</p>
      </div>

      <div style="text-align: center;">
        <div style="
          width: 220px;
          border-top: 4px double #1e40af;
          padding-top: 20px;
          margin: 0 auto 15px auto;
        "></div>
        <p style="font-size: 16px; color: #1e293b; margin: 0; font-weight: 800;">Fecha de Emisión</p>
        <p style="font-size: 13px; color: #64748b; margin: 5px 0 0 0;">Validación y Registro</p>
      </div>
    </div>
  </div>
</div>
    `.trim()
  },

  {
    id: 'excelencia',
    name: 'Certificado de Excelencia',
    description: 'Reconocimiento especial por desempeño destacado',
    type: 'excelencia',
    content: `
<div style="
  font-family: 'Arial', serif;
  width: 11in;
  height: 8.5in;
  padding: 0;
  box-sizing: border-box;
  background: linear-gradient(135deg, #fef2f2 0%, #fef9f9 50%, #fef2f2 100%);
  position: relative;
  overflow: hidden;
">
  <!-- Fondo con patrón de laureles -->
  <div style="
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
      radial-gradient(circle at 20% 50%, rgba(220, 38, 38, 0.03) 0%, transparent 50%),
      radial-gradient(circle at 80% 50%, rgba(220, 38, 38, 0.03) 0%, transparent 50%);
    pointer-events: none;
  "></div>

  <!-- Marco exterior elegante -->
  <div style="
    position: absolute;
    top: 25px;
    left: 25px;
    right: 25px;
    bottom: 25px;
    border: 4px solid #dc2626;
    border-radius: 10px;
    pointer-events: none;
    box-shadow: 0 8px 32px rgba(220, 38, 38, 0.15), inset 0 0 0 1px rgba(220, 38, 38, 0.1);
  "></div>

  <!-- Marco interior decorativo -->
  <div style="
    position: absolute;
    top: 35px;
    left: 35px;
    right: 35px;
    bottom: 35px;
    border: 2px solid #f87171;
    border-radius: 8px;
    pointer-events: none;
  "></div>

  <!-- Trophy/Corona decorativos en las esquinas -->
  <div style="position: absolute; top: 35px; left: 35px; font-size: 36px; opacity: 0.6;">🏆</div>
  <div style="position: absolute; top: 35px; right: 35px; font-size: 36px; opacity: 0.6;">🏆</div>
  <div style="position: absolute; bottom: 35px; left: 35px; font-size: 36px; opacity: 0.6;">🏆</div>
  <div style="position: absolute; bottom: 35px; right: 35px; font-size: 36px; opacity: 0.6;">🏆</div>

  <!-- Medalla de excelencia -->
  <div style="
    position: absolute;
    top: 25px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
  ">
    <div style="
      width: 100px;
      height: 100px;
      background: linear-gradient(135deg, #fbbf24 0%, #d97706 50%, #b45309 100%);
      border-radius: 50%;
      border: 6px solid #92400e;
      box-shadow:
        0 8px 20px rgba(251, 191, 36, 0.4),
        inset 0 -4px 8px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <span style="font-size: 52px; filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.3));">🏅</span>
    </div>
    <!-- Cinta de la medalla -->
    <div style="
      position: absolute;
      top: 95px;
      left: 50%;
      transform: translateX(-50%);
      width: 30px;
      height: 40px;
      background: linear-gradient(180deg, #dc2626 0%, #b91c1c 100%);
      clip-path: polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%);
    "></div>
  </div>

  <!-- Contenido -->
  <div style="
    position: relative;
    z-index: 1;
    text-align: center;
    padding: 140px 80px 60px 80px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  ">
    <!-- Título principal -->
    <h1 style="
      font-size: 60px;
      color: #dc2626;
      margin: 0 0 15px 0;
      font-weight: 900;
      letter-spacing: 5px;
      text-shadow:
        3px 3px 0px #fef2f2,
        5px 5px 10px rgba(220, 38, 38, 0.2);
      line-height: 1.1;
    ">
      CERTIFICADO
    </h1>

    <h2 style="
      font-size: 36px;
      color: #ef4444;
      margin: 0 0 50px 0;
      font-weight: 800;
      letter-spacing: 15px;
      text-transform: uppercase;
    ">
      DE EXCELENCIA
    </h2>

    <!-- Líneas decorativas -->
    <div style="
      width: 500px;
      height: 3px;
      background: linear-gradient(90deg, transparent, #dc2626, transparent);
      margin: 0 auto 20px auto;
    "></div>
    <div style="
      width: 350px;
      height: 2px;
      background: #f87171;
      margin: 0 auto 50px auto;
    "></div>

    <!-- Texto introductorio -->
    <p style="
      font-size: 22px;
      color: #64748b;
      margin: 0 0 40px 0;
      font-style: italic;
      font-weight: 500;
    ">
      Se otorga el presente reconocimiento a:
    </p>

    <!-- Nombre en medalla -->
    <div style="
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%);
      padding: 30px 60px;
      border-radius: 16px;
      border: 4px solid #d97706;
      margin: 0 auto 40px auto;
      display: inline-block;
      box-shadow:
        0 12px 24px rgba(217, 119, 6, 0.3),
        inset 0 2px 4px rgba(255, 255, 255, 0.5);
      transform: scale(1.08);
    ">
      <p style="
        font-size: 52px;
        color: #1e293b;
        margin: 0;
        font-weight: 900;
        letter-spacing: 2px;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
      ">
        {{nombre_completo}}
      </p>
    </div>

    <!-- Datos del participante -->
    <div style="
      background: white;
      padding: 15px 40px;
      border-radius: 8px;
      border: 2px solid #fca5a5;
      margin: 0 auto 50px auto;
      display: inline-block;
      box-shadow: 0 4px 8px rgba(220, 38, 38, 0.1);
    ">
      <p style="
        font-size: 16px;
        color: #64748b;
        margin: 0;
        font-weight: 600;
      ">
        <strong style="color: #475569;">C.I.:</strong> {{ci}}
        <span style="margin: 0 15px; color: #fecaca;">✦</span>
        <strong style="color: #475569;">Teléfono:</strong> {{telefono}}
        <span style="margin: 0 15px; color: #fecaca;">✦</span>
        <strong style="color: #475569;">Oficina:</strong> {{oficina_alfa}}
      </p>
    </div>

    <!-- Texto de reconocimiento -->
    <p style="
      font-size: 24px;
      color: #475569;
      margin: 0 0 30px 0;
      font-weight: 700;
      line-height: 1.8;
    ">
      Por su destacada participación y excelencia en el evento:
    </p>

    <!-- Evento -->
    <div style="
      background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
      padding: 35px 70px;
      border-radius: 16px;
      border: 4px solid #dc2626;
      margin: 0 auto 40px auto;
      display: inline-block;
      box-shadow: 0 10px 30px rgba(220, 38, 38, 0.25);
    ">
      <p style="
        font-size: 40px;
        color: #dc2626;
        margin: 0;
        font-weight: 900;
        letter-spacing: 1px;
      ">
        {{evento}}
      </p>
    </div>

    <!-- Fecha -->
    <div style="
      display: inline-block;
      background: white;
      padding: 18px 50px;
      border-radius: 35px;
      border: 3px solid #fbbf24;
      margin: 0 auto 50px auto;
      box-shadow: 0 6px 12px rgba(251, 191, 36, 0.2);
    ">
      <p style="
        font-size: 22px;
        color: #d97706;
        margin: 0;
        font-weight: 800;
      ">
        {{fecha}}
      </p>
    </div>

    <!-- Mensaje opcional -->
    <div style="
      background: linear-gradient(135deg, #fef9c3 0%, #fef08a 100%);
      padding: 20px 50px;
      border-radius: 10px;
      border: 2px dashed #eab308;
      margin: 0 auto 80px auto;
      display: inline-block;
      box-shadow: 0 4px 12px rgba(234, 179, 8, 0.15);
    ">
      <p style="
        font-size: 18px;
        color: #a16207;
        margin: 0;
        font-weight: 700;
        font-style: italic;
      ">
        {{mensaje}}
      </p>
    </div>

    <!-- Firmas -->
    <div style="
      display: flex;
      justify-content: space-around;
      align-items: flex-end;
      margin-top: auto;
      padding: 0 100px;
    ">
      <div style="text-align: center;">
        <div style="
          width: 230px;
          border-top: 5px double #dc2626;
          padding-top: 20px;
          margin: 0 auto 15px auto;
        "></div>
        <p style="font-size: 17px; color: #1e293b; margin: 0; font-weight: 900;">Comité Organizador</p>
        <p style="font-size: 14px; color: #64748b; margin: 5px 0 0 0;">Reconocimiento Oficial</p>
      </div>

      <div style="text-align: center;">
        <div style="
          width: 230px;
          border-top: 5px double #dc2626;
          padding-top: 20px;
          margin: 0 auto 15px auto;
        "></div>
        <p style="font-size: 17px; color: #1e293b; margin: 0; font-weight: 900;">Fecha de Emisión</p>
        <p style="font-size: 14px; color: #64748b; margin: 5px 0 0 0;">Certificación Registrada</p>
      </div>
    </div>
  </div>
</div>
    `.trim()
  },

  {
    id: 'blank',
    name: 'Lienzo en Blanco',
    description: 'Editor vacío para crear certificados personalizados',
    type: 'personalizado',
    content: `
<div style="
  font-family: 'Times New Roman', serif;
  width: 11in;
  height: 8.5in;
  padding: 0.5in;
  box-sizing: border-box;
  background: white;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
">
  <h1 style="
    font-size: 48px;
    color: #1e40af;
    margin: 0 0 30px 0;
    font-weight: 900;
    letter-spacing: 2px;
  ">
    TU TÍTULO AQUÍ
  </h1>

  <p style="
    font-size: 20px;
    color: #64748b;
    margin: 0 0 50px 0;
    font-style: italic;
  ">
    Comienza a editar este certificado...
  </p>

  <p style="
    font-size: 42px;
    color: #1e293b;
    margin: 0 0 20px 0;
    font-weight: 700;
  ">
    {{nombre_completo}}
  </p>

  <p style="
    font-size: 18px;
    color: #94a3b8;
    margin: 0;
  ">
    {{evento}} - {{fecha}}
  </p>
</div>
    `.trim()
  }
]
