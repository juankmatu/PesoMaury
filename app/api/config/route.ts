import { NextResponse } from "next/server"

// In-memory storage (will reset on each deployment - use a database for persistence)
let config: Record<string, string> = {}

export async function GET() {
  return NextResponse.json(config)
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    for (const [key, value] of Object.entries(data)) {
      config[key] = String(value)
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 })
  }
}
