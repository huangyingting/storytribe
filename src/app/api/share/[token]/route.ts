import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loadFullProject } from "@/lib/project-serializer";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;

  const projectByToken = await prisma.project.findUnique({
    where: { shareToken: token },
  });

  if (projectByToken && projectByToken.isPublic && projectByToken.shareAccess !== "off") {
    const fullProject = await loadFullProject(projectByToken.id);
    return NextResponse.json({ project: fullProject, mode: "storyboard" });
  }

  const videoByToken = await prisma.videoProject.findUnique({
    where: { shareToken: token },
  });

  if (videoByToken && videoByToken.isPublic) {
    const fullProject = await loadFullProject(videoByToken.projectId);
    return NextResponse.json({ project: fullProject, mode: "video" });
  }

  return NextResponse.json(
    { error: "Shared storyboard not found or access disabled." },
    { status: 404 }
  );
}
