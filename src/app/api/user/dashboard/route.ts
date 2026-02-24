import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const user = await prisma.cc_User.findUnique({
            where: { id: userId },
            include: {
                limits: true,
                websites: true,
                databases: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Calculate Usage
        const usedWebsites = user.websites.length;
        const usedDatabases = user.databases.length;

        let usedDisk = 0;
        let usedBandwidth = 0;

        user.websites.forEach(web => {
            usedDisk += web.diskUsage;
            usedBandwidth += web.bandwidthUsage;
        });

        // Default constraints for setup-generated accounts (like budi123) which might lack cc_StudentLimit table entries.
        const maxWebsites = user.limits?.maxWebsites || 2;
        const maxDatabases = user.limits?.maxDatabases || 1;
        const maxDiskSpace = user.limits?.maxDiskSpace || 1073741824; // 1GB in bytes
        const maxBandwidth = user.limits?.maxBandwidth || 10737418240; // 10GB in bytes

        return NextResponse.json({
            usage: {
                websites: usedWebsites,
                databases: usedDatabases,
                disk: usedDisk,
                bandwidth: usedBandwidth
            },
            limits: {
                maxWebsites,
                maxDatabases,
                maxDiskSpace,
                maxBandwidth
            },
            recentDeployments: user.websites.map(w => ({
                id: w.id,
                name: w.name,
                path: w.path,
                domain: w.domain,
                status: w.status,
                createdAt: w.createdAt
            })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 3)
        });

    } catch (error) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
