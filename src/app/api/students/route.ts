import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requesterRole = searchParams.get('requesterRole') || 'student';

    // Jika admin, hanya bisa lihat student. Jika superadmin, bisa lihat admin dan student.
    const eligibleRoles = requesterRole === 'superadmin' ? ['admin', 'student'] : ['student'];

    const students = await prisma.cc_User.findMany({
      where: {
        role: { in: eligibleRoles }
      },
      include: {
        limits: true,
        websites: true,
        databases: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedStudents = students.map(student => {
      let usedDisk = 0;
      let usedBandwidth = 0;
      student.websites.forEach(w => {
        usedDisk += w.diskUsage;
        usedBandwidth += w.bandwidthUsage;
      });

      const { websites, databases, ...rest } = student;
      return {
        ...rest,
        usage: {
          websites: websites.length,
          databases: databases.length,
          diskSpace: usedDisk,
          bandwidth: usedBandwidth
        }
      };
    });

    return NextResponse.json(formattedStudents);
  } catch (error) {
    console.error("Failed to fetch students:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, name, email, password, phpVersion, targetRole, requesterRole } = body;

    // Validate request
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    // Role Validation
    let finalRole = 'student';
    if (targetRole === 'admin' && requesterRole === 'superadmin') {
      finalRole = 'admin';
    }

    // Check if user already exists
    const existingUser = await prisma.cc_User.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this username or email already exists' },
        { status: 400 }
      );
    }

    // Create user and its limits inside a transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.cc_User.create({
        data: {
          username,
          name: name || username,
          email,
          password: password, // Gunakan plaintext agar sesuai API dengan Login sementara 
          role: finalRole,
          status: 'active',
        }
      });

      // Create dummy limits for new student
      await tx.cc_StudentLimit.create({
        data: {
          userId: user.id,
          maxWebsites: 1,
          maxDatabases: 1,
          maxDiskSpace: 1073741824, // 1GB
          maxBandwidth: 10737418240, // 10GB
        }
      });

      // Here you would also want to call your Node Daemon
      // to create the actual server folders, unix user, etc.
      // fetch('http://localhost:4000/api/daemon/create-student', ...)

      return user;
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Failed to create student:", error);
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 }
    );
  }
}
