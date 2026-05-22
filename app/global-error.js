'use client';
import Link from 'next/link';

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui' }}>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>Something went wrong</h1>
          <p style={{ color: '#666', marginTop: 8 }}>{error?.message || 'Unexpected error'}</p>
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <button onClick={() => reset()} style={{ padding: '8px 14px', borderRadius: 8, background: '#2563eb', color: 'white' }}>Try again</button>
            <Link href="/" style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #ccc' }}>Home</Link>
          </div>
        </div>
      </body>
    </html>
  );
}
