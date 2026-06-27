import SportPageClient from './SportPageClient';

export async function generateStaticParams() {
  return [
    { sport: 'football' },
    { sport: 'basketball' },
    { sport: 'ufc' },
    { sport: 'boxing' },
    { sport: 'f1' },
    { sport: 'tennis' },
  ];
}

interface SportPageProps {
  params: Promise<{ sport: string }>;
}

export default function Page({ params }: SportPageProps) {
  return <SportPageClient params={params} />;
}
