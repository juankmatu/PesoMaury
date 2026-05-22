"use client"

import { useState, useEffect } from "react"

interface RegistroCardProps {
  onAdd: (fecha: string, peso: number) => void
}

export function RegistroCard({ onAdd }: RegistroCardProps) {
  const [fecha, setFecha] = useState("")
  const [peso, setPeso] = useState("")

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    setFecha(today)
  }, [])

  const handleAdd = () => {
    if (!fecha || !peso) return
    onAdd(fecha, parseFloat(peso))
    setPeso("")
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-3.5 mb-3.5">
      <div className="text-xs tracking-wider uppercase mb-2.5 text-blue">Registrar Peso</div>
      <div className="flex gap-2 flex-wrap items-center">
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="bg-background border border-border rounded-md text-foreground px-3 py-2 font-mono text-sm outline-none flex-1 min-w-[100px] focus:border-blue"
        />
        <input
          type="number"
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
          placeholder="Peso (kg)"
          step="0.1"
          className="bg-background border border-border rounded-md text-foreground px-3 py-2 font-mono text-sm outline-none flex-1 min-w-[100px] focus:border-blue"
        />
        <button
          onClick={handleAdd}
          className="border-none rounded-md px-4 py-2 cursor-pointer font-mono text-sm font-bold tracking-wide whitespace-nowrap bg-blue text-[#0a0a14] hover:opacity-85 active:translate-y-0 transition-all"
        >
          Registrar
        </button>
      </div>
    </div>
  )
}
