import AdventureView from '@/components/adventure/AdventureView';

interface AdventurePageProps {
  params: Promise<{ id: string }>;
}

export default async function AdventurePage({ params }: AdventurePageProps) {
  const { id } = await params;

  return <AdventureView slug={id} />;
}
