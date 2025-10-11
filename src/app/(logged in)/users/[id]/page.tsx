interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserPage({ params }: PageProps) {
  const { id: id } = await params;
    return <div>User {id}</div>
}