import { prisma } from "../src/lib/prisma";
import { auth } from "../src/lib/auth";

const PRODUCTS_SEEDS = [
  {
    id: "1",
    name: "Microsoft 365",
    description:
      "Der Keepit Backup Service beinhaltet in jedem Fall sämtliche Kosten und Aufwände für Backup & Recovery der kompletten Microsoft M365 Umgebung. Dies umschließt alle Komponenten (Exchange, Teams, OneDrive, SharePoint, Teams-Chats).",
    table:
      "Sicherung von „Workload“ mit unbegrenztem Datenvolumen und max. Aufbewahrungszeit der Backups von 1 Jahr/unlimitierter Aufbewahrungszeit; \n - Preis / Active User / Monat  \n - bei einer Vertragslaufzeit von {duration_months} Monaten",
  },
  {
    id: "2",
    name: "Entra ID Advanced",
    description:
      "Im Bereich von Entra ID (ehem. Azure AD) umfasst die Funktionalität folgende Objekte: User, Gruppen, Administrative Einheiten & Rollen, sowie Policies, Enterprise Apps, App Registrations, Intune Backup, Activity Logs & Devices (Bitlocker Recovery Keys & LAPS).",
    table: "",
  },
];

const OWNER = {
  email: "admin@keepit.de",
  password: "admin1234",
  name: "Admin User",
  firstName: "Admin",
  lastName: "User",
  salutation: "Herr",
};

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: OWNER.email },
  });

  if (existing) {
    console.log(`User ${OWNER.email} already exists, skipping.`);
    return;
  }

  await auth.api.signUpEmail({
    body: {
      email: OWNER.email,
      password: OWNER.password,
      name: OWNER.name,
      firstName: OWNER.firstName,
      lastName: OWNER.lastName,
      salutation: OWNER.salutation,
    },
  });

  await prisma.user.update({
    where: { email: OWNER.email },
    data: { role: "admin" },
  });

  console.log(`Created owner user: ${OWNER.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
