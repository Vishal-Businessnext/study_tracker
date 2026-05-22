'use client';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';

export default function useMe() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get('/api/auth/me').then(setMe).catch(() => setMe(null)).finally(() => setLoading(false));
  }, []);
  return { me, loading, setMe };
}
