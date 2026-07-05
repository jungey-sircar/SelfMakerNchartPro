export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '4rem', background: '#050816', color: '#f8fafc' }}>
      <section style={{ maxWidth: 860, width: '100%', border: '1px solid rgba(148,163,184,0.16)', borderRadius: 32, padding: '3rem', background: 'linear-gradient(180deg, rgba(15,23,42,0.9), rgba(2,6,23,0.9))' }}>
        <p style={{ textTransform: 'uppercase', letterSpacing: '0.22em', color: '#f4b860', fontSize: 12, fontWeight: 700 }}>NChartPro</p>
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', lineHeight: 0.95, margin: '0.75rem 0 1rem' }}>NChartPro</h1>
        <p style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: 1.8, maxWidth: 720 }}>Sample NChartPro landing page content.</p>
      </section>
    </main>
  );
}