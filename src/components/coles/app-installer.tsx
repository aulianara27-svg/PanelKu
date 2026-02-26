'use client';

import { motion } from 'framer-motion';
import {
    DownloadCloud,
    LayoutTemplate,
    Code2,
    Database,
    Search,
    CheckCircle2,
    Box,
    ShoppingCart
} from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function AppInstaller() {
    const [search, setSearch] = useState('');

    const APPS = [
        {
            id: 'wordpress',
            name: 'WordPress',
            icon: LayoutTemplate,
            color: 'blue',
            category: 'CMS / Blog',
            desc: 'Sistem manajemen konten paling populer di dunia untuk membuat blog dan e-commerce.'
        },
        {
            id: 'laravel',
            name: 'Laravel Toolkit',
            icon: Code2,
            color: 'red',
            category: 'Framework',
            desc: 'Otomatis setup environment PHP dan composer untuk mendeploy aplikasi Laravel.'
        },
        {
            id: 'magento',
            name: 'Magento',
            icon: ShoppingCart,
            color: 'orange',
            category: 'E-Commerce',
            desc: 'Platform toko online skala besar yang kuat dan dinamis.'
        },
        {
            id: 'nextcloud',
            name: 'Nextcloud',
            icon: Database,
            color: 'cyan',
            category: 'File Storage',
            desc: 'Bikin Google Drive pribadimu di mana file tersimpan aman di server panel ini.'
        }
    ];

    const filteredApps = APPS.filter(app => app.name.toLowerCase().includes(search.toLowerCase()) || app.category.toLowerCase().includes(search.toLowerCase()));

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 max-w-6xl mx-auto"
        >
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                        <DownloadCloud className="w-6 h-6 text-blue-400" />
                        1-Click App Installer
                    </h2>
                    <p className="text-gray-400 text-sm max-w-2xl">
                        Di sinilah tempat kamu bisa menginstall script populer secara otomatis hanya dalam 1 klik tanpa perlu pengaturan Database dan zip manual.
                    </p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                        placeholder="Cari script (misal: CMS)"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-10 bg-white/5 border-white/10 text-white"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredApps.map((app, i) => (
                    <motion.div
                        key={app.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="glass-card bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 rounded-2xl p-6 group hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10 flex flex-col h-full"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-white/5 group-hover:bg-blue-500/20 transition-colors">
                                <app.icon className="w-7 h-7" style={{ color: `var(--${app.color}-400)` }} />
                            </div>
                            <span className="text-xs font-semibold px-2 py-1 rounded bg-white/10 text-gray-300">
                                {app.category}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{app.name}</h3>
                        <p className="text-sm text-gray-400 flex-1 leading-relaxed">
                            {app.desc}
                        </p>

                        <div className="mt-6 pt-4 border-t border-white/10">
                            <Button className="w-full bg-white/10 hover:bg-blue-600 text-white transition-colors group-hover:shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                                Install Now
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
