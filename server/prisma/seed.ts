import { prisma } from "../src/lib/prisma";
import { auth } from "../src/lib/auth";

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
