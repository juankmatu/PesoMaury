"use client"

import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/header"
import { StatsBar } from "@/components/stats-bar"
import { MetaCard } from "@/components/meta-card"
import { RegistroCard } from "@/components/registro-card"
import { TabsView } from "@/components/tabs-view"
import { Toast } from "@/components/toast"

export interface Registro {
  id: number
  fecha: string
  peso: number
}

export interface Config {
  meta?: string
}

export default function HomePage() {
  const [registros, setRegistros] = useState<Registro[]>([])
  const [config, setConfig] = useState<Config>({})
  const [toast, setToast] = useState<{ msg: string; color: string } | null>(null)

  const cargarDatos = useCallback(async () => {
    try {
      const [r1, r2] = await Promise.all([
        fetch("/api/registros").then((r) => r.json()),
        fetch("/api/config").then((r) => r.json()),
      ])
      setRegistros(r1)
      setConfig(r2)
    } catch (e) {
      console.error("Error cargando datos:", e)
    }
  }, [])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  const showToast = (msg: string, color = "var(--green)") => {
    setToast({ msg, color })
    setTimeout(() => setToast(null), 2200)
  }

  const agregarPeso = async (fecha: string, peso: number) => {
    await fetch("/api/registros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fecha, peso }),
    })
    showToast("Peso registrado")
    cargarDatos()
  }

  const guardarMeta = async (meta: number) => {
    await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meta }),
    })
    showToast("Meta guardada")
    cargarDatos()
  }

  const borrarTodo = async () => {
    if (!confirm("Borrar TODOS los registros?")) return
    await fetch("/api/registros", { method: "DELETE" })
    showToast("Historial eliminado", "var(--red)")
    cargarDatos()
  }

  const exportarCSV = () => {
    const rows = [
      ["id", "fecha", "peso_kg"],
      ...registros.map((r) => [r.id, r.fecha, r.peso]),
    ]
    const csv = rows.map((r) => r.join(",")).join("\n")
    const a = document.createElement("a")
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv)
    a.download = "historial_peso.csv"
    a.click()
  }

  return (
    <div className="min-h-screen">
      <Header />
      <StatsBar registros={registros} config={config} />
      <main className="p-4 max-w-3xl mx-auto">
        <MetaCard onSave={guardarMeta} currentMeta={config.meta} />
        <RegistroCard onAdd={agregarPeso} />
        <TabsView
          registros={registros}
          config={config}
          onExport={exportarCSV}
          onDelete={borrarTodo}
        />
      </main>
      {toast && <Toast msg={toast.msg} color={toast.color} />}
    </div>
  )
}
