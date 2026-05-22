import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-4xl md:text-6xl font-bold mb-4">📘 Study Tracker</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mb-8">
        Track your study sessions, set goals, monitor progress, and never miss a study reminder.
      </p>
      <div className="flex gap-3">
        <Link href="/login" className="btn-primary">Login</Link>
        <Link href="/register" className="btn-ghost border border-gray-300 dark:border-gray-700">Sign up</Link>
      </div>
    </div>
  );
}
