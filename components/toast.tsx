interface ToastProps {
  msg: string
  color: string
}

export function Toast({ msg, color }: ToastProps) {
  return (
    <div
      className="fixed bottom-6 right-6 rounded-lg px-4 py-2.5 font-bold text-sm text-[#0a0a14] z-50 animate-in fade-in slide-in-from-bottom-2 duration-300"
      style={{ background: color }}
    >
      {msg}
    </div>
  )
}
