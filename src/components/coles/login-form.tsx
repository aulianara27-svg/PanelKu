'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Palette, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function LoginForm() {
    const { login, setMockRole } = useAuthStore();
    const { toast } = useToast();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Jalankan setup otomatis jika DB kosong (hanya kemudahan untuk prototype ini)
    const handleSetup = async () => {
        try {
            await fetch('/api/auth/setup');
        } catch (e) { /* ignore */ }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        await handleSetup(); // Pastikan ada admin & budi123 di database

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to login');

            // Login Sukses
            login(data.user);

            // Update role checker untuk Sidebar & Header ui
            setMockRole(data.user.role as any);

            toast({
                title: 'Welcome back!',
                description: `Logged in as ${data.user.name}`,
            });

        } catch (error: any) {
            toast({
                title: 'Authentication Failed',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f1115] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-md relative z-10"
            >
                <div className="glass-card p-8 rounded-2xl border-white/10 shadow-2xl relative overflow-hidden">
                    {/* Accent Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-violet-500 to-indigo-500" />

                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25 mx-auto mb-4"
                        >
                            <Palette className="w-8 h-8 text-white" />
                        </motion.div>
                        <h1 className="text-2xl font-bold text-white mb-2">Coles Control Panel</h1>
                        <p className="text-gray-400 text-sm">Please sign in to your workspace.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-4">
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    required
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500"
                                />
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    required
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <Button
                            disabled={isLoading}
                            type="submit"
                            className="w-full h-12 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-base mt-2 border-0 shadow-lg shadow-blue-500/25 group"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/10 text-center">
                        <p className="text-xs text-gray-500">
                            Demo Test Accounts:<br />
                            <b>admin / password123</b> (Superadmin)<br />
                            <b>manager123 / password123</b> (Admin)<br />
                            <b>budi123 / password123</b> (Student)<br />
                            <b>joko123 / password123</b> (User)
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
