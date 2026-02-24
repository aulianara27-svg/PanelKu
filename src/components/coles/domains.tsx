'use client';

import { motion } from 'framer-motion';
import {
    Globe,
    Plus,
    Search,
    MoreVertical,
    ExternalLink,
    Edit,
    Trash2,
    RefreshCw,
    Server,
    Info
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const MOCK_DOMAINS = [
    { id: 1, name: 'coles.id', status: 'active', type: 'Primary', dns: 'Cloudflare', expiration: '2027-01-15' },
    { id: 2, name: 'student.coles.id', status: 'active', type: 'Subdomain', dns: 'Local', expiration: 'N/A' },
    { id: 3, name: 'tes-project.com', status: 'pending', type: 'Addon', dns: 'Awaiting DNS', expiration: '2027-04-20' },
];

export function Domains() {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                        placeholder="Search domains..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500"
                    />
                </div>
                <Button className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white border-0">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Domain
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {MOCK_DOMAINS.map((domain, i) => (
                    <motion.div
                        key={domain.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center border border-white/5">
                                <Globe className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-semibold text-white">{domain.name}</h3>
                                    <a href={`http://${domain.name}`} target="_blank" rel="noreferrer">
                                        <ExternalLink className="w-3 h-3 text-gray-500 hover:text-blue-400 cursor-pointer" />
                                    </a>
                                </div>
                                <div className="flex items-center gap-3 text-sm mt-1">
                                    <Badge variant="outline" className="border-white/10 text-gray-400">{domain.type}</Badge>
                                    <span className="text-gray-500 flex items-center gap-1">
                                        <Server className="w-3 h-3" />
                                        DNS: {domain.dns}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-sm text-gray-400">Expiration</span>
                                <span className="text-sm text-white font-mono">{domain.expiration}</span>
                            </div>

                            <div className={cn(
                                'px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 border',
                                domain.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            )}>
                                <div className={cn("w-1.5 h-1.5 rounded-full", domain.status === 'active' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse')} />
                                {domain.status.toUpperCase()}
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="hover:bg-white/10 text-gray-400">
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="hover:bg-red-500/10 hover:text-red-400 text-gray-400">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="glass-card rounded-xl p-4 flex items-start gap-3 border-blue-500/20 bg-blue-500/5">
                <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-200/70 leading-relaxed">
                    <strong className="text-blue-300">Point your DNS to:</strong> Ensure your domain's A record is pointing to this server's IP address. Local subdomains will automatically resolve if managed by internal DNS.
                </div>
            </div>
        </motion.div>
    );
}
