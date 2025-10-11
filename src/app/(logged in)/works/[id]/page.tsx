interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkPage({ params }: PageProps) {
  const { id: id } = await params;
    return <div>Work {id}</div>
}