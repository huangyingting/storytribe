import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const properties = await prisma.propertyDefinition.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    properties: properties.map((p) => ({
      ...p,
      options: (() => {
        try {
          return JSON.parse(p.optionsJson);
        } catch {
          return [];
        }
      })(),
    })),
  });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const label = String(body.label || "").trim();
  if (!label) {
    return NextResponse.json({ error: "Property label required" }, { status: 400 });
  }

  const key =
    String(body.key || label)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 28) || `prop${Date.now()}`;

  const type = [
    "text",
    "select",
    "multiselect",
    "number",
    "checkbox",
    "person",
    "media",
  ].includes(body.type)
    ? body.type
    : "text";

  const options = Array.isArray(body.options) ? body.options.map(String) : [];

  const created = await prisma.propertyDefinition.create({
    data: {
      ownerId: user.id,
      workspaceId: body.workspaceId ? String(body.workspaceId) : null,
      key,
      label,
      type,
      category: String(body.category || "Custom"),
      optionsJson: JSON.stringify(options),
      isDefault: false,
    },
  });

  return NextResponse.json(
    {
      property: {
        ...created,
        options,
      },
    },
    { status: 201 }
  );
}
