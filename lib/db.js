import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('[db] MONGODB_URI is NOT set');
} else {
  // Log only host portion to avoid leaking credentials
  try {
    const u = new URL(MONGODB_URI.replace('mongodb+srv://', 'http://').replace('mongodb://', 'http://'));
    console.log(`[db] MONGODB_URI host=${u.host} db=${u.pathname}`);
  } catch { console.log('[db] MONGODB_URI present (unparseable for safe-log)'); }
}

let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    console.log('[db] connecting to MongoDB...');
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false, serverSelectionTimeoutMS: 10000 })
      .then(m => { console.log('[db] connected'); return m; })
      .catch(err => {
        console.error('[db] connection error:', err?.name, err?.message);
        cached.promise = null;
        throw err;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
