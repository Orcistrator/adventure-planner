import AdventureView from '@/components/adventure/AdventureView';

interface AdventurePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}

export default async function AdventurePage({ params, searchParams }: AdventurePageProps) {
  const { id } = await params;
  const { edit } = await searchParams;

  return <AdventureView slug={id} initialEditing={edit === 'true'} />;
}
