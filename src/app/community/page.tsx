import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/common/PublicHeader";
import { PublicFooter } from "@/components/common/PublicFooter";
import { Compass, Film, Sparkles, ArrowRight, Eye } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CommunityHubPage() {
  const publicProjects = await prisma.project.findMany({
    where: {
      OR: [{ isPublishedToCommunity: true }, { isPublic: true }],
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
      stages: {
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 12,
  });

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <PublicHeader />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 space-y-12">
        <div className="rounded-3xl bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 text-white p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              StoryTribe Community Showcase
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Discover storyboards and creators from the StoryTribe community
            </h1>
            <p className="text-sm text-gray-300 leading-relaxed">
              Explore commercial storyboards, indie film breakdowns, UX user journeys, and animatics shared by visual storytellers around the world.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/community/explore"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-gray-950 text-sm font-bold hover:bg-gray-100 transition"
            >
              <Compass className="w-4 h-4" />
              Explore Gallery
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-gray-950">
                Featured Community Storyboards
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Published projects with public web access enabled
              </p>
            </div>
            <Link
              href="/community/explore"
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {publicProjects.length === 0 ? (
            <div className="p-12 rounded-2xl border border-dashed border-gray-200 text-center space-y-3">
              <Film className="w-8 h-8 text-gray-400 mx-auto" />
              <div className="text-sm font-bold text-gray-900">
                No public community storyboards published yet
              </div>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Publish a project to the web from the Storyboard Editor Share modal to feature it in the StoryTribe Community hub.
              </p>
              <div className="pt-2">
                <Link
                  href="/app/create"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-950 text-white text-xs font-bold hover:bg-gray-800"
                >
                  Create a Storyboard
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicProjects.map((project) => (
                <div
                  key={project.id}
                  className="group rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition flex flex-col"
                >
                  <div
                    className="h-44 flex items-center justify-center p-4 border-b border-gray-100 relative"
                    style={{
                      backgroundColor:
                        project.stages[0]?.bkgdColor || "#F8FAFC",
                    }}
                  >
                    <span className="text-xs font-bold text-gray-500 bg-white/90 px-2.5 py-1 rounded-full shadow-sm">
                      {project.width}×{project.height}
                    </span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-bold text-sm text-gray-950 line-clamp-1">
                        {project.title}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                        {project.synopsis || "Published StoryTribe storyboard."}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
                      <Link
                        href={`/${project.owner.username || project.owner.id}`}
                        className="font-semibold text-gray-800 hover:underline"
                      >
                        @{project.owner.username || project.owner.name || "creator"}
                      </Link>
                      <span className="inline-flex items-center gap-1 text-gray-400">
                        <Eye className="w-3.5 h-3.5" /> Public
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
