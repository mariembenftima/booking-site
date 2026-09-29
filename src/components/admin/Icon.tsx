// Leaf mark: shown top-left in the admin navigation
export default function Icon({ size = 24 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M4 20C4 11 11 4 20 4C20 13 13 20 4 20Z" fill="#4F6B5A" />
      <path d="M4 20L14 10" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}