"use client"

import { useState } from "react"
import type { Registro, Config } from "@/app/page"
import { ChartView } from "./chart-view"
import { TableView } from "./table-view"

interface TabsViewProps {
  registros: Registro[]
  config: Config
  onExport: () => void
  onDelete: () => void
}

export function TabsView({ registros, config, onExport, onDelete }: TabsViewProps) {
  const [tab, setTab] = useState<"chart" | "table">("chart")

  return (
    <>
      <div className="flex gap-2 mb-3.5">
        <button
          onClick={() => setTab("chart")}
          className={`border-none rounded-md px-4 py-2 cursor-pointer font-mono text-sm font-bold tracking-wide whitespace-nowrap transition-all ${
            tab === "chart" ? "bg-accent text-[#0a0a14]" : "bg-border text-foreground"
          }`}
        >
          Grafica
        </button>
        <button
          onClick={() => setTab("table")}
          className={`border-none rounded-md px-4 py-2 cursor-pointer font-mono text-sm font-bold tracking-wide whitespace-nowrap transition-all ${
            tab === "table" ? "bg-accent text-[#0a0a14]" : "bg-border text-foreground"
          }`}
        >
          Historial
        </button>
      </div>

      {tab === "chart" ? (
        <ChartView registros={registros} config={config} />
      ) : (
        <TableView registros={registros} />
      )}

      <div className="text-right mt-2.5">
        <button
          onClick={onExport}
          className="border-none rounded-md px-3.5 py-1.5 cursor-pointer font-mono text-[11px] font-bold tracking-wide whitespace-nowrap bg-border text-foreground hover:opacity-85 transition-all"
        >
          Exportar CSV
        </button>
        <button
          onClick={onDelete}
          className="ml-2 bg-transparent border border-red text-red rounded-md px-2.5 py-1 cursor-pointer font-mono text-[11px] font-bold tracking-wide whitespace-nowrap hover:opacity-85 transition-all"
        >
          Borrar todo
        </button>
      </div>
    </>
  )
}
