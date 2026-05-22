"use client"

import { useState } from "react"

interface MetaCardProps {
  onSave: (meta: number) => void
  currentMeta?: string
}

export function MetaCard({ onSave, currentMeta }: MetaCardProps) {
  const [value, setValue] = useState("")

  const handleSave = () => {
    if (!value) return
    onSave(parseFloat(value))
    setValue("")
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-3.5 mb-3.5">
      <div className="text-xs tracking-wider uppercase mb-2.5 text-accent">Meta de Peso</div>
      <div className="flex gap-2 flex-wrap items-center">
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={currentMeta ? `Meta actual: ${currentMeta} kg` : "ej: 75.0"}
          step="0.1"
          className="bg-background border border-border rounded-md text-foreground px-3 py-2 font-mono text-sm outline-none flex-1 min-w-[100px] focus:border-blue"
        />
        <button
          onClick={handleSave}
          className="border-none rounded-md px-4 py-2 cursor-pointer font-mono text-sm font-bold tracking-wide whitespace-nowrap bg-accent text-[#0a0a14] hover:opacity-85 active:translate-y-0 transition-all"
        >
          Guardar Meta
        </button>
      </div>
    </div>
  )
}
