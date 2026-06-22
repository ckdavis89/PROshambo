export default function RetroButton({ children, onClick, variant = 'default', disabled = false, className = '' }) {
  return (
    <button
      className={`retro-btn retro-btn--${variant} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
