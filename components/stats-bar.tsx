import type { Registro, Config } from "@/app/page"

interface StatsBarProps {
  registros: Registro[]
  config: Config
}

export function StatsBar({ registros, config }: StatsBarProps) {
  const meta = config.meta ? parseFloat(config.meta) : null
  const inicio = registros.length ? registros[0].peso : null
  const actual = registros.length ? registros[registros.length - 1].peso : null
  const perdido = inicio && actual ? inicio - actual : null
  const falta = meta && actual ? actual - meta : null

  return (
    <div className="flex bg-[#0f0f1a] border-b border-border overflow-x-auto">
      <Stat label="Inicio" value={inicio ? `${inicio.toFixed(1)} kg` : "—"} color="text-muted" />
      <Stat label="Actual" value={actual ? `${actual.toFixed(1)} kg` : "—"} color="text-blue" />
      <Stat label="Meta" value={meta ? `${meta} kg` : "—"} color="text-accent" />
      <Stat
        label="Perdido"
        value={perdido !== null ? `${perdido.toFixed(1)} kg` : "—"}
        color="text-green"
      />
      <Stat
        label="Falta"
        value={falta !== null ? (falta <= 0 ? "Meta!" : `${falta.toFixed(1)} kg`) : "—"}
        color={falta !== null && falta <= 0 ? "text-green" : "text-red"}
      />
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="stat-card">
      <div className="text-[9px] text-[#555] tracking-wider uppercase">{label}</div>
      <div className={`text-[15px] font-bold mt-0.5 ${color}`}>{value}</div>
    </div>
  )
}
