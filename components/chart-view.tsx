"use client"

import { useEffect, useRef } from "react"
import type { Registro, Config } from "@/app/page"

interface ChartViewProps {
  registros: Registro[]
  config: Config
}

declare global {
  interface Window {
    Chart: any
  }
}

export function ChartView({ registros, config }: ChartViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<any>(null)

  useEffect(() => {
    // Load Chart.js from CDN
    const script = document.createElement("script")
    script.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"
    script.onload = () => renderChart()
    document.body.appendChild(script)

    return () => {
      if (chartRef.current) chartRef.current.destroy()
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined" && window.Chart) {
      renderChart()
    }
  }, [registros, config])

  const renderChart = () => {
    if (!canvasRef.current || !window.Chart) return
    if (registros.length < 2) return

    if (chartRef.current) chartRef.current.destroy()

    const labels = registros.map((r) => r.fecha)
    const pesos = registros.map((r) => r.peso)
    const meta = config.meta ? parseFloat(config.meta) : null

    let metaLine: number[] | null = null
    if (meta !== null && pesos.length > 1) {
      const start = pesos[0]
      metaLine = pesos.map((_, i) =>
        parseFloat((start - ((start - meta) / (pesos.length - 1)) * i).toFixed(2))
      )
    }

    const datasets: any[] = [
      {
        label: "Peso real",
        data: pesos,
        borderColor: "#64b5f6",
        backgroundColor: "rgba(100,181,246,0.08)",
        borderWidth: 2.5,
        pointBackgroundColor: "#0a0a14",
        pointBorderColor: "#e8c547",
        pointBorderWidth: 2,
        pointRadius: 5,
        tension: 0,
        fill: false,
      },
    ]

    if (metaLine) {
      datasets.push({
        label: "Trayectoria a meta",
        data: metaLine,
        borderColor: "#e8c547",
        borderDash: [8, 4],
        borderWidth: 2,
        pointRadius: 0,
        tension: 0,
        fill: false,
      })
    }

    if (meta !== null) {
      datasets.push({
        label: `Meta: ${meta} kg`,
        data: labels.map(() => meta),
        borderColor: "rgba(232,197,71,0.3)",
        borderDash: [3, 6],
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
      })
    }

    const allVals = [...pesos, ...(metaLine || []), meta].filter((v) => v != null) as number[]
    const minY = Math.floor(Math.min(...allVals) - 2)
    const maxY = Math.ceil(Math.max(...allVals) + 2)

    chartRef.current = new window.Chart(canvasRef.current, {
      type: "line",
      data: { labels, datasets },
      options: {
        responsive: true,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            labels: { color: "#888", font: { family: "'Share Tech Mono', monospace", size: 11 } },
          },
          tooltip: {
            backgroundColor: "#0f0f1a",
            borderColor: "#e8c547",
            borderWidth: 1,
            titleColor: "#e8c547",
            bodyColor: "#f0f0f0",
            titleFont: { family: "Share Tech Mono", size: 12 },
            bodyFont: { family: "Share Tech Mono", size: 12 },
            callbacks: {
              label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)} kg`,
            },
          },
        },
        scales: {
          x: {
            ticks: { color: "#888", font: { family: "Share Tech Mono", size: 11 } },
            grid: { color: "#1e1e30" },
            title: {
              display: true,
              text: "FECHA",
              color: "#555",
              font: { family: "Share Tech Mono", size: 11 },
            },
          },
          y: {
            min: minY,
            max: maxY,
            ticks: {
              color: "#888",
              font: { family: "Share Tech Mono", size: 11 },
              callback: (v: number) => v + " kg",
            },
            grid: { color: "#1e1e30" },
            title: {
              display: true,
              text: "PESO (kg)",
              color: "#555",
              font: { family: "Share Tech Mono", size: 11 },
            },
          },
        },
      },
    })
  }

  if (registros.length < 2) {
    return (
      <div className="bg-surface border border-border rounded-xl p-5">
        <div className="text-center text-[#555] py-16">
          <div className="text-[42px] mb-2.5">📉</div>
          <div>Registra al menos 2 pesos para ver la grafica</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <canvas ref={canvasRef} className="max-h-[360px]" />
      <p className="text-center text-[#444] text-[11px] mt-1.5">
        Linea azul = peso real - Linea amarilla punteada = trayectoria a meta
      </p>
    </div>
  )
}
