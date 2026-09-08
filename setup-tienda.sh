#!/bin/bash

# =============================================================================
# SCRIPT DE SETUP AUTOMÁTICO - OPCIÓN C
# =============================================================================
# Este script configura automáticamente una instalación para una nueva tienda
# Uso: bash setup-tienda.sh
# =============================================================================

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║         POS FERRETERÍA - CONFIGURACIÓN AUTOMÁTICA             ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ ERROR: Node.js no está instalado"
    echo "Descarga desde: https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js detectado: $(node --version)"
echo ""

# Pedir información de la tienda
echo "════════════════════════════════════════════════════════════════"
echo "INFORMACIÓN DE LA TIENDA"
echo "════════════════════════════════════════════════════════════════"
echo ""

read -p "Nombre de la tienda: " store_name
read -p "ID de la tienda (sin espacios): " store_id
read -p "URL de Supabase (https://...): " supabase_url
read -p "Clave anon de Supabase: " supabase_key

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "Configurando..."
echo "════════════════════════════════════════════════════════════════"
echo ""

# Crear .env.local
cat > .env.local << EOF
# Configuración para: $store_name

NEXT_PUBLIC_STORE_NAME=$store_name
NEXT_PUBLIC_STORE_ID=$store_id
NEXT_PUBLIC_SUPABASE_URL=$supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabase_key

NODE_ENV=production
EOF

echo "✓ Archivo .env.local creado"
echo ""

# Instalar dependencias
echo "Instalando dependencias (esto toma 3-5 minutos)..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error en npm install"
    exit 1
fi

echo ""
echo "✓ Dependencias instaladas"
echo ""

# Listo
echo "════════════════════════════════════════════════════════════════"
echo "✓ ¡CONFIGURACIÓN COMPLETADA!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Para iniciar el servidor, ejecuta:"
echo ""
echo "  npm run dev"
echo ""
echo "Luego abre: http://localhost:3000"
echo ""
echo "Credenciales de ejemplo:"
echo "  Email: admin@pos.com"
echo "  Pass: (La que configuraste en Supabase)"
echo ""
