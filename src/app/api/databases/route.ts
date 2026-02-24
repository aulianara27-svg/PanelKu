import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const databases = await prisma.cc_Database.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: true
      }
    });

    return NextResponse.json(databases);
  } catch (error) {
    console.error("Failed to fetch databases:", error);
    return NextResponse.json({ error: "Failed to fetch databases" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, username, password, charset, collation } = body;

    if (!name || !username || !password) {
      return NextResponse.json(
        { error: 'Database name, username, and password are required' },
        { status: 400 }
      );
    }

    // Check if database name already exists
    const existingDb = await prisma.cc_Database.findUnique({
      where: { name }
    });

    if (existingDb) {
      return NextResponse.json(
        { error: 'Database name already exists' },
        { status: 400 }
      );
    }

    // Encrypt password (for panel viewing context, though normally we'd pass it to daemon directly to hash for mysql users)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get default admin user to attach db, since userId is required
    let user = await prisma.cc_User.findFirst();
    if (!user) {
      return NextResponse.json(
        { error: 'No users found in the system to attach the database.' },
        { status: 400 }
      );
    }

    const newDb = await prisma.cc_Database.create({
      data: {
        userId: user.id,
        name,
        username,
        password: hashedPassword,
        charset: charset || 'utf8mb4',
        collation: collation || 'utf8mb4_unicode_ci',
        status: 'active',
      }
    });

    // Node daemon call to actually run CREATE DATABASE, CREATE USER, GRANT PRIVILEGES
    // fetch('http://localhost:4000/api/daemon/create-database', ...)

    return NextResponse.json(newDb, { status: 201 });
  } catch (error) {
    console.error("Failed to create database:", error);
    return NextResponse.json(
      { error: "Failed to create database" },
      { status: 500 }
    );
  }
}
