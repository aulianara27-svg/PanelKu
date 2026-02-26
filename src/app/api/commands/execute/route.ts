import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { command } = body;

        if (!command) {
            return NextResponse.json({ error: 'Command is required' }, { status: 400 });
        }

        // Execute the command
        const { stdout, stderr } = await execAsync(command);

        if (stderr && !stdout) {
            return NextResponse.json({ message: `Selesai dengan pesan: ${stderr}` });
        }

        return NextResponse.json({ message: `Terminal Output:\n${stdout.slice(0, 1000)}${stdout.length > 1000 ? '\n... (truncated)' : ''}` });

    } catch (error: any) {
        return NextResponse.json({ error: `Command failed: ${error.message}` }, { status: 500 });
    }
}
