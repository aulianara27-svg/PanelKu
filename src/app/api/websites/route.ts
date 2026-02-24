import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const websites = await prisma.cc_Website.findMany({
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

    // Connect to an admin user since real auth is not yet hooked up
    let user = await prisma.cc_User.findFirst();
    if (!user) {
      // Auto-create a dummy admin user if none exists yet
      user = await prisma.cc_User.create({
        data: {
          email: 'admin@coles.id',
          username: 'admin',
          password: 'hashed_password', // Just a placeholder for testing
          name: 'Administrator',
          role: 'superadmin',
          status: 'active',
        }
      });
    }

    const newWebsite = await prisma.cc_Website.create({
      data: {
        userId: user.id,
        name,
        path,
        domain: domain || null,
        documentRoot: `/var/www/${path}`,
        phpVersion: environment || 'static',
        status: 'active',
      }
    });

    // Node daemon call to actually run configure Nginx, reload, etc.
    // fetch('http://localhost:4000/api/daemon/create-website', ...)

    // TEMPORARY: Create local folder on Windows XAMPP to simulate linux panel.
    try {
      const BASE_DIR = 'C:\\xampp\\htdocs';
      const targetDir = path.join(BASE_DIR, path);

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });

        // Buat file index.html default
        const defaultHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Welcome to ${name}</title>
    <style>
        body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f1115; color: white; }
        .container { text-align: center; padding: 2rem; background: rgba(255,255,255,0.05); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); }
        h1 { color: #60a5fa; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to ${name}!</h1>
        <p>Your Coles Control workspace <strong>/var/www/${path}</strong> is ready.</p>
        <p>Environment: <strong>${environment === 'static' ? 'Static HTML' : environment}</strong></p>
    </div>
</body>
</html>`;
        fs.writeFileSync(path.join(targetDir, 'index.html'), defaultHtml);
      }
    } catch (fsError) {
      console.error("Warning: Failed to create local xampp directory:", fsError);
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
