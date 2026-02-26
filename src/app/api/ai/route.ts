import OpenAI from 'openai';
import fs from 'fs';

// Groq API - Free, OpenAI-compatible, with streaming support
const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
});

const BASE_HTDOCS = 'C:\\xampp\\htdocs';

const LOG_PATHS = {
    apache_error: 'C:\\xampp\\apache\\logs\\error.log',
    php_error: 'C:\\xampp\\php\\logs\\php_error_log',
    mysql_error: 'C:\\xampp\\mysql\\data\\mysql_error.log',
};

function readLastLines(filePath: string, lineCount = 25): string {
    try {
        if (!fs.existsSync(filePath)) return '';
        const content = fs.readFileSync(filePath, 'utf-8');
        return content.split('\n').filter(l => l.trim()).slice(-lineCount).join('\n');
    } catch { return ''; }
}

function gatherServerContext(includeLogs: boolean): string {
    let ctx = '';
    try {
        const folders = fs.readdirSync(BASE_HTDOCS).slice(0, 15).join(', ');
        ctx += `Isi htdocs: [${folders}]\n`;
    } catch { ctx += `Htdocs tidak ditemukan di ${BASE_HTDOCS}\n`; }

    if (includeLogs) {
        for (const [name, path] of Object.entries(LOG_PATHS)) {
            const log = readLastLines(path);
            if (log) ctx += `\nLog ${name}:\n\`\`\`\n${log}\n\`\`\`\n`;
        }
    }
    return ctx;
}

function isErrorQuery(msg: string): boolean {
    const kw = ['error', 'eror', 'masalah', 'gagal', 'crash', 'bug', 'log', 'fix', 'perbaiki',
        '500', '404', '403', 'failed', 'exception', 'php', 'nginx', 'mysql'];
    return kw.some(k => msg.toLowerCase().includes(k));
}

export async function POST(request: Request) {
    const body = await request.json();
    const { message, history } = body;

    if (!message) return new Response('Message required', { status: 400 });
    if (!process.env.GROQ_API_KEY) return new Response('GROQ_API_KEY not set', { status: 500 });

    const includeLog = isErrorQuery(message);
    const serverCtx = gatherServerContext(includeLog);

    const systemPrompt = `Kamu adalah Coles AI Assistant web panel COLES CONTROL — AI cerdas layaknya Copilot yang terintegrasi di dalam web panel hosting COLES CONTROL ini.

Keahlian utama kamu:
- 🚀 Manajemen & Deployment — Membantu user melakukan deploy website/aplikasi baru langsung di server hosting panel ini. Kamu bisa memandu proses deploy, membaca arsitektur web, hingga memberikan instruksi deploy otomatis (seperti clone dari GitHub ke htdocs).
- 🐛 Debug & Diagnosa — Menganalisa error (PHP, Nginx, MySQL, Node.js) dari website yang dihosting di panel ini.
- ⚙️ Konfigurasi Server — Mengatur server lokal panel ini seperti virtual host, PHP-FPM, dan SSL.
- 🗂️ Analisa File & Log — Membaca struktur file htdocs dan error log yang dilampirkan untuk mencari masalah.
- 💡 Asisten Serba Bisa — Menjawab pertanyaan bebas seputar coding, analisis website, dan IT pada umumnya.

Konteks server panel saat ini:
${serverCtx}

Cara menjawab yang WAJIB kamu ikuti:
1. DILARANG KERAS menggunakan karakter asterisk/bintang (*) untuk formatting (bold/italic). Gunakan huruf kapital atau spasi saja untuk penekanan. Jangan sampai markdown bintang merusak UI.
2. Ingat bahwa kamu berada DI DALAM Web Panel Hosting ini. Bantulah user mengelola web dan file mereka di server lokal panel ini.
3. JIKA USER MELAMPIRKAN FILE (ditandai dengan [File: nama_file.ext] diikuti isi file), kamu BISA memperbaikinya atau menyarankan eksekusi/menyimpan file tersebut ke server.
4. UNTUK MENYARANKAN PENYIMPANAN FILE, kamu **WAJIB** menyertakan block JSON khusus di baris paling akhir dari jawabanmu dengan format persis seperti ini:
\`\`\`json
[
  {
    "type": "save_file",
    "label": "Simpan File nama_file.ext ke Server",
    "data": "{\\"filename\\": \\"nama_file.ext\\", \\"content\\": \\"isi file yang sudah diperbaiki/dibuat\\", \\"targetPath\\": \\"C:\\\\\\\\xampp\\\\\\\\htdocs\\"}"
  }
]
\`\`\`
*(Pastikan \`data\` berisi string JSON yang di-escape dengan benar, berisi filename, content, dan targetPath).*
5. UNTUK MENJALANKAN PERINTAH TERMINAL (seperti git clone, npm install, npm run build), kamu **WAJIB** pakai JSON seperti ini:
\`\`\`json
[
  {
    "type": "command",
    "label": "Clone & Build React",
    "data": "cd C:\\\\\\\\xampp\\\\\\\\htdocs && git clone https://github.com/user/repo my-app && cd my-app && npm install && npm run build"
  }
]
\`\`\`
6. Langsung ke inti masalah secara logis dan terstruktur.
7. Berkomunikasilah dengan bahasa Indonesia yang santai, proaktif, dan asik layaknya rekan kerja.`;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...history.slice(-10).map((h: any) => ({
            role: h.role === 'assistant' ? 'assistant' : 'user',
            content: h.content,
        })),
        { role: 'user', content: message },
    ];

    // Use 70b model for heavy tasks (like error fixing) and 8b for standard questions
    const selectedModel = includeLog ? 'llama-3.3-70b-versatile' : 'llama-3.1-8b-instant';

    // Streaming response
    const stream = await client.chat.completions.create({
        model: selectedModel,
        messages,
        temperature: 0.65,
        max_tokens: 2048,
        stream: true,
    });

    // Pipe stream ke client via ReadableStream
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
        async start(controller) {
            try {
                for await (const chunk of stream) {
                    const text = chunk.choices[0]?.delta?.content || '';
                    if (text) {
                        // Kirim sebagai Server-Sent Event style JSON
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                    }
                }
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
            } catch (e) {
                controller.error(e);
            }
        },
    });

    return new Response(readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
