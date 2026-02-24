'use client';

import { motion } from 'framer-motion';
import {
    Cloud,
    Globe,
    Plus,
    RefreshCw,
    Power,
    Trash2,
    Copy,
    Link2,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const MOCK_TUNNELS = [
    { id: 1, name: 'Main Server', status: 'online', type: 'cloudflared', url: 'https://coles.id', publicUrl: 'https://coles-server.trycloudflare.com', connections: 4 },
    { id: 2, name: 'Student Access', status: 'offline', type: 'ngrok', url: 'http://localhost:80', publicUrl: 'N/A', connections: 0 },
];

export function CloudflareTunnels() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            <div className="flex flex-col sm:flex-row gap-4 items-start justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Cloud className="w-5 h-5 text-orange-400" />
                        Tunnels & Expose
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Expose local services to the internet via Cloudflare Tunnel or Ngrok.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-white/10 hover:bg-white/5 text-gray-300">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sync Status
                    </Button>
                    <Button className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white border-0">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Tunnel
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_TUNNELS.map((tunnel, i) => (
                    <motion.div
                        key={tunnel.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card rounded-xl p-6 relative overflow-hidden flex flex-col justify-between"
                    >
                        <div className={cn(
                            "absolute top-0 left-0 w-full h-1",
                            tunnel.status === 'online' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-orange-500'
                        )} />

                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Globe className={cn("w-5 h-5", tunnel.status === 'online' ? "text-green-400" : "text-gray-500")} />
                                    {tunnel.name}
                                </h3>
                                <Badge variant="outline" className={cn("mt-2 border-white/10", tunnel.type === 'cloudflared' ? 'text-orange-400' : 'text-blue-400')}>
                                    {tunnel.type}
                                </Badge>
                            </div>

                            <div className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1.5",
                                tunnel.status === 'online' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            )}>
                                <div className={cn("w-1.5 h-1.5 rounded-full", tunnel.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500')} />
                                {tunnel.status.toUpperCase()}
                            </div>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="bg-black/20 p-3 rounded-lg border border-white/5 space-y-2">
                                <div className="flex items-center gap-2">
                                    <Link2 className="w-4 h-4 text-gray-500 shrink-0" />
                                    <span className="text-xs text-gray-400 min-w-16">Local:</span>
                                    <span className="text-sm font-mono text-white truncate">{tunnel.url}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                                    <span className="text-xs text-gray-400 min-w-16">Public:</span>
                                    <span className="text-sm font-mono text-blue-300 truncate">{tunnel.publicUrl}</span>
                                    {tunnel.status === 'online' && (
                                        <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto hover:bg-white/10 shrink-0">
                                            <Copy className="w-3 h-3 text-gray-400" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-400 px-1">
                                <span>Active Connections:</span>
                                <span className="text-white font-mono">{tunnel.connections}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-auto">
                            {tunnel.status === 'online' ? (
                                <Button className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20">
                                    <Power className="w-4 h-4 mr-2" />
                                    Stop Tunnel
                                </Button>
                            ) : (
                                <Button className="flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20">
                                    <Power className="w-4 h-4 mr-2" />
                                    Start Tunnel
                                </Button>
                            )}
                            <Button variant="outline" size="icon" className="border-white/10 hover:bg-red-500/10 hover:text-red-400 text-gray-400 shrink-0">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
