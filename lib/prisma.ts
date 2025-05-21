import { PrismaClient } from '../prisma/generated/client';

// Define global type for Prisma
declare global {
  var prisma: PrismaClient | undefined;
}

// Create a singleton Prisma client that works in all environments
function getPrismaClient() {
  // In development, use the global variable to prevent multiple instances
  if (process.env.NODE_ENV === 'development') {
    if (!global.prisma) {
      console.log('Creating new PrismaClient in development mode');
      global.prisma = new PrismaClient({
        log: ['query', 'error', 'warn'],
      });
    }
    return global.prisma;
  }

  // In production, create a new client (won't be called multiple times as Next.js caches imports)
  try {
    console.log('Creating PrismaClient in production mode');
    // Pass connection parameters to help with connection pooling
    return new PrismaClient({
      log: ['error'],
      // Adding these options can help with Supabase connections
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  } catch (error) {
    console.error('Failed to initialize Prisma Client:', error);
    throw error;
  }
}

// Export the client as a default export
const prisma = getPrismaClient();
export default prisma;
