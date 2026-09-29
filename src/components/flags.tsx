export function FlagFR() {
  return (
    <svg viewBox="0 0 3 2" className="h-4 w-6 rounded-sm" preserveAspectRatio="none" aria-hidden="true">
      <rect width="1" height="2" x="0" fill="#002654" />
      <rect width="1" height="2" x="1" fill="#FFFFFF" />
      <rect width="1" height="2" x="2" fill="#CE1126" />
    </svg>
  )
}

export function FlagUS() {
  return (
    <svg viewBox="0 0 494 260" className="h-4 w-6 rounded-sm" preserveAspectRatio="none" aria-hidden="true">
      <rect width="494" height="260" fill="#B22234" />
      {[20, 60, 100, 140, 180, 220].map((y) => (
        <rect key={y} y={y} width="494" height="20" fill="#FFFFFF" />
      ))}
      <rect width="198" height="140" fill="#3C3B6E" />
    </svg>
  )
}
