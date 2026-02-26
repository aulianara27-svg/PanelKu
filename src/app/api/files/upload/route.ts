import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const BASE_DIR = 'C:\\xampp\\htdocs';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const targetPath = formData.get('targetPath') as string;

        if (!file || !targetPath) {
            return NextResponse.json({ error: 'File and targetPath are required' }, { status: 400 });
        }

        const subPath = targetPath.replace(/^\/var\/www\/?/, '');
        const fullPath = path.join(BASE_DIR, subPath);

        // Security check
        if (!fullPath.startsWith(BASE_DIR)) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Write the file
        fs.writeFileSync(fullPath, buffer);

        return NextResponse.json({ message: 'File uploaded successfully', filename: file.name });
    } catch (error: any) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
