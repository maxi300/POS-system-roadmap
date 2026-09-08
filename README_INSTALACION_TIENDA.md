# POS FERRETERÍA - GUÍA DE INSTALACIÓN

## 📋 Requisitos Previos

Antes de instalar, asegúrate de tener:

- **Windows 10+**, **Mac**, o **Linux**
- **Node.js 18+** instalado ([Descargar](https://nodejs.org/))
- **npm** o **pnpm** (incluido con Node.js)
- **Conexión a Internet** (para Supabase)

### Verificar que Node.js está instalado

Abre terminal/CMD y escribe:
```bash
node --version
npm --version
```

Deberías ver versiones (ej: v18.0.0, 9.0.0)

---

## 🚀 Pasos de Instalación

### PASO 1: Descargar y Extraer

1. Recibe carpeta `POS_v1.0.zip`
2. Extrae en una ubicación permanente (ej: `C:\Programas\POS_v1.0`)
3. Abre la carpeta en terminal

### PASO 2: Configurar Credenciales de Supabase

1. Abre carpeta POS_v1.0
2. Busca archivo `.env.local`
3. Abre con Notepad
4. Reemplaza los valores:

**ANTES:**
```
NEXT_PUBLIC_STORE_NAME=Mi Ferretería
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

**DESPUÉS (con tus datos):**
```
NEXT_PUBLIC_STORE_NAME=Ferretería El Abuelo
NEXT_PUBLIC_SUPABASE_URL=https://abc123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

5. Guarda archivo (Ctrl+S)

### PASO 3: Instalar Dependencias

Abre terminal en carpeta POS_v1.0 y ejecuta:

```bash
npm install
```

O si tienes pnpm:
```bash
pnpm install
```

Esto descarga ~500MB de archivos. **Espera 3-5 minutos.**

### PASO 4: Iniciar Servidor

```bash
npm run dev
```

O con pnpm:
```bash
pnpm dev
```

Deberías ver:
```
> POS@1.0.0 dev
> next dev

Ready in 3.2s
```

### PASO 5: Abrir en Navegador

1. Abre navegador (Chrome, Firefox, Edge)
2. Ve a: **http://localhost:3000**
3. Deberías ver login

### PASO 6: Login

**Email:** admin@pos.com
**Contraseña:** (La que tu proveedor te dio)

¡**LISTO! Puedes comenzar a vender.**

---

## 📱 Uso Básico

### Crear una Venta
1. Login como Cajero
2. Busca producto
3. Agrega al carrito
4. Ingresa cliente
5. Selecciona pago
6. Confirma venta
7. ¡Imprime recibo!

### Ver Reportes
1. Login como Manager
2. Click "Reportes"
3. Ve gráficas y desempeño

### Gestionar Productos
1. Login como Admin
2. Click "Productos"
3. Agrega/edita/elimina

---

## 🔧 Troubleshooting

### Error: "Cannot find module..."
```bash
npm install
```

### Error: "Port 3000 already in use"
Otro programa usa puerto 3000. Reinicia computadora o:
```bash
npm run dev -- -p 3001
```

### App no carga en http://localhost:3000
- Verifica que npm run dev esté ejecutándose
- Intenta http://127.0.0.1:3000
- Reinicia navegador (Ctrl+Shift+R)

### Error de Supabase "Invalid credentials"
- Verifica que .env.local tenga URLs correctas
- No debe haber espacios extra
- Copia exactamente lo que proveedor te dio

### App se reinicia constantemente
- Hay error en el código
- Revisa consola (terminal)
- Contacta soporte

---

## ☎️ Soporte

**Problemas técnicos:**
📧 Email: soporte@tupos.com
📱 WhatsApp: +502 7000-0000

**Horario:** Lunes-Viernes 8am-5pm

**Información a incluir en soporte:**
- Tu nombre + ferretería
- Screenshot del error
- Pasos para reproducir

---

## 📚 Documentación Adicional

- Todos los usuarios predeterminados están en `USUARIOS_PREDETERMINADOS.txt`
- Preguntas frecuentes en `FAQ.md`
- Guía avanzada en `GUIA_AVANZADA.md`

---

## ✅ Checklist Post-Instalación

- [ ] Node.js instalado
- [ ] Carpeta extraída
- [ ] .env.local configurado
- [ ] npm install completó
- [ ] npm run dev ejecutando
- [ ] http://localhost:3000 abre
- [ ] Login funciona
- [ ] Venta de prueba hecha
- [ ] Recibo imprime

**Si todo está ✓ = ¡Instalación exitosa!**

---

**Versión:** 1.0  
**Última actualización:** 2026-05-12  
**Soporte:** soporte@tupos.com
