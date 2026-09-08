// app/api/usuarios/route.ts

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'
import crypto from 'crypto'

// Función auxiliar para hashing seguro
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

export async function POST(req: Request) {
  try {
    const { nombre, email, password, rol } = await req.json()

    if (!nombre || !email || !password) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const contraseña_hash = hashPassword(password)

    const { data, error } = await supabase
      .from('usuarios')
      .insert([{ nombre, email, contraseña_hash, rol: rol || 'cashier', estado: 'activo' }])
      .select()

    if (error) throw error

    return NextResponse.json({ success: true, user: data[0] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const { id, nombre, email, password, rol } = await req.json()

    if (!id) return NextResponse.json({ error: 'ID no proporcionado' }, { status: 400 })

    const updatePayload: any = { nombre, email, rol }
    if (password) {
      updatePayload.contraseña_hash = hashPassword(password)
    }

    const { error } = await supabase
      .from('usuarios')
      .update(updatePayload)
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

    const { error } = await supabase.from('usuarios').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}