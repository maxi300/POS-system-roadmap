// app/admin/facturacion-dte/configuracion/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function ConfiguracionDTEPage() {
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [formData, setFormData] = useState({
    nombre_comercial: '',
    razon_social: '',
    nit: '',
    nrc: '',
    cod_actividad: '',
    desc_actividad: '',
    departamento_code: '',
    municipio_code: '',
    direccion_complemento: '',
    telefono: '',
    correo_contacto: '',
    ambiente_dte: '00', // 00: Pruebas, 01: Producción
    version_json: '3',
    url_firmador: '',
    api_key_mh: '',
    password_p12: '',
  })

  useEffect(() => {
    cargarConfiguracion()
  }, [])

  async function cargarConfiguracion() {
    setLoading(true)
    const { data, error } = await supabase
      .from('configuracion_empresa')
      .select('*')
      .limit(1)
      .single()

    if (data && !error) {
      setFormData({
        nombre_comercial: data.nombre_comercial || '',
        razon_social: data.razon_social || '',
        nit: data.nit || '',
        nrc: data.nrc || '',
        cod_actividad: data.cod_actividad || '',
        desc_actividad: data.desc_actividad || '',
        departamento_code: data.departamento_code || '',
        municipio_code: data.municipio_code || '',
        direccion_complemento: data.direccion_complemento || '',
        telefono: data.telefono || '',
        correo_contacto: data.correo_contacto || '',
        ambiente_dte: data.ambiente_dte || '00',
        version_json: String(data.version_json || '3'),
        url_firmador: data.url_firmador || '',
        api_key_mh: data.api_key_mh || '',
        password_p12: data.password_p12 || '',
      })
    }
    setLoading(false)
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault()
    setGuardando(true)

    // Verificamos si ya existe un registro para actualizarlo o insertarlo
    const { data: existing } = await supabase.from('configuracion_empresa').select('id').limit(1).single()

    const payload = {
      ...formData,
      version_json: parseInt(formData.version_json) || 3,
      updated_at: new Date().toISOString(),
    }

    let error;
    if (existing?.id) {
      const res = await supabase.from('configuracion_empresa').update(payload).eq('id', existing.id)
      error = res.error
    } else {
      const res = await supabase.from('configuracion_empresa').insert([payload])
      error = res.error
    }

    setGuardando(false)
    if (error) {
      alert(`Error al guardar configuración: ${error.message}`)
    } else {
      alert('Configuración tributaria actualizada con éxito.')
    }
  }

  if (loading) {
    return <div className="p-6 text-white">Cargando parámetros de empresa...</div>
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 text-white">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración Facturación DTE (El Salvador)</h1>
        <p className="text-slate-400 mt-1">Parámetros del emisor, llaves de conexión con el Ministerio de Hacienda y Firmador.</p>
      </div>

      <form onSubmit={handleGuardar} className="space-y-6">
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-lg text-slate-200">Datos Fiscales del Emisor</CardTitle>
            <CardDescription>Información legal registrada ante el Ministerio de Hacienda.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400">Razón Social</label>
              <Input 
                value={formData.razon_social} 
                onChange={(e) => setFormData({...formData, razon_social: e.target.value})}
                className="bg-slate-800 border-slate-700 text-white mt-1" 
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400">Nombre Comercial</label>
              <Input 
                value={formData.nombre_comercial} 
                onChange={(e) => setFormData({...formData, nombre_comercial: e.target.value})}
                className="bg-slate-800 border-slate-700 text-white mt-1" 
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400">NIT</label>
              <Input 
                value={formData.nit} 
                onChange={(e) => setFormData({...formData, nit: e.target.value})}
                className="bg-slate-800 border-slate-700 text-white mt-1" 
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400">NRC</label>
              <Input 
                value={formData.nrc} 
                onChange={(e) => setFormData({...formData, nrc: e.target.value})}
                className="bg-slate-800 border-slate-700 text-white mt-1" 
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400">Código de Actividad Económica</label>
              <Input 
                value={formData.cod_actividad} 
                onChange={(e) => setFormData({...formData, cod_actividad: e.target.value})}
                className="bg-slate-800 border-slate-700 text-white mt-1" 
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400">Descripción de Actividad</label>
              <Input 
                value={formData.desc_actividad} 
                onChange={(e) => setFormData({...formData, desc_actividad: e.target.value})}
                className="bg-slate-800 border-slate-700 text-white mt-1" 
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-400">Depto (Code)</label>
                <Input 
                  value={formData.departamento_code} 
                  onChange={(e) => setFormData({...formData, departamento_code: e.target.value})}
                  className="bg-slate-800 border-slate-700 text-white mt-1" 
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400">Municipio (Code)</label>
                <Input 
                  value={formData.municipio_code} 
                  onChange={(e) => setFormData({...formData, municipio_code: e.target.value})}
                  className="bg-slate-800 border-slate-700 text-white mt-1" 
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400">Teléfono y Correo</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Input 
                  value={formData.telefono} 
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  placeholder="Teléfono" 
                  className="bg-slate-800 border-slate-700 text-white" 
                />
                <Input 
                  value={formData.correo_contacto} 
                  onChange={(e) => setFormData({...formData, correo_contacto: e.target.value})}
                  placeholder="Correo" 
                  className="bg-slate-800 border-slate-700 text-white" 
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-400">Dirección Completa</label>
              <Input 
                value={formData.direccion_complemento} 
                onChange={(e) => setFormData({...formData, direccion_complemento: e.target.value})}
                className="bg-slate-800 border-slate-700 text-white mt-1" 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-lg text-slate-200">Credenciales Técnicas y Conexión MH</CardTitle>
            <CardDescription>Ambiente de pruebas o producción, URL del firmador local o en la nube.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400">Ambiente DTE</label>
              <select 
                value={formData.ambiente_dte} 
                onChange={(e) => setFormData({...formData, ambiente_dte: e.target.value})}
                className="w-full mt-1 bg-slate-800 border border-slate-700 text-white rounded-md p-2 text-sm"
              >
                <option value="00">00 - Pruebas (の開発 / Testing)</option>
                <option value="01">01 - Producción</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400">Versión JSON</label>
              <Input 
                type="number"
                value={formData.version_json} 
                onChange={(e) => setFormData({...formData, version_json: e.target.value})}
                className="bg-slate-800 border-slate-700 text-white mt-1" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-400">URL del Servidor Firmador</label>
              <Input 
                value={formData.url_firmador} 
                onChange={(e) => setFormData({...formData, url_firmador: e.target.value})}
                placeholder="http://localhost:8103/firmar" 
                className="bg-slate-800 border-slate-700 text-white mt-1" 
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400">API Key / Token Ministerio de Hacienda</label>
              <Input 
                type="password"
                value={formData.api_key_mh} 
                onChange={(e) => setFormData({...formData, api_key_mh: e.target.value})}
                className="bg-slate-800 border-slate-700 text-white mt-1" 
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400">Password Certificado P12</label>
              <Input 
                type="password"
                value={formData.password_p12} 
                onChange={(e) => setFormData({...formData, password_p12: e.target.value})}
                className="bg-slate-800 border-slate-700 text-white mt-1" 
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={guardando} className="bg-blue-600 hover:bg-blue-500 text-white px-6">
            {guardando ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </div>
      </form>
    </div>
  )
}