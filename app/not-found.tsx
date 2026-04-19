import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-6 py-24 text-center">
      <div className="space-y-6 max-w-lg mx-auto">
        <h1 className="text-8xl font-bold text-primary animate-pulse">404</h1>
        <h2 className="text-3xl font-bold">Page Not Found</h2>
        <p className="text-secondary text-lg">
          Oops! It seems like the page you are looking for has vanished into the digital void.
        </p>
        <div className="pt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-3 px-8 py-4 border-2 border-primary bg-primary text-primary-foreground hover:bg-transparent hover:text-primary transition-all duration-300 rounded font-bold uppercase tracking-widest text-sm"
          >
            ← Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
