import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        // Cek apakah tabel user sudah ada isinya
        const userCount = await prisma.cc_User.count();

        if (userCount > 0) {
            return NextResponse.json({ message: "Database is already initialized. Skipping setup." }, { status: 200 });
        }

        // Buat Super Admin
        await prisma.cc_User.create({
            data: {
                email: 'admin@coles.id',
                username: 'admin',
                password: 'password123', // Dummy password untuk testing
                name: 'Super Administrator',
                role: 'superadmin',
                status: 'active'
            }
        });

        // Buat Student (User biasa)
        await prisma.cc_User.create({
            data: {
                email: 'budi@student.coles.id',
                username: 'budi123',
                password: 'password123', // Dummy password
                name: 'Budi Santoso',
                role: 'student',
                status: 'active'
            }
        });

        return NextResponse.json({ message: "Database successfully initialized with admin and budi123." }, { status: 201 });

    } catch (error) {
        console.error("Setup Error:", error);
        return NextResponse.json({ error: "Failed to initialize database", details: error }, { status: 500 });
    }
}
