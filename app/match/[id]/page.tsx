import { Suspense } from 'react';
import MatchPageClient from './MatchPageClient';
import { LoadingSpinner } from '@/components/ui';

export async function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

interface MatchPageProps {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: MatchPageProps) {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    }>
      <MatchPageClient params={params} />
    </Suspense>
  );
}
