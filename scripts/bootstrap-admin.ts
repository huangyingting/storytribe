import "dotenv/config";
import { createInvitation } from "../src/lib/account-admission";

function parseArgs(argv: string[]) {
  const opts: {
    email?: string;
    role?: "USER" | "ADMIN";
    expiresHours?: number;
    notes?: string;
  } = {
    role: "ADMIN",
    expiresHours: 72,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--email" && argv[i + 1]) {
      opts.email = argv[++i];
    } else if (arg.startsWith("--email=")) {
      opts.email = arg.slice("--email=".length);
    } else if (arg === "--role" && argv[i + 1]) {
      const r = argv[++i].toUpperCase();
      opts.role = r === "USER" ? "USER" : "ADMIN";
    } else if (arg.startsWith("--role=")) {
      const r = arg.slice("--role=".length).toUpperCase();
      opts.role = r === "USER" ? "USER" : "ADMIN";
    } else if (arg === "--expires-hours" && argv[i + 1]) {
      opts.expiresHours = Number(argv[++i]);
    } else if (arg.startsWith("--expires-hours=")) {
      opts.expiresHours = Number(arg.slice("--expires-hours=".length));
    } else if (arg === "--notes" && argv[i + 1]) {
      opts.notes = argv[++i];
    }
  }
  return opts;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.email) {
    console.error("Usage: npm run bootstrap:admin -- --email <email> [--role ADMIN|USER] [--expires-hours 72]");
    process.exit(1);
  }

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const { invitation, rawToken } = await createInvitation({
    email: args.email,
    role: args.role,
    expiresInHours: args.expiresHours,
    notes: args.notes || "CLI Bootstrap Invitation",
    invitedByEmail: "bootstrap-cli",
  });

  const inviteUrl = `${baseUrl.replace(/\/$/, "")}/invite/${rawToken}`;

  console.log(
    JSON.stringify(
      {
        status: "created",
        invitationId: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt.toISOString(),
        rawToken,
        inviteUrl,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error("Bootstrap error:", err.message || err);
  process.exit(1);
});
