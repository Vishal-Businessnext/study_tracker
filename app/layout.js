import './globals.css';
import { Toaster } from 'react-hot-toast';
import ThemeProvider from '@/components/ThemeProvider';

export const metadata = {
  title: 'Study Tracker',
  description: 'Track your study sessions, goals, and progress.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
