import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

const BASE_DIR = 'C:\\xampp\\htdocs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, targetPath, newPath, content } = body;

        if (!targetPath) {
            return NextResponse.json({ error: 'targetPath is required' }, { status: 400 });
        }

        const subPath = targetPath.replace(/^\/var\/www\/?/, '');
        const fullPath = path.join(BASE_DIR, subPath);

        if (!fullPath.startsWith(BASE_DIR)) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        switch (action) {
            case 'mkdir':
                if (!fs.existsSync(fullPath)) {
                    fs.mkdirSync(fullPath, { recursive: true });
                }
                return NextResponse.json({ message: 'Folder created' });

            case 'delete':
                if (fs.existsSync(fullPath)) {
                    fs.rmSync(fullPath, { recursive: true, force: true });
                }
                return NextResponse.json({ message: 'Deleted successfully' });

            case 'rename':
                if (!newPath) return NextResponse.json({ error: 'newPath required' }, { status: 400 });
                const newSubPath = newPath.replace(/^\/var\/www\/?/, '');
                const fullNewPath = path.join(BASE_DIR, newSubPath);
                fs.renameSync(fullPath, fullNewPath);
                return NextResponse.json({ message: 'Renamed successfully' });

            case 'read':
                if (fs.existsSync(fullPath)) {
                    const text = fs.readFileSync(fullPath, 'utf-8');
                    return NextResponse.json({ content: text });
                }
                return NextResponse.json({ error: 'File not found' }, { status: 404 });

            case 'write':
                fs.writeFileSync(fullPath, content || '', 'utf-8');
                return NextResponse.json({ message: 'File saved' });

            case 'extract':
                if (fs.existsSync(fullPath)) {
                    // Expect fullPath to be the .zip file
                    const ext = path.extname(fullPath).toLowerCase();
                    if (ext !== '.zip') return NextResponse.json({ error: 'Only .zip files are supported' }, { status: 400 });

                    try {
                        const zip = new AdmZip(fullPath);
                        // Extract to the folder where the zip is located
                        const extractTo = path.dirname(fullPath);
                        zip.extractAllTo(extractTo, true);

                        // Optionally delete zip after extracting
                        // fs.unlinkSync(fullPath); 

                        return NextResponse.json({ message: 'Extracted successfully' });
                    } catch (e: any) {
                        return NextResponse.json({ error: `Failed to extract: ${e.message}` }, { status: 500 });
                    }
                }
                return NextResponse.json({ error: 'File not found' }, { status: 404 });

            default:
                return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
        }

    } catch (error: any) {
        console.error("File Action Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
