// app/api/hash-password/route.ts

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()

    if (!password || password.trim().length === 0) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    // Usar bcryptjs (instalable con: pnpm add bcryptjs)
    // Importamos dinámicamente para que no falle si no está instalado
    const bcrypt = await import('bcryptjs')

    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    return NextResponse.json({
      success: true,
      original: password,
      hashed: hashedPassword,
      message: 'Copy the "hashed" value to your database'
    })
  } catch (error: any) {
    // Si bcryptjs no está instalado
    if (error.code === 'MODULE_NOT_FOUND') {
      return NextResponse.json(
        { 
          error: 'bcryptjs not installed',
          instruction: 'Run: pnpm add bcryptjs',
          details: error.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to hash password',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// GET endpoint para testing
export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint with {"password": "your_password"}',
    example: {
      method: 'POST',
      url: '/api/hash-password',
      body: { password: 'admin123' },
      response: {
        success: true,
        original: 'admin123',
        hashed: '$2a$10$...'
      }
    }
  })
}
