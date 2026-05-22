export default function Custom500() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700 }}>500</h1>
        <p style={{ color: '#666', marginTop: 8 }}>Server-side error occurred</p>
      </div>
    </div>
  );
}
