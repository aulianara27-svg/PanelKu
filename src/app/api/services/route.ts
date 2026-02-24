import { NextResponse } from 'next/server';

// Mock in-memory state for demonstration until Node Daemon is ready
let mockServices = [
  {
    id: 'nginx',
    name: 'nginx',
    displayName: 'Nginx Web Server',
    status: 'running',
    version: '1.24.0',
    port: 80,
    cpuUsage: 12.5,
    memUsage: 256,
    uptime: 864000,
    lastRestart: new Date(Date.now() - 864000000),
    configPath: '/etc/nginx/nginx.conf',
    logPath: '/var/log/nginx/',
  },
  {
    id: 'php-fpm',
    name: 'php-fpm8.2',
    displayName: 'PHP-FPM 8.2',
    status: 'running',
    version: '8.2.15',
    port: 9000,
    cpuUsage: 8.2,
    memUsage: 512,
    uptime: 864000,
    lastRestart: new Date(Date.now() - 864000000),
    configPath: '/etc/php/8.2/fpm/php-fpm.conf',
    logPath: '/var/log/php8.2-fpm/',
  },
  {
    id: 'mysql',
    name: 'mysql',
    displayName: 'MySQL Server',
    status: 'running',
    version: '8.0.36',
    port: 3306,
    cpuUsage: 15.8,
    memUsage: 1024,
    uptime: 1728000,
    lastRestart: new Date(Date.now() - 1728000000),
    configPath: '/etc/mysql/mysql.conf.d/mysqld.cnf',
    logPath: '/var/log/mysql/',
  },
  {
    id: 'redis',
    name: 'redis-server',
    displayName: 'Redis Cache',
    status: 'running',
    version: '7.2.4',
    port: 6379,
    cpuUsage: 2.1,
    memUsage: 128,
    uptime: 1728000,
    lastRestart: new Date(Date.now() - 1728000000),
    configPath: '/etc/redis/redis.conf',
    logPath: '/var/log/redis/',
  },
  {
    id: 'pm2',
    name: 'pm2',
    displayName: 'PM2 Process Manager',
    status: 'running',
    version: '5.3.0',
    port: null,
    cpuUsage: 5.4,
    memUsage: 384,
    uptime: 432000,
    lastRestart: new Date(Date.now() - 432000000),
    configPath: '/etc/pm2/ecosystem.config.js',
    logPath: '/var/log/pm2/',
  },
];

export async function GET() {
  // Simulasi fetch status services dari Systemctl Linux via Daemon 
  return NextResponse.json({ services: mockServices });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, serviceId } = body;

    // Simulasi mengeksekusi sudo systemctl restart nginx
    if (['start', 'stop', 'restart'].includes(action)) {
      mockServices = mockServices.map(s => {
        if (s.id === serviceId) {
          return {
            ...s,
            status: action === 'stop' ? 'stopped' : 'running',
            uptime: action === 'restart' ? 0 : s.uptime,
            lastRestart: action === 'restart' ? new Date() : s.lastRestart,
            cpuUsage: action === 'stop' ? 0 : s.cpuUsage,
          };
        }
        return s;
      });

      return NextResponse.json({ success: true, services: mockServices });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process command" }, { status: 500 });
  }
}
