export default function FeatureStrip() {
  const features = ['Live charts', 'AI insights', 'Fast edits'];
  return (
    <section style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginTop: '1.5rem' }}>
      {features.map((item) => (
        <div key={item} style={{ borderRadius: 20, border: '1px solid rgba(148,163,184,0.14)', background: 'rgba(15,23,42,0.72)', padding: '1.25rem' }}>
          <strong>{item}</strong>
        </div>
      ))}
    </section>
  );
}