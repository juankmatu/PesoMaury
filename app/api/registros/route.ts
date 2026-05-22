import { NextResponse } from "next/server"

// In-memory storage (will reset on each deployment - use a database for persistence)
let registros: { id: number; fecha: string; peso: number }[] = []
let nextId = 1

export async function GET() {
  return NextResponse.json(registros)
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { fecha, peso } = data

    // Check if date already exists
    const existing = registros.findIndex((r) => r.fecha === fecha)
    if (existing >= 0) {
      registros[existing].peso = peso
    } else {
      registros.push({ id: nextId++, fecha, peso })
      // Sort by date
      registros.sort((a, b) => a.fecha.localeCompare(b.fecha))
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 })
  }
}

export async function DELETE() {
  registros = []
  nextId = 1
  return NextResponse.json({ ok: true })
}
