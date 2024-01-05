import { PrismaClient } from '@prisma/client';

declare global {
    var prisma : PrismaClient | undefined;
}

const db = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
// export const db = new  PrismaClient();

// message
// This saves to crashing the devlopment or failure by using thgis code