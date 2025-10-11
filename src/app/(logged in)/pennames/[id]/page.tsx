interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PenNamePage({ params }: PageProps) {
  const { id: id } = await params;
    return <div>PenName {id}</div>
}