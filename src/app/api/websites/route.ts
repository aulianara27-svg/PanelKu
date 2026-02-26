import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const requesterRole = searchParams.get('requesterRole') || 'student';

    const whereClause: any = {};
    if (requesterRole !== 'superadmin' && requesterRole !== 'admin') {
      if (!userId) {
        return NextResponse.json({ error: "Missing userId" }, { status: 400 });
      }
      whereClause.userId = userId;
    }

    const websites = await prisma.cc_Website.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: true
      }
    });

    return NextResponse.json(websites);
  } catch (error) {
    console.error("Failed to fetch websites:", error);
    return NextResponse.json({ error: "Failed to fetch websites" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, path, domain, environment } = body;

    if (!name || !path) {
      return NextResponse.json(
        { error: 'Website name and path are required' },
        { status: 400 }
      );
    }

    // Check if path already exists
    const existingSite = await prisma.cc_Website.findUnique({
      where: { path }
    });

    if (existingSite) {
      return NextResponse.json(
        { error: 'Website path already exists' },
        { status: 400 }
      );
    }

    let user: any = null;
    if (body.userId) {
      user = await prisma.cc_User.findUnique({ where: { id: body.userId } });
    }

    if (!user) {
      user = await prisma.cc_User.findFirst({ where: { role: 'superadmin' } });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'No user found' },
        { status: 400 }
      );
    }

    // Role-based limits: Student role has a limit of 3 websites
    const requesterRole = body.requesterRole || user.role;
    if (requesterRole === 'student') {
      const userWebsiteCount = await prisma.cc_Website.count({
        where: { userId: user.id }
      });
      if (userWebsiteCount >= 3) {
        return NextResponse.json(
          { error: 'Batas maksimal 3 website untuk pengguna student telah tercapai.' },
          { status: 403 }
        );
      }
    }

    // Determine the actual path on disk and virtual path
    let virtualPath = path;
    let actualPathOnDisk = path;
    const isStudent = requesterRole === 'student';

    if (isStudent && user?.username) {
      // Enforce student's path to be rooted inside their workspace
      // So if they enter 'myweb', it becomes 'student_budi/myweb'
      const prefix = `student_${user.username}`;
      if (!path.startsWith(`${prefix}/`)) {
        actualPathOnDisk = `${prefix}/${path.replace(/^[/]+/, '')}`;
        virtualPath = actualPathOnDisk;
      }
    }

    const newWebsite = await prisma.cc_Website.create({
      data: {
        userId: user.id,
        name,
        path: virtualPath,
        domain: domain || null,
        documentRoot: `/var/www/${virtualPath}`,
        phpVersion: environment || 'static',
        status: 'active',
      }
    });

    // Call the remote Linux daemon to create the folder and nginx configuration
    try {
      await fetch('http://100.65.134.119:4000/api/website/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'COLES_SECRET_123'
        },
        body: JSON.stringify({
          username: user.username,
          pathName: actualPathOnDisk,
          domain: domain || null,
          targetRole: requesterRole
        })
      });
    } catch (daemonError) {
      console.error("Warning: Failed to call remote linux daemon:", daemonError);
    }

    return NextResponse.json(newWebsite, { status: 201 });
  } catch (error) {
    console.error("Failed to create website:", error);
    return NextResponse.json(
      { error: "Failed to create website" },
      { status: 500 }
    );
  }
}
