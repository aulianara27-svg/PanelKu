import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/metrics - Get server metrics
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hours = parseInt(searchParams.get('hours') || '24');
    const limit = hours * 12; // 5-minute intervals
    
    const metrics = await db.cc_ServerMetric.findMany({
      take: limit,
      orderBy: { timestamp: 'desc' }
    });
    
    // Get latest metrics for current status
    const latestMetric = metrics[0];
    
    // Get alerts
    const alerts = await db.cc_Alert.findMany({
      where: { isResolved: false },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    // Calculate averages
    const avgCpu = metrics.reduce((sum, m) => sum + m.cpuUsage, 0) / metrics.length;
    const avgMem = metrics.reduce((sum, m) => sum + m.memUsage, 0) / metrics.length;
    const avgDisk = metrics.reduce((sum, m) => sum + m.diskUsage, 0) / metrics.length;
    
    return NextResponse.json({
      success: true,
      data: {
        current: latestMetric || null,
        history: metrics.reverse(),
        averages: {
          cpu: avgCpu.toFixed(2),
          memory: avgMem.toFixed(2),
          disk: avgDisk.toFixed(2)
        },
        alerts
      }
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

// POST /api/metrics - Record new metrics (called by monitoring service)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      cpuUsage,
      memUsage,
      diskUsage,
      diskRead,
      diskWrite,
      netIn,
      netOut,
      loadAvg1,
      loadAvg5,
      loadAvg15,
      uptime
    } = body;
    
    const metric = await db.cc_ServerMetric.create({
      data: {
        cpuUsage,
        memUsage,
        diskUsage,
        diskRead,
        diskWrite,
        netIn,
        netOut,
        loadAvg1,
        loadAvg5,
        loadAvg15,
        uptime
      }
    });
    
    // Check thresholds and create alerts
    const thresholds = {
      cpu: { warning: 70, critical: 90 },
      memory: { warning: 80, critical: 95 },
      disk: { warning: 85, critical: 95 }
    };
    
    if (cpuUsage >= thresholds.cpu.critical) {
      await db.cc_Alert.create({
        data: {
          type: 'cpu',
          severity: 'critical',
          message: `CPU usage critically high: ${cpuUsage.toFixed(1)}%`,
          value: cpuUsage,
          threshold: thresholds.cpu.critical
        }
      });
    } else if (cpuUsage >= thresholds.cpu.warning) {
      await db.cc_Alert.create({
        data: {
          type: 'cpu',
          severity: 'warning',
          message: `CPU usage high: ${cpuUsage.toFixed(1)}%`,
          value: cpuUsage,
          threshold: thresholds.cpu.warning
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      data: metric
    });
  } catch (error) {
    console.error('Error recording metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record metrics' },
      { status: 500 }
    );
  }
}
