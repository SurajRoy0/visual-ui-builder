import { VisualEditor } from "@/components/VisualEditor";

interface EditorProjectPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function EditorProjectPage({ params }: EditorProjectPageProps) {
  const { projectId } = await params;

  return <VisualEditor initialProjectId={projectId} />;
}
