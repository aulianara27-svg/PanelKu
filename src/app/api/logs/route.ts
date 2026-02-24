import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// ============================================================
// Path log untuk development (Windows + XAMPP)
// Ganti dengan path Linux saat deploy ke VPS
// ============================================================
const LOG_PATHS = {
    xampp_apache_error: 'C:\\xampp\\apache\\logs\\error.log',
    xampp_php_error: 'C:\\xampp\\php\\logs\\php_error_log',
    xampp_mysql_error: 'C:\\xampp\\mysql\\data\\mysql_error.log',
    // Linux VPS (aktifkan saat deploy):
    // nginx_error:   '/var/log/nginx/error.log',
    // nginx_access: '/var/log/nginx/access.log',
    // php_fpm:       '/var/log/php8.2-fpm.log',
    // mysql:         '/var/log/mysql/error.log',
};

function readLastLines(filePath: string, lineCount: number = 50): { content: string; exists: boolean } {
    try {
        if (!fs.existsSync(filePath)) {
            return { content: '', exists: false };
        }
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n').filter(l => l.trim());
        const lastLines = lines.slice(-lineCount).join('\n');
        return { content: lastLines, exists: true };
    } catch (e) {
        return { content: '', exists: false };
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const logName = searchParams.get('log') || 'all';
    const lines = parseInt(searchParams.get('lines') || '50');

    const result: Record<string, any> = {};

    if (logName === 'all') {
        for (const [name, filePath] of Object.entries(LOG_PATHS)) {
            const { content, exists } = readLastLines(filePath, lines);
            result[name] = {
                path: filePath,
                exists,
                content: exists ? content : null,
                lineCount: exists ? content.split('\n').length : 0,
            };
        }
    } else {
        const filePath = LOG_PATHS[logName as keyof typeof LOG_PATHS];
        if (!filePath) {
            return NextResponse.json({ error: `Unknown log: ${logName}` }, { status: 400 });
        }
        const { content, exists } = readLastLines(filePath, lines);
        result[logName] = { path: filePath, exists, content, lineCount: content.split('\n').length };
    }

    return NextResponse.json(result);
}
