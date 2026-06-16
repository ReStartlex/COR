// Декоративный фон: размытые орбы + шумовой оверлей. Стили — в globals.css (.ambient-bg).
export default function AmbientBackground() {
  return (
    <>
      <div className="ambient-bg" aria-hidden="true">
        <div className="ambient-orb" />
        <div className="ambient-orb" />
        <div className="ambient-orb" />
      </div>
      <div className="noise-overlay" aria-hidden="true" />
    </>
  )
}
