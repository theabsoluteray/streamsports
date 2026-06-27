import TeamPageClient from './TeamPageClient';

export async function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

interface TeamPageProps {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: TeamPageProps) {
  return <TeamPageClient params={params} />;
}
