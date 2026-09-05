export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
      <p className="text-sm text-muted-foreground">Workflow</p>
      <h1 className="font-heading text-lg font-medium tracking-tight">{id}</h1>
    </div>
  );
};
