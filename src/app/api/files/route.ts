import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Kita map root path server virtual ke folder XAMPP lokal di Windows
// Supaya saat ditest, benar-benar membaca folder htdocs asli.
const BASE_DIR = 'C:\\xampp\\htdocs';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dirParam = searchParams.get('dir') || '/';

        // Normalisasi path agar aman dan tidak bisa keluar dari BASE_DIR
        const subPath = dirParam.replace(/^\/var\/www\/?/, '');
        const targetPath = path.join(BASE_DIR, subPath);

        // Fallback keamanan jika path mencoba lari ke direktori atas (Directory Traversal)
        if (!targetPath.startsWith(BASE_DIR)) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        if (!fs.existsSync(targetPath)) {
            // Jika folder htdocs belum ada folder tersebut, kita handle graceful
            return NextResponse.json({ files: [], currentPath: dirParam, error: "Directory not found" }, { status: 404 });
        }

        const items = fs.readdirSync(targetPath, { withFileTypes: true });

        const files = items.map(item => {
            const itemPath = path.join(targetPath, item.name);
            const isDirectory = item.isDirectory();
            let size = 0;
            let modifiedAt = new Date();
            let permissions = '755'; // mock

            try {
                const stats = fs.statSync(itemPath);
                size = stats.size;
                modifiedAt = stats.mtime;
                // mock permissions string based on octal Mode in windows (terbatas)
                permissions = isDirectory ? '755' : '644';
            } catch (e) {
                // Abaikan error stat untuk file system file/shortcut terkunci
            }

            // Deteksi mime type sederhana dari ekstensi
            let mimeType: string | null = null;
            if (!isDirectory) {
                const ext = path.extname(item.name).toLowerCase();
                if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif' || ext === '.svg') mimeType = 'image/' + ext.substring(1);
                else if (ext === '.json') mimeType = 'application/json';
                else if (ext === '.php') mimeType = 'text/x-php';
                else if (ext === '.html' || ext === '.txt' || ext === '.md' || ext === '.js' || ext === '.ts' || ext === '.css') mimeType = 'text/plain';
                else if (ext === '.zip') mimeType = 'application/zip';
            }

            return {
                name: item.name,
                path: path.posix.join(dirParam, item.name).replace(/\/+/g, '/'), // kembalikan ke format web virtual path
                type: isDirectory ? 'directory' : 'file',
                size,
                permissions,
                owner: 'www-data', // Mock owner
                group: 'www-data',
                modifiedAt,
                mimeType
            };
        });

        // Urutkan Folder lebih dulu, baru file
        files.sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === 'directory' ? -1 : 1;
        });

        return NextResponse.json({ files, currentPath: dirParam });
    } catch (error) {
        console.error("File Manager Error:", error);
        return NextResponse.json({ error: "Failed to read directory" }, { status: 500 });
    }
}
