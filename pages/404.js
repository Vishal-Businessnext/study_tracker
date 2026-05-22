export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700 }}>404</h1>
        <p style={{ color: '#666', marginTop: 8 }}>Page not found</p>
        <a href="/" style={{ display: 'inline-block', marginTop: 16, padding: '8px 14px', borderRadius: 8, background: '#2563eb', color: 'white', textDecoration: 'none' }}>Go home</a>
      </div>
    </div>
  );
}
