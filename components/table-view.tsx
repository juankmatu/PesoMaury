import type { Registro } from "@/app/page"

interface TableViewProps {
  registros: Registro[]
}

export function TableView({ registros }: TableViewProps) {
  const inv = [...registros].reverse()

  if (inv.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="text-center text-[#555] py-12">No hay registros aun.</div>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-[#1a1a2e] border-b-2 border-accent">
            <th className="py-2.5 px-3 text-accent font-bold text-left tracking-wide">#</th>
            <th className="py-2.5 px-3 text-accent font-bold text-left tracking-wide">Fecha</th>
            <th className="py-2.5 px-3 text-accent font-bold text-left tracking-wide">Peso (kg)</th>
            <th className="py-2.5 px-3 text-accent font-bold text-left tracking-wide">Cambio</th>
          </tr>
        </thead>
        <tbody>
          {inv.map((r, i) => {
            const origIdx = registros.length - 1 - i
            const prev = registros[origIdx - 1]
            const delta = prev ? r.peso - prev.peso : null
            const dStr = delta === null ? "—" : delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)
            const dClass =
              delta === null
                ? "text-muted"
                : delta < 0
                  ? "text-green"
                  : delta > 0
                    ? "text-red"
                    : "text-muted"

            return (
              <tr key={r.id} className="border-b border-border even:bg-[#0f0f1a]">
                <td className="py-2 px-3 text-[#555]">{origIdx + 1}</td>
                <td className="py-2 px-3 text-[#aaa]">{r.fecha}</td>
                <td className="py-2 px-3 text-blue font-bold">{r.peso.toFixed(1)}</td>
                <td className={`py-2 px-3 ${dClass}`}>{dStr}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
