'use client';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import FileUpload from '@/components/FileUpload';

export default function UploadsPage() {
  const [items, setItems] = useState([]);
  const load = async () => setItems(await api.get('/api/uploads'));
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Uploads</h1>
      <div className="card">
        <FileUpload onUploaded={load} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {items.map(u => (
          <a key={u._id} href={u.path} target="_blank" className="card hover:shadow-lg transition">
            {u.mimeType.startsWith('image/')
              ? <img src={u.path} alt={u.originalName} className="rounded-lg max-h-40 object-cover w-full" />
              : <div className="h-40 flex items-center justify-center text-5xl">📄</div>}
            <div className="text-sm mt-2 truncate">{u.originalName}</div>
            <div className="text-xs text-gray-500">{(u.size/1024).toFixed(1)} KB</div>
          </a>
        ))}
        {items.length === 0 && <div className="text-sm text-gray-500">No uploads yet.</div>}
      </div>
    </div>
  );
}
