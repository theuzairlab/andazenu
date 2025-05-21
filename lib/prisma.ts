import { PrismaClient } from '../prisma/generated/client';

// Create a simple direct connection to the database
const prisma = new PrismaClient();

export default prisma;