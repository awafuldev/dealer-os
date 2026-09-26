import { prisma } from "./prisma";

export async function getDefaultOrganization() {
  const org = await prisma.organization.findFirst({
    include: {
      users: true,
    },
  });

  if (!org) {
    throw new Error("No organization found. Please run seed first.");
  }

  return org;
}
