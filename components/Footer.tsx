'use client';

import Link from 'next/link';
import { SPORTS_CONFIG } from '@/lib/sports-config';


export default function Footer() {
  return (
    <footer className="border-t mt-28 justify-center content-center" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="  max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"> All rights reserved. &copy; {new Date().getFullYear()} | Powered by Code4fun
        </div>
    </footer>
  );
}
