import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            );
        }

        // Pertama, cari akun dengan username ini
        const user = await prisma.cc_User.findUnique({
            where: { username }
        });

        // Karena sistem hashing/bcrypt mungkin belum siap untuk user ini,
        // kita bandingkan password secara plaintext dulu sebagai placeholder pengembangan.
        // Di sisi produksi, wajib pakai bcrypt.compare(password, user.password)

        if (!user || user.password !== password) {
            return NextResponse.json(
                { error: 'Invalid username or password' },
                { status: 401 }
            );
        }

        if (user.status !== 'active') {
            return NextResponse.json(
                { error: 'Account is suspended or pending' },
                { status: 403 }
            );
        }

        // Update last login
        await prisma.cc_User.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
        });

        // Berhasil login
        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                name: user.name,
                role: user.role,
                avatar: user.avatar,
                status: user.status
            },
            token: 'simulate_jwt_token_12345' // Untuk sisi produksi wajib jwt.sign()
        });

    } catch (error) {
        console.error("Login Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
