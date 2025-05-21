import { PrismaClient } from '@prisma/client';

// Explicitly type the PrismaClient to ensure all models are available
const prismaClientSingleton = () => {
  try {
    const client = new PrismaClient();
    console.log('Prisma Client initialized successfully');
    return client;
  } catch (error) {
    console.error('Failed to initialize Prisma Client:', error);
    // During build time, return a mock client if needed
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
      console.log('Using mock client during build');
      return {} as PrismaClient;
    }
    throw error;
  }
};

declare global {
  var prisma: PrismaClient | undefined;
}

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const prisma = global.prisma || prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;

  // Additional logging for development
  console.log('Prisma Client methods:', Object.keys(prisma));
}
