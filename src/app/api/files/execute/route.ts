import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Data usually contains a JSON string from the AI's action data block
        const { data } = body;

        let parsedData;
        try {
            parsedData = JSON.parse(data);
        } catch (e) {
            return NextResponse.json({ error: 'Invalid JSON format in action data' }, { status: 400 });
        }

        const { filename, content, targetPath } = parsedData;

        if (!filename || content === undefined) {
            return NextResponse.json({ error: 'Filename and content are required' }, { status: 400 });
        }

        // By default, save to htdocs
        const basePath = targetPath || 'C:\\xampp\\htdocs';
        const fullPath = path.join(basePath, filename);

        // Pastikan direktorinya ada
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Tulis isi file
        fs.writeFileSync(fullPath, content, 'utf8');

        return NextResponse.json({ message: `File berhasil disimpan di ${fullPath}` });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}
