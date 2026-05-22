'use client';
import { useRef, useState } from 'react';
import { api } from '@/services/api';
import toast from 'react-hot-toast';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX = 5 * 1024 * 1024;

export default function FileUpload({ onUploaded }) {
  const inputRef = useRef();
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    if (!ALLOWED.includes(file.type)) return toast.error('Unsupported file type');
    if (file.size > MAX) return toast.error('Max file size is 5MB');
    if (file.type.startsWith('image/')) setPreview(URL.createObjectURL(file));
    else setPreview(null);
    setUploading(true);
    try {
      const data = await api.upload(file);
      toast.success('Uploaded');
      onUploaded?.(data);
    } catch (e) { toast.error(e.message); }
    finally { setUploading(false); }
  };

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files?.[0]); }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer border-2 border-dashed rounded-xl p-6 text-center text-sm transition
          ${drag ? 'border-brand-500 bg-brand-50 dark:bg-gray-800' : 'border-gray-300 dark:border-gray-700 hover:border-brand-500'}`}>
        <input ref={inputRef} type="file" className="hidden" accept=".jpg,.jpeg,.png,.webp,.pdf"
          onChange={(e) => handleFile(e.target.files?.[0])} />
        {uploading ? 'Uploading…' : 'Drag & drop or click to upload (jpg, png, webp, pdf — max 5MB)'}
      </div>
      {preview && <img src={preview} alt="preview" className="mt-3 max-h-48 rounded-lg border border-gray-200 dark:border-gray-800" />}
    </div>
  );
}
