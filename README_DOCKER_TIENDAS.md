# Sistema POS con Docker - Instalación para Tiendas

## ¿Qué es Docker?

Docker es una herramienta que permite empacar toda tu aplicación en un "contenedor" listo para usar, sin necesidad de configurar nada en la PC.

**Ventajas:**
- Un comando (`docker-compose up`) y listo
- Cero configuración manual
- Funciona en cualquier PC
- Aislamiento seguro de datos

## Requisitos Mínimos

- **Espacio en disco:** 3 GB disponibles
- **RAM:** 2 GB mínimo
- **Internet:** Para descarga inicial
- **Windows 10+, Mac, o Linux**

## Instalación Paso a Paso

### PASO 1: Descargar Docker Desktop (5 minutos)

1. Ve a: https://www.docker.com/products/docker-desktop
2. Descarga según tu SO:
   - Windows: Docker Desktop for Windows
   - Mac: Docker Desktop for Mac
   - Linux: Docker Engine

### PASO 2: Instalar Docker (10 minutos)

**Windows:**
1. Ejecuta el instalador descargado
2. Acepta términos
3. Haz clic en "Install"
4. Reinicia la PC cuando pida

**Mac/Linux:**
1. Sigue las instrucciones del instalador
2. Reinicia si es necesario

### PASO 3: Verificar Instalación (2 minutos)

Abre la terminal (cmd en Windows, Terminal en Mac/Linux) y escribe:

```bash
docker --version
```

Debería mostrar algo como: `Docker version 20.10.12`

Si sale error, reinicia la PC e intenta de nuevo.

### PASO 4: Obtener Archivos del Sistema (5 minutos)

Pide a tu proveedor (nosotros) estos archivos:
- `docker-compose.yml`
- `Dockerfile.pos`
- `Dockerfile.facturacion`
- `.dockerignore`
- `README_DOCKER_TIENDAS.md` (este archivo)

Guárdalos en una carpeta: `C:\MiTienda` (Windows) o `~/MiTienda` (Mac/Linux)

### PASO 5: Configurar Credenciales (5 minutos)

Abre el archivo `docker-compose.yml` con un editor de texto (Bloc de notas, VS Code, etc.)

Busca estas líneas:
```yaml
environment:
  - NEXT_PUBLIC_SUPABASE_URL=https://ehnbuveijpjkgqglopef.supabase.co
  - NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Reemplaza con las credenciales que te proporcionó tu proveedor:
- URL de Supabase
- Clave anónima de Supabase

Guarda el archivo.

### PASO 6: Iniciar Sistema (3 minutos)

1. Abre terminal en la carpeta `MiTienda`:
   - Windows: Shift + Click derecho → Abrir PowerShell aquí
   - Mac/Linux: Click derecho → Abrir Terminal

2. Escribe:
```bash
docker-compose up
```

3. Espera a ver este mensaje:
```
✓ pos service is healthy
✓ facturacion service is healthy
```

¡Listo! El sistema está corriendo.

### PASO 7: Acceder al Sistema (1 minuto)

Abre tu navegador y ve a:

```
http://localhost:3000
```

Deberías ver la pantalla de login del POS.

Login por defecto:
- Usuario: `admin@pos.com`
- Contraseña: `admin123`

## Usar el Sistema

### Casodia normal:

1. Encender PC
2. Abrir terminal en carpeta `MiTienda`
3. Escribir: `docker-compose up`
4. Ir a: `http://localhost:3000`
5. ¡Vender!

### Detener el sistema:

En la terminal, presiona: `Ctrl + C`

### Reiniciar sin errores:

```bash
docker-compose restart
```

### Ver logs (para debugging):

```bash
docker-compose logs -f pos
```

O para facturación:

```bash
docker-compose logs -f facturacion
```

## Características del Sistema

### POS (Terminal de Ventas)
- **Puerto:** http://localhost:3000
- **Función:** Vender productos, generar recibos
- **BD:** Supabase en la nube (seguro)

### Facturación (API)
- **Puerto:** http://localhost:5000
- **Función:** Generar facturas electrónicas (DTE)
- **Uso:** Llamadas automáticas desde POS

### Base de Datos Local (Opcional)
- **Puerto:** localhost:5432 (solo local)
- **Usuario:** tienda_admin
- **Contraseña:** tienda_db_pass_123
- **Admin Web:** http://localhost:8080

## Solución de Problemas

### "docker: command not found"
**Solución:**
- Docker no está instalado correctamente
- Reinicia la PC después de instalar
- Verifica: `docker --version`

### "Cannot start service pos"
**Solución:**
- Asegúrate que el puerto 3000 está libre
- En terminal: `docker-compose down`
- Intenta de nuevo: `docker-compose up`

### "Cannot connect to http://localhost:3000"
**Solución:**
- Espera 30 segundos (primera vez tarda más)
- Recarga el navegador: Ctrl + R (o Cmd + R en Mac)
- Verifica en terminal que dice "healthy"

### "Error: ENOENT: no such file or directory"
**Solución:**
- Asegúrate que estás en la carpeta correcta
- `docker-compose.yml` debe estar en esa carpeta
- Prueba: `ls -la docker-compose.yml` (o `dir docker-compose.yml` en Windows)

### Datos se pierden al reiniciar
**Solución:**
- Los datos se guardan en Supabase (en la nube)
- Si cierras y reabres Docker, los datos persisten
- Verifica que Internet está conectado

### Lento después de muchas ventas
**Solución:**
- Limpia caché de navegador: Ctrl + Shift + Delete
- Reinicia Docker: `docker-compose restart`
- Aumenta RAM disponible en Docker (Configuración)

## Conectar Múltiples PCs

Si tienes varias cajas registradoras:

**Opción 1: Misma PC (Recomendado)**
- Solo 1 Docker corriendo
- Múltiples navegadores a localhost:3000
- Todos comparten mismos datos

**Opción 2: PCs diferentes (Red local)**
- Averigua IP de PC con Docker: `ipconfig` (Windows) o `ifconfig` (Mac/Linux)
- Busca: IPv4 Address
- Otras PCs usan: `http://[IP]:3000`

Ejemplo: `http://192.168.1.100:3000`

## Actualizar a Nueva Versión

Cuando hay actualización:

1. Descarga nuevos archivos
2. Reemplaza en tu carpeta `MiTienda`
3. En terminal:
```bash
docker-compose down
docker-compose up
```

¡Automáticamente se actualiza todo!

## Soporte

Si tienes problemas:

1. Toma screenshot del error
2. Copia los logs: `docker-compose logs > error.txt`
3. Contacta al proveedor con:
   - Descripción del problema
   - Screenshot
   - error.txt

Incluye tu información de tienda para diagnóstico rápido.

## Información Técnica (Avanzado)

### Archivos creados:
- `.docker/` - Configuración
- `data/pos/` - Datos locales
- `data/facturas/` - Facturas generadas
- `data/postgres/` - BD local (si usas)

### Puertos en uso:
- 3000 → POS
- 5000 → API Facturación
- 5432 → BD PostgreSQL
- 8080 → Admin BD

### Ver contenedores corriendo:
```bash
docker-compose ps
```

### Ejecutar comando dentro:
```bash
docker-compose exec pos bash
```

## ¿Preguntas?

Contacta al proveedor. Estamos aquí para ayudarte.

---

**Versión:** 1.0.0  
**Última actualización:** Mayo 2026  
**Soporte:** contacto@pos-system.com
