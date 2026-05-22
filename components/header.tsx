export function Header() {
  return (
    <header className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-b-2 border-accent px-6 pt-5 pb-3.5">
      <h1 className="font-sans text-[clamp(22px,5vw,32px)] font-bold text-accent tracking-wider uppercase">
        Historial de Peso
      </h1>
      <p className="text-muted text-xs tracking-wider mt-0.5">
        Registro · Fluctuaciones · Meta de peso
      </p>
    </header>
  )
}
