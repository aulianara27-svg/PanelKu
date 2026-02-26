import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        // Buat Super Admin
        await prisma.cc_User.upsert({
            where: { username: 'admin' },
            update: {},
            create: {
                email: 'admin@coles.id',
                username: 'admin',
                password: 'password123', // Dummy password untuk testing
                name: 'Super Administrator',
                role: 'superadmin',
                status: 'active'
            }
        });

        // Buat Student
        await prisma.cc_User.upsert({
            where: { username: 'budi123' },
            update: {},
            create: {
                email: 'budi@student.coles.id',
                username: 'budi123',
                password: 'password123', // Dummy password
                name: 'Budi Santoso',
                role: 'student',
                status: 'active'
            }
        });

        // Buat User biasa
        await prisma.cc_User.upsert({
            where: { username: 'joko123' },
            update: {},
            create: {
                email: 'joko@user.coles.id',
                username: 'joko123',
                password: 'password123', // Dummy password
                name: 'Joko Anwar',
                role: 'user',
                status: 'active'
            }
        });

        // Buat Admin
        await prisma.cc_User.upsert({
            where: { username: 'manager123' },
            update: {},
            create: {
                email: 'manager@coles.id',
                username: 'manager123',
                password: 'password123', // Dummy password
                name: 'Manager System',
                role: 'admin',
                status: 'active'
            }
        });

        return NextResponse.json({ message: "Database successfully initialized with admin, manager123, joko123, and budi123." }, { status: 201 });

    } catch (error) {
        console.error("Setup Error:", error);
        return NextResponse.json({ error: "Failed to initialize database", details: error }, { status: 500 });
    }
}
