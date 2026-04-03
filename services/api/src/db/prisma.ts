/**
 * Prisma client singleton.
 * Every layer imports from here — never instantiate PrismaClient elsewhere.
 */

import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
