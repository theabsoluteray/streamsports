import PlayerPageClient from './PlayerPageClient';

export async function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

interface PlayerPageProps {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: PlayerPageProps) {
  return <PlayerPageClient params={params} />;
}
